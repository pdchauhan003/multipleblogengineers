'use client';

import api from '@/api/axios';
import { useReducer, ChangeEvent, FormEvent, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';

interface BlogFormState {
  title: string;
  slug: string;
  htmlContent: string;
  category: string;
  coverImage: string;
  excerpt: string;
  seoKeywords: string;
  status: 'draft' | 'published';
}

type Action =
  | {
      type: 'UPDATE_FIELD';
      field: keyof BlogFormState;
      value: string;
    }
  | {
      type: 'RESET';
    };

const initialState: BlogFormState = {
  title: '',
  slug: '',
  htmlContent: '',
  category: '',
  coverImage: '',
  excerpt: '',
  seoKeywords: '',
  status: 'draft',
};

function reducer(
  state: BlogFormState,
  action: Action
): BlogFormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export default function CreateBlogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);

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
    console.log(state);
    try {
      await api.post('/api/blog/create', state);
    }
    catch (error) {
      alert('error to send data of create blog');
    }
    dispatch({ type: 'RESET' });
  };

  if (loading || !user || user.role !== 'creator') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 mt-6 font-medium animate-pulse tracking-wide text-sm">
          Verifying permissions...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Create Blog
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          value={state.title}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="text"
          name="slug"
          placeholder="Slug"
          value={state.slug}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={state.category}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="text"
          name="coverImage"
          placeholder="Cover Image URL"
          value={state.coverImage}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="excerpt"
          placeholder="Short Description"
          value={state.excerpt}
          onChange={handleChange}
          rows={3}
          className="w-full border p-3 rounded"
          required
        />

        <textarea
          name="htmlContent"
          placeholder="HTML Content"
          value={state.htmlContent}
          onChange={handleChange}
          rows={10}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="text"
          name="seoKeywords"
          placeholder="SEO Keywords (comma separated)"
          value={state.seoKeywords}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <select
          name="status"
          value={state.status}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-3 rounded"
        >
          Create Blog
        </button>
      </form>
    </div>
  );
}