import { cn } from '@/shared/utils/cn';
import React from 'react';

export function CommentsItemSkeleton({ className }: { className?: string }) {
  return (
    <div className="grid grid-columns-double gap-2 w-full mb-4">
      <div className="h-10 w-10 relative border-2 border-zinc-800 bg-zinc-800 mt-2 rounded-full animate-pulse p-1" />
      <div
        className={cn(
          'bg-zinc-800 w-full h-[100px] rounded-md animate-pulse',
          className,
        )}
      />
    </div>
  );
}

export default function CommentsSkeleton() {
  return (
    <div>
      <CommentsItemSkeleton />
      <div className="my-7 flex justify-end w-full">
        <div className="w-full max-w-[750px]">
          <CommentsItemSkeleton className="h-[80px]" />
        </div>
      </div>
    </div>
  );
}
