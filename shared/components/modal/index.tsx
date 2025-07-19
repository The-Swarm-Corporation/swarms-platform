import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Props {
  isOpen: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showClose?: boolean;
  overlayClassName?: string;
}

const Modal = ({
  isOpen,
  title,
  description,
  onClose,
  children,
  footer,
  className,
  showHeader = true,
  showClose = true,
  overlayClassName,
}: Props) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName={overlayClassName || 'backdrop-blur-md'}
        className={className}
        hideCloseButton={!showClose}
      >
        {showHeader && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
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
