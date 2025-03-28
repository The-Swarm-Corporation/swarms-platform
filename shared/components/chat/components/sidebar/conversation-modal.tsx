import { cn } from '@/shared/utils/cn';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Plus } from 'lucide-react';
import LoadingSpinner from '@/shared/components/loading-spinner';

interface ConversationModalProps {
  title?: string;
  description?: string;
  ctaText?: string;
  isCreatePending: boolean;
  isDeletePending: boolean;
  isClonePending: boolean;
  isTrigger?: boolean;
  isMobile: boolean;
  isExpanded: boolean;
  newChatName: string;
  setNewChatName: React.Dispatch<React.SetStateAction<string>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleClick: () => void;
}

export default function ConversationModal({
  isCreatePending,
  isDeletePending,
  isClonePending,
  isExpanded,
  isMobile,
  isTrigger = true,
  newChatName,
  isDialogOpen,
  title = 'New Conversation',
  description = 'Give your conversation a name to get started.',
  ctaText = 'Create',
  setNewChatName,
  setIsDialogOpen,
  handleClick,
}: ConversationModalProps) {
  return (
    <div
      className={cn(
        'p-4 border-t border-[#f9f9f914] pb-8 lg:block',
        isMobile && isExpanded ? 'block' : 'hidden',
      )}
    >
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {isTrigger ? (
            <Button
              disabled={isCreatePending || isDeletePending || isClonePending}
              className={`${isExpanded ? 'w-full' : 'w-auto'} bg-primary/40 hover:bg-primary/70 text-white`}
            >
              {!isCreatePending && <Plus className="h-4 w-4" />}
              {isExpanded && <span className="ml-2">New Chat</span>}
              {isCreatePending && <LoadingSpinner size={18} />}
            </Button>
          ) : (
            <div />
          )}
        </DialogTrigger>
        <DialogContent className="border-[#40403F] border">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Enter conversation name..."
              className="bg-white/80 dark:bg-zinc-950/80"
            />
            <Button
              onClick={handleClick}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              disabled={!newChatName.trim()}
            >
              {ctaText} {isCreatePending && <LoadingSpinner size={18} className='ml-2' />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
