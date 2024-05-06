import { LoaderCircle } from 'lucide-react';

const LoadingSpinner = ({ size }: { size?: number }) => {
  return <LoaderCircle className="animate-spin" size={size} />;
};

export default LoadingSpinner;
