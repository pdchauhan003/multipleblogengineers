import express from 'express';
import { protect, creatorOnly } from '../middleware/authMiddleware.js';
import { createBlog, getBlogs, getIndividualBlog, getBlogBySlug, deleteBlog, updateBlog, getBlogById, searchBlog } from '../controller/blogController.js';
import { upload } from '../middleware/multerMiddleware.js';

const blogRouter = express.Router();

blogRouter.post('/create', protect, creatorOnly, upload.single('image'), createBlog);
blogRouter.get('/', protect, getBlogs);
// /search MUST be before /:slug so Express doesn't treat "search" as a slug value
blogRouter.get('/search', protect, searchBlog);
blogRouter.get('/profile/:username', protect, getIndividualBlog);  // any authenticated user can view a public profile
blogRouter.get('/:slug', protect, getBlogBySlug);
blogRouter.delete('/:id', protect, creatorOnly, deleteBlog);
blogRouter.put('/:id', protect, creatorOnly, upload.single('image'), updateBlog);
blogRouter.get('/id/:id', protect, creatorOnly, getBlogById);

export { blogRouter };
