// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Private
export const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary storage via multer-storage-cloudinary automatically handles the upload
    // and populates req.file with the result.
    res.json({
        url: req.file.path,
        filename: req.file.filename,
        originalName: req.file.originalname,
    });
};
