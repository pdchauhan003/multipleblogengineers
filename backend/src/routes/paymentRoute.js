import express from 'express';
import { createOrder, createPayment, verifyPayment } from "../controller/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const paymentRouter=express.Router();

paymentRouter.post('/create-order',protect,createOrder);
paymentRouter.post('/verify',protect,verifyPayment);
paymentRouter.post('/createpayment',protect,createPayment)

export {paymentRouter};