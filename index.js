import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { startCronJobs } from './cron/weeklyEmail.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: ['https://micro-feedback.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});

// Route files
import auth from './routes/authRoutes.js';
import feedback from './routes/feedbackRoutes.js';
import admin from './routes/adminRoutes.js';
import chats from './routes/chatRoutes.js';
import notes from './routes/noteRoutes.js';
import notifications from './routes/notificationRoutes.js';
import dev from './routes/devRoutes.js';

// Mount routers
app.use('/api/auth', auth);
app.use('/api/feedback', feedback);
app.use('/api/admin', admin);
app.use('/api/chats', chats);
app.use('/api/notes', notes);
app.use('/api/notifications', notifications);

// Developer recovery routes (only in non-production)
if (process.env.NODE_ENV !== 'production') {
    app.use('/api/dev', dev);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCronJobs();
});
