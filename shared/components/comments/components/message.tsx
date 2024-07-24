import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useRef,
} from 'react';
import LikeButton from './like-button';
import { Comment as CommentType, Reply as ReplyType } from '../types';
import Image from 'next/image';
import dayjs from 'dayjs';
import { AArrowDown, AArrowUp, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import useToggle from '@/shared/hooks/toggle';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';
import { cn } from '@/shared/utils/cn';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { usePathname } from 'next/navigation';
import { useToast } from '../../ui/Toasts/use-toast';

interface MessageProps extends PropsWithChildren {
  comment: CommentType | ReplyType;
  handleOpenReply?: () => void;
  handleEdit?: () => void;
  handleDelete?: () => void;
  type: 'comment' | 'reply';
  className?: string;
  refetchLikes?: () => void;
  handleCloseExpanded?: () => void;
}

export default function Message({
  comment,
  children,
  type,
  className,
  refetchLikes,
  handleCloseExpanded,
  handleEdit,
  handleDelete,
  handleOpenReply,
}: MessageProps) {
  const { user } = useAuthContext();
  const dropdownRef = useRef(null);
  const { isOn, setOn, setOff } = useToggle();
  useOnClickOutside(dropdownRef, setOff);

  const pathname = usePathname();
  const toast = useToast();

  const handleCopyLink = () => {
    const commentUrl = `${window.location.origin}${pathname}#${comment.id}`;
    navigator.clipboard.writeText(commentUrl);
    toast.toast({ description: 'Link copied to clipboard!' });
  };

  return (
    <div id={comment.id} className="w-full max-sm:text-xs">
      <a href={`${pathname}#${comment.id}`}></a>
      <div
        className={cn(
          'grid grid-columns-double gap-1 md:gap-2 w-full mb-4',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 md:h-10 md:w-10 relative border border-slate-800 mt-2 rounded-full p-1">
            <Image
              src={comment?.users?.avatar_url || '/profile.png'}
              alt={comment?.users?.full_name || 'profile'}
              className="rounded-full"
              fill
            />
          </div>
          {type === 'comment' && (
            <AArrowUp
              size={20}
              onClick={handleCloseExpanded}
              className="cursor-pointer"
            />
          )}
        </div>
        <div>
          <div className="border border-slate-800 shadow-sm relative rounded-md px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-0.5 md:gap-2">
                <div className="font-semibold">
                  {comment?.users?.full_name || comment?.users?.username}
                </div>
                <span
                  className="text-slate-400 px-1 md:px-2"
                  role="presentation"
                >
                  •
                </span>
                <div className="font-normal">
                  {dayjs(comment?.created_at).fromNow()}
                </div>
              </div>
              <div
                className="absolute max-md:right-2 md:relative cursor-pointer"
                onClick={setOn}
              >
                <Button variant="outline" className="!p-3 h-5 rounded-sm">
                  •••
                </Button>

                {isOn && (
                  <ul
                    ref={dropdownRef}
                    className={cn(
                      'w-36 absolute z-10 p-0 right-0 mt-1 transition duration-150 bg-black text-white border border-secondary bg-opacity-75 rounded-md shadow-lg',
                    )}
                  >
                    {comment?.user_id === user?.id && (
                      <li
                        onClick={handleEdit}
                        className="p-2 text-sm rounded-t-md border-b-zinc-800 border-b hover:bg-destructive hover:text-white"
                      >
                        Edit {type}
                      </li>
                    )}
                    {comment?.user_id === user?.id && (
                      <li
                        onClick={handleDelete}
                        className="p-2 text-sm rounded-b-md border-b-zinc-800 border-b hover:bg-destructive hover:text-white"
                      >
                        Delete {type}
                      </li>
                    )}
                    <li
                      onClick={handleCopyLink}
                      className="p-2 text-sm rounded-b-md hover:bg-destructive hover:text-white"
                    >
                      Copy link
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <p className="mt-6 font-normal">{comment?.content}</p>
          </div>
          <div className="flex gap-2 md:gap-6 mt-2 md:mt-3">
            <LikeButton
              itemId={comment?.id}
              type={type}
              isLiked={comment?.user_has_liked}
              likesCount={comment?.like_count}
              refetchLikes={refetchLikes}
            />
            <button
              onClick={handleOpenReply}
              className="outline-none border-none shadow-none flex items-center gap-1 md:gap-2.5"
            >
              <MessageSquare size={18} /> <span>Reply</span>
            </button>
            {comment?.is_edited && (
              <div className="text-slate-400 mt-0.5">
                Edited on{' '}
                {comment?.updated_at &&
                  dayjs(comment.updated_at).format('MMMM, DD')}
              </div>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
