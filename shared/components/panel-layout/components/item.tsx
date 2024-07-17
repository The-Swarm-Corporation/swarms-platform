import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import React, { ForwardedRef, PropsWithChildren, RefObject } from 'react';

interface NavItemProps extends PropsWithChildren {
  title: string;
  link?: string;
  path?: string;
  icon?: React.ReactNode;
  as?: 'span' | 'a' | 'form' | React.ElementType;
  className?: string;
  isIcon?: boolean;
  isShowSidebarItems?: boolean;
  showTitle?: boolean;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => Promise<boolean | void>;
}

const NavItem = React.forwardRef(function <
  T extends
    | keyof JSX.IntrinsicElements
    | React.ComponentType<
        HTMLAnchorElement | HTMLSpanElement | HTMLFormElement
      >,
>(
  {
    title,
    link,
    path,
    icon = false,
    className,
    isIcon,
    as: Component = 'span',
    children,
    onSubmit,
    isShowSidebarItems,
    showTitle,
    ...props
  }: NavItemProps,
  ref: ForwardedRef<T>,
) {
  if (link) {
    return (
      <Link
        href={link}
        className={cn(
          'group flex items-center justify-center outline-none p-4',
          showTitle && 'justify-start',
          className,
        )}
        ref={ref as RefObject<HTMLAnchorElement>}
        {...props}
      >
        {isIcon && (
          <span
            className={cn(
              'text-black dark:text-white group-hover:text-white hidden',
              showTitle && 'mr-3',
              link === path && 'text-white',
              isIcon && 'block',
            )}
          >
            {icon}
          </span>
        )}
        {showTitle && <span className="whitespace-nowrap">{title}</span>}
      </Link>
    );
  }

  return (
    <Component
      className={cn(
        'group flex items-center justify-start outline-none',
        className,
      )}
      onSubmit={onSubmit}
      ref={ref as RefObject<HTMLFormElement | HTMLSpanElement>}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            'mr-3 text-black dark:text-white group-hover:text-white hidden',
            link === path && 'text-white',
            isIcon && 'block',
          )}
        >
          {icon}
        </span>
      )}
      {isShowSidebarItems && children ? children : <span>{title}</span>}
    </Component>
  );
});

export default NavItem;
