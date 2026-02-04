import Page from '../models/Page.js';

// @desc    Create a new page
// @route   POST /api/pages
// @access  Private
export const createPage = async (req, res) => {
    try {
        const { parent } = req.body;

        const page = await Page.create({
            owner: req.user._id,
            parent: parent || null,
        });

        res.status(201).json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pages for basic sidebar (flat list or tree)
// @route   GET /api/pages
// @access  Private
export const getPages = async (req, res) => {
    try {
        const pages = await Page.find({
            owner: req.user._id,
            isArchived: false
        }).sort({ updatedAt: -1 });

        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single page
// @route   GET /api/pages/:id
// @access  Private
export const getPage = async (req, res) => {
    try {
        const page = await Page.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        res.json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update page (title, icon, cover, etc.)
// @route   PUT /api/pages/:id
// @access  Private
export const updatePage = async (req, res) => {
    try {
        const page = await Page.findOne({ _id: req.params.id, owner: req.user._id });

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        const updatedPage = await Page.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Return updated document
        );

        res.json(updatedPage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Archive/Delete page
// @route   DELETE /api/pages/:id
// @access  Private
export const deletePage = async (req, res) => {
    try {
        const page = await Page.findOne({ _id: req.params.id, owner: req.user._id });

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        // Option 1: Hard delete (and children)
        // await Page.deleteMany({ $or: [{ _id: req.params.id }, { parent: req.params.id }] });

        // Option 2: Archive (Soft delete) - Better for "Trash" functionality
        page.isArchived = true;
        await page.save();

        // Also archive children? For now, let's just archive the parent.
        // Or recursively archive. 
        // For simplicity in this step, let's just archive the single page.

        res.json({ message: 'Page archived' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
