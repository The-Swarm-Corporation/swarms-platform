import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import React, { ForwardedRef, PropsWithChildren, RefObject } from 'react';

interface NavItemProps extends PropsWithChildren {
  title: string;
  link?: string;
  path?: string;
  isExternal?: boolean;
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
    isExternal,
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
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={cn(
          'group flex items-center justify-center outline-none p-2.5 transition-all duration-200',
          showTitle && 'justify-start',
          className,
        )}
        ref={ref as RefObject<HTMLAnchorElement>}
        {...props}
      >
        {isIcon && (
          <span
            className={cn(
              'text-gray-400 group-hover:text-white transition-colors duration-200 hidden',
              showTitle && 'mr-3',
              link === path && 'text-white',
              isIcon && 'block',
            )}
          >
            {React.cloneElement(icon as React.ReactElement, { 
              size: 18,
              className: cn(
                'transition-transform duration-200 group-hover:scale-110',
                (icon as React.ReactElement)?.props?.className
              )
            })}
          </span>
        )}
        {showTitle && (
          <span className="whitespace-nowrap text-sm font-medium transition-colors duration-200">
            {title}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Component
      className={cn(
        'group flex items-center justify-start outline-none transition-all duration-200',
        className,
      )}
      onClick={onSubmit}
      ref={ref as RefObject<HTMLFormElement | HTMLSpanElement>}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            'mr-3 text-gray-400 group-hover:text-white transition-colors duration-200 hidden',
            link === path && 'text-white',
            isIcon && 'block',
          )}
        >
          {React.cloneElement(icon as React.ReactElement, { 
            size: 18,
            className: cn(
              'transition-transform duration-200 group-hover:scale-110',
              (icon as React.ReactElement)?.props?.className
            )
          })}
        </span>
      )}
      {isShowSidebarItems && children ? children : (
        <span className="text-sm font-medium transition-colors duration-200">
          {title}
        </span>
      )}
    </Component>
  );
});

NavItem.displayName = 'NavItem';

export default NavItem;
