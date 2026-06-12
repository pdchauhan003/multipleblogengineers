'use client';

import { useAuth } from "@/context/authContext";
import { useMyBlogs } from "@/hooks/useBlog";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User as UserIcon, Calendar, Mail, Shield, BookOpen, ChevronLeft } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import BlogCardSkeleton from "@/components/BlogCardSkelaton";
import api from "@/api/axios";


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

export default function ProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [selectRole, setRole] = useState('');

  // Redirect if not authenticated (backend requires auth for profile blogs)
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useMyBlogs(username); //infinite query

  const blogs = data?.pages.flatMap((page) => page.blogs) ?? [];  // blogs store 
  console.log('select role is ', selectRole)
  // Determine user info to display
  const isOwnProfile = currentUser?.name.toLowerCase() === decodeURIComponent(username).toLowerCase();

  // Try to extract author info from first blog if not own profile
  const firstBlogAuthor = blogs[0]?.authorId;
  const displayName = isOwnProfile ? currentUser?.name : (firstBlogAuthor?.name || username);
  const displayEmail = isOwnProfile ? currentUser?.email : firstBlogAuthor?.email;
  const displayRole = isOwnProfile ? currentUser?.role : null;
  const joinedDate = isOwnProfile && currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  // Infinite Scroll Trigger
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (authLoading || (!currentUser && !isLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-400 mt-6 font-medium animate-pulse tracking-wide text-sm">
          Loading profile...
        </p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await api.put('/auth/urole', {
        id: currentUser?._id,
        role: selectRole,
      });

      if (response.data.success) {
        router.refresh(); // Refresh server data
        alert('role is update success');
      }
    } 
    catch (error) {
      alert('update api fetch error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white animate-fade-in animate-duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8">

        {/* Navigation back to dashboard */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98] rounded-xl px-3 py-1.5 text-xs hover:bg-white/5 text-gray-300 hover:text-white flex items-center gap-2 hover:text-indigo-400 text-gray-400 transition border border-transparent"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Sidebar */}
          <div className="lg:w-80 space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-center flex flex-col items-center">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-indigo-500/10">
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </div>

              <h1 className="text-2xl font-bold mt-4 tracking-tight">{displayName}</h1>
              {displayEmail && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                  <Mail size={14} />
                  <span>{displayEmail}</span>
                </div>
              )}

              {/* Role badge */}
              {displayRole && (
                <>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold mt-4 capitalize">
                    <Shield size={12} />
                    <span>{displayRole}</span>
                  </div>
                  {
                    currentUser?.role === 'visitor' && (
                      <select
                        value={selectRole}
                        onChange={(e) => setRole(e.target.value)}
                        className="text-black bg-amber-50 rounded-2xl my-3 px-2 py-1 w-full"
                      >
                        <option value="" disabled>Select Role</option>
                        <option value="visitor">Visitor</option>
                        <option value="creator">Creator</option>
                      </select>
                    )}
                  {selectRole !== '' && (
                    <button onClick={handleSubmit} className="text-black bg-blue-300 px-3 py-1 rounded-2xl w-full font-medium hover:bg-blue-400 transition-colors">
                      Submit
                    </button>
                  )}
                </>
              )}

              <div className="w-full border-t border-white/10 my-5" />

              <div className="w-full text-left space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BookOpen size={16} />
                    <span>Total Blogs</span>
                  </div>
                  <span className="font-semibold text-white">{blogs.length}</span>
                </div>

                {joinedDate && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      <span>Joined</span>
                    </div>
                    <span className="font-semibold text-white">{joinedDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blogs Feed */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-200">
              Recent Publications
              <span className="text-sm font-normal text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                {blogs.length}
              </span>
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <UserIcon size={28} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">No blogs published yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  This user hasn&apos;t published any articles yet.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {blogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}

                  {/* Inline skeleton loader while fetching next page */}
                  {isFetchingNextPage && (
                    <>
                      <BlogCardSkeleton />
                      <BlogCardSkeleton />
                    </>
                  )}
                </div>

                {/* Observer sentinel */}
                {hasNextPage && <div ref={sentinelRef} className="h-8 mt-4" />}

                {/* All caught up banner */}
                {!hasNextPage && blogs.length > 0 && (
                  <div className="flex items-center gap-4 mt-8 animate-fade-in">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">
                      End of Profile Feed
                    </span>
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