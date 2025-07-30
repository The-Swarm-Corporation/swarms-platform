'use client';

import React from 'react';
import { Button } from '../ui/button';
import MarkdownComponent from '../markdown';
import { cn } from '@/shared/utils/cn';

/**
 * ExpandableMarkdownOutput component for displaying agent results with expand/collapse functionality
 * 
 * @param text - The markdown text to display
 * @param className - Optional CSS classes for styling
 * @param isExpanded - Whether the content is currently expanded
 * @param onToggleExpanded - Callback function to toggle expansion state
 */
interface ExpandableMarkdownOutputProps {
  text: string;
  className?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const ExpandableMarkdownOutput: React.FC<ExpandableMarkdownOutputProps> = ({ 
  text, 
  className, 
  isExpanded, 
  onToggleExpanded 
}) => {
  const maxLength = 200; // Maximum characters to show when collapsed
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? text : text.slice(0, maxLength) + '...';

  return (
    <div className={cn('space-y-2', className)}>
      <MarkdownComponent
        text={displayText}
        className="space-y-1 *:text-xs"
      />
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </div>
  );
};

export default ExpandableMarkdownOutput; 