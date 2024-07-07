import { cn } from '@/shared/utils/cn';
import React from 'react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function Checkbox({
  id,
  checked,
  onCheckedChange,
}: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <div
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'w-6 h-6 flex items-center justify-center rounded border-2 cursor-pointer transition-colors',
          checked
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'border-black dark:border-white',
        )}
      >
        {checked && (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
      </div>
    </div>
  );
}
