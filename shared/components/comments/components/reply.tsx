import React from 'react';
import LikeButton from './like-button';
import { Reply as ReplyType } from '../types';

interface ReplyProps {
  reply: ReplyType;
}

export default function ReplyComponent({ reply }: ReplyProps) {
  return (
    <div>
      <p>{reply.content}</p>
      <LikeButton itemId={reply.id} type="reply" />
    </div>
  );
}
