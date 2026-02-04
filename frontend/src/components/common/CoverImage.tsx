import { useRef, useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CoverImageProps {
    url?: string | null;
    editable?: boolean;
    onChange?: (url: string | null) => void;
}

export default function CoverImage({ url, editable = true, onChange }: CoverImageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (onChange) {
                onChange(data.url);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        if (onChange) {
            onChange(null);
        }
    };

    return (
        <div
            className={cn(
                "group relative w-full h-[30vh] bg-muted/30 transition-all",
                !url && !editable && "hidden",
                !url && editable && "h-[12vh] opacity-0 hover:opacity-100"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
            />

            {/* Image Display */}
            {url ? (
                <img
                    src={url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
            ) : null}

            {/* Loading Overlay */}
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Skeleton className="w-full h-full" />
                </div>
            )}

            {/* Controls */}
            {editable && (isHovered || !url) && (
                <div className="absolute bottom-4 right-12 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground text-xs h-7"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {url ? "Change cover" : "Add cover"}
                    </Button>

                    {url && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground text-xs h-7"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
