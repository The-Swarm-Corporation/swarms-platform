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
import { USDPriceDisplay } from '@/shared/components/marketplace/price-display';
import usePurchaseStatus from '@/shared/hooks/use-purchase-status';

import Link from 'next/link';
import { trpc } from '@/shared/utils/trpc/trpc';

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
  price?: number | null;
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
  price,
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

    if (!authUser) {
      await checkUserSession();
      return;
    }

    if (showPremiumBadge && price && price > 0 && id && (itemType === 'prompt' || itemType === 'agent')) {
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
      router.push(link);
    }
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
      role="button"
      tabIndex={0}
      aria-label={title}
      className="relative group cursor-pointer h-full"
      onClick={handleCardClick}
    >
      <div
        className={cn(
          'relative flex flex-col h-full min-h-[240px] max-h-[280px] p-4 sm:p-6 rounded-md overflow-hidden group cursor-pointer',
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
              className={`flex items-center justify-center h-14 w-12 rounded-lg ${colors.bg} border border-current/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 shadow-sm`}
            >
              <div className={`${colors.icon} transition-colors`}>{icon}</div>
            </div>
            <div>
              <span
                className={`text-xs uppercase tracking-widest font-medium rounded-md ${colors.icon} border border-current/20`}
              >
                {itemType}
              </span>
              {user?.username && (
                <Link
                  href={`/users/${user?.username}`}
                  className={`flex items-center gap-2 transition-opacity mt-1`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username || 'User'}
                        width={20}
                        height={20}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-[#ccc]">
                        {user?.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold group-hover:${colors.icon}/80 transition-colors ${colors.icon}`}
                  >
                    {user?.username || 'Anonymous'}
                  </span>
                </Link>
              )}
            </div>
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
            onClick={handleShare}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${colors.button} hover:scale-105 active:scale-95`}
            tabIndex={-1}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <button
            className={cn(
              `flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95`,
              colors.button,
              showPremiumBadge && price && price > 0
                ? 'bg-[#4ECD78]/10 border-[0.5px] border-[#4ECD78]/20 hover:bg-[#4ECD78]/20 text-[#4ECD78]'
                : '',
            )}
            title={
              showPremiumBadge && price && price > 0
                ? `Buy this ${itemType} for ${formatPrice(price)}`
                : `View item ${itemType}`
            }
            onClick={handleViewClick}
          >
            <span>
              {showPremiumBadge && price && price > 0
                ? 'Buy'
                : btnLabel || 'Learn More'}{' '}
            </span>
            {showPremiumBadge && price && price > 0 ? (
              <USDPriceDisplay solAmount={price} className="text-[#4ECD78] text-sm" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </button>
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
          price,
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
