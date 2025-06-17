import { cn } from '@/shared/utils/cn';
import { getTruncatedString } from '@/shared/utils/helpers';
import { ReactNode, useState } from 'react';
import { Share2, ExternalLink, Users } from 'lucide-react';
import ShareModal from './share-modal';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  link: string;
  userId?: string;
  usersMap: any;
  agents: string[];
}

const PublicChatCard = ({
  title,
  description,
  icon,
  className,
  userId,
  link,
  usersMap,
  agents,
}: Props) => {
  const user = usersMap?.[userId as string];

  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleShowShareModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShowModalOpen(true);
  };

  const handleCloseModal = () => setIsShowModalOpen(false);

  const handleCardClick = async () => {
    router.push(link);
  };

  const colors = {
    icon: 'text-[#4ECDC4]',
    bg: 'bg-[#4ECDC4]/5',
    border: 'border-[#4ECDC4]/40',
    hover: 'hover:bg-[#4ECDC4]/15',
    button:
      'bg-[#4ECDC4]/10 border-[0.5px] border-[#4ECDC4]/20 hover:bg-[#4ECDC4]/20 text-[#4ECDC4]',
  };

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
        'relative flex flex-col h-full min-h-[280px] max-h-[350px] p-4 sm:p-6 rounded-md overflow-hidden group cursor-pointer',
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
            Chat
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
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
          <div className="flex items-center gap-1.5">
            <Users className={`h-4 w-4 ${colors.icon}`} />
            <span className="text-sm font-medium text-white/80">
              {agents?.length || 0}
            </span>
          </div>
        </div>

        <h1 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors line-clamp-1 leading-tight">
          {title}
        </h1>

        <p className="text-sm text-white/70 group-hover:text-white/80 transition-colors line-clamp-2 flex-1">
          {getTruncatedString(
            description ||
              'Join this public conversation and explore AI-powered discussions with multiple agents.',
            80,
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
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
          <span>Join Chat</span>
          <ExternalLink className="h-4 w-4" />
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

export default PublicChatCard;
