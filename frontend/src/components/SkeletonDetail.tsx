export default function SkeletonDetail() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <div className="h-8 bg-warm-gray rounded animate-pulse-warm w-24 mb-6" />
      <div className="aspect-[16/9] bg-warm-gray rounded-xl animate-pulse-warm mb-6" />
      <div className="h-8 bg-warm-gray rounded animate-pulse-warm w-2/3 mb-4" />
      <div className="flex gap-3 mb-8">
        <div className="h-8 bg-warm-gray rounded-full animate-pulse-warm w-24" />
        <div className="h-8 bg-warm-gray rounded-full animate-pulse-warm w-20" />
        <div className="h-8 bg-warm-gray rounded-full animate-pulse-warm w-28" />
      </div>
      <div className="h-6 bg-warm-gray rounded animate-pulse-warm w-32 mb-4" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-5 bg-warm-gray rounded animate-pulse-warm w-full mb-3" />
      ))}
      <div className="h-6 bg-warm-gray rounded animate-pulse-warm w-32 mt-8 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-warm-gray rounded animate-pulse-warm w-full mb-3" />
      ))}
    </div>
  );
}
