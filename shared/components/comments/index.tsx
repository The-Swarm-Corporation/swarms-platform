import React, { useState, useEffect } from 'react';
import CommentForm from './components/form/comment';
import Comment from './components/comment';
import { Comment as CommentType } from './types';

interface CommentListProps {
  modelId: string;
  title: string;
}

export default function CommentList({ modelId, title }: CommentListProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchComments = async () => {
    // await getComments(modelId, limit, page * limit);
    // setComments(comments);
    // setTotal(count);
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  return (
    <div className="mt-20 max-w-[400px] w-full">
      <h3 className="my-3">{title} comments</h3>

      <CommentForm
        modelId={modelId}
        refetchComments={fetchComments}
        title={title}
      />
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
