/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { LogOut, LayoutDashboard, User as UserIcon, Shield, PenSquare, Clock, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";
import api from "@/api/axios";
import Image from "next/image";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  status: 'draft' | 'published';
  createdAt: string;
  authorId?: {
    name: string;
    email: string;
  };
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-white/10 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-white/10 rounded-lg" />
        <div className="h-4 w-full bg-white/10 rounded-lg" />
        <div className="h-4 w-2/3 bg-white/10 rounded-lg" />
        <div className="flex justify-between mt-4">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-4 w-16 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/20 hover:-translate-y-0.5">
      {/* Cover Image */}
      {blog.coverImage ? (
        <div className="h-44 overflow-hidden">
          <Image
            width={200}
            height={200}
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-gray-900/60 flex items-center justify-center">
          <PenSquare className="text-indigo-500/40" size={40} />
        </div>
      )}

      <div className="p-5 space-y-3">
        {/* Category badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Tag size={10} />
          {blog.category}
        </span>

        {/* Title */}
        <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
          {blog.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <UserIcon size={12} />
            <span>{blog.authorId?.name ?? 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Clock size={12} />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Intersection observer sentinel ref
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchBlogs = useCallback(async (cursor: string | null = null) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetching(true);

    try {
      const params = new URLSearchParams({ limit: '10' });
      if (cursor) params.set('cursor', cursor);

      const res = await api.get(`/blog?${params.toString()}`);
      const data = res.data;

      if (data.success) {
        setBlogs(prev => cursor ? [...prev, ...data.blogs] : data.blogs);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!loading && user) {
      fetchBlogs(null);
    }
  }, [loading, user, fetchBlogs]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
          fetchBlogs(nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, fetchBlogs]);

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
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">Browse the latest engineering blogs</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/30 hover:border-transparent rounded-lg text-red-400 hover:text-white transition-all active:scale-[0.98] self-start"
          >
            <LogOut size={16} />
            <span className="font-medium text-sm">Log Out</span>
          </button>
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
            {initialLoading ? (
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
                  {isFetching && !initialLoading && (
                    <>
                      <BlogCardSkeleton />
                      <BlogCardSkeleton />
                    </>
                  )}
                </div>

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div ref={sentinelRef} className="h-8 mt-4" />
                )}

                {/* End of feed message */}
                {!hasMore && blogs.length > 0 && (
                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">You&apos;re all caught up!</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar Column ── */}
          <div className="lg:w-72 xl:w-80 space-y-5 lg:sticky lg:top-8 lg:self-start">

            {/* Profile Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account</h2>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="p-1.5 bg-gray-800 rounded-lg text-gray-400">
                  <Shield size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Role</p>
                  <p className="text-xs font-semibold text-white capitalize">{user.role}</p>
                </div>
              </div>

              {/* Status badge */}
              <div className="pt-2 border-t border-white/10">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                  Connected
                </span>
              </div>
            </div>

            {/* Creator Actions — only visible to creators */}
            {user.role === 'creator' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Creator Tools</h2>
                <Link
                  href="/dashboard/create"
                  className="flex items-center justify-between p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <PenSquare size={16} />
                    <span className="text-sm font-semibold">Write New Blog</span>
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}