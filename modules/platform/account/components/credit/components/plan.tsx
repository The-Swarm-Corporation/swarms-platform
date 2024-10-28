import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/utils/cn';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { Plan } from '..';
import { Dispatch, SetStateAction } from 'react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';

interface PlanSwitchDialogProps {
  plan: Plan;
  currentPlan: Plan;
  isLoading: boolean;
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  handleConfirm: (plan: 'default' | 'invoice') => void;
}

export default function PlanSwitchDialog({
  plan,
  openModal,
  isLoading,
  currentPlan,
  setOpenModal,
  handleConfirm,
}: PlanSwitchDialogProps) {
  const { user } = useAuthContext();

  return (
    <Dialog open={openModal && !!user} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'px-6 py-0 h-8 w-28 lg:w-32 text-sm font-medium capitalize focus:outline-none focus-visible:outline-black bg-transparent text-black dark:text-white',
            'hover:bg-transparent, hover:text-primary rounded-md shadow-md',
            plan === currentPlan &&
              'bg-primary text-white hover:text-white hover:bg-primary',
          )}
        >
          {plan === 'default' ? (
            <>
              Credit
              <span className="ml-2 bg-black p-1 px-2 text-xs text-white rounded-sm shadow-sm">
                Default
              </span>
            </>
          ) : (
            'Invoice'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[320px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Can you confirm you&apos;re switching to {plan} plan?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {plan === 'default' ? (
            <span>
              You will be charged for the API usage from your credit balance. If
              you do not have enough credit, you can top up your credit balance
              to access necessary data.
            </span>
          ) : (
            <span>
              You will be charged for the API usage at the end of the month. An
              invoice gets send to you at the appropriate time.
            </span>
          )}
        </DialogDescription>
        <div className="mt-2">
          <DialogFooter className="mt-3 flex items-center justify-center gap-4">
            <DialogClose
              className="w-2/4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="No"
            >
              No
            </DialogClose>
            <Button
              className="w-2/4"
              aria-label="Yes"
              onClick={() => handleConfirm(plan)}
            >
              {isLoading ? <LoadingSpinner /> : 'Yes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
