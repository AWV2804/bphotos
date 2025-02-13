import { Request, Response } from 'express'
import dotenv from 'dotenv'
import { User } from '../models/userModel'
import bcrypt from 'bcrypt'
import { logInfo } from '../utils/logger'
import * as db from '../config/db'
import * as auth from '../utils/auth'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

dotenv.config();

export const createAdminUser = async (req: Request, res: Response) => {
    try {
        const ADMIN_USER = process.env.ADMIN_USER;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        const hashedPassword = await bcrypt.hash((ADMIN_PASSWORD as string), 10);
        const [success, result] = await db.addUser("admin", "admin@admin.com", (ADMIN_USER as string), hashedPassword);
        if (success) {
            logInfo("Admin user created successfully");
            return res.status(200).json({ message: "Admin user created successfully" });
        } else {
            logInfo("Error creating admin user: ", result);
            return res.status(500).json({ error: "Failed to create admin user", details: result });
        } 
    } catch (error) {
        logInfo("Error creating admin user: ", error);
        return res.status(500).json({ error: "Error creating admin user" });
    }
}

export const createUser = async (req: Request, res: Response) => {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
        logInfo("User creation failed: missing required fields");
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [success, result] = await db.addUser(name, email, username, hashedPassword);
        if (success) {
            logInfo("User created successfully");
            return res.status(200).json({ message: "User created successfully" });
        } else {
            logInfo("Error creating user: ", result);
            return res.status(500).json({ error: "Failed to create user", details: result });
        }
    } catch (error) {
        logInfo("Error creating user: ", error);
        return res.status(500).json({ error: "Error creating user" });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    const { usernameToDelete, email, password } = req.body;
    
    if (!usernameToDelete || !email || !password) {
        logInfo("User deletion failed: missing required fields");
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    try {
        const [success_email, result_email] = await db.getUserByEmail(email);
        const [success_username, result_username] = await db.getUserByUsername(usernameToDelete);
        if (!success_email || !success_username) {
            logInfo("User deletion failed: user not found");
            return res.status(404).json({ error: "User not found" });
        }
        if ((result_email as any)._id.toString() != (result_username as any)._id) {
            logInfo("User email and username do not match");
            return res.status(404).json({ error: "User email and username do not match" });
        }

        const [success, result] = await db.removeUserByName(usernameToDelete);
        if (success) {
            logInfo("User deleted successfully");
            return res.status(200).json({ message: "User deleted successfully", user: result });
        } else {
            logInfo("Error deleting user: ", result);
            return res.status(500).json({ error: "Failed to delete user", details: result });
        }
    } catch (error) {
        logInfo("Error deleting user: ", error);
        return res.status(500).json({ error: "Error deleting user" });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
            logInfo("Login failed: missing required fields");
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        const [success, result] = await db.getUserByEmail(email);
        if (!success) {
            logInfo("Login failed: user not found");
            return res.status(401).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, (result as any).passwordHash);
        if (!isMatch) {
            logInfo("Login failed: invalid password");
            return res.status(401).json({ error: "Invalid password" });
        }
        logInfo("userid:", (result as any)._id);
        const authToken = await auth.generateToken((result as any)._id);
        logInfo("Login successful. Login token: ", authToken);
        return res.status(200).json({ message: "Login successful", token: authToken });
    } catch (error) {
        logInfo("Error logging in: ", error);
        return res.status(500).json({ error: "Error logging in" });
    }
}