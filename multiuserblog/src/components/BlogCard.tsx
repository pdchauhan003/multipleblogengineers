
import { useQueryClient } from "@tanstack/react-query";
import { User as UserIcon, PenSquare, Clock, Tag, Lock, Unlock } from "lucide-react";
import Image from "next/image";
import { handlePayment } from "@/handler/handlePayment";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BlogCard({ blog }: { blog: any }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const isLocked = blog.status === 'paid' && !blog.hasPaid;

  const handleClick = (e: React.MouseEvent) => {
    console.log('BlogCard click:', { title: blog.title, status: blog.status, hasPaid: blog.hasPaid, isLocked });
    if (isLocked) {
      e.preventDefault();
      handlePayment(blog._id, () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
        queryClient.invalidateQueries({ queryKey: ['search-blogs'] });
        queryClient.invalidateQueries({ queryKey: ['profileBlogs'] });
      });
    } else {
      router.push(`/blog/${blog.slug}`);
    }
  };

  return (
    <div onClick={handleClick} className="block group cursor-pointer h-full">
      <div className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/20 hover:-translate-y-0.5 h-full flex flex-col relative">
        {/* Lock/Unlock Badge */}
        {blog.paymentRequired && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-md bg-gray-950/70 border-white/10 select-none">
            {isLocked ? (
              <>
                <Lock size={12} className="text-amber-400" />
                <span className="text-amber-400 font-medium">Premium</span>
              </>
            ) : (
              <>
                <Unlock size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-medium">Unlocked</span>
              </>
            )}
          </div>
        )}

        {/* Cover Image */}
        {blog.coverImage ? (
          <div className="h-44 overflow-hidden relative">
            <Image
              width={400}
              height={200}
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="eager"
            />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-gray-900/60 flex items-center justify-center relative">
            <PenSquare className="text-indigo-500/40" size={40} />
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
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
          </div>

          <div className="space-y-3 pt-2">
            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <UserIcon size={12} />
                <span>{blog.authorId?.name ?? 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Clock size={12} />
                <span>{date}</span>
              </div>
            </div>

            {isLocked ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment(blog._id, () => {
                    queryClient.invalidateQueries({ queryKey: ['blogs'] });
                    queryClient.invalidateQueries({ queryKey: ['search-blogs'] });
                    queryClient.invalidateQueries({ queryKey: ['profileBlogs'] });
                  });
                }}
                className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98] text-center text-sm border border-amber-400/20 flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                Pay ₹{blog.price || 0} to Unlock
              </button>
            ) : blog.paymentRequired ? (
              <div className="w-full py-2 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-xl text-center flex items-center justify-center gap-1.5">
                <Unlock size={12} />
                Purchased & Unlocked
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
export default BlogCard;
