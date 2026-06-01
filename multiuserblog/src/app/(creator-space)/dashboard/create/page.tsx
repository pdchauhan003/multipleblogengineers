'use client';

import api from '@/api/axios';
import { useReducer, ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { PenSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface BlogFormState {
  title: string;
  htmlContent: string;
  category: string;
  coverImage: string;
  excerpt: string;
  seoKeywords: string;
  status: 'draft' | 'published';
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof BlogFormState; value: string }
  | { type: 'RESET' };

const initialState: BlogFormState = {
  title: '',
  htmlContent: '',
  category: '',
  coverImage: '',
  excerpt: '',
  seoKeywords: '',
  status: 'draft',
};

function reducer(state: BlogFormState, action: Action): BlogFormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm';

export default function CreateBlogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'creator') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: e.target.name as keyof BlogFormState,
      value: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await api.post('/blog/create', state);
      if (res.data.success) {
        setSuccess('Blog created successfully! 🎉');
        dispatch({ type: 'RESET' });
      } else {
        // Backend returned 2xx but success: false (shouldn't normally happen)
        setError(res.data.message || 'Failed to create blog');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Surface the REAL backend error so we know exactly what went wrong
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to create blog. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Show spinner while verifying auth / role
  if (loading || !user || user.role !== 'creator') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-400 mt-6 font-medium animate-pulse tracking-wide text-sm">
          Verifying permissions...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <PenSquare size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create Blog</h1>
            <p className="text-gray-400 text-sm mt-0.5">Write and publish your engineering article</p>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-3 mb-6 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
            <CheckCircle size={16} className="flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
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
                onChange={handleChange}
                className={inputClass}
                required
              />
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
                onChange={handleChange}
                className={inputClass}
                required
              />
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
                onChange={handleChange}
                rows={3}
                className={inputClass}
                required
              />
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
                onChange={handleChange}
                rows={10}
                className={`${inputClass} font-mono text-xs`}
                required
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Cover Image URL
              </label>
              <input
                type="url"
                name="coverImage"
                placeholder="https://example.com/image.jpg"
                value={state.coverImage}
                onChange={handleChange}
                className={inputClass}
              />
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
                className={inputClass}
              >
                <option value="draft">Draft (not visible on feed)</option>
                <option value="published">Published (visible on feed)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-all text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Blog...
                </>
              ) : (
                <>
                  <PenSquare size={18} />
                  Create Blog
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}