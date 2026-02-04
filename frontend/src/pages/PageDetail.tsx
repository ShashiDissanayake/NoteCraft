import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { usePageStore } from '@/store/usePageStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import socketService from '@/services/socket';
import Editor from '@/components/editor/Editor';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2, Share2, Download } from 'lucide-react';
import CoverImage from '@/components/common/CoverImage';
import PresenceAvatars from '@/components/common/PresenceAvatars';
import ShareDialog from '@/components/common/ShareDialog';

export default function PageDetail() {
    const { pageId } = useParams<{ pageId: string }>();
    const { renamePage } = usePageStore();
    const { user } = useAuthStore();

    // Local state for the specific page details (including content)
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // Track if updates are from remote to avoid feedback loops
    const isRemoteUpdate = useRef(false);

    // We only update the local content state from editor changes
    const handleEditorChange = useCallback((newContent: string) => {
        if (!isRemoteUpdate.current) {
            setContent(newContent);
            // Broadcast to other users
            if (pageId && user) {
                socketService.broadcastContentUpdate(pageId, newContent, user._id);
            }
        }
    }, [pageId, user]);

    // Debounce the content value for autosave
    const debouncedContent = useDebounce(content, 1000);

    // Effect to trigger save when debounced content changes
    useEffect(() => {
        const save = async () => {
            if (!pageId || !debouncedContent) return;
            if (page && debouncedContent === page.content) return;

            setIsSaving(true);
            try {
                await api.put(`/pages/${pageId}`, { content: debouncedContent });
                setPage((prev: any) => ({ ...prev, content: debouncedContent }));
            } catch (error) {
                console.error("Failed to save content", error);
            } finally {
                setIsSaving(false);
            }
        };

        if (debouncedContent && !isRemoteUpdate.current) {
            save();
        }
    }, [debouncedContent, pageId]);

    // Fetch page details on mount or pageId change
    useEffect(() => {
        const fetchPageDetails = async () => {
            if (!pageId) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/pages/${pageId}`);
                setPage(data);
                setTitle(data.title);
                setContent(data.content || '');
            } catch (error) {
                console.error("Failed to load page", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageDetails();
    }, [pageId]);

    // Socket connection and room management
    useEffect(() => {
        if (!pageId || !user) return;

        // Connect socket
        socketService.connect();
        // Join page room
        socketService.joinPage(pageId, user);

        // Listen for presence updates
        socketService.onPresenceUpdate((users) => {
            setActiveUsers(users);
        });

        // Listen for content updates from other users
        socketService.onContentUpdated(({ content: remoteContent, userId }) => {
            if (userId !== user._id) {
                isRemoteUpdate.current = true;
                setContent(remoteContent);
                // Reset flag after a short delay
                setTimeout(() => {
                    isRemoteUpdate.current = false;
                }, 100);
            }
        });

        // Listen for title updates from other users
        socketService.onTitleUpdated(({ title: remoteTitle, userId }) => {
            if (userId !== user._id) {
                setTitle(remoteTitle);
                setPage((prev: any) => ({ ...prev, title: remoteTitle }));
            }
        });

        // Cleanup on unmount or page change
        return () => {
            socketService.leavePage(pageId);
            socketService.off('presence_update');
            socketService.off('content_updated');
            socketService.off('title_updated');
        };
    }, [pageId, user]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
    };

    const handleTitleBlur = () => {
        if (pageId && title !== page.title) {
            renamePage(pageId, title);
            // Broadcast title update
            if (user) {
                socketService.broadcastTitleUpdate(pageId, title, user._id);
            }
        }
    };

    const handleCoverChange = async (url: string | null) => {
        if (!pageId) return;
        setPage((prev: any) => ({ ...prev, coverImage: url }));
        try {
            await api.put(`/pages/${pageId}`, { coverImage: url });
        } catch (error) {
            console.error("Failed to update cover", error);
        }
    };

    const handleExportMarkdown = async () => {
        if (!pageId) return;
        try {
            const response = await api.get(`/pages/${pageId}/export/markdown`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${page.title || 'page'}.md`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    if (loading) {
        return (
            <div className="p-12 max-w-4xl mx-auto space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        );
    }

    if (!page) {
        return <div className="p-12 text-center text-muted-foreground">Page not found</div>;
    }

    return (
        <>
            <div className="flex flex-col h-full bg-background overflow-hidden px-4">
                <CoverImage
                    url={page.coverImage}
                    onChange={handleCoverChange}
                />

                {/* Action Bar */}
                <div className="flex justify-between items-center py-2 px-4">
                    <div className="flex items-center gap-2">
                        {activeUsers.length > 1 && (
                            <PresenceAvatars users={activeUsers} currentUserId={user?._id} />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportMarkdown}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShareDialogOpen(true)}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto py-12 pb-32">
                        {/* Title Input */}
                        <div className="group relative mb-4">
                            <Input
                                value={title}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                className="text-4xl font-bold border-none shadow-none px-0 py-2 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
                                placeholder="Untitled"
                            />
                        </div>

                        {/* Editor */}
                        <div className="flex justify-end mb-2 h-4">
                            {isSaving && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
                        </div>
                        <Editor
                            key={pageId}
                            initialContent={page.content}
                            onChange={handleEditorChange}
                        />
                    </div>
                </div>
            </div>

            {/* Share Dialog */}
            {pageId && (
                <ShareDialog
                    pageId={pageId}
                    isOpen={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                />
            )}
        </>
    );
}
