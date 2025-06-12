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
import ReactStars from 'react-rating-star-with-type';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';
import { getTruncatedString } from '@/shared/utils/helpers';
import { Badge } from '@/shared/components/ui/badge';

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
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div
          className="relative w-full h-[500px] bg-gradient-to-br from-red-900/20 via-black to-red-950/30 
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
                <div className="flex-1">
                  <div className="text-xs text-red-400 font-mono uppercase tracking-wider">
                    CHAT
                  </div>
                  <div className="text-red-300 text-xs">PRIORITY: HIGH</div>
                </div>
              </div>
            </div>

            <h3
              className="text-xl font-bold text-white mb-3 font-mono tracking-wide
                         bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent line-clamp-2"
            >
              {title}
            </h3>

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
                  className="bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/30 text-white py-1 px-3 shadow-sm line-clamp-1"
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
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg
                             hover:from-red-500 hover:to-red-400 transition-all duration-300
                             flex items-center gap-2 font-mono text-sm"
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
    is_free,
  }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const router = useRouter();

    const handleShare = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setShowShareModal(true);
    }, []);

    const handleCardClick = async () => {
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
          className="bg-black border-2 h-[500px] border-red-600/70 relative overflow-hidden rounded-xl
                      transition-all duration-300 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] pb-10"
        >
          <div className="bg-gradient-to-r from-red-900 to-red-800 p-3 border-b border-red-600/50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>

              {!is_free && (
                <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
              )}
            </div>
          </div>

          <div className="p-4 h-full flex flex-col">
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
                  <div className="text-red-400 text-xs font-mono">
                    STATUS: ACTIVE
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-1 flex items-center justify-between">
              <Avatar explorerUser={user} showUsername showBorder />
            </div>

            <div className="bg-gray-900/50 border flex-[0.7] border-red-600/30 p-3 mb-4 font-mono text-sm rounded-lg">
              <div className="text-green-400 mb-1">
                {'// PROMPT_DESCRIPTION'}
              </div>
              <div className="text-gray-300 leading-relaxed h-[60px] overflow-y-auto no-scrollbar">
                {description}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags?.length > 0 &&
                tags?.slice(0, 3)?.map(
                  (tag: string, index: number) =>
                    tag && (
                      <Badge
                        key={`${tag}-${index}`}
                        variant="outline"
                        className="bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/30 text-white py-1 px-3 shadow-sm line-clamp-1"
                      >
                        {tag}
                      </Badge>
                    ),
                )}
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              {id &&
                (review ? (
                  <div className="flex items-center gap-2">
                    <ReactStars
                      value={review.rating}
                      isEdit={false}
                      count={1}
                    />
                    <span className="text-red-400 text-sm font-mono">
                      {review.rating}/5
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-purple-300 font-bold uppercase">
                      rate
                    </span>
                  </div>
                ))}

              <div className="text-purple-300 font-bold uppercase">
                {is_free ? 'Free' : 'Premium'}
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
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 font-mono text-sm rounded
                             border border-red-400 transition-all duration-300
                             hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                {btnLabel || 'VIEW'}
              </button>
            </div>
          </div>

          <div
            className={`absolute left-0 right-0 h-px bg-red-400 transition-all duration-1000
                        ${isHovered ? 'top-full' : 'top-0'} shadow-[0_0_10px_rgba(239,68,68,0.8)]`}
          ></div>
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
  }: any) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const router = useRouter();

    const handleShare = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setShowShareModal(true);
    }, []);

    const handleCardClick = async () => {
      await checkUserSession();

      router.push(link);
    };

    return (
      <div className="relative group cursor-pointer" onClick={handleCardClick}>
        <div
          className="relative bg-gradient-to-br h-[500px] from-black via-red-950/20 to-black rounded-2xl
                      border-2 border-red-500 overflow-hidden
                      transition-all duration-300 hover:border-red-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]"
          style={{
            clipPath:
              'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))',
          }}
        >
          <div
            className="absolute top-0 right-0 w-8 h-8 bg-red-600 rounded-br-2xl"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-8 h-8 bg-red-600 rounded-tl-2xl"
            style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
          ></div>

          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
          </div>

          <div className="relative z-10 p-6 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl
                              flex items-center justify-center text-white shadow-lg border border-red-400/50"
                  style={{
                    clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0 100%)',
                  }}
                >
                  {icon || <Cpu className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-red-400 text-xs font-mono uppercase tracking-wider">
                    AGENT
                  </div>
                  <div className="text-green-400 text-xs font-mono">
                    OPERATIONAL
                  </div>
                </div>
              </div>
              {!is_free ? (
                <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
              ) : (
                review?.rating > 4 && (
                  <div className="text-right">
                    <div className="text-red-400 text-xs font-mono">
                      TRENDING
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-white font-mono text-xl font-bold tracking-wide
                           text-shadow-[0_0_10px_rgba(239,68,68,0.5)] line-clamp-2"
              >
                {title}
              </h3>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <Avatar explorerUser={user} showUsername showBorder />
            </div>

            <div className="flex-[0.7] mb-4">
              <div className="text-red-400 text-xs font-mono mb-2 uppercase tracking-wider">
                AGENT BRIEF:
              </div>
              <p className="text-gray-300 text-sm leading-relaxed h-[60px] overflow-y-auto no-scrollbar font-mono">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags?.length > 0 &&
                tags?.slice(0, 3)?.map(
                  (tag: string, index: number) =>
                    tag && (
                      <Badge
                        key={`${tag}-${index}`}
                        variant="outline"
                        className="bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/30 text-white py-1 px-3 shadow-sm line-clamp-1"
                      >
                        {tag}
                      </Badge>
                    ),
                )}
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              {id &&
                (review ? (
                  <div className="flex items-center gap-2">
                    <ReactStars
                      value={review.rating}
                      isEdit={false}
                      count={1}
                    />
                    <span className="text-red-400 text-sm font-mono">
                      {review.rating}/5
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-purple-300 font-bold uppercase">
                      rate
                    </span>
                  </div>
                ))}

              <div className="text-purple-300 font-bold uppercase">
                {is_free ? 'Free' : 'Premium'}
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

          <div className="absolute top-4 right-4 flex flex-col gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
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
  }: any) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const router = useRouter();

    const handleShare = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setShowShareModal(true);
    }, []);

    const handleCardClick = async () => {
      await checkUserSession();

      router.push(link);
    };

    return (
      <div className="relative group cursor-pointer" onClick={handleCardClick}>
        <div
          className="relative h-[500px] bg-gradient-to-b from-gray-900 to-black rounded-xl
                      border-l-4 border-r-4 border-red-600 border-t border-b
                      transition-all duration-300 hover:border-red-400 
                      hover:shadow-[inset_0_0_20px_rgba(239,68,68,0.2)] pb-6"
        >
          <div
            className="bg-gradient-to-r from-red-800 to-red-700 h-8 flex items-center px-4
                        border-b-2 border-red-600 rounded-t-xl"
          >
            <div className="flex items-center gap-2 flex-1">
              <div className="w-4 h-1 bg-red-400 rounded-full"></div>
              <div className="w-2 h-1 bg-red-400 rounded-full"></div>
              <div className="w-6 h-1 bg-red-400 rounded-full"></div>
            </div>
            {!is_free ? (
              <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
            ) : (
              review?.rating > 4 && (
                <div className="text-red-200 text-xs font-mono uppercase tracking-wider">
                  TRENDING
                </div>
              )
            )}
          </div>

          <div className="p-6 h-full flex flex-col">
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
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-br-xl"
                    style={{
                      clipPath:
                        'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)',
                    }}
                  ></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-mono uppercase">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <Avatar explorerUser={user} showUsername showBorder />
            </div>

            <div className="flex-[0.7] mb-1">
              <div className="bg-gray-900/70 border-l-4 border-red-500 p-4 mb-2 rounded-r-lg">
                <div className="text-red-400 text-xs font-mono mb-2 uppercase tracking-wider">
                  DESCRIPTION:
                </div>
                <p className="text-gray-300 text-sm h-[60px] overflow-y-auto no-scrollbar leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags?.length > 0 &&
                tags?.slice(0, 3)?.map(
                  (tag: string, index: number) =>
                    tag && (
                      <Badge
                        key={`${tag}-${index}`}
                        variant="outline"
                        className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-indigo-400/30 text-white py-1 px-3 shadow-sm line-clamp-1"
                      >
                        {tag}
                      </Badge>
                    ),
                )}
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              {id &&
                (review ? (
                  <div className="flex items-center gap-2">
                    <ReactStars
                      value={review.rating}
                      isEdit={false}
                      count={1}
                    />
                    <span className="text-red-400 text-sm font-mono">
                      {review.rating}/5
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-purple-300 font-bold uppercase">
                      rate
                    </span>
                  </div>
                ))}

              <div className="text-purple-300 font-bold uppercase">
                {is_free ? 'Free' : 'Premium'}
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
                className="bg-black border-2 border-red-600 text-white px-8 py-2 rounded-lg
                             hover:bg-red-600 hover:border-red-400 transition-all duration-300
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

          <div className="absolute left-0 top-12 bottom-12 w-1 bg-gradient-to-b from-red-600 via-red-400 to-red-600 rounded-full"></div>
          <div className="absolute right-0 top-12 bottom-12 w-1 bg-gradient-to-b from-red-600 via-red-400 to-red-600 rounded-full"></div>
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
