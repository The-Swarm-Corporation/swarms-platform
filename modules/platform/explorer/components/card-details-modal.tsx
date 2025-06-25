'use client';

import React, { useState } from 'react';
import Modal from '@/shared/components/modal';
import { Badge } from '@/shared/components/ui/badge';
import ReactStars from 'react-rating-star-with-type';
import {
  Crown,
  Share2,
  Tag,
  FileText,
  Cpu,
  Database,
  X,
  Wrench,
  CheckCircle,
  Edit,
  ExternalLink,
  Key,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import ShareModal from './share-modal';
import MarkdownComponent from '@/shared/components/markdown';
import { DialogTitle } from '@/shared/components/ui/dialog';

import usePurchaseStatus from '@/shared/hooks/use-purchase-status';
import EditPriceModal from '@/shared/components/marketplace/edit-price-modal';
import Image from 'next/image';
import Link from 'next/link';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: {
    id?: string;
    title: string;
    description: string;
    tags?: string[];
    user?: any;
    review?: any;
    is_free?: boolean;
    price_usd?: number | null; // USD price from database
    seller_wallet_address?: string | null;
    link?: string;
    type: 'prompt' | 'agent' | 'tool';
    icon?: React.ReactNode;
    imageUrl?: string;
    created_at?: string;
    updated_at?: string;
    usecases?: Array<{ title: string; description: string }>;
    requirements?: Array<{ package: string; installation: string }>;
    handleRoute?: (e: React.MouseEvent) => void;
  };
}

