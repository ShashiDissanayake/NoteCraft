import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    versionNumber: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
versionSchema.index({ pageId: 1, versionNumber: -1 });

const Version = mongoose.model('Version', versionSchema);

export default Version;
