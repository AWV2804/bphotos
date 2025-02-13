import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logInfo } from './logger';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export interface AuthRequest extends Request {
    userId?: string;
}

export async function generateToken(userId: string) {
    try {
        if (!SECRET_KEY) {
            throw new Error('JWT secret key not found');
        }
        const payload = { userId };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
        return [true, token];
    } catch (error) {
        logInfo(error);
        return [false, error as Error];
    }
}

export async function verifyToken(token: string) {
    try {
        if (!SECRET_KEY) {
            throw new Error('JWT secret key not found');
        }
        if (!token) {
            throw new Error('No token provided');
        }
        const payload = jwt.verify(token, SECRET_KEY);
        const decodedpayload = jwt.decode(token);
        logInfo('Decoded payload:', decodedpayload);
        const updatedToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
        
        return { updatedToken };
    }
    catch(error) {
        logInfo(error);
        return { updatedToken: (error as any) };
    }
}

export async function extractPayload(token: string) {
    logInfo("Token:", token);
    try {
        if (!SECRET_KEY) {
            return [false, Error('JWT secret key not found')];
        }
        if (!token) {
            return [false, Error('No token provided')];
        }
        //const payload = jwt.verify(token, SECRET_KEY);
        const decodedpayload = jwt.decode(token);
        if (!decodedpayload) {
            return [false, Error('Error decoding token')];
        }
        const userId = (decodedpayload as jwt.JwtPayload).userId;
        logInfo("Decoded payload:", decodedpayload);
        logInfo('User ID:', userId);
        return [true, userId];
    }
    catch(error) {
        logInfo(error);
        return [false, error as Error];
    }
}
