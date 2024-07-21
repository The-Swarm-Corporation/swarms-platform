import React, { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import { Textarea } from '@/shared/components/ui/textarea';

import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/Button';

interface ReplyFormProps {
  commentId: string;
  modelType: string;
  open: boolean;
  refetchReplies: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ReplyForm({
  commentId,
  open,
  setOpen,
  modelType,
  refetchReplies,
}: ReplyFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContent('');
    refetchReplies();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md flex flex-col gap-2">
        <h2 className="font-medium text-xl">
          Reply this {modelType} comment
        </h2>

        <form onSubmit={handleSubmit} className="mt-5">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            cols={2}
            className='border-slate-800'
          />
          <Button type="submit" className="mt-8">
            Add Reply
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
