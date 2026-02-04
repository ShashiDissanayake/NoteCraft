import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        default: 'Untitled'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        default: null
    },
    icon: {
        type: String,
        default: null
    },
    coverImage: {
        type: String,
        default: null
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    content: {
        type: String, // Placeholder for Block content (JSON string or ref)
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries on owner and parent
pageSchema.index({ owner: 1, parent: 1 });

const Page = mongoose.model('Page', pageSchema);

export default Page;
