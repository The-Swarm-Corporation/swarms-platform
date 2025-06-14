import { memo, ReactNode, useCallback, useState } from 'react';
import {
  ChevronRight,
  Cpu,
  Crown,
  Database,
  Settings,
  Share2,
  Star,
  Zap,
} from 'lucide-react';
import Avatar from '@/shared/components/avatar';
import ShareModal from './share-modal';
import CardDetailsModal from './card-details-modal';
import ReactStars from 'react-rating-star-with-type';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';
import { getTruncatedString } from '@/shared/utils/helpers';
import { Badge } from '@/shared/components/ui/badge';
import { RequirementProps } from '@/shared/components/entity/agent-requirements';

type UseCasesProps = { title: string; description: string };
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
  usecases?: UseCasesProps[];
  requirements?: RequirementProps;
  usersMap: any;
  reviewsMap: any;
  tags: string[];
  agents?: string[];
  is_free?: boolean;
  variant?: 'chat' | 'prompts' | 'agents' | 'tools';
}

const PublicChatsCard = memo(
  ({ title, description, icon, btnLabel, link, agents, user }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const router = useRouter();

    const handleShare = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setShowShareModal(true);
    }, []);

    const remainingAgentsLength = Math.max(agents?.length - 3, 0);

    const handleCardClick = async () => {
      await checkUserSession();
      router.push(link);
    };

    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative w-full h-80 bg-gradient-to-br from-red-900/20 via-black to-red-950/30 
                      rounded-2xl border border-red-500/50 overflow-hidden transition-all duration-500
                      hover:border-red-400 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]
                      before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-red-500/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
          style={{
            clipPath:
              'polygon(25px 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%, 0 25px)',
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(239,68,68,0.3)_25%,rgba(239,68,68,0.3)_26%,transparent_27%,transparent_74%,rgba(239,68,68,0.3)_75%,rgba(239,68,68,0.3)_76%,transparent_77%),linear-gradient(rgba(239,68,68,0.3)_24%,transparent_25%,transparent_26%,rgba(239,68,68,0.3)_27%,rgba(239,68,68,0.3)_74%,transparent_75%,transparent_76%,rgba(239,68,68,0.3)_77%)] bg-[length:50px_50px]"></div>
          </div>

          <div
            className={`absolute inset-0 bg-gradient-to-b from-transparent via-red-400/30 to-transparent h-8 
                        transition-transform duration-2000 ${isHovered ? 'translate-y-full' : '-translate-y-full'}`}
          ></div>

          <div className="relative z-10 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <div
                    className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl
                            flex items-center justify-center text-white shadow-lg
                            border border-red-400/50"
                    style={{
                      clipPath:
                        'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                    }}
                  >
                    {icon || <Zap className="w-6 h-6" />}
                  </div>
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold text-white mb-3 font-mono tracking-wide
                         bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent line-clamp-2"
                  >
                    {title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <Avatar explorerUser={user} showUsername showBorder />
            </div>

            {description && (
              <p className="text-gray-300 text-sm flex-1 leading-relaxed h-[60px] overflow-y-auto no-scrollbar">
                {description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 h-20 overflow-y-auto no-scrollbar">
              {agents?.slice(0, 3)?.map((agent: string, index: number) => (
                <Badge
                  key={`${agent}-${index}`}
                  variant="outline"
                  className="bg-gradient-to-r flex items-center from-emerald-500/30 to-teal-500/30 border-emerald-400/30 text-white py-1 px-3 shadow-sm"
                >
                  {agent}
                </Badge>
              ))}
              {remainingAgentsLength > 0 && (
                <Badge
                  variant="outline"
                  onClick={handleCardClick}
                  role="button"
                  tabIndex={0}
                  aria-label={`${remainingAgentsLength} more agents`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCardClick();
                    }
                  }}
                  className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-indigo-400/30 text-white py-1 px-3 shadow-sm text-sm font-bold"
                >
                  +{remainingAgentsLength}
                </Badge>
              )}
            </div>

            <div className="mt-auto flex justify-between items-center">
              <button
                onClick={handleShare}
                className="bg-transparent hover:bg-red-500 text-white px-4 py-2.5 font-mono text-sm rounded flex items-center gap-2
                             border border-[#40403F] transition-all duration-300
                             hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg
                             hover:from-red-500 hover:to-red-400 transition-all duration-300
                             flex items-center gap-2 font-mono text-sm"
                aria-label="Review chat"
                onClick={handleCardClick}
              >
                {btnLabel || 'REVIEW'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-lg"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-lg"></div>
        </div>
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          link={link}
        />
      </div>
    );
  },
);

const PromptsCard = memo(
  ({
    title,
    description,
    icon,
    btnLabel,
    link,
    review,
    user,
    id,
    tags,
    usecases,
    requirements,
    is_free,
  }: any) => {
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
      await checkUserSession();
      router.push(link);
    };

    return (
      <div
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div
          className="bg-black border-2 h-80 border-red-600/50 relative overflow-hidden rounded-xl
                      transition-all duration-300 hover:border-red-400/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"></div>

              {!is_free && (
                <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
              )}
            </div>
          </div>

          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div>
                  <div
                    className="w-10 h-10 bg-red-600 text-white flex items-center justify-center rounded-lg
                            border border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                  >
                    {icon || <Database className="w-5 h-5" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-mono text-lg font-bold line-clamp-2">
                    {title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="mb-1 flex items-center justify-between">
              <Avatar explorerUser={user} showUsername showBorder />

              {review?.rating > 0 && (
                <div className="flex items-center gap-2">
                  <ReactStars value={review.rating} isEdit={false} count={1} />
                  <span className="text-red-400 text-sm font-mono">
                    {review.rating || 0}/5
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-900/50 border flex-[0.5] border-red-600/30 p-3 mb-4 font-mono text-sm rounded-lg">
              <div className="text-green-400 mb-2 text-xs">
                {'// PROMPT DESCRIPTION'}
              </div>
              <div className="text-gray-300 leading-relaxed line-clamp-2">
                {description}
              </div>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <button
                onClick={handleShare}
                className="bg-transparent hover:bg-red-500 text-white px-4 py-2.5 font-mono text-sm rounded flex items-center gap-2
                             border border-[#40403F] transition-all duration-300
                             hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                <Share2 className="w-4 h-4" />
                SHARE
              </button>
              <button
                aria-label="View Prompt"
                onClick={handleViewClick}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 font-mono text-sm rounded
                             border border-red-400 transition-all duration-300
                             hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                {btnLabel || 'VIEW'}
              </button>
            </div>
          </div>

          <div
            className={`absolute left-0 right-0 h-px bg-red-400/50 transition-all duration-1000
                        ${isHovered ? 'top-full' : 'top-0'} shadow-[0_0_10px_rgba(239,68,68,0.8)]`}
          ></div>
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
  },
);

const AgentsCard = memo(
  ({
    title,
    description,
    icon,
    btnLabel,
    link,
    review,
    user,
    id,
    tags,
    is_free,
    usecases,
    requirements,
  }: any) => {
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

    const handleDeployClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await checkUserSession();
      router.push(link);
    };

    return (
      <div className="relative group cursor-pointer" onClick={handleCardClick}>
        <div
          className="relative bg-gradient-to-br h-80 from-black via-red-950/20 to-black rounded-2xl
                      border-2 border-red-500/50 overflow-hidden
                      transition-all duration-300 hover:border-red-300/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]"
          style={{
            clipPath:
              'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))',
          }}
        >
          <div
            className="absolute top-0 right-0 w-8 h-8 bg-red-600/50 rounded-br-2xl"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-8 h-8 bg-red-600/50 rounded-tl-2xl"
            style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
          ></div>

          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
          </div>

          <div className="relative z-10 p-6 h-full flex flex-col">
            {!is_free && (
              <div className="flex items-start justify-between mb-4">
                <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div>
                <div
                  className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl
                              flex items-center justify-center text-white shadow-lg border border-red-400/50"
                  style={{
                    clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0 100%)',
                  }}
                >
                  {icon || <Cpu className="w-6 h-6" />}
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-white font-mono text-xl font-bold tracking-wide
                           text-shadow-[0_0_10px_rgba(239,68,68,0.5)] line-clamp-2"
                >
                  {title}
                </h3>
              </div>
            </div>

            <div className="my-4 flex items-center justify-between">
              <Avatar explorerUser={user} showUsername showBorder />
              {review?.rating > 0 && (
                <div className="flex items-center gap-2">
                  <ReactStars value={review.rating} isEdit={false} count={1} />
                  <span className="text-red-400 text-sm font-mono">
                    {review.rating || 0}/5
                  </span>
                </div>
              )}
            </div>

            <div className="flex-[0.5] mb-4">
              <div className="text-red-400 text-xs font-mono mb-2 uppercase tracking-wider">
                AGENT DESCRIPTION:
              </div>
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                {description}
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <button
                onClick={handleShare}
                className="bg-transparent hover:bg-red-500 text-white px-4 py-2 font-mono text-sm rounded flex items-center gap-2
                             border border-[#40403F] transition-all duration-300
                             hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                <Share2 className="w-4 h-4" />
                SHARE
              </button>
              <button
                aria-label="Deploy Agent"
                onClick={handleDeployClick}
                className="bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-2 rounded-xl
                             hover:from-red-600 hover:to-red-500 transition-all duration-300
                             font-mono text-sm font-bold tracking-wider
                             shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                style={{
                  clipPath:
                    'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                }}
              >
                {btnLabel || 'DEPLOY'}
              </button>
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
            usecases,
            requirements,
            link,
            type: 'agent',
            icon: icon || <Cpu className="w-6 h-6" />,
            handleRoute: handleDeployClick,
          }}
        />
      </div>
    );
  },
);

const ToolsCard = memo(
  ({
    title,
    description,
    icon,
    btnLabel,
    link,
    review,
    user,
    id,
    tags,
    is_free,
    usecases,
    requirements,
  }: any) => {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const router = useRouter();

    const handleShare = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setShowShareModal(true);
    }, []);

    const handleToolCardClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowDetailsModal(true);
    };

    const handleLearnMore = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await checkUserSession();
      router.push(link);
    };

    return (
      <div
        className="relative group cursor-pointer"
        onClick={handleToolCardClick}
      >
        <div
          className="relative h-80 bg-gradient-to-b from-gray-900 to-black rounded-xl
                      border-l border-r border-red-600/50 border-t border-b
                      transition-all duration-300 hover:border-red-400/50 
                      hover:shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]"
        >
          {!is_free && (
            <div>
              <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
            </div>
          )}

          <div className="p-6 pb-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl
                              border-2 border-red-500 flex items-center justify-center text-white
                              shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                  >
                    {icon || <Settings className="w-7 h-7" />}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                    {title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <Avatar explorerUser={user} showUsername showBorder />
              {review?.rating > 0 && (
                <div className="flex items-center gap-2">
                  <ReactStars value={review.rating} isEdit={false} count={1} />
                  <span className="text-red-400 text-sm font-mono">
                    {review.rating || 0}/5
                  </span>
                </div>
              )}
            </div>

            <div className="flex-[0.5] mb-4">
              <div className="bg-gray-900/70 p-4 rounded-r-lg">
                <div className="text-red-400 text-xs font-mono mb-2 uppercase tracking-wider">
                  DESCRIPTION:
                </div>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-mono"
              >
                <Share2 className="w-4 h-4" />
                SHARE
              </button>
              <button
                aria-label="Learn more"
                onClick={handleLearnMore}
                className="bg-black border-2 border-red-600/50 text-white px-8 py-2 rounded-lg
                             hover:bg-red-600/50 hover:border-red-400/50 transition-all duration-300
                             font-mono text-sm font-bold tracking-wider uppercase
                             shadow-[0_4px_15px_rgba(0,0,0,0.3)]
                             relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {btnLabel || 'LEARN MORE'}
                </span>
              </button>
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
            usecases,
            requirements,
            link,
            type: 'tool',
            icon: icon || <Cpu className="w-6 h-6" />,
            handleRoute: handleLearnMore,
          }}
        />
      </div>
    );
  },
);

// Main InfoCard component
const InfoCard = memo((props: Props) => {
  const { variant = 'prompts', reviewsMap, usersMap, id, userId } = props;
  const review = reviewsMap?.[id as string];
  const user = usersMap?.[userId as string];

  const cardProps = {
    ...props,
    review,
    user,
  };

  switch (variant) {
    case 'chat':
      return <PublicChatsCard {...cardProps} />;
    case 'prompts':
      return <PromptsCard {...cardProps} />;
    case 'agents':
      return <AgentsCard {...cardProps} />;
    case 'tools':
      return <ToolsCard {...cardProps} />;
    default:
      return <PromptsCard {...cardProps} />;
  }
});

InfoCard.displayName = 'InfoCard';
PublicChatsCard.displayName = 'PublicChatsCard';
PromptsCard.displayName = 'PromptsCard';
AgentsCard.displayName = 'AgentsCard';
ToolsCard.displayName = 'ToolsCard';

export default InfoCard;
