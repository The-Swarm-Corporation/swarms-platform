import { cn } from '@/shared/utils/cn';
import { formatPrice, getTruncatedString } from '@/shared/utils/helpers';
import { ReactNode, useState } from 'react';
import { Share2, ShoppingCart, ExternalLink } from 'lucide-react';
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
  isPremium?: boolean;
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
  isPremium = false,
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

  const renderPrice = (label: string, price: number) => (
    <li className="pricing-unit flex items-center gap-2 bg-black/50 rounded px-2 py-1">
      <span className="font-semibold text-white">{label}</span>
      <span className="text-red-500">{formatPrice(price)}/1M Tokens</span>
    </li>
  );

  const getItemColors = () => {
    switch (itemType) {
      case 'agent':
        return {
          icon: 'text-[#4ECDC4]',
          bg: 'bg-[#4ECDC4]/5',
          border: 'border-[#4ECDC4]/40',
          hover: 'hover:bg-[#4ECDC4]/15',
          button:
            'bg-[#4ECDC4]/10 border-[0.5px] border-[#4ECDC4]/20 hover:bg-[#4ECDC4]/20 text-[#4ECDC4]',
        };
      case 'tool':
        return {
          icon: 'text-[#FFD93D]',
          bg: 'bg-[#FFD93D]/5',
          border: 'border-[#FFD93D]/40',
          hover: 'hover:bg-[#FFD93D]/15',
          button:
            'bg-[#FFD93D]/10 border-[0.5px] border-[#FFD93D]/20 hover:bg-[#FFD93D]/20 text-[#FFD93D]',
        };
      default: // prompt
        return {
          icon: 'text-[#FF6B6B]',
          bg: 'bg-[#FF6B6B]/5',
          border: 'border-[#FF6B6B]/40',
          hover: 'hover:bg-[#FF6B6B]/15',
          button:
            'bg-[#FF6B6B]/10 border-[0.5px] border-[#FF6B6B]/20 hover:bg-[#FF6B6B]/20 text-[#FF6B6B]',
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
        'relative flex flex-col h-full min-h-[280px] max-h-[350px] p-4 sm:p-6 rounded-xl overflow-hidden group cursor-pointer',
        'transition-all duration-300 ease-in-out',
        'bg-black/95 border',
        'hover:shadow-xl hover:shadow-current/30',
        'hover:scale-[1.02] sm:hover:scale-[1.03] active:scale-[0.98]',
        'backdrop-blur-sm',
        'border-gray-800',
        colors.bg,
        className,
      )}
    >
      {id && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
          <div className="mb-0.5">
            <ReactStars
              value={review?.rating}
              isEdit={false}
              count={1}
              size={16}
            />
          </div>
          <span className="text-sm font-bold text-white">
            {review?.rating || 0}
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center h-5 w-5 rounded-xl transition-all duration-300 group-hover:scale-110`}
          >
            <div className={`${colors.icon} transition-colors`}>{icon}</div>
          </div>
          <span
            className={`text-xs uppercase tracking-widest font-medium rounded-md ${colors.icon} border border-current/20`}
          >
            {itemType}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.username || 'User'}
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                {user?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-white/80">
            @{user?.username || 'Unknown'}
          </span>
        </div>

        <h1 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors line-clamp-1 leading-tight">
          {title}
        </h1>

        <p className="text-sm text-white/70 group-hover:text-white/80 transition-colors line-clamp-2 flex-1">
          {getTruncatedString(description, 80)}
        </p>

        {(input || output) && (
          <div className="flex items-center gap-2 flex-wrap">
            {input && renderPrice('Input', input)}
            {output && renderPrice('Output', output)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
        <button
          onClick={handleShowShareModal}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${colors.button} hover:scale-105 active:scale-95`}
          tabIndex={-1}
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${colors.button} hover:scale-105 active:scale-95`}
          tabIndex={-1}
        >
          <span>{isPremium ? 'Buy Now' : btnLabel || 'Learn More'}</span>
          {isPremium ? (
            <ShoppingCart className="h-4 w-4" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
        </button>
      </div>

      <ShareModal
        isOpen={isShowShareModalOpen}
        onClose={handleCloseModal}
        link={link}
      />
    </div>
  );
};

export default InfoCard;
