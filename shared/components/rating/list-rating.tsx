import React from 'react';
import dayjs from 'dayjs';
import ReactStars from 'react-rating-star-with-type';
import Image from 'next/image';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';

export interface ReviewProps {
  comment: string;
  created_at: string | Date;
  id: string;
  model_id: string;
  model_type: string;
  rating: number;
  user_id: string;
  users?: {
    avatar_url?: string;
    email?: string;
    full_name?: string;
    username?: string;
  };
}
dayjs.extend(relativeTime);

export default function ListReview({
  reviews = [],
  isOpen,
  onClose,
}: {
  reviews: ReviewProps[];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!reviews || reviews.length === 0) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg flex flex-col gap-2 h-[400px] overflow-y-auto">
        <h1 className="font-bold text-2xl mb-4">Reviews</h1>
        <div className="mt-2">
          {(reviews || []).map((review, i) => (
            <div key={`${review.id}-${i}`}>
              <div className="grid grid-columns-double gap-2 w-full mb-4 ">
                <div className="h-12 w-12 relative border border-primary rounded-full p-1">
                  <Image
                    src={review?.users?.avatar_url || '/profile.png'}
                    alt={review?.users?.full_name || 'profile'}
                    className="rounded-full"
                    fill
                  />
                </div>

                <div className="w-full">
                  <div className="font-semibold w-full">
                    {review?.users?.full_name || review?.users?.username}
                  </div>
                  <div className="font-normal">
                    {dayjs(review?.created_at).fromNow()}
                  </div>
                  <div className="mt-2.5">
                    <ReactStars value={review?.rating} isEdit={false} />
                    <div className="mt-1">{review.comment}</div>
                    <hr className="border-transparent" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
