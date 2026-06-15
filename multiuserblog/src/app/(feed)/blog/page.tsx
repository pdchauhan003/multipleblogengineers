'use client';

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { LayoutDashboard, PenSquare, Search, X, Loader2, SearchX } from "lucide-react";
import api from "@/api/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import BlogCardSkeleton from "@/components/BlogCardSkelaton";
import BlogCard from "@/components/BlogCard";
import { useDebounce } from "@/hooks/useDebounce";

export default function Feed() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Search state 
  const [searchInput, setSearchInput] = useState('');
  const debouncedQuery = useDebounce(searchInput.trim(), 400);  // call debounce
  const isSearchMode = debouncedQuery.length > 0;    //check search or not

  // Sentinel refs for infinite scroll 
  const feedSentinelRef = useRef<HTMLDivElement | null>(null);  // check feed blog divs
  const searchSentinelRef = useRef<HTMLDivElement | null>(null); // check search blog last scroll divs
  const searchInputRef = useRef<HTMLInputElement | null>(null);  // check search Inputes

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Feed query 
  const {
    data: feedData,
    isLoading: feedLoading,
    isFetchingNextPage: feedFetchingMore,
    fetchNextPage: feedFetchMore,
    hasNextPage: feedHasMore,
  } = useInfiniteQuery({
    queryKey: ['blogs'],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '10' });
      if (pageParam) params.set('cursor', pageParam);
      const res = await api.get(`/blog?${params.toString()}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !isSearchMode,  // when snot any search then its call
  });

  //  Search query 
  const {
    data: searchData,
    isLoading: searchLoading,
    isFetchingNextPage: searchFetchingMore,
    fetchNextPage: searchFetchMore,
    hasNextPage: searchHasMore,
  } = useInfiniteQuery({
    queryKey: ['search-blogs', debouncedQuery],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ q: debouncedQuery, limit: '10' });
      if (pageParam) params.set('cursor', pageParam);
      const res = await api.get(`/blog/search?${params.toString()}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: isSearchMode, // when search anything then call it 
  });

  const feedBlogs = feedData?.pages.flatMap((p) => p.blogs) ?? [];
  const searchBlogs = searchData?.pages.flatMap((p) => p.blogs) ?? [];

  //Intersection
  const setupObserver = useCallback(
    (
      ref: React.RefObject<HTMLDivElement | null>,
      fetchMore: () => void,
      hasMore: boolean | undefined,
      isFetching: boolean,
    ) => {
      if (!ref.current) return () => {};
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore && !isFetching) {
            fetchMore();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    },
    [],
  );

  useEffect(
    () => setupObserver(feedSentinelRef, feedFetchMore, feedHasMore, feedFetchingMore),
    [feedFetchMore, feedHasMore, feedFetchingMore, setupObserver],
  );

  useEffect(
    () => setupObserver(searchSentinelRef, searchFetchMore, searchHasMore, searchFetchingMore),
    [searchFetchMore, searchHasMore, searchFetchingMore, setupObserver],
  );

  // Show spinner only while auth is being checked.
  // Once loading is done: if no user → the useEffect will redirect to /login.
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-400 mt-6 font-medium animate-pulse tracking-wide text-sm">Loading feed...</p>
      </div>
    );
  }

  // Auth resolved but no user — redirect in progress (useEffect above handles it)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8">

        {/* ── Header ── */}
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

        {/* ── Search Bar ── */}
        <div className="mb-8">
          <div className="relative group max-w-2xl mx-auto">
            {/* Glow ring on focus */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-indigo-500/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />

            <div className="relative flex items-center bg-white/5 border border-white/10 group-focus-within:border-indigo-500/50 rounded-2xl transition-all duration-300 overflow-hidden">
              {/* Search icon */}
              <div className="pl-4 pr-2 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-200">
                {searchLoading && isSearchMode
                  ? <Loader2 size={18} className="animate-spin text-indigo-400" />
                  : <Search size={18} />}
              </div>

              <input
                ref={searchInputRef}
                id="blog-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search blogs by title…"
                className="flex-1 bg-transparent py-3.5 pr-2 text-white placeholder-gray-500 text-sm outline-none"
                autoComplete="off"
                spellCheck={false}
              />

              {/* Clear button  x sign*/}
              {searchInput && (
                <button
                  id="clear-search-btn"
                  onClick={() => {
                    setSearchInput('');
                    searchInputRef.current?.focus();
                  }}
                  className="mr-3 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-150"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Live hint */}
            {isSearchMode && (
              <p className="mt-2 text-center text-xs text-gray-600">
                Showing results for &nbsp;<span className="text-indigo-400 font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
              </p>
            )}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main feed / search results ── */}
          <div className="flex-1 min-w-0">

            {/* Section heading */}
            <div className="flex items-center justify-between mb-5">
              {isSearchMode ? (
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <Search size={16} className="text-indigo-400" />
                  Search Results
                </h2>
              ) : (
                <h2 className="text-lg font-semibold text-gray-200">Latest Blogs</h2>
              )}
              <span className="text-sm text-gray-500">
                {isSearchMode ? searchBlogs.length : feedBlogs.length} loaded
              </span>
            </div>

            {/* ════════════════════════════════════════
                SEARCH MODE
            ════════════════════════════════════════ */}
            {isSearchMode ? (
              <>
                {/* Initial search skeleton */}
                {searchLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => <BlogCardSkeleton key={i} />)}
                  </div>

                ) : searchBlogs.length === 0 ? (
                  /* No results */
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                      <SearchX className="text-indigo-400" size={28} />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">No blogs found</h3>
                    <p className="text-gray-500 text-sm max-w-xs">
                      No results for &ldquo;<span className="text-indigo-400">{debouncedQuery}</span>&rdquo;. Try a different keyword.
                    </p>
                  </div>

                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {searchBlogs.map((blog) => (
                        <BlogCard key={blog._id} blog={blog} />
                      ))}
                      {searchFetchingMore && <BlogCardSkeleton />}
                    </div>

                    {/* Search infinite scroll sentinel */}
                    {searchHasMore && (
                      <div ref={searchSentinelRef} className="h-8 mt-4" />
                    )}

                    {/* End of search results */}
                    {!searchHasMore && searchBlogs.length > 0 && (
                      <div className="flex items-center gap-4 mt-8">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-gray-500 text-xs font-medium whitespace-nowrap">
                          All {searchBlogs.length} result{searchBlogs.length !== 1 ? 's' : ''} shown
                        </span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                    )}
                  </>
                )}
              </>

            ) : (
              /* ════════════════════════════════════════
                 FEED MODE
              ════════════════════════════════════════ */
              <>
                {feedLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
                  </div>

                ) : feedBlogs.length === 0 ? (
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
                      {feedBlogs.map((blog) => (
                        <BlogCard key={blog._id} blog={blog} />
                      ))}
                      {feedFetchingMore && <BlogCardSkeleton />}
                    </div>

                    {/* Feed infinite scroll sentinel */}
                    {feedHasMore && (
                      <div ref={feedSentinelRef} className="h-8 mt-4" />
                    )}

                    {/* End of feed */}
                    {!feedHasMore && feedBlogs.length > 0 && (
                      <div className="flex items-center gap-4 mt-8">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-gray-500 text-xs font-medium whitespace-nowrap">You&apos;re all caught up!</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}