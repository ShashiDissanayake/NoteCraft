import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private url: string;

    constructor() {
        this.url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    }

    connect() {
        if (this.socket?.connected) return this.socket;

        this.socket = io(this.url, {
            withCredentials: true,
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }

    // Page collaboration events
    joinPage(pageId: string, user: any) {
        this.socket?.emit('join_page', { pageId, user });
    }

    leavePage(pageId: string) {
        this.socket?.emit('leave_page', { pageId });
    }

    broadcastContentUpdate(pageId: string, content: string, userId: string) {
        this.socket?.emit('content_update', { pageId, content, userId });
    }

    broadcastTitleUpdate(pageId: string, title: string, userId: string) {
        this.socket?.emit('title_update', { pageId, title, userId });
    }

    // Event listeners
    onPresenceUpdate(callback: (users: any[]) => void) {
        this.socket?.on('presence_update', callback);
    }

    onContentUpdated(callback: (data: { content: string; userId: string }) => void) {
        this.socket?.on('content_updated', callback);
    }

    onTitleUpdated(callback: (data: { title: string; userId: string }) => void) {
        this.socket?.on('title_updated', callback);
    }

    // Remove listeners
    off(event: string) {
        this.socket?.off(event);
    }
}

const socketService = new SocketService();
export default socketService;
