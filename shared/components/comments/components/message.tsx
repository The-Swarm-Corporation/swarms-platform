import React, { useState, useEffect, PropsWithChildren } from 'react';
import LikeButton from './like-button';
import ReplyForm from './form/reply';
import ReplyComponent from './reply';
import { Comment as CommentType, Reply as ReplyType } from '../types';
import Image from 'next/image';
import dayjs from 'dayjs';
import { MessageSquare } from 'lucide-react';

interface MessageProps extends PropsWithChildren {
  comment: CommentType;
  modelType: string;
}

export default function Message({
  comment,
  modelType,
  children,
}: MessageProps) {
  const [openReply, setOpenReply] = useState(false);

  function handleOpenReply() {
    setOpenReply(true);
  }

  return (
    <div className="w-full">
      <div className="grid grid-columns-double gap-2 w-full mb-4">
        <div className="h-10 w-10 relative border border-primary mt-2 rounded-full p-1">
          <Image
            src={comment?.users?.avatar_url || '/profile.png'}
            alt={comment?.users?.full_name || 'profile'}
            className="rounded-full"
            fill
          />
        </div>
        <div>
          <div className="border border-slate-800 shadow-sm rounded-md px-4 py-6">
            <div className="flex items-center gap-2">
              <div className="font-semibold">
                {comment?.users?.full_name || comment?.users?.username}
              </div>
              <span className="text-slate-400 px-2" role="presentation">
                •
              </span>
              <div className="font-normal">
                {dayjs(comment?.created_at).fromNow()}
              </div>
            </div>

            <p className="mt-6 font-normal">{comment.content}</p>
          </div>
          <div className="flex gap-12 mt-4">
            <LikeButton itemId={comment.id} type="comment" />
            <button
              onClick={handleOpenReply}
              className="outline-none border-none shadow-none flex items-center gap-2.5"
            >
              <MessageSquare size={18} /> <span>Reply</span>
            </button>
            <ReplyForm
              commentId={comment.id}
              modelType={modelType}
              open={openReply}
              setOpen={setOpenReply}
              refetchReplies={() => {}}
            />
          </div>
        </div>
      </div>

      {children}

    </div>
  );
}
