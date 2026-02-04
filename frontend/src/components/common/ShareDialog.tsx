import { useState } from 'react';
import { Copy, Check, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

interface ShareDialogProps {
    pageId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareDialog({ pageId, isOpen, onClose }: ShareDialogProps) {
    const [shareUrl, setShareUrl] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGenerateLink = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/pages/${pageId}/share`);
            setShareUrl(data.shareUrl);
            setIsPublished(true);
        } catch (error) {
            console.error('Failed to generate share link', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeLink = async () => {
        setLoading(true);
        try {
            await api.delete(`/pages/${pageId}/share`);
            setShareUrl('');
            setIsPublished(false);
        } catch (error) {
            console.error('Failed to revoke share link', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share this page</DialogTitle>
                    <DialogDescription>
                        Anyone with the link can view this page
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!isPublished || !shareUrl ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-3">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Lock className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Page is private</p>
                                <p className="text-sm text-muted-foreground">
                                    Generate a shareable link to publish
                                </p>
                            </div>
                            <Button onClick={handleGenerateLink} disabled={loading}>
                                <Globe className="h-4 w-4 mr-2" />
                                Publish to web
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopy}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRevokeLink}
                                    disabled={loading}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    Unpublish
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
