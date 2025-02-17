import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Photo } from '../models/photoModel';
import { logInfo } from '../utils/logger'
import * as db from '../config/db';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import fs from 'fs';
import * as auth from '../utils/auth';
import * as mdata from '../utils/getMetadata';
import { content } from 'googleapis/build/src/apis/content';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export const uploadPhoto = async (req: MulterRequest, res: Response) => {
    const authToken = req.headers['authorization'];
    const file = req.file;
    logInfo(req.file);

    if(!authToken || authToken == '' || authToken == null || authToken.trim() == '') {
        logInfo("Missing Authentication Header");
        return res.status(403).json({ error: "Missing Authentication Header" });
    }

    if (!file) {
        logInfo("No file uploaded");
        return res.status(400).json({ error: "Please upload a file" });
    }

    try {
        const updatedToken = await auth.verifyToken(authToken);
        if (updatedToken instanceof Error) {
            logInfo("Invalid or expired token");
            return res.status(403).json({ error: "Invalid or expired token" });
        }
    
        const { filename, path: originalPath } = file;
        logInfo(file);
        const contentType = file.mimetype || 'application/octet-stream';
        logInfo("Content type: ", contentType);
        if (!contentType.startsWith('image/')) {
            logInfo("Invalid file type");
            return res.status(400).json({ error: "Invalid file type" });
        }
        const gridFSFileId = await db.uploadFileToGridFS(originalPath, filename);
        if (!gridFSFileId || gridFSFileId instanceof Error) {
            logInfo("Error uploading file to GridFS", gridFSFileId);
            return res.status(500).json({ error: "Error uploading file to GridFS" });
        }
        
        const [successMetadata, metadata, metadataStringified] = await mdata.getMetadata(originalPath);
        if (!successMetadata) {
            logInfo("Error reading metadata", metadata);
            return res.status(500).json({ error: "Error reading metadata" });
        }

        const [successUserId, userId] = await auth.extractPayload(authToken);
        const newPhoto = new Photo({
            userId: userId,
            filename: filename,
            gridFSFileId: gridFSFileId,
            contentType: contentType,
            dateTaken: metadata.DateTimeOriginal || undefined,
            size: (metadata.ExifImageWidth * metadata.ExifImageHeight) || (metadata.ImageWidth * metadata.ImageHeight) || undefined,
            importantMetadata: {
                Make: metadata.Make || undefined,
                Model: metadata.Model || undefined,
                Location: {
                    Latitude: metadata.latitude || undefined,
                    Longitude: metadata.longitude || undefined
                },
                Dimensions: {
                    width: metadata.ExifImageWidth || undefined,
                    height: metadata.ExifImageHeight || undefined
                }
            },
            fullMetadata: metadataStringified,
        });

        await newPhoto.save();
        fs.unlinkSync(originalPath);

        return res.status(200).json({ message: "Photo uploaded successfully", photo: newPhoto });
    } catch (error) {
        //TODO: NEED A WAY TO DELETE FILE FROM GRIDFS IF UPLOAD FAILS
        logInfo("Upload error", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const deletePhoto = async (req: Request, res: Response) => {
    const authToken = req.headers['authorization'];
    const { id } = req.params; 

    if (!authToken || authToken == '' || authToken == null || authToken.trim() == '') {
        logInfo("Missing Authentication Header");
        return res.status(403).json({ error: "Missing Authentication Header" });
    }

    if (!id) {
        logInfo("No photo ID provided to delete");
        return res.status(400).json({ error: "Please provide a photo ID to delete" });
    }

    try {
        const updatedToken = await auth.verifyToken(authToken);
        if (updatedToken instanceof Error) {
            logInfo("Invalid or expired token");
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        
        const [success, result] = await db.deletePhoto(id);
        if (success) {
            logInfo("Photo deleted successfully: ", id);
            return res.status(200).json({ message: `Photo deleted successfully: ${id}` });
        } else {
            logInfo("Error deleting photo: ", result);
            return res.status(500).json({ error: "Failed to delete photo", details: result });
        }
    } catch (error) {
        logInfo("Error deleting photo: ", error);
        return res.status(500).json({ error: "Error deleting photo", details: error });
    }
}

export const getPhotos = async (req: Request, res: Response) => {
    const authToken = req.headers['authorization'];
    if(!authToken || authToken == '' || authToken == null || authToken.trim() == '') {
        logInfo("Missing Authentication Header");
        return res.status(403).json({ error: "Missing Authentication Header" });
    }
    try {
        const updatedToken = await auth.verifyToken(authToken);
        if (updatedToken instanceof Error) {
            logInfo("Invalid or expired token");
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        const { userId, dateTaken, tags } = req.query;
        if (!userId) {
            logInfo("No user ID provided");
            return res.status(400).json({ error: "Please provide a user ID" });
        }

        const filters: any = { userId };

        // Optional filters
        if (dateTaken) {
            filters.dateTaken = new Date(dateTaken as string);
        }
        if (tags) {
            filters.tags = { $in: (tags as string).split(',') };
        }

        const photos = await Photo.find(filters);
        return res.status(200).json(photos);
    } catch (error) {
        logInfo("Error getting photos: ", error);
        return res.status(500).json({ error: "Error fetching photos" });
    }
}

export const downloadPhoto = async (req: Request, res: Response) => {
    const authToken = req.headers['authorization'];
    // The id is the gridFSFileId NOT the _id
    const { gridFSFileId } = req.params;

    if (!authToken || authToken == '' || authToken == null || authToken.trim() == '') {
        logInfo("Missing Authentication Header");
        return res.status(403).json({ error: "Missing Authentication Header" });
    }
    if (!gridFSFileId) {
        logInfo("No photo ID provided");
        return res.status(400).json({ error: "Please provide a photo ID" });
    }

    try {
        const updatedToken = await auth.verifyToken(authToken);
        if (updatedToken instanceof Error) {
            logInfo("Invalid or expired token");
            return res.status(403).json({ error: "Invalid or expired token" });
        }

        const photo = await Photo.findOne({ gridFSFileId: new mongoose.Types.ObjectId(gridFSFileId) });
        if (!photo) {
            logInfo("Photo not found");
            return res.status(404).json({ error: "Photo not found" });
        }

        const filestream = await db.downloadFileFromGridFS(gridFSFileId.toString());
        if (!filestream) {
            logInfo("File not found in GridFS");
            return res.status(500).json({ error: "File not found in GridFS" });
        }
        if (filestream instanceof Error) {
            logInfo("Error downloading file from GridFS", filestream);
            return res.status(500).json({ error: "Error downloading file from GridFS" });
        }
        const contentType = photo.contentType || null;
        if (contentType == null) {
            logInfo("There was an error displaying the image");
            return res.status(500).json({ error: "There was an error displaying the image" });
        }
        
        const extension = contentType.split('/')[1];
        const filenameWithExtension = `${photo.filename}.${extension}`;
        res.set('Content-Type', contentType as string);
        logInfo("content type:", contentType as string);
        res.set('Content-Disposition', `attachment; filename=${filenameWithExtension}`);
        logInfo("filename:", filenameWithExtension);
        filestream.pipe(res);
    } catch (error) {
        logInfo("Error downloading photo: ", error);
        return res.status(500).json({ error: "Error downloading photo" });
    }
}

export const renamePhoto = async (req: Request, res: Response) => {
    const authToken = req.headers['authorization'];
    const { id } = req.params;
    const { newFilename } = req.body;

    if (!authToken || authToken == '' || authToken == null || authToken.trim() == '') {
        logInfo("Missing Authentication Header");
        return res.status(403).json({ error: "Missing Authentication Header" });
    }
    if (!id) {
        logInfo("No photo ID provided");
        return res.status(400).json({ error: "Please provide a photo ID" });
    }
    if (!newFilename) {
        logInfo("No new name provided");
        return res.status(400).json({ error: "Please provide a new name" });
    }

    try {
        const updatedToken = await auth.verifyToken(authToken);
        if (updatedToken instanceof Error) {
            logInfo("Invalid or expired token");
            return res.status(403).json({ error: "Invalid or expired token" });
        }

        const renameResult = await db.renamePhoto(id, newFilename);
        if (renameResult instanceof Error) {
            logInfo("Error renaming photo: ", renameResult);
            return res.status(500).json({ error: "Error renaming photo" });
        }

        return res.status(200).json({ message: "Photo renamed successfully", id, newFilename });
        
    } catch (error) {
        logInfo("Error renaming photo: ", error);
        return res.status(500).json({ error: "Error renaming photo" });
    }
}
