import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { Button } from '@/shared/components/ui/Button';
import LoadingSpinner from '@/shared/components/loading-spinner';

interface ModalPromptProps extends PropsWithChildren {
  handleClick: (...rest: any) => void;
  content?: string;
  isLoading?: boolean;
  openDialog?: boolean;
  setOpenDialog?: Dispatch<SetStateAction<boolean>>;
}

export default function ModalPrompt({
  children,
  handleClick,
  content,
  isLoading,
  openDialog,
  setOpenDialog,
}: ModalPromptProps) {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[320px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{content}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <DialogFooter className="mt-3 flex items-center justify-center gap-4">
            <DialogClose
              className="w-2/4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="No"
            >
              No
            </DialogClose>
            <Button className="w-2/4" aria-label="Yes" onClick={handleClick}>
              {isLoading ? <LoadingSpinner /> : 'Yes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
