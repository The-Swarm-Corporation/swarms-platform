import { cn } from '@/shared/utils/cn';
import React, { MouseEvent } from 'react';

interface SmoothScrollLinkProps {
  href: string;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}

const SmoothScrollLink: React.FC<SmoothScrollLinkProps> = ({
  href,
  className,
  delay = 300,
  children,
}) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }, delay);
    }

    if (window.history.pushState) {
      window.history.pushState(null, '', href);
    } else {
      window.location.hash = href;
    }
  };

  return (
    <a href={href} className={cn(className, 'link link--metis')} onClick={handleClick}>
      {children}
    </a>
  );
};

export default SmoothScrollLink;
