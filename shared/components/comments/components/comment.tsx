import React, { useState } from 'react';
import ReplyComponent from './reply';
import { Comment as CommentType, Reply as ReplyType } from '../types';
import Message from './message';

interface CommentProps {
  comment: CommentType;
  modelType: string;
}

export default function Comment({ comment, modelType }: CommentProps) {
  const [replies, setReplies] = useState<ReplyType[]>([]);

  return (
    <Message comment={comment} modelType={modelType}>
      {replies.map((reply) => (
        <ReplyComponent key={reply.id} reply={reply} modelType={modelType} />
      ))}
    </Message>
  );
}
