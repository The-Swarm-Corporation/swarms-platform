import React, { useState, useEffect, useCallback } from 'react';
import CommentForm from './components/form/comment';
import Comment from './components/comment';
import { Comment as CommentType } from './types';
import { trpc } from '@/shared/utils/trpc/trpc';

interface CommentListProps {
  modelId: string;
  title: string;
}

const commentsLimit = 20;
export default function CommentList({ modelId, title }: CommentListProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [offset, setOffset] = useState(0);
  const [isFetchingComments, setIsFetchingComments] = useState(false);

  const commentsQuery = trpc.explorerOptions.getComments.useQuery({
    modelId,
    limit: commentsLimit,
    offset,
  });

  useEffect(() => {
    if (commentsQuery?.data?.comments) {
      setComments((prev) => [...prev, ...commentsQuery.data?.comments]);
      setIsFetchingComments(false);
    }
  }, [commentsQuery.data?.comments, offset]);

  const loadMorePrompts = () => {
    setOffset((prevOffset) => prevOffset + commentsLimit);
    setIsFetchingComments(true);
  };

  function refetchComments() {
    return commentsQuery.refetch();
  }

  console.log({ comments });

  return (
    <div className="mt-20 max-w-[800px] w-full">
      <h3 className="my-3">{title} comments</h3>

      <CommentForm
        modelId={modelId}
        refetchComments={refetchComments}
        title={title}
      />
      <ul className="p-0 my-8">
        {comments.map((comment) => (
          <li key={comment.id}>
            <Comment comment={comment} modelType={title} />
          </li>
        ))}
      </ul>
    </div>
  );
}
