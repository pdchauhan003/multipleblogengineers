// hooks/useSlug.ts

import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  htmlContent: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  seoKeywords?: string;
  status?: 'draft' | 'published' | 'paid';
  paymentRequired?: boolean;
  hasPaid?: boolean;
  createdAt: string;
  authorId?: {
    name: string;
    email: string;
  };
}

export const useSlug = (slug?: string) => {
  return useQuery({
    queryKey: ['blog', slug],

    queryFn: async () => {
      const res = await api.get(`/blog/${slug}`);
      return res.data.blog as Blog;
    },

    enabled: !!slug,

    staleTime: 1000 * 60 * 5, // 5 min cache
  });
};