import express from 'express';
import { login,refresh,register,logout,getUserProfile,googleLogin, forgotSendMail, verifyOtp, resetPassword, selectRole } from '../controller/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody, LoginSchema, RegisterSchema } from '../middleware/validationMiddleware.js';

const userRouter = express.Router();

userRouter.post('/login', validateBody(LoginSchema), login);
userRouter.post('/register', validateBody(RegisterSchema), register);
userRouter.post('/google', googleLogin);
userRouter.post('/refresh', refresh);
userRouter.delete('/logout', logout);
userRouter.get('/me', protect, getUserProfile);
userRouter.post('/send-mail',forgotSendMail);
userRouter.post('/verify-otp',verifyOtp);
userRouter.post('/reset-password', resetPassword);
userRouter.put('/urole',protect,selectRole);

export { userRouter };
