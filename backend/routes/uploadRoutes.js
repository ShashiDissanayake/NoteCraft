import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadFile } from '../controllers/uploadController.js';
import { fileUpload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/', protect, fileUpload.single('file'), uploadFile);

export default router;
