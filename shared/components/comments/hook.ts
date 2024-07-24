import { trpc } from '@/shared/utils/trpc/trpc';

type UserLikes = {
  [key: string]: boolean;
};

export default function usefetchCommentsWithLikes(
  modelId: string,
  limit: number,
  offset: number,
  userId: string,
) {
  const commentsResponse = trpc.explorerOptions.getComments.useQuery({
    modelId,
    limit,
    offset,
  });
  const commentIds = commentsResponse.data?.comments?.map(
    (comment) => comment.id,
  );

  const replyIds = commentsResponse.data?.comments?.flatMap((comment) =>
    comment.swarms_cloud_comments_replies?.map((reply: any) => reply?.id),
  );

  const commentLikesResponse = trpc.explorerOptions.getLikes.useQuery({
    itemIds: commentIds || [],
    itemType: 'comment',
    userId,
  });

  const replyLikesResponse = trpc.explorerOptions.getLikes.useQuery({
    itemIds: replyIds || [],
    itemType: 'reply',
    userId,
  });

  const commentLikeMap = commentLikesResponse?.data?.likeCounts;
  const replyLikeMap = replyLikesResponse.data?.likeCounts;

  const userCommentLikeMap = commentLikesResponse.data?.userLikes?.reduce(
    (acc: UserLikes, itemId) => {
      acc[itemId] = true;
      return acc;
    },
    {},
  );

  const userReplyLikeMap = replyLikesResponse.data?.userLikes?.reduce(
    (acc: UserLikes, itemId) => {
      acc[itemId] = true;
      return acc;
    },
    {},
  );

  const commentsWithLikes = commentsResponse.data?.comments.map((comment) => ({
    ...comment,
    like_count: commentLikeMap?.[comment.id] || 0,
    user_has_liked: userCommentLikeMap?.[comment.id] || false,
    swarms_cloud_comments_replies: comment.swarms_cloud_comments_replies?.map(
      (reply: any) => ({
        ...reply,
        like_count: replyLikeMap?.[reply.id] || 0,
        user_has_liked: userReplyLikeMap?.[reply.id] || false,
      }),
    ),
  }));

  return {
    commentsData: commentsWithLikes,
    commentsResponse,
    commentLikesResponse,
    replyLikesResponse,
  };
}
