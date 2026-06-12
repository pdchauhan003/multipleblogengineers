import { razorpay } from "../lib/razorpay.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";
import { Blog } from "../models/Blog.js";

export const createOrder=async(req,res)=>{
    try{
        const {blogId}=req.body;
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({message: "Blog not found"});
        }
        if (blog.status !== 'paid') {
            return res.status(400).json({message: "This blog does not require payment"});
        }
        const order=await razorpay.orders.create({
            amount:blog.price*100,
            currency:"INR",
            receipt:`receipt_${Date.now()}`
        });

        res.status(200).json(order);
    }
    catch(error){
        res.status(500).json({message: error.message,});
    }
}

export const verifyPayment=async(req,res)=>{
    try{
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, }= req.body;
        const generatedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(
            razorpay_order_id + "|" + razorpay_payment_id
        ).digest("hex");

        const isValid = generatedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({
            success: false,
            message: "Invalid Signature",
            });
        }
        const updatePayment=await Payment.updateOne({orderId:razorpay_order_id},{$set:{
            paymentId:razorpay_payment_id,
            razorpaySignature:razorpay_signature,
            status:'paid',
            isVerified:true,
            paidAt:Date.now(),
            
        }},{new:true});
        res.status(200).json({
            success: true,
            message: "Payment Verified",
        });
    }
    catch(error){
        res.status(500).json({message: error.message,});
    }
}

export const createPayment = async (req, res) => {
    try {
        const { orderId, blogId } = req.body;
        const userId = req.user._id;
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({message: "Blog not found", success: false});
        }
        const amount = blog.price;
        const payment = await Payment.create({user: userId,amount,orderId,blogId});
        res.status(200).json({message: 'payment create success',success: true});
    } catch (error) {
        res.status(500).json({message: error.message,success: false});
    }
};
