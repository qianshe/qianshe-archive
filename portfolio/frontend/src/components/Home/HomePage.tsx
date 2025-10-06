import React from 'react';
import Hero from './Hero';
import RecentPosts from './RecentPosts';
import FeaturedProjects from './FeaturedProjects';
import { BlogPost, Project } from '@/types';

interface HomePageProps {
  recentPosts: BlogPost[];
  featuredProjects: Project[];
}

const HomePage: React.FC<HomePageProps> = ({ recentPosts, featuredProjects }) => {
  return (
    <div>
      <Hero />
      <RecentPosts posts={recentPosts} />
      <FeaturedProjects projects={featuredProjects} />
    </div>
  );
};

export default HomePage;
