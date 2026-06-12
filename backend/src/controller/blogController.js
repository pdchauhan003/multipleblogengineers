import { Blog } from "../models/Blog.js";
import { User } from "../models/User.js";
import { cloudinary } from "../config/cloudinary.js";
import { Payment } from "../models/Payment.js";

export const createBlog = async (req, res) => {
  try {
    const {title,htmlContent,category,coverImage,excerpt,seoKeywords,status,price} = req.body || {};
    // if (!title ||!htmlContent ||!category ||!excerpt)  //checks required fields
    if (!title ||!category ) 
    {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }
    const fetchTitle=await Blog.findOne({title}).select('title').lean();

    if(fetchTitle){
      return res.status(409).json({success:false,message:'this title is exists plz use difference title'})
    }
    const slug = title.toLowerCase().trim().replace(/\s+/g, "-"); //create slug using title and replace space with - and uppercase with lowercase

    const existingBlog = await Blog.findOne({ slug });  //check blog exists or not

    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: "Blog already exists",
      });
    }
    let finalCoverImage = coverImage || '';
    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'dev_blog_covers',
      });
      finalCoverImage = result.secure_url;
    }

    const parsedPrice = status === 'paid' ? (Number(price) || 0) : 0;
    const blog = await Blog.create({title,slug,htmlContent,category,coverImage:finalCoverImage,excerpt,seoKeywords,status,price: parsedPrice,authorId: req.user?._id,});
    return res.status(200).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Cursor-based pagination — fetches latest blogs sorted by createdAt descending
