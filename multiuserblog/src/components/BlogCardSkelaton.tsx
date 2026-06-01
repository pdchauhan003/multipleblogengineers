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
export default BlogCardSkeleton