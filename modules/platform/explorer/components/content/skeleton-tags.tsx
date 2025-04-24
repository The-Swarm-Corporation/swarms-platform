type SkeletonTagsProps = {
  className?: string;
  desktopMb?: number;
  mobilePb?: string;
  isMobileMb?: boolean;
  bgColor?: string;
};

export const SkeletonTags = ({
  className = '',
  desktopMb = 6,
  mobilePb = '8px',
  isMobileMb = true,
  bgColor = '#22201F',
}: SkeletonTagsProps) => {
  return (
    <div className={className}>
      <div
        className={`hidden lg:flex space-x-2 overflow-x-auto mb-${desktopMb}`}
        style={{ marginBottom: `${desktopMb * 4}px` }}
      >
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="rounded-full w-[70px] h-[35px] animate-pulse"
            style={{ backgroundColor: bgColor }}
          />
        ))}
      </div>

      {/* Mobile skeletons */}
      <div
        className={`flex lg:hidden space-x-1 overflow-x-auto ${
          isMobileMb ? 'mb-2 sm:mb-4' : 'mb-0'
        }`}
        style={{
          paddingBottom: mobilePb,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-full w-[60px] h-[35px] animate-pulse"
            style={{ backgroundColor: bgColor }}
          />
        ))}
      </div>
    </div>
  );
};
