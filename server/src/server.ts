import express from 'express';
import cors from 'cors';
import * as db from './config/db';
import dotenv from 'dotenv';
import { logInfo } from './utils/logger';
import userRoutes from './routes/userRoutes';

dotenv.config({ path: '../.env' });  // Load environment variables from .env file

const app = express();
const BACKEND_PORT = process.env.BACKEND_PORT || 3000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3001;

app.use(cors({
    origin: `http://localhost:${FRONTEND_PORT}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

async function initialize_database() {
    await db.connectToMongoDB();
    logInfo('Connected to MongoDB');
}

initialize_database().then(() => {
    app.listen(BACKEND_PORT, () => {
        logInfo(`Server running on port ${BACKEND_PORT}`);
    });
});

app.use('/users', userRoutes);