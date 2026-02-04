import express from 'express';
import { createPage, getPages, getPage, updatePage, deletePage } from '../controllers/pageController.js';
import {
    generateShareLink,
    revokeShareLink,
    createVersion,
    getVersions,
    restoreVersion,
    exportToMarkdown
} from '../controllers/advancedController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createPage)
    .get(getPages);

router.route('/:id')
    .get(getPage)
    .put(updatePage)
    .delete(deletePage);

// Advanced features
router.post('/:id/share', generateShareLink);
router.delete('/:id/share', revokeShareLink);
router.post('/:id/versions', createVersion);
router.get('/:id/versions', getVersions);
router.post('/:id/versions/:versionId/restore', restoreVersion);
router.get('/:id/export/markdown', exportToMarkdown);

export default router;
