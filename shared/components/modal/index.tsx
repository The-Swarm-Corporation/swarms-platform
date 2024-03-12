import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const Modal = ({
  isOpen,
  title,
  onClose,
  children,
  footer,
  className
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        {children}
        {footer && (
          <div className="mt-4">
            <DialogFooter>{footer}</DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
