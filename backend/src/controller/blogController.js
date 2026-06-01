import { Blog } from "../models/Blog.js";

export const createBlog = async (req, res) => {
  try {
    const {title,htmlContent,category,coverImage,excerpt,seoKeywords,status,} = req.body;
    if (!title ||!htmlContent ||!category ||!excerpt)  //checks required fields
    {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const slug = title.toLowerCase().trim().replace(/\s+/g, "-"); //create slug using totle and replace space with - and uppercase with lowercase

    const existingBlog = await Blog.findOne({ slug });  //check blog is exit or not

    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: "Blog already exists",
      });
    }

    const blog = await Blog.create({title,slug,htmlContent,category,coverImage,excerpt,seoKeywords,status,authorId: req.user?.id,}); // if auth middleware exists
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

