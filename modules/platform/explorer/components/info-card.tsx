import { cn } from '@/shared/utils/cn';
import { formatPrice, getTruncatedString } from '@/shared/utils/helpers';
import { ReactNode, useState } from 'react';
import { Share2 } from 'lucide-react';
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

  const [isButtonHover, setIsButtonHover] = useState(false);
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
          border: 'border-[#4ECDC4]/20',
          hover: 'hover:bg-[#4ECDC4]/10',
          button: 'bg-[#4ECDC4]/10 border-[#4ECDC4]/50 hover:bg-[#4ECDC4]/20'
        };
      case 'tool':
        return {
          icon: 'text-[#FFD93D]',
          bg: 'bg-[#FFD93D]/5',
          border: 'border-[#FFD93D]/20',
          hover: 'hover:bg-[#FFD93D]/10',
          button: 'bg-[#FFD93D]/10 border-[#FFD93D]/50 hover:bg-[#FFD93D]/20'
        };
      default: // prompt
        return {
          icon: 'text-[#FF6B6B]',
          bg: 'bg-[#FF6B6B]/5',
          border: 'border-[#FF6B6B]/20',
          hover: 'hover:bg-[#FF6B6B]/10',
          button: 'bg-[#FF6B6B]/10 border-[#FF6B6B]/50 hover:bg-[#FF6B6B]/20'
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
        'relative flex flex-col justify-between h-full min-h-[260px] max-h-[320px] gap-4 p-6 rounded-lg overflow-hidden group cursor-pointer',
        'transition-all duration-200 ease-in-out',
        'bg-black/90 border border-gray-800',
        'hover:shadow-lg hover:shadow-current/20',
        'hover:scale-[1.02] active:scale-[0.98]',
        colors.bg,
        className,
      )}
    >
      {/* Rating */}
      {id && (
        <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
          <div className="mb-0.5">
            <ReactStars value={review?.rating} isEdit={false} count={1} />
          </div>
          <span className="text-sm font-semibold text-white/80">
            {review?.rating || 0}/5
          </span>
        </div>
      )}

      {/* Top Section: Icon/Image, Title, User, Description, Price */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center gap-3 mb-1">
          {imageUrl ? (
            <div className="relative h-10 aspect-square">
              <Image
                src={imageUrl ?? ''}
                alt={title}
                fill
                className="rounded-lg border border-primary/30"
              />
            </div>
          ) : (
            <div className={`flex items-center justify-center h-10 ${colors.bg} text-white rounded-lg aspect-square transition-colors group-hover:bg-opacity-20`}>
              {icon}
            </div>
          )}
          <span className={`text-xs uppercase tracking-wider font-medium ${colors.icon}`}>
            {itemType}
          </span>
        </div>
        <h1 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors line-clamp-1">
          {title}
        </h1>
        <Avatar explorerUser={user} showUsername showBorder />
        <span
          title={description}
          className="text-sm text-white/70 group-hover:text-white/80 transition-colors truncate"
        >
          {getTruncatedString(description, 80)}
        </span>
        {(input || output) && (
          <ul className="p-0 my-2 flex items-center gap-2">
            {input && renderPrice('Input', input)}
            {output && renderPrice('Output', output)}
          </ul>
        )}
      </div>

      {/* Buttons at the bottom */}
      <div className="flex items-center gap-3 mt-2 pt-2">
        <button
          onClick={handleShowShareModal}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md ${colors.button} text-white transition-all duration-200 group`}
          tabIndex={-1}
        >
          <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Share</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md ${colors.button} text-white transition-all duration-200 group`}
          tabIndex={-1}
        >
          <span className="text-sm font-medium">{btnLabel || 'Learn More'}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.74999 2H4.99999V3.5H5.74999H11.4393L2.21966 12.7197L1.68933 13.25L2.74999 14.3107L3.28032 13.7803L12.4988 4.56182V10.25V11H13.9988V10.25V3C13.9988 2.44772 13.5511 2 12.9988 2H5.74999Z"
              fill="currentColor"
            />
          </svg>
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