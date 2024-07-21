import { cn } from '@/shared/utils/cn';
import { LoaderCircle } from 'lucide-react';

const LoadingSpinner = ({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) => {
  return <LoaderCircle className={cn('animate-spin', className)} size={size} />;
};

export default LoadingSpinner;
