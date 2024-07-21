import { ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';

interface LikeButtonProps {
  itemId: string | number;
  type: 'comment' | 'reply';
}

export default function LikeButton ({ itemId, type }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);

  async function unlikeComment() {}
  async function unlikeReply() {}
  async function likeComment() {}
  async function likeReply() {}

  const handleLike = async () => {
    if (liked) {
      type === 'comment' ? await unlikeComment() : await unlikeReply();
    } else {
      type === 'comment' ? await likeComment() : await likeReply();
    }
    setLiked(!liked);
  };

  return (
    <button
      onClick={handleLike}
      className="outline-none border-none shadow-none"
    >
      {liked ? <ThumbsDown /> : <ThumbsUp />}
    </button>
  );
};
