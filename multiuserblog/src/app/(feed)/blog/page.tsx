'use client';

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, } from "react";
import { LayoutDashboard, PenSquare, } from "lucide-react";
import api from "@/api/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import BlogCardSkeleton from "@/components/BlogCardSkelaton";
import BlogCard from "@/components/BlogCard";

export default function Feed() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Intersection observer sentinel ref
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['blogs'],
    initialPageParam: null as string | null,

    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '10' });
      if (pageParam) {
        params.set('cursor', pageParam);
      }
      const res = await api.get(`/blog?${params.toString()}`);
      return res.data;
    },

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore
        ? lastPage.nextCursor
        : undefined;
    },
  });
  const blogs = data?.pages.flatMap((page) => page.blogs) ?? [];


  // Intersection Observer for infinite scroll
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
      {
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 mt-6 font-medium animate-pulse tracking-wide text-sm">Loading dashboard...</p>
      </div>
    );
  }
  console.log('blod data is blogs:',blogs)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Feed</h1>
              <p className="text-gray-400 text-sm mt-0.5">Browse the latest engineering blogs</p>
            </div>
          </div>
        </header>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main Feed Column ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-200">Latest Blogs</h2>
              <span className="text-sm text-gray-500">{blogs.length} loaded</span>
            </div>

            {/* Initial skeletons */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <PenSquare className="text-indigo-400" size={28} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">No blogs published yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  There are no published blogs at the moment. Check back soon!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {blogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}

                  {/* Inline pagination skeletons */}
                  {isFetchingNextPage && (
                    <>
                      <BlogCardSkeleton />
                      {/* <BlogCardSkeleton /> */}
                    </>
                  )}
                </div>

                {/* Infinite scroll sentinel */}
                {hasNextPage && (
                  <div ref={sentinelRef} className="h-8 mt-4" />
                )}

                {/* End of feed message */}
                {!hasNextPage && blogs.length > 0 && (
                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">You&apos;re all caught up!</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}