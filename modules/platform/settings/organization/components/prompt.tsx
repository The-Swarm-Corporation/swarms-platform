import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { PropsWithChildren } from 'react';
import { Button } from '@/shared/components/ui/Button';
import LoadingSpinner from '@/shared/components/loading-spinner';

interface ModalPromptProps extends PropsWithChildren {
  handleLeftClick?: () => void;
  handleRightClick: (...rest: any) => void;
  content?: string;
  isLoading?: boolean;
}

export default function ModalPrompt({
  children,
  handleRightClick,
  handleLeftClick,
  content,
  isLoading
}: ModalPromptProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[320px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{content}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <DialogFooter className="mt-3 flex items-center justify-center gap-4">
            <Button
              className="w-2/4"
              aria-label="Yes"
              onClick={handleLeftClick}
            >
              No
            </Button>
            <Button
              className="w-2/4"
              aria-label="Yes"
              onClick={handleRightClick}
            >
              {isLoading ? <LoadingSpinner /> : 'Yes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
