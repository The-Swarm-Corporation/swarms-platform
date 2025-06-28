type ItemType = 'prompt' | 'agent' | 'tool' | 'trending';

interface SkeletonLoaderProps {
  itemType?: ItemType;
  index?: number;
}

interface ExplorerSkeletonLoadersProps {
  itemType?: ItemType;
  count?: number;
}

export function SkeletonLoader({
  itemType = 'prompt',
  index = 0,
}: SkeletonLoaderProps) {
  const getItemColors = (type: ItemType, cardIndex: number = 0) => {
    if (type === 'trending') {
      const types = ['prompt', 'agent', 'tool'];
      const cycleType = types[cardIndex % 3] as 'prompt' | 'agent' | 'tool';
      return getItemColors(cycleType);
    }

    switch (type) {
      case 'agent':
        return {
          bg: 'bg-[#4ECDC4]/5',
          border: 'border-[#4ECDC4]/20',
          icon: 'bg-[#4ECDC4]/10',
        };
      case 'tool':
        return {
          bg: 'bg-[#FFD93D]/5',
          border: 'border-[#FFD93D]/20',
          icon: 'bg-[#FFD93D]/10',
        };
      default: // prompt
        return {
          bg: 'bg-[#FF6B6B]/5',
          border: 'border-[#FF6B6B]/20',
          icon: 'bg-[#FF6B6B]/10',
        };
    }
  };

  const colors = getItemColors(itemType, index);

  return (
    <div
      className={`h-[150px] md:h-[200px] ${colors.bg} border ${colors.border} p-4 rounded-md animate-pulse`}
    >
      <div className="flex items-center gap-4 w-full mb-4">
        <div className={`w-10 h-10 ${colors.icon} rounded-md`} />
        <div className={`h-5 ${colors.icon} w-1/3 rounded`} />
      </div>

      <div className={`h-3/5 ${colors.icon} rounded mb-2`} />
    </div>
  );
}

export function ExplorerSkeletonLoaders({
  itemType = 'prompt',
  count = 3,
}: ExplorerSkeletonLoadersProps) {
  return (
    <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} itemType={itemType} index={i} />
      ))}
    </div>
  );
}
