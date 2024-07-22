import React from 'react';
import LikeButton from './like-button';
import { Reply as ReplyType, Comment } from '../types';
import Message from './message';

interface ReplyProps {
  reply: ReplyType;
  modelType: string;
}

export default function ReplyComponent({ reply, modelType }: ReplyProps) {
  return (
    <Message
      comment={reply as unknown as Comment}
      modelType={modelType}
    ></Message>
  );
}
