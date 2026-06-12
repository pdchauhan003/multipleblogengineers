/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import api from '@/api/axios';
import { useReducer, ChangeEvent, FormEvent, useEffect, useState, use } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { PenSquare, CheckCircle, AlertCircle, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { blogEditFormSchema } from '@/services/zodeValidation';

interface BlogFormState {
  title: string;
  htmlContent: string;
  category: string;
  coverImage: string;
  excerpt: string;
  seoKeywords: string;
  status: 'draft' | 'published' | 'paid';
  price: number;
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof BlogFormState; value: string | number }
  | { type: 'SET_FIELDS'; payload: BlogFormState }
  | { type: 'RESET' };

const initialState: BlogFormState = {
  title: '',
  htmlContent: '',
  category: '',
  coverImage: '',
  excerpt: '',
  seoKeywords: '',
  status: 'draft',
  price: 0,
};

function reducer(state: BlogFormState, action: Action): BlogFormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_FIELDS':
      return { ...action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'creator') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setError('');
        const res = await api.get(`/blog/id/${id}`);
        if (res.data.success) {
          const blog = res.data.blog;
          dispatch({
            type: 'SET_FIELDS',
            payload: {
              title: blog.title,
              htmlContent: blog.htmlContent,
              category: blog.category,
              coverImage: blog.coverImage || '',
              excerpt: blog.excerpt,
              seoKeywords: blog.seoKeywords || '',
              status: blog.status,
              price: blog.price || 0,
            },
          });
          if (blog.coverImage) {
            setImagePreview(blog.coverImage);
          }
        } else {
          setError(res.data.message || 'Failed to fetch blog details');
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to fetch blog details';
        setError(msg);
      } finally {
        setLoadingBlog(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: e.target.name as keyof BlogFormState,
      value: e.target.value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    const result = blogEditFormSchema.safeParse({
      title: state.title,
      category: state.category,
      excerpt: state.excerpt,
      htmlContent: state.htmlContent,
      status: state.status,
      seoKeywords: state.seoKeywords,
      price: state.price,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', state.title);
      formData.append('htmlContent', state.htmlContent);
      formData.append('category', state.category);
      formData.append('excerpt', state.excerpt);
      formData.append('seoKeywords', state.seoKeywords);
      formData.append('status', state.status);
      formData.append('price', state.price.toString());

      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('coverImage', state.coverImage);
      }

      const res = await api.put(`/blog/${id}`, formData);
      if (res.data.success) {
        setSuccess('Blog updated successfully! Redirecting... 🎉');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(res.data.message || 'Failed to update blog');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update blog. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingBlog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-400 mt-6 font-medium animate-pulse tracking-wide text-sm">
          {loading ? 'Verifying permissions...' : 'Loading blog details...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Back navigation & Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Blog</h1>
              <p className="text-gray-400 text-sm mt-0.5">Update your article content and configurations</p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-3 mb-6 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm animate-fadeIn">
            <CheckCircle size={16} className="flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-fadeIn">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Blog Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. How to build a scalable Node.js API"
                value={state.title}
                onChange={(e) => {
                  handleChange(e);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
                }}
                className={`${inputClass} ${fieldErrors.title ? "border-red-500/60 focus:ring-red-500" : ""}`}
                required
              />
              {fieldErrors.title && (
                <p className="text-red-400 text-xs mt-1 animate-fadeIn">{fieldErrors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Backend, DevOps, React"
                value={state.category}
                onChange={(e) => {
                  handleChange(e);
                  if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: "" }));
                }}
                className={`${inputClass} ${fieldErrors.category ? "border-red-500/60 focus:ring-red-500" : ""}`}
                required
              />
              {fieldErrors.category && (
                <p className="text-red-400 text-xs mt-1 animate-fadeIn">{fieldErrors.category}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Short Description (Excerpt) <span className="text-red-400">*</span>
              </label>
              <textarea
                name="excerpt"
                placeholder="A brief summary of what this article covers..."
                value={state.excerpt}
                onChange={(e) => {
                  handleChange(e);
                  if (fieldErrors.excerpt) setFieldErrors((prev) => ({ ...prev, excerpt: "" }));
                }}
                rows={3}
                className={`${inputClass} ${fieldErrors.excerpt ? "border-red-500/60 focus:ring-red-500" : ""}`}
                required
              />
              {fieldErrors.excerpt && (
                <p className="text-red-400 text-xs mt-1 animate-fadeIn">{fieldErrors.excerpt}</p>
              )}
            </div>

            {/* HTML Content */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                HTML Content <span className="text-red-400">*</span>
              </label>
              <textarea
                name="htmlContent"
                placeholder="<h2>Introduction</h2><p>Your article content here...</p>"
                value={state.htmlContent}
                onChange={(e) => {
                  handleChange(e);
                  if (fieldErrors.htmlContent) setFieldErrors((prev) => ({ ...prev, htmlContent: "" }));
                }}
                rows={10}
                className={`${inputClass} font-mono text-xs ${fieldErrors.htmlContent ? "border-red-500/60 focus:ring-red-500" : ""}`}
                required
              />
              {fieldErrors.htmlContent && (
                <p className="text-red-400 text-xs mt-1 animate-fadeIn">{fieldErrors.htmlContent}</p>
              )}
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Cover Image
              </label>

              {imagePreview && (
                <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 border border-white/10 bg-white/5">
                  <Image
                    src={imagePreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* SEO Keywords */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                SEO Keywords
              </label>
              <input
                type="text"
                name="seoKeywords"
                placeholder="node.js, api, backend, scalability"
                value={state.seoKeywords}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <select
                name="status"
                value={state.status}
                onChange={handleChange}
                className={`${inputClass} appearance-none bg-gray-900 text-white`}
              >
                <option value="draft">Draft (not visible on feed)</option>
                <option value="published">Published (visible on feed)</option>
                <option value="paid">Paid (requires payment, visible on feed)</option>
              </select>
            </div>

            {/* Price */}
            {state.status === 'paid' && (
              <div className="animate-fadeIn mt-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Blog Price (INR) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g. 500"
                  min="0"
                  value={state.price || ''}
                  onChange={(e) => {
                    handleChange(e);
                    if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  className={`${inputClass} ${fieldErrors.price ? "border-red-500/60 focus:ring-red-500" : ""}`}
                  required
                />
                {fieldErrors.price && (
                  <p className="text-red-400 text-xs mt-1 animate-fadeIn">{fieldErrors.price}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-all text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Updating Blog...
                </>
              ) : (
                <>
                  <PenSquare size={18} />
                  Update Blog
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
