'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import { useMyBlogs, useDeleteBlog } from '@/hooks/useBlog';

export default function Dashboard() {
  const router = useRouter();
  const { user,loading } = useAuth();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {data,isLoading,hasNextPage,fetchNextPage,isFetchingNextPage} = useMyBlogs(user?.name || '');
  const deleteBlogMutation = useDeleteBlog(user?.name || '');

  const blogs =
    data?.pages.flatMap((page) => page.blogs) ?? [];

  const handleDelete = async (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlogMutation.mutateAsync(blogId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error deleting blog:', error);
        alert(error?.response?.data?.message || 'Failed to delete blog. Please try again.');
      }
    }
  };

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
    if (!sentinelRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if ( entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage,isFetchingNextPage,fetchNextPage,]);

  // Show spinner while auth state is being resolved
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Verifying session...</p>
      </div>
    );
  }

  // Auth resolved but no user — redirect in progress
  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
        Loading blogs...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            My Blogs
          </h1>
          <button onClick={() => router.push('/dashboard/create')} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition">
            Create Blog
          </button>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No blogs found
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <div key={blog._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden" onClick={()=>router.push(`/blog/${blog.slug}`)}>
                  <div className="relative h-52">
                    <Image
                      src={blog.coverImage ||'/placeholder-blog.jpg'}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      loading="eager"
                    />
                  </div>

                  <div className="p-4">
                    <h2 className="font-semibold text-lg line-clamp-2">
                      {blog.title}
                    </h2>

                    <div className="flex gap-3 mt-4">
                      <button onClick={(e) =>{
                        e.stopPropagation();
                        router.push(`/dashboard/edit/${blog._id}`)
                        }}
                         className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition">
                        <Pencil size={16} />
                        Update
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(blog._id)
                        }}
            
                        disabled={deleteBlogMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
                      >
                        <Trash2 size={16} />
                        {deleteBlogMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isFetchingNextPage && (
              <div className="text-center py-6 text-gray-400">
                Loading more blogs...
              </div>
            )}

            {hasNextPage && (
              <div ref={sentinelRef} className="h-10"/>
            )}

            {!hasNextPage && blogs.length > 0 && (
              <div className="text-center py-10 text-gray-500">
                End of blogs
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}