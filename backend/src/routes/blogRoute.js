import express from 'express';
import { protect,creatorOnly } from '../middleware/authMiddleware.js';
import { createBlog } from '../controller/blogController.js';

const blogRouter=express.Router();

blogRouter.post('/create',protect,creatorOnly,createBlog);


export {blogRouter}