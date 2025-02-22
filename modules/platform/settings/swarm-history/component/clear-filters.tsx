import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface ClearAllFiltersProps {
  isSelectedFilter: boolean;
  clearAllFilters: () => void;
  className?: string;
}

export default function ClearAllFilters({
  className,
  isSelectedFilter,
  clearAllFilters,
}: ClearAllFiltersProps) {
  if (!isSelectedFilter) return null;

  return (
    <div
      className={cn('mt-2 flex items-center gap-2', className)}
      aria-label="Clear filters"
      onClick={clearAllFilters}
    >
      <p className="cursor-pointer text-sm text-primary underline">Clear all</p>
      <X size={18} className="cursor-pointer text-primary" />
    </div>
  );
}
