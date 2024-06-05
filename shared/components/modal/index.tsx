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
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showClose?: boolean;
}

const Modal = ({
  isOpen,
  title,
  onClose,
  children,
  footer,
  className,
  showHeader = true,
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent overlayClassName="backdrop-blur-md" className={className}>
        {showHeader && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogClose onClick={onClose} />
          </DialogHeader>
        )}
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
