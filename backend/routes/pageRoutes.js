import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createPage,
    getPages,
    getPage,
    updatePage,
    deletePage
} from '../controllers/pageController.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
    .post(createPage)
    .get(getPages);

router.route('/:id')
    .get(getPage)
    .put(updatePage)
    .delete(deletePage);

export default router;
