// Portfolio展示端专用的评论相关类型定义

// 基础评论类型
export interface Comment {
  id: number;
  post_id: number;
  user_name: string;
  user_email: string;
  user_website?: string;
  content: string;
  is_approved: boolean;
  like_count: number;
  created_at: string;
  updated_at?: string;
  replies?: Comment[];
  parent_id?: number;
}

// 评论查询参数
export interface CommentQuery {
  page?: number;
  limit?: number;
  post_id?: number;
  approved_only?: boolean;
  search?: string;
  sort?: 'created_at' | 'like_count';
  order?: 'asc' | 'desc';
}

// 评论列表响应
export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 评论请求类型
export interface CommentRequest {
  post_id: number;
  user_name: string;
  user_email: string;
  user_website?: string;
  content: string;
  parent_id?: number;
}