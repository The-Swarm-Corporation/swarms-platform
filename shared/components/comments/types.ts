export type CommentProps = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  is_edited?: boolean;
  users: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export interface Reply extends CommentProps {
  comment_id: string;
}
export interface Comment extends CommentProps {
  model_id: string;
  model_type: string;
  swarms_cloud_comments_replies: Reply[];
}


export interface CommentResponse {
  comments: Comment[];
  count: number;
}

export interface ReplyResponse {
  replies: Reply[];
  count: number;
}
