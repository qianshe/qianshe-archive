// Portfolio Worker评论类型定义
export interface Comment {
  id: number;
  post_id: number;
  parent_id?: number;
  user_name: string;
  user_email: string;
  user_website?: string;
  user_avatar?: string;
  content: string;
  like_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// 提交评论请求
export interface CommentRequest {
  post_id: number;
  parent_id?: number;
  user_name: string;
  user_email: string;
  user_website?: string;
  content: string;
}

// 评论列表查询参数
export interface CommentQuery {
  post_id: number;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'like_count';
  sort_order?: 'asc' | 'desc';
}

// 评论列表响应
export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 嵌套评论树结构
export interface CommentTreeNode extends Comment {
  children: CommentTreeNode[];
  level: number;
}

// 邮箱验证请求
export interface EmailVerificationRequest {
  email: string;
  code: string;
}

// 评论点赞请求
export interface CommentLikeRequest {
  comment_id: number;
}
