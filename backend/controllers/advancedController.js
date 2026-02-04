import Page from '../models/Page.js';
import Version from '../models/Version.js';
import crypto from 'crypto';

// @desc    Generate share link for a page
// @route   POST /api/pages/:id/share
// @access  Private
export const generateShareLink = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (page.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Generate unique share token if not exists
        if (!page.shareToken) {
            page.shareToken = crypto.randomBytes(16).toString('hex');
            page.isPublished = true;
            await page.save();
        } else {
            // Just make sure it's published
            page.isPublished = true;
            await page.save();
        }

        res.json({
            shareToken: page.shareToken,
            shareUrl: `${process.env.CLIENT_URL}/share/${page.shareToken}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Revoke share link
// @route   DELETE /api/pages/:id/share
// @access  Private
export const revokeShareLink = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (page.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        page.isPublished = false;
        await page.save();

        res.json({ message: 'Share link revoked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public page by share token
// @route   GET /api/public/:shareToken
// @access  Public
export const getPublicPage = async (req, res) => {
    try {
        const page = await Page.findOne({
            shareToken: req.params.shareToken,
            isPublished: true
        }).populate('owner', 'name email avatarUrl');

        if (!page) {
            return res.status(404).json({ message: 'Page not found or not published' });
        }

        res.json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create version snapshot
// @route   POST /api/pages/:id/versions
// @access  Private
export const createVersion = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (page.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Get the latest version number
        const latestVersion = await Version.findOne({ pageId: page._id })
            .sort({ versionNumber: -1 });

        const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        const version = await Version.create({
            pageId: page._id,
            title: page.title,
            content: page.content,
            createdBy: req.user._id,
            versionNumber
        });

        res.status(201).json(version);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get version history
// @route   GET /api/pages/:id/versions
// @access  Private
export const getVersions = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (page.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const versions = await Version.find({ pageId: page._id })
            .sort({ versionNumber: -1 })
            .populate('createdBy', 'name email avatarUrl');

        res.json(versions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Restore a version
// @route   POST /api/pages/:id/versions/:versionId/restore
// @access  Private
export const restoreVersion = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        const version = await Version.findById(req.params.versionId);

        if (!page || !version) {
            return res.status(404).json({ message: 'Page or version not found' });
        }

        if (page.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Create a new version from current state before restoring
        const latestVersion = await Version.findOne({ pageId: page._id })
            .sort({ versionNumber: -1 });

        await Version.create({
            pageId: page._id,
            title: page.title,
            content: page.content,
            createdBy: req.user._id,
            versionNumber: latestVersion.versionNumber + 1
        });

        // Restore the version
        page.title = version.title;
        page.content = version.content;
        await page.save();

        res.json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export page to Markdown
// @route   GET /api/pages/:id/export/markdown
// @access  Private
export const exportToMarkdown = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (page.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Convert TipTap JSON to Markdown
        let markdown = `# ${page.title}\n\n`;

        if (page.content) {
            try {
                const content = JSON.parse(page.content);
                markdown += convertTipTapToMarkdown(content);
            } catch (e) {
                markdown += page.content;
            }
        }

        res.set({
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${page.title}.md"`
        });

        res.send(markdown);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to convert TipTap JSON to Markdown
function convertTipTapToMarkdown(doc) {
    if (!doc || !doc.content) return '';

    let markdown = '';

    for (const node of doc.content) {
        markdown += processNode(node);
    }

    return markdown;
}

function processNode(node, listDepth = 0) {
    let result = '';
    const indent = '  '.repeat(listDepth);

    switch (node.type) {
        case 'heading':
            const level = node.attrs?.level || 1;
            result = `${'#'.repeat(level)} ${getTextContent(node)}\n\n`;
            break;

        case 'paragraph':
            result = `${getTextContent(node)}\n\n`;
            break;

        case 'bulletList':
            if (node.content) {
                for (const item of node.content) {
                    result += `${indent}- ${processNode(item, listDepth)}\n`;
                }
            }
            result += '\n';
            break;

        case 'orderedList':
            if (node.content) {
                node.content.forEach((item, i) => {
                    result += `${indent}${i + 1}. ${processNode(item, listDepth)}\n`;
                });
            }
            result += '\n';
            break;

        case 'listItem':
            result = getTextContent(node);
            break;

        case 'taskList':
            if (node.content) {
                for (const item of node.content) {
                    result += processNode(item, listDepth);
                }
            }
            break;

        case 'taskItem':
            const checked = node.attrs?.checked ? 'x' : ' ';
            result = `${indent}- [${checked}] ${getTextContent(node)}\n`;
            break;

        case 'codeBlock':
            const language = node.attrs?.language || '';
            result = `\`\`\`${language}\n${getTextContent(node)}\n\`\`\`\n\n`;
            break;

        case 'blockquote':
            result = `> ${getTextContent(node)}\n\n`;
            break;

        default:
            result = getTextContent(node);
    }

    return result;
}

function getTextContent(node) {
    if (!node.content) return '';

    return node.content.map(child => {
        if (child.type === 'text') {
            let text = child.text || '';

            // Apply marks
            if (child.marks) {
                for (const mark of child.marks) {
                    switch (mark.type) {
                        case 'bold':
                            text = `**${text}**`;
                            break;
                        case 'italic':
                            text = `*${text}*`;
                            break;
                        case 'code':
                            text = `\`${text}\``;
                            break;
                        case 'strike':
                            text = `~~${text}~~`;
                            break;
                    }
                }
            }

            return text;
        }

        return processNode(child);
    }).join('');
}
