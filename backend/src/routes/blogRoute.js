import express from 'express';
import { protect, creatorOnly } from '../middleware/authMiddleware.js';
import { createBlog, getBlogs, getIndividualBlog, getBlogBySlug, deleteBlog } from '../controller/blogController.js';

const blogRouter = express.Router();

blogRouter.post('/create', protect, creatorOnly, createBlog);
blogRouter.get('/', protect, getBlogs);
blogRouter.get('/profile/:username',protect,creatorOnly,getIndividualBlog)
blogRouter.get('/:slug', protect, getBlogBySlug);
blogRouter.delete('/:id',protect,creatorOnly,deleteBlog);

export { blogRouter };
