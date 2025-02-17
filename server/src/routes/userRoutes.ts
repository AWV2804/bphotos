import { Router } from 'express';
import { createUser, deleteUser, loginUser, createAdminUser } from '../controllers/userController';

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
router.post('/login', loginUser);


/**
 * @swagger
 * /users/admin:
 *   post:
 *     summary: Create an admin user
 *     description: Registers an admin user.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Admin user created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/admin', createAdminUser);

export default router;
