import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { PropsWithChildren } from 'react';
import { Button } from '@/shared/components/ui/Button';
import LoadingSpinner from '@/shared/components/loading-spinner';

interface ModalPromptProps extends PropsWithChildren {
  handleClick: (...rest: any) => void;
  content?: string;
  isLoading?: boolean;
}

export default function ModalPrompt({
  children,
  handleClick,
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
            <DialogClose>
              <Button
                className="w-2/4"
                aria-label="Yes"
              >
                No
              </Button>
            </DialogClose>
            <Button
              className="w-2/4"
              aria-label="Yes"
              onClick={handleClick}
            >
              {isLoading ? <LoadingSpinner /> : 'Yes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
