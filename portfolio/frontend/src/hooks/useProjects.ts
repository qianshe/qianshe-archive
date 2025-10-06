import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/services/api';
import { ProjectQuery } from '@/types/project';

export const useProjects = (params: ProjectQuery = {}) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟 (garbage collection time)
    refetchOnWindowFocus: false
  });
};

export const useProject = (slug: string) => {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: () => projectsApi.getProject(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10分钟
    gcTime: 30 * 60 * 1000 // 30分钟 (garbage collection time)
  });
};

export const useTechStats = () => {
  return useQuery({
    queryKey: ['projects', 'tech', 'stats'],
    queryFn: () => projectsApi.getTechStats(),
    staleTime: 60 * 60 * 1000 // 1小时
  });
};
