import { cn } from '@/shared/utils/cn';
import { ReactNode } from 'react';

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}
const InfoCard = ({ title, description, icon, className }: Props) => {
  return (
    <div
      className={cn(
        'relative flex gap-4 p-4 border border-primary rounded-lg overflow-hidden group hover:border-red-700',
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full aspect-square">
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        <span>{description}</span>
      </div>

      <div>
        <svg
          width="95"
          height="25"
          viewBox="0 0 95 25"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-0 bottom-0 scale-x-[2] scale-y-[1.8] fill-[#FB0101]"
        >
          <path
            d="M21 0H95V25H0L21 0Z"
            className="fill-[#FB0101] group-hover:fill-red-700"
          />
        </svg>
        <div className="absolute  right-0 bottom-0 text-white px-4 py-1">
          <div className="relative flex items-center gap-2">
            <span>preview</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.74999 2H4.99999V3.5H5.74999H11.4393L2.21966 12.7197L1.68933 13.25L2.74999 14.3107L3.28032 13.7803L12.4988 4.56182V10.25V11H13.9988V10.25V3C13.9988 2.44772 13.5511 2 12.9988 2H5.74999Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
