declare module 'react-awesome-stars-rating' {
  import * as React from 'react';

  interface AwesomeStarsRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: number;
    isHalf?: boolean;
    className?: string;
    disabled?: boolean;
    readonly?: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    fillColor?: string;
    emptyColor?: string;
    transition?: boolean;
    [key: string]: any;
  }

  const AwesomeStarsRating: React.FC<AwesomeStarsRatingProps>;
  export default AwesomeStarsRating;
}
