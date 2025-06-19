'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import ReactStarsRating from 'react-awesome-stars-rating';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import Input from '@/shared/components/ui/Input/Input';
import { Button } from '@/shared/components/ui/button';
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
      <DialogContent className="max-w-md bg-black border border-gray-800 rounded-xl shadow-2xl backdrop-blur-sm">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight">
              Rate this {modelType}
            </DialogTitle>
            <p className="text-gray-400 text-sm">
              Share your experience and help others discover great utilities!
            </p>
          </div>

          {/* Rating Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Your Rating
            </label>
            <div className="flex justify-center py-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <ReactStarsRating
                value={rating}
                onChange={handleRating}
                isHalf
                size={32}
                starGap={6}
                count={5}
              />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-400">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300">
              Your Review
            </label>
            <Input
              id="comment"
              name="comment"
              required
              onChange={setComment}
              placeholder="Share your thoughts about this Utility..."
              className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200 min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddRating} 
              disabled={addReview.isPending || rating === 0 || comment.trim().length < 2}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addReview.isPending ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  <span>Adding...</span>
                </div>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
