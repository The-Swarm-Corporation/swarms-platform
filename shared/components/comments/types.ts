export interface Comment {
    id: string;
    model_id: string;
    model_type: string;
    content: string;
    user_id: string;
    created_at: string;
    like_count: number;
    user: {
      full_name: string;
      username: string;
      email: string;
      avatar_url: string;
    };
  }
  
  export interface Reply {
    id: string;
    comment_id: string;
    content: string;
    user_id: string;
    created_at: string;
    like_count: number;
    user: {
      full_name: string;
      username: string;
      email: string;
      avatar_url: string;
    };
  }
  
  export interface CommentResponse {
    comments: Comment[];
    count: number;
  }
  
  export interface ReplyResponse {
    replies: Reply[];
    count: number;
  }
  