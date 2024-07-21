import React, { FormEvent, useState } from 'react';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/Button';

interface ReplyFormProps {
  commentId: string;
  refetchReplies: () => void;
}

export default function ReplyForm({ commentId, refetchReplies }: ReplyFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContent('');
    refetchReplies();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <Button type="submit">Add Reply</Button>
    </form>
  );
}
