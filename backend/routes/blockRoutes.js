import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createBlock,
    updateBlock,
    getPageBlocks,
    reorderBlocks
} from '../controllers/blockController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createBlock);

router.put('/reorder', reorderBlocks);

router.route('/:id')
    .put(updateBlock);

// Nested route support often handled in index or mergedparams, but simple route here:
router.get('/page/:pageId', getPageBlocks);

export default router;
