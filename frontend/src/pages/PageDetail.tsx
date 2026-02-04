import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePageStore } from '@/store/usePageStore';
import api from '@/services/api';
import Editor from '@/components/editor/Editor';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2 } from 'lucide-react';

export default function PageDetail() {
    const { pageId } = useParams<{ pageId: string }>();
    const { renamePage } = usePageStore();

    // Local state for the specific page details (including content)
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');

    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // We only update the local content state from editor changes
    const handleEditorChange = useCallback((newContent: string) => {
        setContent(newContent);
    }, []);

    // Debounce the content value
    const debouncedContent = useDebounce(content, 1000); // 1 second delay

    // Effect to trigger save when debounced content changes
    useEffect(() => {
        const save = async () => {
            if (!pageId || !debouncedContent) return;
            // Prevent saving initial empty string if page hasn't loaded or simply skip if matches loaded
            if (page && debouncedContent === page.content) return;

            setIsSaving(true);
            try {
                await api.put(`/pages/${pageId}`, { content: debouncedContent });
                // Update local page reference so we don't re-save if no further changes
                setPage((prev: any) => ({ ...prev, content: debouncedContent }));
            } catch (error) {
                console.error("Failed to save content", error);
            } finally {
                setIsSaving(false);
            }
        };

        if (debouncedContent) {
            save();
        }
    }, [debouncedContent, pageId]); // Removed 'page' from dependency to avoid cycles

    useEffect(() => {
        const fetchPageDetails = async () => {
            if (!pageId) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/pages/${pageId}`);
                setPage(data);
                setTitle(data.title);
                setContent(data.content || ''); // Initialize content
            } catch (error) {
                console.error("Failed to load page", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageDetails();
    }, [pageId]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (pageId && title !== page.title) {
            renamePage(pageId, title); // Updates store and backend
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
        <div className="flex flex-col h-full bg-background overflow-hidden px-4">
            {/* Banner / Cover Image Placeholder */}
            <div className={`h-32 w-full bg-muted/30 group relative transition-all ${!page.coverImage ? 'hidden' : ''}`}>
                {/* Cover Image rendering would go here */}
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
    );
}
