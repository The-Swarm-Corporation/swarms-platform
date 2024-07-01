export function SkeletonLoader() {
  return (
    <div className="h-[150px] md:h-[200px] bg-zinc-800 p-4 rounded-md animate-pulse flex space-x-4">
      <div className="w-10 h-10 bg-neutral-700 rounded-md mb-4" />

      <div className="w-full">
        <div className="h-1/5 bg-neutral-700 rounded mb-2" />
        <div className="h-3/4 bg-neutral-700 rounded mb-4" />
      </div>
    </div>
  );
}

export function ExplorerSkeletonLoaders() {
  return (
    <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonLoader key={i} />
      ))}
    </div>
  );
}
