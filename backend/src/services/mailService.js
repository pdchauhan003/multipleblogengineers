import { User } from "../models/User.js"
import nodemailer from 'nodemailer';

export const sendMail = async (email) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return { success: false, message: "User not found" };
        }

        const now = new Date();

        //  Reset after 24 hours
        if (user.otpLastRequest) {
            const diff = now - new Date(user.otpLastRequest);
            const hours = diff / (1000 * 60 * 60);

            if (hours >= 24) {
                user.otpRequestCount = 0;
            }
        }

        user.otpRequestCount = user.otpRequestCount || 0;

        // Limit check
        if (user.otpRequestCount >= 5) {
            return {
                success: false,
                message: "Limit reached. Try again after 24 hours ❌",
            };
        }

        //  Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        //  Expiry 5 minutes
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        //  Update user
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.otpRequestCount = (user.otpRequestCount || 0) + 1;
        user.otpLastRequest = now;

        await user.save();

       // console.log(`\n==========================================\n[OTP GENERATED] OTP for ${email} is: ${otp}\n==========================================\n`);

        //  Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        });

        return {
            success: true,
            message: `OTP sent (${user.otpRequestCount}/5)`,
            // otp is intentionally NOT returned — it is saved to DB and sent by email only.
        };

    } catch (error) {
        console.error("Error inside sendMail service:", error);
        return {
            success: false,
            message: "Server error",
        };
    }
}