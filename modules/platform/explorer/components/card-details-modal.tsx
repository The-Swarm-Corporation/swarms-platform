'use client';

import React, { useState } from 'react';
import Modal from '@/shared/components/modal';
import { Badge } from '@/shared/components/ui/badge';
import Avatar from '@/shared/components/avatar';
import ReactStars from 'react-rating-star-with-type';
import {
  Crown,
  Share2,
  Tag,
  FileText,
  Cpu,
  Database,
  X,
  Plus,
  Wrench,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import ShareModal from './share-modal';
import MarkdownComponent from '@/shared/components/markdown';
import { DialogTitle } from '@/shared/components/ui/dialog';

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
  const toast = useToast();

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

  console.log({ tag: cardData?.tags });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => null}
        className="w-full max-w-5xl max-h-[80vh] md:max-h-[80vh] h-full overflow-y-hidden border-[#40403F] border mx-4 md:mx-auto"
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
              'bg-gradient-to-r from-background to-red-950 p-4 md:p-8',
            )}
            style={{
              backgroundImage: `
                  linear-gradient(180deg, rgba(9, 11, 10, 0) 38.11%, rgba(9, 11, 10, 0.8) 88.68%),
                  linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
                  url(${cardData?.imageUrl})
                `,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x" />
            {!cardData.is_free && (
              <div className="absolute top-4 left-4">
                <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl
                              border-2 border-red-500 flex items-center justify-center text-foreground
                              shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                >
                  {getTypeIcon()}
                </div>
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-br-xl"
                  style={{
                    clipPath:
                      'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)',
                  }}
                ></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                  <Badge
                    className={cn(
                      'text-xs font-mono uppercase tracking-wider',
                      'bg-red-500/20 text-red-400 border-red-500/30',
                    )}
                  >
                    {cardData.type}
                  </Badge>
                  {!cardData.is_free && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      PREMIUM
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl md:text-3xl font-bold text-foreground mb-3 leading-tight break-words">
                  {cardData.title}
                </h1>

                <DialogTitle hidden />

                {cardData.user && (
                  <div className="flex items-center gap-3">
                    <Avatar
                      explorerUser={cardData.user}
                      showUsername
                      showBorder
                      className="text-foreground/90"
                    />
                  </div>
                )}
              </div>

              {cardData.review && (
                <div className="flex flex-col items-start md:items-end flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ReactStars
                      value={cardData.review.rating}
                      isEdit={false}
                      count={5}
                      size={16}
                    />
                  </div>
                  <span className="text-foreground/70 text-sm">
                    {cardData.review.rating}/5
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                Description
              </h3>
              <div
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
                className="text-sm font-mono mt-2.5 font-medium md:text-base text-foreground/80 bg-zinc-950/50 p-3 rounded-md border-l-2 border-primary/50 shadow-inner w-full"
              >
                <MarkdownComponent text={cardData?.description} />
              </div>
            </div>

            {cardData?.tags && cardData.tags.length > 0 && cardData?.tags[0] && (
              <div className="mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {cardData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gradient-to-r rounded-[4000px] max-md:line-clamp-3 from-red-500/10 to-red-500/20 border-red-400/30 text-foreground/80 py-2 px-4 text-xs md:text-sm"
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
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-500 text-foreground rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto justify-center"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={cardData.handleRoute}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-foreground rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                Learn More
              </button>
            </div>

            <div className="text-xs text-muted-foreground capitalize font-mono italic hidden md:block">
              {cardData.is_free ? 'Free' : 'Premium'} • {cardData.type}
            </div>
          </div>
        </div>
      </Modal>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        link={cardData.link || ''}
      />
    </>
  );
}
