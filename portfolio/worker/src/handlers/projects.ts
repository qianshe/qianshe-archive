import { Context } from 'hono';
import { ProjectService } from '../services/project-service';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';
import { validateInput } from '../utils/validation';
import { projectQuerySchema } from '../utils/validation';

export class ProjectHandler {
  private projectService: ProjectService;

  constructor(env: any) {
    this.projectService = new ProjectService(env);
  }

  // 获取项目列表
  async getProjects(c: Context) {
    try {
      const query = c.req.query();
      const validation = await validateInput(projectQuerySchema as any)(query);

      if (!validation.success) {
        return errorResponse(c, validation.error, 400);
      }

      const result = await this.projectService.getProjects(validation.data as any);
      return successResponse(c, result);
    } catch (error) {
      console.error('Get projects error:', error);
      return errorResponse(c, 'Failed to fetch projects', 500);
    }
  }

  // 获取项目详情
  async getProjectBySlug(c: Context) {
    try {
      const slug = c.req.param('slug');
      if (!slug) {
        return errorResponse(c, 'Slug is required', 400);
      }

      const project = await this.projectService.getProjectBySlug(slug);
      if (!project) {
        return notFoundResponse(c, 'Project');
      }

      return successResponse(c, project);
    } catch (error) {
      console.error('Get project error:', error);
      return errorResponse(c, 'Failed to fetch project', 500);
    }
  }

  // 获取技术栈统计
  async getTechStats(c: Context) {
    try {
      const techStats = await this.projectService.getTechStats();
      return successResponse(c, techStats);
    } catch (error) {
      console.error('Get tech stats error:', error);
      return errorResponse(c, 'Failed to fetch tech statistics', 500);
    }
  }
}
