import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/components/ui/dialog';
import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/shared/components/ui/Button';
import LoadingSpinner from '@/shared/components/loading-spinner';

interface DeleteContentProps {
  handleClick: (...rest: any) => void;
  isLoading?: boolean;
  openDialog?: boolean;
  type: 'comment' | 'reply';
  setOpenDialog?: Dispatch<SetStateAction<boolean>>;
}

export default function DeleteContent({
  handleClick,
  type,
  isLoading,
  openDialog,
  setOpenDialog,
}: DeleteContentProps) {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="max-w-[320px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>You are trying to delete this {type}?</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <DialogFooter className="mt-3 flex items-center justify-center gap-4">
            <DialogClose
              className="w-2/4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 bg-white text-black"
              aria-label="No"
            >
              No
            </DialogClose>
            <Button className="w-2/4" aria-label="Yes" onClick={handleClick}>
              <span className="mr-2">Yes</span>{' '}
              {isLoading && <LoadingSpinner />}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
