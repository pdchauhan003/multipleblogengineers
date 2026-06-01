
import { User as UserIcon, PenSquare, Clock, Tag,} from "lucide-react";
import Image from "next/image";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BlogCard({ blog }: { blog: any }) {
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
export default BlogCard;