export const getBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor; // ISO date string of the last fetched blog's createdAt

    // Build the query — if cursor exists, fetch blogs older than the cursor date
    const query = { status: { $in: ['published', 'paid'] } };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // Fetch limit + 1 to determine if there are more pages without an extra count query
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('authorId', 'name email')
      .lean();

    const hasMore = blogs.length > limit;
    if (hasMore) blogs.pop(); // Remove the extra item

    // The next cursor is the createdAt of the last item in the returned list
    const nextCursor = hasMore ? blogs[blogs.length - 1].createdAt.toISOString() : null;

    // Fetch user verified payments
    const userPayments = req.user ? await Payment.find({
      user: req.user._id,
      status: 'paid',
      isVerified: true
    }).select('blogId').lean() : [];
    const paidBlogIds = new Set(userPayments.map(p => p.blogId?.toString()));

    const blogsWithPayment = blogs.map(blog => {
      const authorId = blog.authorId?._id || blog.authorId;
      const isAuthor = req.user && (req.user._id.toString() === authorId.toString());
      const paymentRequired = blog.status === 'paid';
      const hasPaid = isAuthor || !paymentRequired || paidBlogIds.has(blog._id.toString());
      return {
        ...blog,
        paymentRequired,
        hasPaid
      };
    });

    return res.status(200).json({
      success: true,
      blogs: blogsWithPayment,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error in getBlogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Fetch a single blog by slug (for the blog detail page)
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, status: { $in: ['published', 'paid'] } })
      .populate('authorId', 'name email')
      .lean();

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const isAuthor = req.user && (req.user._id.toString() === (blog.authorId?._id || blog.authorId).toString());
    const paymentRequired = blog.status === 'paid';
    
    let hasPaid = isAuthor || !paymentRequired;
    if (paymentRequired && !isAuthor && req.user) {
      const payment = await Payment.findOne({
        user: req.user._id,
        blogId: blog._id,
        status: 'paid',
        isVerified: true
      });
      if (payment) {
        hasPaid = true;
      }
    }

    if (paymentRequired && !hasPaid) {
      // Return details but hide the htmlContent
      return res.status(200).json({
        success: true,
        blog: {
          ...blog,
          htmlContent: '', // Hide htmlContent
          paymentRequired: true,
          hasPaid: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      blog: {
        ...blog,
        paymentRequired,
        hasPaid: true
      }
    });
  } catch (error) {
    console.error('Error in getBlogBySlug:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getIndividualBlog=async(req,res)=>{
    try {
    const limit = parseInt(req.query.limit) || 10;
    const username=req.params.username;
    const cursor = req.query.cursor; // ISO date string of the last fetched blog's createdAt

    const user=await User.findOne({name:username}).select('-password').lean();
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const query = { status: { $in: ['published', 'paid'] } };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // Fetch limit + 1 to determine if there are more pages without an extra count query
    const blogs = await Blog.find({authorId:user._id,...query})
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('authorId', 'name email')
      .lean();

    const hasMore = blogs.length > limit;
    if (hasMore) blogs.pop(); // Remove the extra item

    // The next cursor is the createdAt of the last item in the returned list
    const nextCursor = hasMore ? blogs[blogs.length - 1].createdAt.toISOString() : null;

    // Fetch user verified payments
    const userPayments = req.user ? await Payment.find({
      user: req.user._id,
      status: 'paid',
      isVerified: true
    }).select('blogId').lean() : [];
    const paidBlogIds = new Set(userPayments.map(p => p.blogId?.toString()));

    const blogsWithPayment = blogs.map(blog => {
      const authorId = blog.authorId?._id || blog.authorId;
      const isAuthor = req.user && (req.user._id.toString() === authorId.toString());
      const paymentRequired = blog.status === 'paid';
      const hasPaid = isAuthor || !paymentRequired || paidBlogIds.has(blog._id.toString());
      return {
        ...blog,
        paymentRequired,
        hasPaid
      };
    });

    return res.status(200).json({
      success: true,
      blogs: blogsWithPayment,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error in getBlogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.authorId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'delete blog success' });
  } catch (error) {
    console.error('error in delete blog:', error);
    return res.status(500).json({ success: false, message: 'error in delete blog from server' });
  }
}

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, htmlContent, category, coverImage, excerpt, seoKeywords, status, price } = req.body || {};

    const checkBlog = await Blog.findById(id);
    if (!checkBlog) {
      return res.status(404).json({ success: false, message: 'blog not fount' });
    }

    if (checkBlog.authorId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this blog' });
    }

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const fetchTitle = await Blog.findOne({ title, _id: { $ne: id } }).select('title').lean();

    if (fetchTitle) {
      return res.status(409).json({ success: false, message: 'this title is exists plz use difference title' });
    }

    const slug = title.toLowerCase().trim().replace(/\s+/g, "-");

    const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: "Blog already exists",
      });
    }

    let finalCoverImage = coverImage || checkBlog.coverImage || '';
    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'dev_blog_covers',
      });
      finalCoverImage = result.secure_url;
    }

    const parsedPrice = status === 'paid' ? (Number(price) || 0) : 0;
    const blog = await Blog.findByIdAndUpdate(
      id,
      { title, slug, htmlContent, category, coverImage: finalCoverImage, excerpt, seoKeywords, status, price: parsedPrice },
      { new: true }
    );
    return res.status(200).json({ success: true, message: "Blog updated successfully", blog });

  }
  catch (error) {
    console.log('server error to update blog', error);
    return res.status(500).json({ success: false, message: 'server error to update blog' });
  }
}

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate('authorId', 'name email').lean();

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Only the author can fetch this blog by ID (draft or published) for editing
    if (blog.authorId._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this blog' });
    }

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error('Error in getBlogById:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


export const searchBlog = async (req, res) => {
  try {
    const { q, cursor, limit: limitStr } = req.query;
    const limit = parseInt(limitStr) || 10;

    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Case-insensitive title search
    const query = {
      status: { $in: ['published', 'paid'] },
      title: { $regex: q.trim(), $options: 'i' },
    };

    // Cursor: createdAt of last fetched blog (consistent with getBlogs)
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // Fetch limit + 1 to check if there are more results
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('authorId', 'name email')
      .lean();

    const hasMore = blogs.length > limit;
    if (hasMore) blogs.pop();

    const nextCursor = hasMore ? blogs[blogs.length - 1].createdAt.toISOString() : null;

    // Fetch user verified payments
    const userPayments = req.user ? await Payment.find({
      user: req.user._id,
      status: 'paid',
      isVerified: true
    }).select('blogId').lean() : [];
    const paidBlogIds = new Set(userPayments.map(p => p.blogId?.toString()));

    const blogsWithPayment = blogs.map(blog => {
      const authorId = blog.authorId?._id || blog.authorId;
      const isAuthor = req.user && (req.user._id.toString() === authorId.toString());
      const paymentRequired = blog.status === 'paid';
      const hasPaid = isAuthor || !paymentRequired || paidBlogIds.has(blog._id.toString());
      return {
        ...blog,
        paymentRequired,
        hasPaid
      };
    });

    return res.status(200).json({
      success: true,
      blogs: blogsWithPayment,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.log('search serverside error', error);
    res.status(500).json({ message: 'server side search error', success: false });
  }
};