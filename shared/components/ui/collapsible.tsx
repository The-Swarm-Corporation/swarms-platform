'use client';

import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

import { cn } from '@/shared/utils/cn';

type CollapsibleProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Root
>;

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, children, ...props }, ref) => (
    <CollapsiblePrimitive.Root
      ref={ref}
      className={cn('relative flex w-full', className)}
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Root>
  ),
);

Collapsible.displayName = 'Collapsible';

type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Trigger
>;

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ children, className, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn('flex items-center w-full', className)}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Trigger>
));

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

type CollapsibleContentProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Content
>;

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn('overflow-hidden collapsible-content', className)}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Content>
));

CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
