import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const BlogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be under 100 characters"),
  category: z.string().min(1, "Category is required"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  htmlContent: z.string().min(20, "HTML Content must be at least 20 characters"),
  status: z.enum(["draft", "published"]).default("draft"),
  seoKeywords: z.string().optional(),
});

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || 'Validation failed',
          errors: formattedErrors
        });
      }
      next(error);
    }
  };
};
