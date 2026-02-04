import Block from '../models/Block.js';
import Page from '../models/Page.js';

// @desc    Get blocks for a page
// @route   GET /api/pages/:pageId/blocks
// @access  Private
export const getPageBlocks = async (req, res) => {
    try {
        const blocks = await Block.find({ pageId: req.params.pageId })
            .sort({ order: 1 });
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Append a block
// @route   POST /api/blocks
// @access  Private
export const createBlock = async (req, res) => {
    try {
        const { pageId, type, content, order } = req.body;

        // simple validation
        const page = await Page.findById(pageId);
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }
        if (page.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const block = await Block.create({
            pageId,
            type,
            content,
            order: order || Date.now() // Simple appending logic if order not provided
        });

        res.status(201).json(block);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a block
// @route   PUT /api/blocks/:id
// @access  Private
export const updateBlock = async (req, res) => {
    try {
        const block = await Block.findById(req.params.id);

        if (!block) {
            return res.status(404).json({ message: 'Block not found' });
        }

        // Check ownership via Page
        const page = await Page.findById(block.pageId);
        if (page.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedBlock = await Block.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedBlock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reorder blocks (batch update)
// @route   PUT /api/blocks/reorder
// @access  Private
export const reorderBlocks = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { id, order }

        // Bulk write for performance
        const operations = updates.map(update => ({
            updateOne: {
                filter: { _id: update.id },
                update: { order: update.order }
            }
        }));

        await Block.bulkWrite(operations);

        res.json({ message: 'Blocks reordered' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
