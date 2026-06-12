import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'paid';
  paymentRequired?: boolean;
  hasPaid?: boolean;
  price?: number;
  createdAt: string;
  authorId?: {
    name: string;
    email: string;
  };
}

interface FetchBlogsResponse {
  success: boolean;
  blogs: Blog[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const useMyBlogs = (username: string) => {
  return useInfiniteQuery({
    queryKey: ['profileBlogs', username],
    initialPageParam: null as string | null,

    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: '10',
      });

      if (pageParam) {
        params.set('cursor', pageParam);
      }

      // Explicitly type the axios get request
      const res = await api.get<FetchBlogsResponse>(
        `/blog/profile/${username}?${params.toString()}`
      );

      return res.data;
    },

    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.nextCursor
        : undefined,
  });
};

export const useDeleteBlog = (username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId: string) => {
      const res = await api.delete(`/blog/${blogId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileBlogs', username] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};
