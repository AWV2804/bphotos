import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logInfo } from './logger';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export interface AuthRequest extends Request {
    userId?: string;
}

export function generateToken(userId: string): string {
    try {
        if (!SECRET_KEY) {
            throw new Error('JWT secret key not found');
        }
        const payload = { userId };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
        return token;
    } catch (error) {
        logInfo(error);
        return '';
    }
}

export function verifyToken(token: string): { updatedToken: string } {
    try {
        if (!SECRET_KEY) {
            throw new Error('JWT secret key not found');
        }
        if (!token) {
            throw new Error('No token provided');
        }
        const payload = jwt.verify(token, SECRET_KEY);
        const decodedpayload = jwt.decode(token);
        const updatedToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
        
        return { updatedToken };
    }
    catch(error) {
        logInfo(error);
        return { updatedToken: '' };
    }
}
