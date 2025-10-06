import React from 'react';
import Layout from '@/components/Layout/Layout';
import HomePage from '@/components/Home/HomePage';
import { usePosts } from '@/hooks/usePosts';
import { useProjects } from '@/hooks/useProjects';

const Home: React.FC = () => {
  // 获取最新文章（最多4篇）
  const { data: postsData, isLoading: postsLoading } = usePosts({
    page: 1,
    limit: 4,
    status: 'published',
    sort_by: 'published_at',
    sort_order: 'desc'
  });

  // 获取精选项目（最多4个）
  const { data: projectsData, isLoading: projectsLoading } = useProjects({
    page: 1,
    limit: 4,
    featured: true,
    sort: 'created_at',
    order: 'desc'
  });

  if (postsLoading || projectsLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  const posts = postsData?.data?.posts || [];
  const projects = projectsData?.data?.projects || [];

  return (
    <Layout>
      <HomePage recentPosts={posts as any} featuredProjects={projects} />
    </Layout>
  );
};

export default Home;
