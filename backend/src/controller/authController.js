import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { accessToken, refreshToken } from "../utils/token.js";

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
            return res.status(401).json({ success: false, message: 'invalid email or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'invalid email or password' });
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
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.log('login failed', error);
        return res.status(500).json({ success: false, message: 'error in login' });
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
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Error during Google login:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during Google login' });
    }
}