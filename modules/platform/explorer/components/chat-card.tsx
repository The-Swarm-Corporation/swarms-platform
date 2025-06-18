import { cn } from '@/shared/utils/cn';
import { getTruncatedString } from '@/shared/utils/helpers';
import { ReactNode, useState } from 'react';
import { Share2, ExternalLink, Users, BotMessageSquare } from 'lucide-react';
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
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center h-14 w-12 rounded-lg ${colors.bg} border border-current/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 shadow-sm`}>
              <div className={`${colors.icon} transition-colors`}>
                {icon}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-xs uppercase tracking-widest font-medium rounded-md ${colors.icon} border border-current/20`}>
                Chat
              </span>
              <div className="flex items-center gap-2 opacity-75 group-hover:opacity-100 transition-opacity">
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
                    <div className='w-full h-full flex items-center justify-center text-[10px] font-semibold text-[#ccc]'>
                      {user?.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <span className={`text-xs font-semibold group-hover:${colors.icon}/80 transition-colors ${colors.icon}`}>
                  {user?.username || 'Anonymous'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-75 group-hover:opacity-100 transition-opacity">
            <Users className={`h-3.5 w-3.5 ${colors.icon}`} />
            <span className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors">
              {agents?.length || 0}
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors line-clamp-1 leading-tight">
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
