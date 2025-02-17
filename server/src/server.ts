import express from 'express';
import cors from 'cors';
import * as db from './config/db';
import dotenv from 'dotenv';
import { logInfo } from './utils/logger';
import userRoutes from './routes/userRoutes';
import photoRoutes from './routes/photoRoutes';
import { setupSwagger } from './docs/swagger';

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

// Initialize swagger
setupSwagger(app);

async function initialize_database() {
    const [success, result] = await db.connectToMongoDB();
    if (!success) {
        logInfo('Failed to connect to MongoDB', result);
        throw result;
    }
    logInfo('Connected to MongoDB');
}

initialize_database().then(() => {
    app.listen(BACKEND_PORT, () => {
        logInfo(`Server running on http://localhost:${BACKEND_PORT}`);
        logInfo(`Swagger Docs available at http://localhost:${BACKEND_PORT}/api-docs`);
    });
});

// Routes
app.use('/users', userRoutes);
app.use('/photos', photoRoutes);