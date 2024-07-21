import { Heart, ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';

interface LikeButtonProps {
  itemId: string | number;
  type: 'comment' | 'reply';
  likeCount?: number;
}

export default function LikeButton({ itemId, type, likeCount = 0 }: LikeButtonProps) {
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
      className="outline-none border-none shadow-none flex items-center gap-2.5"
    >
      <Heart fill={liked ? '#ab2f33' : 'none'} size={18} />{' '}
      <span>
        {0} like{likeCount !== 1 && 's'}
      </span>
    </button>
  );
}
