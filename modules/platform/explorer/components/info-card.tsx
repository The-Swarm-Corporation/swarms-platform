import { cn } from '@/shared/utils/cn';
import { formatPrice, getTruncatedString } from '@/shared/utils/helpers';
import { ReactNode, useState } from 'react';
import { Share2, ArrowRight } from 'lucide-react';
import Avatar from '@/shared/components/avatar';
import ShareModal from './share-modal';
import ReactStars from 'react-rating-star-with-type';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  btnLabel?: string;
  imageUrl?: string;
  input?: number | null;
  output?: number | null;
  isRating?: boolean;
  promptId?: any;
  link: string;
  userId?: string;
  id?: string;
  usersMap: any;
  reviewsMap: any;
  itemType?: 'prompt' | 'agent' | 'tool';
}

const InfoCard = ({
  title,
  description,
  icon,
  className,
  btnLabel,
  imageUrl,
  input,
  output,
  userId,
  id,
  link,
  usersMap,
  reviewsMap,
  itemType = 'prompt',
}: Props) => {
  const review = reviewsMap?.[id as string];
  const user = usersMap?.[userId as string];

  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleShowShareModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShowModalOpen(true);
  };

  const handleCloseModal = () => setIsShowModalOpen(false);

  const handleCardClick = async () => {
    await checkUserSession();
    router.push(link);
  };

  const getItemColors = () => {
    switch (itemType) {
      case 'prompt':
        return {
          icon: 'text-[#FF6B6B]',
          bg: 'bg-[#FF6B6B]/5',
          border: 'border-[#FF6B6B]/20',
          hover: 'hover:bg-[#FF6B6B]/10',
          button: 'bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 text-[#FF6B6B]'
        };
      case 'agent':
        return {
          icon: 'text-[#4ECDC4]',
          bg: 'bg-[#4ECDC4]/5',
          border: 'border-[#4ECDC4]/20',
          hover: 'hover:bg-[#4ECDC4]/10',
          button: 'bg-[#4ECDC4]/10 hover:bg-[#4ECDC4]/20 text-[#4ECDC4]'
        };
      case 'tool':
        return {
          icon: 'text-[#FFD93D]',
          bg: 'bg-[#FFD93D]/5',
          border: 'border-[#FFD93D]/20',
          hover: 'hover:bg-[#FFD93D]/10',
          button: 'bg-[#FFD93D]/10 hover:bg-[#FFD93D]/20 text-[#FFD93D]'
        };
      default:
        return {
          icon: 'text-[#FF6B6B]',
          bg: 'bg-[#FF6B6B]/5',
          border: 'border-[#FF6B6B]/20',
          hover: 'hover:bg-[#FF6B6B]/10',
          button: 'bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 text-[#FF6B6B]'
        };
    }
  };

  const colors = getItemColors();

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleCardClick();
        }
      }}
      className={cn(
        'relative flex flex-col p-6 rounded-md overflow-hidden group cursor-pointer',
        'transition-all duration-200 ease-in-out',
        'bg-black/90 backdrop-blur-lg',
        colors.border,
        'hover:shadow-lg hover:shadow-current/20',
        'hover:scale-[1.02] active:scale-[0.98]',
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {imageUrl ? (
          <div className="relative h-10 w-10">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="rounded-md object-cover"
            />
          </div>
        ) : (
          <div className={cn('flex items-center justify-center h-10 w-10 rounded-md', colors.bg)}>
            {icon}
          </div>
        )}
        <span className={cn('text-xs uppercase tracking-wider font-medium', colors.icon)}>
          {itemType}
        </span>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 tracking-tight group-hover:text-white/90 transition-colors">
        {title}
      </h3>

      <Avatar explorerUser={user} showUsername showBorder />

      <p className="text-white/70 mb-3 line-clamp-2 text-sm group-hover:text-white/80 transition-colors">
        {description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <ReactStars value={review?.rating || 0} isEdit={false} count={1} />
          <span className="text-sm font-medium text-white/70">
            {review?.rating || 0}/5
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShowShareModal}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              colors.button
            )}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={handleCardClick}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              colors.button
            )}
          >
            Learn More
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ShareModal
        isOpen={isShowShareModalOpen}
        onClose={handleCloseModal}
        title={title}
        description={description}
        link={link}
      />
    </div>
  );
};

export default InfoCard;
