import { Router } from 'express';
import multer from 'multer';
import { uploadPhoto, deletePhoto, getPhotos, downloadPhoto, renamePhoto, updateMetadata, toggleFavorite } from '../controllers/photoController';

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
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
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
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
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
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
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
 *         description: Filter by date taken (ISO 8601 format)
 *       - in: query
 *         name: tags
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated tags to filter photos
 *       - in: query
 *         name: isFavorite
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by favorite status (true/false)
 *     responses:
 *       200:
 *         description: Successfully retrieved photos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique ID of the photo
 *                   userId:
 *                     type: string
 *                     description: ID of the user who uploaded the photo
 *                   filename:
 *                     type: string
 *                     description: Name of the file
 *                   dateTaken:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the photo was taken
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Tags associated with the photo
 *                   isFavorite:
 *                     type: boolean
 *                     description: Whether the photo is marked as a favorite
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
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
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
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
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

/**
 * @swagger
 * /photos/updateMetadata/{id}:
 *   patch:
 *     summary: Update photo metadata
 *     description: Update the metadata of a photo, including tags and description.
 *     tags: [Photos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the photo to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of tags associated with the photo
 *               description:
 *                 type: string
 *                 description: Description of the photo
 *     responses:
 *       200:
 *         description: Metadata updated successfully
 *       400:
 *         description: Missing required parameters
 *       403:
 *         description: Unauthorized, missing authentication token
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Internal server error
 */
router.patch('/updateMetadata/:id', updateMetadata);

/**
 * @swagger
 * /photos/toggleFavorite/{id}:
 *   patch:
 *     summary: Toggle favorite status of a photo
 *     description: Mark a photo as favorite or remove it from favorites.
 *     tags: [Photos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the photo to update
 *     responses:
 *       200:
 *         description: Favorite status toggled successfully
 *       400:
 *         description: Missing required parameters
 *       403:
 *         description: Unauthorized, missing authentication token
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Internal server error
 */
router.patch('/toggleFavorite/:id', toggleFavorite);
export default router;