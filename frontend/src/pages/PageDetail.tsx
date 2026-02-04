import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePageStore } from '@/store/usePageStore';
import api from '@/services/api';
import Editor from '@/components/editor/Editor';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function PageDetail() {
    const { pageId } = useParams<{ pageId: string }>();
    const { renamePage } = usePageStore();

    // Local state for the specific page details (including content)
    // We fetch this separately from the sidebar tree to get full content
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const fetchPageDetails = async () => {
            if (!pageId) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/pages/${pageId}`);
                setPage(data);
                setTitle(data.title);
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

    const saveContent = useCallback(async (content: string) => {
        if (!pageId) return;
        // Debounce this ideally, but for now direct save
        try {
            await api.put(`/pages/${pageId}`, { content });
        } catch (error) {
            console.error("Failed to save content", error);
        }
    }, [pageId]);

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
                    {/* Keying by pageId ensures we remount editor when switching pages */}
                    <Editor
                        key={pageId}
                        initialContent={page.content}
                        onChange={saveContent}
                    />
                </div>
            </div>
        </div>
    );
}
