import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        required: true,
        index: true
    },
    type: {
        type: String, // 'paragraph', 'heading', 'image', 'code', etc.
        required: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // Can be text, or complex object
        default: ''
    },
    properties: {
        type: Map,
        of: String, // Additional attributes like text alignment, color
        default: {}
    },
    order: {
        type: Number,
        required: true
    },
    parentBlockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block',
        default: null
    }
}, {
    timestamps: true
});

const Block = mongoose.model('Block', blockSchema);

export default Block;
