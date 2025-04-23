import express from 'express';
import cors from 'cors';
import * as db from './config/db';
import dotenv from 'dotenv';
import { logInfo } from './utils/logger';
import userRoutes from './routes/userRoutes';
import photoRoutes from './routes/photoRoutes';
import { setupSwagger } from './docs/swagger';
import { applySecurityHeaders, apiRateLimiter, logSecurityHeaders } from './utils/security';
import os from 'os';
import https from 'https';

dotenv.config({ path: '../.env' });  // Load environment variables from .env file

const app = express();
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || "3000", 10);
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3001;

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of (iface ?? [])) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address; // First non-internal IPv4 address
            }
        }
    }
    return 'Unknown Local IP';
}

function getExternalIp(callback: (externalIp: string) => void) {
    https.get('https://api.ipify.org', (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            callback(data);
        });
    }).on('error', (err) => {
        logInfo(`Failed to fetch external IP: ${err.message}`);
    });
}

const localIp = getLocalIp();
let FRONTEND_ORIGIN = `http://${localIp}:${FRONTEND_PORT}`;

getExternalIp((externalIp: string) => {
    FRONTEND_ORIGIN = `http://${externalIp}:${FRONTEND_PORT}`;
    logInfo(`Using FRONTEND_ORIGIN: ${FRONTEND_ORIGIN}`);

    // Apply security headers using Helmet
    app.use(applySecurityHeaders);

    // Log security headers application
    app.use(logSecurityHeaders);

    // Apply general API rate limiter
    app.use(apiRateLimiter);

    app.use(cors({
        origin: function (origin, callback) {
            const allowedOrigins = [
                `http://localhost:${FRONTEND_PORT}`,
                `http://${localIp}:${FRONTEND_PORT}`,
                `http://${process.env.PUBLIC_IP || '70.176.216.253'}:${FRONTEND_PORT}`
            ];
    
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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
        app.listen(BACKEND_PORT, '::', () => {
            logInfo(`Server running on:`);
            logInfo(`- http://localhost:${BACKEND_PORT}`);
            logInfo(`- http://${localIp}:${BACKEND_PORT} (LAN)`);

            // Fetch and display external IP
            getExternalIp((externalIp: string) => {
                logInfo(`- http://${externalIp}:${BACKEND_PORT} (Public)`);
                logInfo(`Swagger Docs available at:`);
                logInfo(`- http://localhost:${BACKEND_PORT}/api-docs`);
                logInfo(`- http://${localIp}:${BACKEND_PORT}/api-docs (LAN)`);
                logInfo(`- http://${externalIp}:${BACKEND_PORT}/api-docs (Public)`);
            });
        });
    });

    // Routes
    app.use('/users', userRoutes);
    app.use('/photos', photoRoutes);
});