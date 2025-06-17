import { cn } from '@/shared/utils/cn';
import { formatPrice, getTruncatedString } from '@/shared/utils/helpers';
import { ReactNode, useCallback, useState } from 'react';
import { Crown, Database, Share2 } from 'lucide-react';
import Avatar from '@/shared/components/avatar';
import ShareModal from './share-modal';
import ReactStars from 'react-rating-star-with-type';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CardDetailsModal from './card-details-modal';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
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
  is_free?: boolean;
  usecases?: { title: string; description: string }[];
  requirements?: Array<{ package: string; installation: string }>;
  tags?: string[];
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
  tags,
  is_free,
  usecases,
  requirements,
}: Props) => {
  const review = reviewsMap?.[id as string];
  const user = usersMap?.[userId as string];

  const { user: authUser } = useAuthContext();

  const [isHovered, setIsHovered] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  }, []);

  const handleCardClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetailsModal(true);
  };

  const handleViewClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (authUser) {
      router.push(link);
    } else {
      await checkUserSession();
      router.push(link);
    }
  };

  const renderPrice = (label: string, price: number) => (
    <li className="pricing-unit flex items-center gap-2 bg-black rounded px-2 py-1">
      <span className="font-semibold text-white">{label}</span>
      <span className="text-red-500">{formatPrice(price)}/1M Tokens</span>
    </li>
  );

  return (
    <div
      className="relative group cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div
        className={cn(
          'relative flex gap-4 p-4 px-3 rounded-lg overflow-hidden group cursor-pointer',
          'transition-all duration-200 ease-in-out',
          'bg-black border border-red-600',
          'hover:shadow-lg hover:shadow-red-600/20',
          'hover:scale-[1.02] active:scale-[0.98]',
          className,
        )}
      >
        <div className="flex absolute right-2 top-2 mb-1">
          {!is_free && (
            <Crown className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
          )}
        </div>
        <div className="mt-2">
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
            <div className="flex items-center justify-center h-10 bg-red-600 text-white rounded-lg aspect-square transition-colors group-hover:bg-red-500">
              {icon}
            </div>
          )}

          {id && (
            <div className="mt-3 relative flex items-center justify-center gap-1 xl:hidden">
              <div className="mb-0.5">
                <ReactStars value={review?.rating} isEdit={false} count={1} />
              </div>
              <span className="text-xs font-semibold">
                {review?.rating || 0}/5
              </span>
            </div>
          )}
        </div>

        <div className="h-4/5 flex flex-col overflow-y-auto no-scrollbar mt-2">
          <div className="flex flex-col gap-2 flex-grow">
            <h1 className="text-xl sm:text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
              {title}
            </h1>

            <Avatar explorerUser={user} showUsername showBorder />
            <span title={description} className="text-sm">
              {getTruncatedString(description, 100)}
            </span>
          </div>

          {(input || output) && (
            <ul className="p-0 my-3 flex items-center gap-2">
              {input && renderPrice('Input', input)}
              {output && renderPrice('Output', output)}
            </ul>
          )}
        </div>

        {id && (
          <div className="bottom-2 left-4 absolute items-center justify-center gap-1 hidden xl:flex">
            <div className="mb-0.5">
              <ReactStars value={review?.rating} isEdit={false} count={1} />
            </div>
            <span className="text-sm font-semibold">
              {review?.rating || 0}/5
            </span>
          </div>
        )}

        <div
          className="cursor-pointer hover:opacity-70 z-10"
          onClick={handleShare}
        >
          <svg
            width="95"
            height="25"
            viewBox="0 0 95 25"
            xmlns="http://www.w3.org/2000/svg"
            className="rating-svg absolute right-[150px] xl:right-[120px] bottom-0 scale-x-[2.5] scale-y-[1.8]"
          >
            <path d="M21 0H95V25H0L21 0Z" className="fill-red-600" />
          </svg>
          <div className="absolute right-[150px] bottom-0 text-white px-4 py-1">
            <div className="relative flex items-center justify-center gap-2 w-[80px] xl:w-[66px] group">
              <span>Share</span>
              <Share2 className="group-hover:text-red-500 transition-colors" />
            </div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 z-10">
          <svg
            width="95"
            height="25"
            viewBox="0 0 95 25"
            xmlns="http://www.w3.org/2000/svg"
            className="preview-svg scale-x-[2.5] scale-y-[1.8]"
          >
            <path
              d="M21 0H95V25H0L21 0Z"
              className={`${isHovered ? 'fill-red-500' : 'fill-red-600'} transition-colors`}
            />
          </svg>
          <div
            className="absolute right-0 bottom-0 text-white px-4 py-1"
            onClick={handleViewClick}
            role="button"
            tabIndex={0}
            aria-label={title}
          >
            <div className="relative flex items-center justify-center gap-2 w-[110px]">
              <span>{btnLabel || 'Learn More'}</span>
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
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        link={link}
      />

      <CardDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        cardData={{
          id,
          title,
          description,
          tags,
          user,
          review,
          is_free,
          link,
          usecases,
          requirements,
          type: 'prompt',
          icon: icon || <Database className="w-6 h-6" />,
          handleRoute: handleViewClick,
        }}
      />
    </div>
  );
};

export default InfoCard;
