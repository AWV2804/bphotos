import { Router } from 'express';
import multer from 'multer';
import { uploadPhoto, deletePhoto } from '../controllers/photoController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @route POST /photos/upload
 * @desc Upload a photo
 */
router.post('/upload', upload.single('photo'), uploadPhoto);

/**
 * @route DELETE /photos/delete
 * @desc Delete a photo
 */
router.delete('/delete/:id', deletePhoto);
export default router;