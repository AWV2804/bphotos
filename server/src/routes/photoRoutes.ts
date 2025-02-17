import { Router } from 'express';
import multer from 'multer';
import { uploadPhoto, deletePhoto, getPhotos, downloadPhoto, renamePhoto } from '../controllers/photoController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * tags:
 *   name: Photos
 *   description: API for managing photos
 */

/**
 * @swagger
 * /photos/upload:
 *   post:
 *     summary: Upload a photo
 *     description: Upload a new photo along with its metadata.
 *     tags: [Photos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The photo file to upload
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Bad request, missing file or invalid format
 *       403:
 *         description: Unauthorized, missing authentication token
 *       500:
 *         description: Internal server error
 */
router.post('/upload', upload.single('photo'), uploadPhoto);

/**
 * @swagger
 * /photos/delete/{id}:
 *   delete:
 *     summary: Delete a photo
 *     description: Remove a photo from the database and GridFS storage.
 *     tags: [Photos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the photo to delete
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 *       400:
 *         description: Missing required parameters
 *       403:
 *         description: Unauthorized, missing authentication token
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', deletePhoto);

/**
 * @swagger
 * /photos:
 *   get:
 *     summary: Get photos
 *     description: Retrieve photos for a user, with optional filters.
 *     tags: [Photos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to fetch photos for
 *       - in: query
 *         name: dateTaken
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by date taken
 *       - in: query
 *         name: tags
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated tags to filter photos
 *     responses:
 *       200:
 *         description: Successfully retrieved photos
 *       400:
 *         description: Missing required parameters
 *       403:
 *         description: Unauthorized, missing authentication token
 *       500:
 *         description: Internal server error
 */
router.get('/', getPhotos);

/**
 * @swagger
 * /photos/download/{gridFSFileId}:
 *   get:
 *     summary: Download a photo
 *     description: Retrieve a photo file from GridFS.
 *     tags: [Photos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gridFSFileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The GridFS file ID of the photo
 *     responses:
 *       200:
 *         description: Successfully retrieved the photo file
 *       400:
 *         description: Missing required parameters
 *       403:
 *         description: Unauthorized, missing authentication token
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Internal server error
 */
router.get('/download/:gridFSFileId', downloadPhoto);

/**
 * @swagger
 * /photos/rename/{id}:
 *   patch:
 *     summary: Rename a photo
 *     description: Change the filename of a photo.
 *     tags: [Photos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the photo to rename
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newFilename
 *             properties:
 *               newFilename:
 *                 type: string
 *                 description: The new filename for the photo
 *     responses:
 *       200:
 *         description: Photo renamed successfully
 *       400:
 *         description: Missing required parameters
 *       403:
 *         description: Unauthorized, missing authentication token
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Internal server error
 */
router.patch('/rename/:id', renamePhoto);
export default router;