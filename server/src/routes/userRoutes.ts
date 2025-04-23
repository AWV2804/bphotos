import { Router } from 'express';
import { createUser, deleteUser, loginUser, getAllUsers, createAdminUser } from '../controllers/userController';
import { loginRateLimiter } from '../utils/security';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Create a new user
 *     description: Registers a new user in the system.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: "SecureP@ssword123"
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/create', createUser);

/**
 * @swagger
 * /users/delete:
 *   delete:
 *     summary: Delete an existing user
 *     description: Removes a user from the database.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameToDelete
 *               - email
 *               - password
 *             properties:
 *               usernameToDelete:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: "SecureP@ssword123"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request, missing required fields
 *       401:
 *         description: Unauthorized, incorrect credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete', deleteUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user and returns a JWT token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: "SecureP@ssword123"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Bad request, missing required fields
 *       401:
 *         description: Unauthorized, invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginRateLimiter, loginUser);

/**
 * @swagger
 * /users/admin:
 *   post:
 *     summary: Create an admin user if no user exists
 *     description: Registers an admin user.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: "SecureP@ssword123"
 *     responses:
 *       200:
 *         description: Admin user created successfully
 *       400:
 *         description: Bad request, missing required fields
 *       403:
 *         description: Admin user already exists
 *       500:
 *         description: Internal server error
 */
router.post('/admin', createAdminUser);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users in the system.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/all', getAllUsers);

export default router;