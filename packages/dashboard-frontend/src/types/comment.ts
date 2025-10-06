// Dashboard管理端评论类型定义
export interface Comment {
  id: number;
  post_id: number;
  parent_id?: number;
  user_email: string;
  user_name: string;
  user_website?: string;
  user_avatar?: string;
  content: string;
  ip_address?: string;
  user_agent?: string;
  is_verified: boolean;
  is_approved: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

// 评论列表查询参数
export interface CommentQuery {
  page?: number;
  limit?: number;
  post_id?: number;
  parent_id?: number;
  approved?: boolean;
  search?: string;
  start_date?: string;
  end_date?: string;
}

// 评论列表响应
export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 审核评论请求
export interface CommentModerationRequest {
  comment_ids: number[];
  action: 'approve' | 'reject' | 'delete';
}

// 评论统计信息
export interface CommentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  todayCount: number;
  thisMonthCount: number;
}

// 嵌套评论树结构
export interface CommentTreeNode extends Comment {
  children: CommentTreeNode[];
  level: number;
}
