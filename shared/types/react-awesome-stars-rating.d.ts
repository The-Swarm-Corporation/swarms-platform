declare module 'react-awesome-stars-rating' {
  interface ReactStarsRatingProps {
    value: number;
    onChange: (value: number) => void;
    isHalf?: boolean;
    size?: number;
    starGap?: number;
    count?: number;
  }
  
  const ReactStarsRating: React.FC<ReactStarsRatingProps>;
  export default ReactStarsRating;
} 