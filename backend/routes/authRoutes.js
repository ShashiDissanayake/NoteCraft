import express from 'express';
import { authGoogle, logoutUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/google', authGoogle);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);

export default router;
