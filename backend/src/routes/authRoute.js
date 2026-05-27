import express from 'express';
import { login,refresh,register,logout,getUserProfile,googleLogin } from '../controller/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/login', login);
userRouter.post('/register', register);
userRouter.post('/google', googleLogin);
userRouter.post('/refresh', refresh);
userRouter.delete('/logout', logout);
userRouter.get('/me', protect, getUserProfile);

export { userRouter };
