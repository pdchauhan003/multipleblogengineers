import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no access token' });
  }
  try {
    const decode = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = await User.findById(decode.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  }
  catch (error) {
    // console.error('error in token');
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}