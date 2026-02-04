import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import blockRoutes from './routes/blockRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB (ONLY ONCE)
connectDB();

const app = express();
const httpServer = createServer(app);

// ---------------- Socket.io ----------------
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    },
});

// Store active users per page room
const pageRooms = new Map(); // pageId -> Set of { socketId, userId, userName, avatarUrl }

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join a page room
    socket.on('join_page', ({ pageId, user }) => {
        socket.join(`page:${pageId}`);

        // Add user to room tracking
        if (!pageRooms.has(pageId)) {
            pageRooms.set(pageId, new Set());
        }

        const userPresence = {
            socketId: socket.id,
            userId: user._id,
            userName: user.name,
            avatarUrl: user.avatarUrl,
        };

        pageRooms.get(pageId).add(userPresence);

        // Broadcast presence to all users in the room
        const presenceList = Array.from(pageRooms.get(pageId));
        io.to(`page:${pageId}`).emit('presence_update', presenceList);

        console.log(`User ${user.name} joined page ${pageId}`);
    });

    // Leave a page room
    socket.on('leave_page', ({ pageId }) => {
        socket.leave(`page:${pageId}`);

        // Remove user from room tracking
        if (pageRooms.has(pageId)) {
            const room = pageRooms.get(pageId);
            const updatedRoom = Array.from(room).filter(u => u.socketId !== socket.id);

            if (updatedRoom.length === 0) {
                pageRooms.delete(pageId);
            } else {
                pageRooms.set(pageId, new Set(updatedRoom));
            }

            // Broadcast updated presence
            io.to(`page:${pageId}`).emit('presence_update', updatedRoom);
        }
    });

    // Broadcast content update
    socket.on('content_update', ({ pageId, content, userId }) => {
        // Broadcast to all users in the room except sender
        socket.to(`page:${pageId}`).emit('content_updated', { content, userId });
    });

    // Broadcast title update
    socket.on('title_update', ({ pageId, title, userId }) => {
        socket.to(`page:${pageId}`).emit('title_updated', { title, userId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);

        // Remove user from all rooms
        pageRooms.forEach((room, pageId) => {
            const updatedRoom = Array.from(room).filter(u => u.socketId !== socket.id);

            if (updatedRoom.length === 0) {
                pageRooms.delete(pageId);
            } else {
                pageRooms.set(pageId, new Set(updatedRoom));
                io.to(`page:${pageId}`).emit('presence_update', updatedRoom);
            }
        });
    });
});

// ---------------- Middleware ----------------
// ---------------- Middleware ----------------
app.use(
    helmet({
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);
app.use(express.json());
app.use(cookieParser());

const CLIENT_URL = process.env.CLIENT_URL || process.env.client_URL || 'http://localhost:5173';

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

// ---------------- Routes ----------------
app.get('/', (req, res) => {
    res.send('NoteCraft API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

// ---------------- Error Handling ----------------
app.use(notFound);
app.use(errorHandler);

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
