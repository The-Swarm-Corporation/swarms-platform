import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using `clsx` and merges Tailwind CSS classes using `twMerge`.
 * This function ensures that utility classes are merged correctly and avoids conflicts.
 *
 * @param inputs - An array of class name values that can be strings, arrays, or objects.
 * @returns A single merged string of class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
