export default function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
      <div className="aspect-[4/3] bg-warm-gray animate-pulse-warm" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-warm-gray rounded animate-pulse-warm w-3/4" />
        <div className="h-4 bg-warm-gray rounded animate-pulse-warm w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-warm-gray rounded-full animate-pulse-warm w-16" />
          <div className="h-6 bg-warm-gray rounded-full animate-pulse-warm w-14" />
        </div>
      </div>
    </div>
  );
}