export default function CardDetailsModal({
  isOpen,
  onClose,
  cardData,
}: CardDetailsModalProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditPrice, setShowEditPrice] = useState(false);

  const {
    isOwner,
    hasPurchased,
    showPremiumBadge,
    showOwnerBadge,
    showPurchasedBadge,
  } = usePurchaseStatus({
    itemId: cardData.id || '',
    itemType: cardData.type,
    userId: cardData.user?.id,
    isFree: cardData.is_free,
  });

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleCloseButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const getTypeIcon = () => {
    switch (cardData.type) {
      case 'agent':
        return <Cpu className="w-6 h-6" />;
      case 'prompt':
        return <Database className="w-6 h-6" />;
      case 'tool':
        return <Wrench className="w-6 h-6" />;
      default:
        return cardData?.icon || <FileText className="w-6 h-6" />;
    }
  };

  const getItemColors = () => {
    switch (cardData.type) {
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => null}
        className={cn(
          'w-full max-w-5xl max-h-[80vh] md:max-h-[80vh] h-full overflow-y-hidden mx-4 md:mx-auto',
          `border ${colors.border}`,
        )}
        showHeader={false}
        showClose={false}
      >
        <button
          onClick={handleCloseButtonClick}
          className="absolute top-4 right-4 w-8 h-8 border border-[#40403F] rounded-md bg-background/20 hover:bg-red-400/50 flex items-center justify-center text-foreground/70 hover:text-foreground transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="group h-full overflow-y-auto">
          <div
            className={cn(
              'relative w-full rounded-2xl overflow-hidden',
              `bg-black/95 ${colors.bg}`,
              'p-4 md:p-8',
            )}
            style={{
              backgroundImage: cardData?.imageUrl
                ? `
                  linear-gradient(180deg, rgba(9, 11, 10, 0) 38.11%, rgba(9, 11, 10, 0.8) 88.68%),
                  linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
                  url(${cardData?.imageUrl})
                `
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Rating display in top right */}
            {cardData.review && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div className="mb-0.5">
                  <ReactStars
                    value={cardData.review.rating}
                    isEdit={false}
                    count={5}
                    size={16}
                  />
                </div>
                <span className="text-sm font-bold text-white">
                  {cardData.review.rating}/5
                </span>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    'w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center',
                    `${colors.bg} border border-current/30 ${colors.icon}`,
                  )}
                >
                  {getTypeIcon()}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                  <Badge
                    className={cn(
                      'text-xs font-mono uppercase tracking-wider px-0',
                      `bg-transparent ${colors.icon}`,
                    )}
                  >
                    {cardData.type}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-col mb-3">
                  <h1 className="text-xl md:text-3xl font-bold text-foreground leading-tight break-words">
                    {cardData.title}
                  </h1>

                  <Link
                    href={`/users/${cardData?.user?.username}`}
                    className={`flex items-center gap-2 w-fit transition-opacity rounded-md ${colors.bg} border border-current/30 px-3 py-1 backdrop-blur-sm transition-all duration-300 shadow-sm`}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                      {cardData?.user?.avatar_url ? (
                        <Image
                          src={cardData.user.avatar_url}
                          alt={cardData.user.username || 'User'}
                          width={20}
                          height={20}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-[#ccc]">
                          {cardData?.user?.username?.charAt(0)?.toUpperCase() ||
                            '?'}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold group-hover:${colors.icon}/80 transition-colors ${colors.icon}`}
                    >
                      {cardData?.user?.username || 'Anonymous'}
                    </span>
                  </Link>
                </div>

                <DialogTitle hidden />
              </div>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className={`w-4 h-4 md:w-5 md:h-5 ${colors.icon}`} />
                Description
              </h3>
              <div className="text-sm font-mono mt-2.5 font-medium md:text-base text-foreground/80 bg-zinc-950/50 p-3 rounded-md border-l-2 border-primary/50 shadow-inner w-full">
                <MarkdownComponent text={cardData?.description} />
              </div>
            </div>

            {cardData?.tags &&
              cardData.tags.length > 0 &&
              cardData?.tags[0] && (
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Tag className={`w-4 h-4 md:w-5 md:h-5 ${colors.icon}`} />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {cardData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`bg-gradient-to-r rounded-[4000px] max-md:line-clamp-3 ${colors.bg} ${colors.border} text-foreground/80 py-2 px-4 text-xs md:text-sm`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {cardData?.usecases && cardData?.usecases.length > 0 && (
              <div className="mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">
                  Use Cases
                </h3>
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  {cardData.usecases.map((usecase, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 md:p-4"
                    >
                      <h4 className="font-semibold text-foreground mb-2 text-sm md:text-base">
                        {usecase.title}
                      </h4>
                      <p className="text-muted-foreground text-xs md:text-sm">
                        {usecase.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700/50 p-4 md:p-6 md:pb-4 bg-gray-900/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 w-full md:w-auto">
              <button
                onClick={handleShare}
                className={cn(
                  'flex items-center gap-2 px-3 md:px-4 py-2 text-foreground rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto justify-center',
                  colors.button,
                )}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {/* {showOwnerBadge && cardData.price && cardData.price > 0 && (
                <button
                  onClick={() => setShowEditPrice(true)}
                  className={cn(
                  'flex items-center gap-2 px-3 md:px-4 py-2 text-foreground rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto justify-center',
                  colors.button,
                )}
                >
                  <Edit className="w-4 h-4" />
                  Edit Price
                </button>
              )} */}

              <button
                onClick={cardData.handleRoute}
                className={cn(
                  'flex items-center gap-2 px-3 md:px-4 py-2 text-foreground rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto justify-center',
                  colors.button,
                  showPremiumBadge && cardData.price_usd && cardData.price_usd > 0
                    ? 'bg-[#4ECD78]/10 border-[0.5px] border-[#4ECD78]/20 hover:bg-[#4ECD78]/20 text-[#4ECD78]'
                    : '',
                )}
              >
                {showPremiumBadge && cardData.price_usd && cardData.price_usd > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="flex items-center">Buy</span>

                    <span className="text-[#4ECD78] text-sm font-medium">
                      [${cardData.price_usd?.toFixed(2) || '0.00'}]
                    </span>
                  </div>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    {showOwnerBadge ? 'View Details' : 'Learn More'}
                  </>
                )}
              </button>
            </div>

            <div
              title={`${cardData.is_free ? 'Free' : 'Premium'} • ${cardData.type}`}
              className="font-mono hidden md:block"
            >
              {cardData.is_free ? (
                <Badge className="bg-green-500/20 hover:bg-green-500/20 text-green-400 border-green-500/30 text-sm rounded-lg flex items-center gap-2 px-3 md:px-4 py-2">
                  <Key className="w-4 h-4" />
                  Free
                </Badge>
              ) : showOwnerBadge ? (
                <Badge className="bg-blue-500/20 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 text-sm rounded-lg flex items-center gap-2 px-3 md:px-4 py-2">
                  <Edit className="w-4 h-4" />
                  <span>Author</span>
                </Badge>
              ) : showPurchasedBadge ? (
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30 text-sm rounded-lg flex items-center gap-2 px-3 md:px-4 py-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Paid</span>
                </Badge>
              ) : (
                <Badge className="bg-purple-500/20 capitalize text-purple-400 hover:bg-purple-500/20 border-purple-500/30 text-sm rounded-lg flex items-center gap-2 px-3 md:px-4 py-2">
                  <Crown className="w-4 h-4" />
                  <span>Premium</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        link={cardData.link || ''}
      />

      {showOwnerBadge && cardData.price_usd && (
        <EditPriceModal
          isOpen={showEditPrice}
          onClose={() => setShowEditPrice(false)}
          item={{
            id: cardData.id || '',
            name: cardData.title,
            type: cardData.type,
            currentPrice: cardData.price_usd,
          }}
          onPriceUpdated={() => {
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
