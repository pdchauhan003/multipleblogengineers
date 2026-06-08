import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { accessToken, refreshToken } from "../utils/token.js";
import { sendMail } from "../services/mailService.js";

const getCookieOptions = (req, maxAge) => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const secure = isProduction || isSecure;

    return {
        httpOnly: true,
        secure: secure,
        sameSite: secure ? 'none' : 'lax',
        ...(maxAge ? { maxAge } : {})
    };
};

export const register = async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        const { name, email, password } = req.body;
        const [checkName,checkEmail]=await Promise.all([
            User.findOne({name}).lean(),
            User.findOne({email}).lean()
        ])
        if(checkName){
            return res.status(201).json({success:false,message:'name already exists'})
        }
        if(checkEmail){
            return res.status(201).json({success:false,message:'email already exists'})
        }
        const newUser = await User.create({ name, email, password });
        console.log('New User created:', newUser);
        return res.status(201).json({ success: true, message: 'user register success' });
    }
    catch (error) {
        console.error('Registration failed with error:', error);
        return res.status(500).json({ success: false, message: 'failed in register' });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'invalid email', forgot: false });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'invalid password', forgot: true });
        }

        const accesstoken = accessToken({ id: user._id });
        const refreshtoken = refreshToken({ id: user._id });

        // BUG FIX: save on instance (user), not on the Model class (User)
        user.refreshToken = refreshtoken;
        await user.save();

        res.cookie('accessToken', accesstoken, getCookieOptions(req, 15 * 60 * 1000));

        res.cookie('refreshToken', refreshtoken, getCookieOptions(req, 7 * 24 * 60 * 60 * 1000));

        return res.json({
            success: true,
            message: 'login success',
            forgot: false,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.log('login failed', error);
        return res.status(500).json({ success: false, message: 'error in login', forgot: false });
    }
}

export const refresh = async (req, res) => {
    const refresttoken = req.cookies.refreshToken;
    if (!refresttoken) {
        return res.status(401).json({ success: false, message: "refresh token is not available" });
    }
    try {
        const decoded = jwt.verify(refresttoken, process.env.REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user || user.refreshToken !== refresttoken) {
            return res.status(401).json({ success: false, message: 'refresh token is invalid' });
        }
        const accesstoken = accessToken({ id: user._id });
        res.cookie('accessToken', accesstoken, getCookieOptions(req, 15 * 60 * 1000));
        return res.json({ success: true, message: 'access token refreshed' });
    }
    catch (error) {
        console.log('error in refresh');
        return res.status(401).json({ success: false, message: 'refresh error' });
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        }
        return res.json({ success: true, user });
    }
    catch (error) {
        console.log('error in get user profile', error);
        return res.status(500).json({ success: false, message: 'error in user profile fetch' });
    }
}

export const logout = async (req, res) => {
    try {
        const refreshtoken = req.cookies.refreshToken;
        if (refreshtoken) {
            await User.findOneAndUpdate({ refreshToken: refreshtoken }, { refreshToken: '' });
        }
        res.clearCookie('refreshToken', getCookieOptions(req));
        res.clearCookie('accessToken', getCookieOptions(req));
        return res.json({ success: true, message: 'logout success' });
    }
    catch (error) {
        console.log('error in logout', error);
        return res.status(500).json({ success: false, message: 'error in logout' });
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Google access token is required' });
        }

        // Verify the Google token by fetching user profile from Google info endpoint

    // When backend sends https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}
    //  the token to that Google URL, Google checks the token:
    // "Is this token valid and not expired?"
    // "Which user does this token belong to?"
    // "Does this app have permission to view their email and profile?"
        const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        if (!googleResponse.ok) {
            return res.status(400).json({ success: false, message: 'Failed to verify Google access token' });
        }

        const googleUser = await googleResponse.json();
        const { email, name } = googleUser;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Google account does not contain a valid email' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // User does not exist, auto-register them
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                password: randomPassword,
                role: 'visitor' // Default role for new users
            });
        }

        // Log the user in by generating session tokens
        const accesstoken = accessToken({ id: user._id });
        const refreshtoken = refreshToken({ id: user._id });

        user.refreshToken = refreshtoken;
        await user.save();

        res.cookie('accessToken', accesstoken, getCookieOptions(req, 15 * 60 * 1000));
        res.cookie('refreshToken', refreshtoken, getCookieOptions(req, 7 * 24 * 60 * 60 * 1000));

        return res.json({
            success: true,
            message: 'login success',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Error during Google login:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during Google login' });
    }
}

export const forgotSendMail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const mailsend = await sendMail(email);
        if (!mailsend.success) {
            return res.status(400).json({ success: false, message: mailsend.message });
        }
        return res.status(200).json({ success: true, message: mailsend.message, otp: mailsend.otp });
    }
    catch (error) {
        console.error('Error in forgotSendMail:', error);
        return res.status(500).json({ success: false, message: 'Error in sending mail' });
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        //  Wrong OTP
        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        //  Expiry check
        if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP expired. Request new one ",
            });
        }

        //  after Success reset
        user.otp = 'VERIFIED_RESET';
        // keep expiry for a short window (e.g. 10 more minutes)
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
        await user.save();

        return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } 
    catch (error) {
        console.error("Error in verify-otp API:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: "Email and new password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check that verification was already completed and is within expiration
        if (user.otp !== 'VERIFIED_RESET') {
            return res.status(400).json({ success: false, message: "OTP has not been verified" });
        }

        if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ success: false, message: "Verification session has expired. Please verify OTP again." });
        }

        // Set the new password - Mongoose hooks will hash it automatically on save!
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    }
    catch (error) {
        console.error("Error in resetPassword API:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
