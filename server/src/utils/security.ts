import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Helmet middleware to secure HTTP headers
export const applySecurityHeaders = helmet();

// Rate limiting to prevent brute force attacks
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts. Please try again later.',
    headers: true,
});

// General API rate limiter to prevent abuse
export const apiRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Each IP can make 100 requests per 10 minutes
    message: 'Too many requests from this IP. Try again later.',
    headers: true,
});

// Middleware to log security-related issues
export const logSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
    console.log(`Security headers applied for ${req.method} ${req.url}`);
    next();
};
