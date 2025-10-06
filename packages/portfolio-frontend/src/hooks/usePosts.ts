import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/services/api';
import { BlogPostQuery } from '@/types/blog';

export const usePosts = (params: BlogPostQuery = {}) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => postsApi.getPosts(params),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟 (garbage collection time)
    refetchOnWindowFocus: false
  });
};

export const usePost = (slug: string) => {
  return useQuery({
    queryKey: ['posts', slug],
    queryFn: () => postsApi.getPost(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10分钟
    gcTime: 30 * 60 * 1000 // 30分钟 (garbage collection time)
  });
};

export const useRelatedPosts = (slug: string) => {
  return useQuery({
    queryKey: ['posts', slug, 'related'],
    queryFn: () => postsApi.getRelatedPosts(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000 // 15分钟
  });
};

export const useArchive = (params: { year?: number; month?: number } = {}) => {
  return useQuery({
    queryKey: ['posts', 'archive', params],
    queryFn: () => postsApi.getArchive(params),
    staleTime: 30 * 60 * 1000 // 30分钟
  });
};

export const useTagStats = () => {
  return useQuery({
    queryKey: ['posts', 'tags', 'stats'],
    queryFn: () => postsApi.getTagStats(),
    staleTime: 60 * 60 * 1000 // 1小时
  });
};

export const useCategoryStats = () => {
  return useQuery({
    queryKey: ['posts', 'categories', 'stats'],
    queryFn: () => postsApi.getCategoryStats(),
    staleTime: 60 * 60 * 1000 // 1小时
  });
};
