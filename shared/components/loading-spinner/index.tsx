import { LoaderCircle } from 'lucide-react';

const LoadingSpinner = ({size}:{
  size?: number
}) => {
  return (
    <div className="loading-spinner animate-spin">
        <LoaderCircle size={size} />
    </div>
  );
};

export default LoadingSpinner;
