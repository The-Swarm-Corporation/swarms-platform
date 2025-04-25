import { cn } from '@/shared/utils/cn';
import { getTruncatedString } from '@/shared/utils/helpers';
import { ReactNode, useState } from 'react';
import { Share2 } from 'lucide-react';
import Avatar from '@/shared/components/avatar';
import ShareModal from './share-modal';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';

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

  const remainingAgentsLength = Math.max(agents?.length - 3, 0);

  return (
    <div
      className={cn(
        'relative flex gap-4 p-4 px-3 rounded-lg overflow-hidden',
        'transition-all duration-200 ease-in-out',
        'bg-[#141414] border border-[#40403F]',
        'hover:shadow-lg hover:shadow-red-600/20',
        'hover:scale-[1.02] active:scale-[0.98] h-[220px]',
        className,
      )}
    >
      <div className="flex items-center justify-center h-10 bg-red-600 text-white rounded-lg aspect-square transition-colors group-hover:bg-red-500">
        {icon}
      </div>

      <div className="h-4/5 flex flex-col overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-2 flex-grow">
          <h1 className="text-xl sm:text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
            {title}
          </h1>

          <Avatar explorerUser={user} showUsername showBorder />
          {description && (
            <span title={description} className="text-sm">
              {getTruncatedString(description, 100)}
            </span>
          )}

          <div className="flex flex-wrap gap-2">
            {agents?.slice(0, 3)?.map((agent, index) => (
              <div
                key={`${agent}-${index}`}
                className="rounded-[4000px] bg-[#2e2e2e] border border-[#40403F] px-3 py-1"
              >
                <p className="text-sm font-bold text-[#F5F5F4]">
                  {getTruncatedString(agent, 30)}
                </p>
              </div>
            ))}
            {remainingAgentsLength > 0 && (
              <div
                onClick={handleCardClick}
                role="button"
                tabIndex={0}
                aria-label={`${remainingAgentsLength} more agents`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCardClick();
                  }
                }}
                className="cursor-pointer rounded-[4000px] bg-[#1f1f1f] px-3 py-1 hover:bg-primary/70"
              >
                <p className="text-sm font-bold text-[#F5F5F4]">
                  +{remainingAgentsLength}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="cursor-pointer hover:opacity-70 z-10"
        onClick={handleShowShareModal}
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
            className="fill-red-600 transition-colors hover:fill-red-500"
          />
        </svg>
        <div
          className="absolute right-0 bottom-0 text-white px-4 py-1"
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          aria-label={title}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCardClick();
            }
          }}
        >
          <div className="relative flex items-center justify-center gap-2 w-[110px]">
            <span>Learn More</span>
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

      <ShareModal
        isOpen={isShowShareModalOpen}
        onClose={handleCloseModal}
        link={link}
      />
    </div>
  );
};

export default PublicChatCard;
