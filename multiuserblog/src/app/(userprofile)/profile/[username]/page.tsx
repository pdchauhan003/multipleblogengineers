'use client'
import { useAuth } from "@/context/authContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api/axios";
export default function ProfilePage() {
  const {user} = useAuth();
    const {data,isLoading,isFetchingNextPage,fetchNextPage,hasNextPage,} = useInfiniteQuery({
        queryKey: ['blogs'],
        initialPageParam: null as string | null,

        queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({limit: '10'});
        if (pageParam) {
            params.set('cursor', pageParam);
        }
        const res = await api.get(`/blog/profile/${user?.name}?${params.toString()}`);
        return res.data;
        },

        getNextPageParam: (lastPage) => {
        return lastPage.hasMore
            ? lastPage.nextCursor
            : undefined;
        },
    });

    const blogs =data?.pages.flatMap((page) => page.blogs) ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-300" />

          <h1 className="text-2xl font-bold mt-4">
            {user?.name}
          </h1>

          {/* <p className="text-gray-600">{user?.bio}</p> */}

          <p className="text-sm text-gray-500 mt-2">
            Joined {user?.createdAt}
          </p>

          {/* <div className="mt-4">
            <span className="font-semibold">
              {user?.totalBlogs}
            </span>{" "}
            Blogs Published
          </div> */}
        </div>
      </div>

      {/* Blogs */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Recent Blogs
        </h2>

        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="border rounded-lg p-4 hover:shadow"
            >
              <h3 className="text-lg font-semibold">
                {blog.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {blog.excerpt}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                {blog.createdAt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}