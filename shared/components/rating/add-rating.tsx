'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import ReactStarsRating from 'react-awesome-stars-rating';

import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import Input from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useAuthContext } from '../ui/auth.provider';
import { useToast } from '../ui/Toasts/use-toast';
import LoadingSpinner from '../loading-spinner';

export default function AddRatingModal({
  modelType = 'model',
  open,
  setOpen,
  id,
  handleRefetch,
}: {
  id: string;
  modelType: string;
  open: boolean;
  handleRefetch: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { user } = useAuthContext();
  const addReview = trpc.explorer.addReview.useMutation();
  const toast = useToast();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  function handleRating(rate: number) {
    setRating(rate);
  }

  function handleAddRating() {
    if (!user) {
      toast.toast({ description: 'Login to continue', variant: 'destructive' });
      return;
    }

    if (!comment && comment.trim().length < 2) {
      toast.toast({
        description: 'Add a valid comment with two characters at least',
        variant: 'destructive',
      });
      return;
    }

    addReview
      .mutateAsync({
        model_id: id ?? '',
        model_type: modelType,
        rating,
        comment,
      })
      .then(() => {
        setOpen(false);
        handleRefetch();
        toast.toast({ description: 'Rating added successfully' });
      })
      .catch((err) => {
        console.error(err);
        toast.toast({
          description: 'Error adding rating',
          variant: 'destructive',
        });
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm flex flex-col gap-2">
        <h1 className="font-bold text-2xl text-primary">
          Rate this {modelType}
        </h1>
        <div className="rating">
          <ReactStarsRating
            value={rating}
            onChange={handleRating}
            isHalf
            size={30}
            starGap={4}
            count={5}
          />
        </div>
        <label htmlFor="comment" hidden>
          Comment
        </label>
        <Input
          id="comment"
          name="comment"
          required
          onChange={setComment}
          placeholder="Add a comment"
        />
        <Button onClick={handleAddRating} className="mt-4">
          {addReview.isPending ? <LoadingSpinner /> : 'Add Rating'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
