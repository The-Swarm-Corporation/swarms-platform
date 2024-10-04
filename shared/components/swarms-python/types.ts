import { PropsWithChildren } from 'react';

export interface CardProps {
  title: string;
  description: string;
}

export interface CodePrismCardProps
  extends PropsWithChildren,
    Partial<Pick<CardProps, 'title'>> {
  code: string;
}
