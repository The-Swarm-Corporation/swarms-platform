import { cn } from '@/shared/utils/cn';
import s from './LoadingDots.module.css';
interface Props {
  className?: string;
}
const LoadingDots = ({ className }: Props) => {
  return (
    <span className={cn(s.root, className)}>
      <span />
      <span />
      <span />
    </span>
  );
};

export default LoadingDots;
