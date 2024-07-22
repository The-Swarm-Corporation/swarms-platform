export type CommentProps = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  like_count?: number;
  users: {
    full_name: string | null;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

export interface Comment extends CommentProps {
  model_id: string;
  model_type: string;
}

export interface Reply extends CommentProps {
  comment_id: string;
}

export interface CommentResponse {
  comments: Comment[];
  count: number;
}

export interface ReplyResponse {
  replies: Reply[];
  count: number;
}
