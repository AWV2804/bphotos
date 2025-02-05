import { Router } from 'express';
import { createUser, deleteUser, loginUser } from '../controllers/userController';

const router = Router();

/**
 * @route POST /users/create
 * @desc Create a new user
 */
router.post('/create', createUser);

/**
 * @route DELETE /users/delete
 * @desc Delete an existing user
 */
router.delete('/delete', deleteUser);

/**
 * @route POST /users/login
 * @desc Log in a user
 */
router.post('/login', loginUser);

export default router;
