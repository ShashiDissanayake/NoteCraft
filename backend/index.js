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

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
});

// ---------------- Middleware ----------------
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// ---------------- Routes ----------------
app.get('/', (req, res) => {
    res.send('NoteCraft API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);

// ---------------- Error Handling ----------------
app.use(notFound);
app.use(errorHandler);

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
