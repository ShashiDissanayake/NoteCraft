import express from 'express';
import { getPublicPage } from '../controllers/advancedController.js';

const router = express.Router();

router.get('/:shareToken', getPublicPage);

export default router;
