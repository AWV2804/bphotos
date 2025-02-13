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
        const gridFSFileId = await db.uploadFileToGridFS(originalPath, filename);

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