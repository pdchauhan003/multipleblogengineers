'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import { useMyBlogs } from '@/hooks/useBlog';

export default function Dashboard() {
  const router = useRouter();
  const { user,loading } = useAuth();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {data,isLoading,hasNextPage,fetchNextPage,isFetchingNextPage} = useMyBlogs(user?.name || '');

  const blogs =
    data?.pages.flatMap((page) => page.blogs) ?? [];

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
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasNextPage,isFetchingNextPage,fetchNextPage,]);

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

          <button
            onClick={() => router.push('/dashboard/create')}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
          >
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
                <div
                  key={blog._id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="relative h-52">
                    <Image
                      src={
                        blog.coverImage ||
                        '/placeholder-blog.jpg'
                      }
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h2 className="font-semibold text-lg line-clamp-2">
                      {blog.title}
                    </h2>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/edit/${blog._id}`
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
                      >
                        <Pencil size={16} />
                        Update
                      </button>

                      <button
                        onClick={() => {
                          console.log(
                            'Delete:',
                            blog._id
                          );
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                      >
                        <Trash2 size={16} />
                        Delete
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
              <div
                ref={sentinelRef}
                className="h-10"
              />
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