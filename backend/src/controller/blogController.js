import { Blog } from "../models/Blog.js";
import { User } from "../models/User.js";

export const createBlog = async (req, res) => {
  try {
    const {title,htmlContent,category,coverImage,excerpt,seoKeywords,status,} = req.body;
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
      return res.status(501).json({success:false,message:'this title is exists plz use difference title'})
    }
    const slug = title.toLowerCase().trim().replace(/\s+/g, "-"); //create slug using title and replace space with - and uppercase with lowercase

    const existingBlog = await Blog.findOne({ slug });  //check blog exists or not

    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: "Blog already exists",
      });
    }

    const blog = await Blog.create({title,slug,htmlContent,category,coverImage,excerpt,seoKeywords,status,authorId: req.user?._id,});
    return res.status(201).json({
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
    const query = { status: 'published' };
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

    return res.status(200).json({
      success: true,
      blogs,
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
    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('authorId', 'name email')
      .lean();

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.status(200).json({ success: true, blog });
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

    const query = { status: 'published' };
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

    return res.status(200).json({
      success: true,
      blogs,
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