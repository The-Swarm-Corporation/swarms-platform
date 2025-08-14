import { cn } from '@/shared/utils/cn';
import { formatPrice, getTruncatedString } from '@/shared/utils/helpers';
import { ReactNode, useCallback, useState } from 'react';
import { Database, ExternalLink, Share2 } from 'lucide-react';
import ShareModal from './share-modal';
import ReactStars from 'react-rating-star-with-type';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CardDetailsModal from './card-details-modal';
import { useAuthContext } from '@/shared/components/ui/auth.provider';

import usePurchaseStatus from '@/shared/hooks/use-purchase-status';
import { trpc } from '@/shared/utils/trpc/trpc';
import Link from 'next/link';

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
  price_usd?: number | null;
  seller_wallet_address?: string | null;
  itemType?: 'prompt' | 'agent' | 'tool';
  isPremium?: boolean;
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
  price_usd,
  seller_wallet_address,
  itemType = 'prompt',
  usecases,
  requirements,
}: Props) => {
  const review = reviewsMap?.[id as string];
  const user = usersMap?.[userId as string];

  const { user: authUser } = useAuthContext();
  const generateToken = trpc.marketplace.generateAccessToken.useMutation();
  const { showPremiumBadge } = usePurchaseStatus({
    itemId: id || '',
    itemType,
    userId,
    isFree: is_free,
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isShareModalClosing, setIsShareModalClosing] = useState(false);
  const router = useRouter();

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowShareModal(true);
  }, []);

  const handleShareModalClose = useCallback(() => {
    setIsShareModalClosing(true);
    setShowShareModal(false);
    setTimeout(() => {
      setIsShareModalClosing(false);
    }, 100);
  }, []);

  const handleCardClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShareModalClosing || showShareModal) {
      return;
    }
    setShowDetailsModal(true);
  };

  const handleViewClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isNavigating || generateToken.isPending) {
      return;
    }

    setIsNavigating(true);

    try {
      const isPaidContent = showPremiumBadge && price_usd && price_usd > 0;

      if (isPaidContent && !authUser) {
        await checkUserSession();
        return;
      }

      if (
        isPaidContent &&
        id &&
        (itemType === 'prompt' || itemType === 'agent')
      ) {
        try {
          const result = await generateToken.mutateAsync({
            itemId: id,
            itemType: itemType as 'prompt' | 'agent',
          });
          router.push(`/access/${itemType}/${result.token}`);
        } catch (error) {
          console.error('Failed to generate access token:', error);
          router.push(link);
        }
      } else {
        // Free content or authenticated user - direct navigation
        router.push(link);
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
    }
  };

  const renderPrice = (label: string, price: number) => (
    <li className="pricing-unit flex items-center gap-2 bg-black/50 rounded px-2 py-1">
      <span className="font-semibold text-white">{label}</span>
      <span className="text-red-500">{formatPrice(price)}/1M Tokens</span>
    </li>
  );

  // Neutral colors for all item types
  const colors = {
    icon: 'text-gray-300',
    bg: 'bg-gray-800/20',
    border: 'border-gray-700/50',
    hover: 'hover:bg-gray-800/30',
    button: 'bg-green-500/15 border border-green-500/40 hover:bg-green-500/25 text-green-400 hover:text-green-300',
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      className="relative group cursor-pointer h-full"
      onClick={handleCardClick}
    >
      <div
        className={cn(
          'relative flex flex-col h-full min-h-[320px] max-h-[380px] rounded-xl overflow-hidden group cursor-pointer',
          'transition-all duration-300 ease-in-out',
          'bg-zinc-800/30 backdrop-blur-xl border border-zinc-700/50',
          'hover:shadow-2xl hover:shadow-current/20',
          'hover:scale-[1.02] sm:hover:scale-[1.03] active:scale-[0.98]',
          'hover:bg-zinc-700/30 hover:border-zinc-600/50',
          className,
        )}
      >
        {/* Image Section */}
        {imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden bg-zinc-900/50">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Rating overlay on image */}
            {id && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-zinc-900/70 backdrop-blur-sm rounded-full px-2.5 py-1.5">
                <div className="mb-0.5">
                  <ReactStars
                    value={review?.rating}
                    isEdit={false}
                    count={1}
                    size={14}
                  />
                </div>
                <span className="text-xs font-bold text-white">
                  {review?.rating || 0}
                </span>
              </div>
            )}

            {/* Item type badge on image */}
            <div className="absolute top-3 left-3 z-10">
              <span
                className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border text-white bg-zinc-900/50 border-zinc-600/50"
              >
                {itemType}
              </span>
            </div>
          </div>
        ) : (
          // Fallback when no image - show only type badge
          <div className="relative h-32 w-full flex flex-col items-center justify-center bg-zinc-900/50 border-b border-zinc-700/50">
            {/* Item type badge */}
            <span
              className="text-sm uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full border text-zinc-300 bg-zinc-800/30 border-zinc-600/50"
            >
              {itemType}
            </span>

            {/* Rating for no-image cards */}
            {id && !imageUrl && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-zinc-900/60 backdrop-blur-sm rounded-full px-2.5 py-1.5">
                <div className="mb-0.5">
                  <ReactStars
                    value={review?.rating}
                    isEdit={false}
                    count={1}
                    size={14}
                  />
                </div>
                <span className="text-xs font-bold text-white">
                  {review?.rating || 0}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-4 sm:p-5">
          {/* Author info */}
          {user?.username && (
            <Link
              href={`/users/${user?.username}`}
              className="flex items-center gap-2 mb-3 group/author hover:bg-zinc-700/30 rounded-lg p-1 -m-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800/50 border border-zinc-600/50">
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.username || 'User'}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-zinc-300">
                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover/author:text-white transition-colors">
                {user?.username || 'Anonymous'}
              </span>
            </Link>
          )}

          {/* Title */}
          <h1 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors line-clamp-2 leading-tight mb-2">
            {title}
          </h1>

          {/* Description */}
          <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors line-clamp-3 flex-1 leading-relaxed">
            {getTruncatedString(description, 120)}
          </p>

          {/* Pricing info */}
          {(input || output) && (
            <div className="flex items-center gap-2 flex-wrap mt-3 mb-3">
              {input && renderPrice('Input', input)}
              {output && renderPrice('Output', output)}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-700/50">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white"
              tabIndex={-1}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white"
              title={
                showPremiumBadge && price_usd && price_usd > 0
                  ? `Buy this ${itemType} for $${price_usd?.toFixed(2) || '0.00'}`
                  : `View item ${itemType}`
              }
              onClick={handleViewClick}
              disabled={isNavigating || generateToken.isPending}
            >
              <span>
                {isNavigating || generateToken.isPending ? (
                  <div className="flex items-center gap-1 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-1" />
                    Loading...
                  </div>
                ) : (
                  <>
                    {showPremiumBadge && price_usd && price_usd > 0
                      ? 'Buy'
                      : btnLabel || 'View'}{' '}
                  </>
                )}
              </span>
              {showPremiumBadge && price_usd && price_usd > 0 ? (
                <span className="text-white-400 text-sm font-medium">
                  [${price_usd?.toFixed(2) || '0.00'}]
                </span>
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={handleShareModalClose}
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
          price_usd,
          seller_wallet_address,
          link,
          usecases,
          requirements,
          type: itemType,
          icon: icon || <Database className="w-6 h-6" />,
          handleRoute: handleViewClick,
        }}
      />
    </div>
  );
};

export default InfoCard;