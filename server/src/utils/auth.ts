import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logInfo } from './logger';
import { getUserIdfromPhotoId } from '../config/db';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY || '';

/**
 * Extends the Express `Request` interface to include an optional `userId` property.
 * This interface can be used to type requests that include user authentication information.
 *
 * @interface AuthRequest
 * @extends {Request}
 * @property {string} [userId] - The ID of the authenticated user, if available.
 */
export interface AuthRequest extends Request {
    userId?: string;
}

/**
 * Generates a JWT token for the given user ID.
 *
 * @param {string} userId - The ID of the user for whom the token is being generated.
 * @returns {Promise<[boolean, string | Error]>} A promise that resolves to a tuple where the first element is a boolean indicating success, and the second element is either the generated token prefixed with "Bearer " or an error.
 * @throws {Error} If the JWT secret key is not found.
 */
export async function generateToken(userId: string) {
    try {
        if (!SECRET_KEY) {
            throw new Error('JWT secret key not found');
        }
        const payload = { userId };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
        return [true, `Bearer ${token}`];  // Add "Bearer " prefix
    } catch (error) {
        logInfo(error);
        return [false, error as Error];
    }
}


/**
 * Verifies a JWT token, updates its expiration, and returns the updated token.
 *
 * @param token - The JWT token to verify.
 * @returns An object containing the updated token with a "Bearer " prefix.
 * @throws Will throw an error if the secret key is not found or if no token is provided.
 *
 * The function performs the following steps:
 * 1. Checks if the secret key is available.
 * 2. Checks if the token is provided.
 * 3. Removes the "Bearer " prefix from the token if it exists.
 * 4. Verifies the token using the secret key.
 * 5. Signs a new token with the same payload and a 1-hour expiration.
 * 6. Decodes both the updated token and the original token for logging purposes.
 * 7. Logs the decoded payloads.
 * 8. Returns the updated token with a "Bearer " prefix.
 * 9. Catches and logs any errors that occur during the process.
 */
export async function verifyToken(token: string) {
    try {
        if (!SECRET_KEY) {
            throw new Error('JWT secret key not found');
        }
        if (!token) {
            throw new Error('No token provided');
        }

        // Remove "Bearer " prefix if it exists
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }

        const payload = jwt.verify(token, SECRET_KEY);
        const updatedToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

        const decodedpayload = jwt.decode(updatedToken as string);
        const decodedpayload2 = jwt.decode(token);

        logInfo('Decoded payload with verified:', decodedpayload);
        logInfo('Decoded payload with original:', decodedpayload2);

        return { updatedToken: `Bearer ${updatedToken}` };  // Add "Bearer " prefix
    }
    catch(error) {
        logInfo(error);
        return { updatedToken: (error as any) };
    }
}

/**
 * Extracts the payload from a given JWT token.
 *
 * @param token - The JWT token from which to extract the payload.
 * @returns A promise that resolves to a tuple. The first element is a boolean indicating success or failure.
 *          The second element is either the user ID (on success) or an Error object (on failure).
 *
 * @throws Will throw an error if the JWT secret key is not found or if the token is not provided.
 */
export async function extractPayload(token: string) {
    logInfo("Token:", token);
    try {
        if (!SECRET_KEY) {
            return [false, Error('JWT secret key not found')];
        }
        if (!token) {
            return [false, Error('No token provided')];
        }

        // Remove "Bearer " prefix if it exists
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }

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

export async function isPhotoOwner(authToken: string, photoId: string) {
    const [successUserIdToken, userIdToken] = await extractPayload(authToken);
        if (!successUserIdToken) {
            logInfo("Error extracting user ID from token");
            return Error("Error extracting user ID from token");
        }

        const userIdPhoto = await getUserIdfromPhotoId(photoId);
        if (userIdPhoto instanceof Error) {
            logInfo("Error getting user ID from photo ID: ", userIdPhoto);
            return userIdPhoto;
        }
        logInfo("User ID from photo: ", userIdPhoto.toString());
        logInfo("User ID from token: ", userIdToken.toString());
        if (userIdPhoto.toString() != userIdToken.toString()) {
            logInfo("Unauthorized user");
            return Error("Unauthorized user");
        }
        return true;
}

// Test function for extractPayload
// async function testExtractPayload() {
//     const token = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2N2FkOTdjYjQ0YzQwOGM3MTk4NjgzYjkifQ.jJSNCtrT1g-vnZ8SgWsekSjodbAU5arK6rVuZ_k_iQQ";
//     const [success, userId] = await extractPayload(token);
//     logInfo("userid reg:", userId);
//     logInfo("stringed user id:", userId.toString());
//     logInfo("json stringified userid:", JSON.stringify(userId));
// }

// testExtractPayload();