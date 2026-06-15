import { razorpay } from "../lib/razorpay.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";
import { Blog } from "../models/Blog.js";

export const createOrder = async (req, res) => {
    try {
        const { blogId } = req.body;

        if (!blogId) {
            return res.status(400).json({ message: "blogId is required" });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        if (blog.status !== 'paid') {
            return res.status(400).json({ message: "This blog does not require payment" });
        }
        if (!blog.price || blog.price <= 0) {
            return res.status(400).json({ message: "This blog has no valid price set. Please contact the author." });
        }

        const order = await razorpay.orders.create({
            amount: Math.round(blog.price * 100), // paise, must be integer
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        });

        res.status(200).json(order);
    } catch (error) {
        // Log the full Razorpay error on the server for easy debugging
        console.error("[createOrder] Payment error:", error);

        // Return the actual Razorpay error description if available
        const razorpayMsg = error?.error?.description || error?.message || "Failed to create payment order";
        res.status(500).json({ message: razorpayMsg });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing payment verification fields" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        const isValid = generatedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid Signature" });
        }

        await Payment.updateOne(
            { orderId: razorpay_order_id },
            {
                $set: {
                    paymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: 'paid',
                    isVerified: true,
                    paidAt: Date.now(),
                }
            }
        );

        res.status(200).json({ success: true, message: "Payment Verified" });
    } catch (error) {
        console.error("[verifyPayment] Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const createPayment = async (req, res) => {
    try {
        const { orderId, blogId } = req.body;
        const userId = req.user._id;

        if (!orderId || !blogId) {
            return res.status(400).json({ message: "orderId and blogId are required", success: false });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found", success: false });
        }

        const amount = blog.price;
        await Payment.create({ user: userId, amount, orderId, blogId });

        res.status(200).json({ message: 'Payment record created successfully', success: true });
    } catch (error) {
        console.error("[createPayment] Error:", error);
        res.status(500).json({ message: error.message, success: false });
    }
};
