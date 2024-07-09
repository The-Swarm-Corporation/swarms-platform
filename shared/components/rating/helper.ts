import { ReviewProps } from './list-rating';

export function getReviewRating(reviews: ReviewProps[]) {
  const reviewsRating = reviews?.reduce((acc, curr) => {
    return curr?.rating + acc;
  }, 0);

  const reviewLength = reviews?.length;
  const reviewTextEnd = reviewLength === 1 ? '' : 's';

  return {
    modelRating: reviewsRating / reviews?.length,
    reviewLength,
    reviewTextEnd,
  };
}
