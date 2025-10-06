import { Context } from 'hono';
import { SearchService } from '../services/search-service';
import { successResponse, errorResponse } from '../utils/response';
import { validateInput } from '../utils/validation';
import { searchSchema } from '../utils/validation';

export class SearchHandler {
  private searchService: SearchService;

  constructor(env: any) {
    this.searchService = new SearchService(env);
  }

  // 全站搜索
  async search(c: Context) {
    try {
      const query = c.req.query();
      const validation = await validateInput(searchSchema)(query);

      if (!validation.success) {
        return errorResponse(c, validation.error, 400);
      }

      const result = await this.searchService.search(validation.data);
      return successResponse(c, result);
    } catch (error) {
      console.error('Search error:', error);
      return errorResponse(c, 'Search failed', 500);
    }
  }

  // 获取搜索建议
  async getSuggestions(c: Context) {
    try {
      const query = c.req.query('q');
      const limit = parseInt(c.req.query('limit') || '5');

      if (!query) {
        return errorResponse(c, 'Query parameter is required', 400);
      }

      const suggestions = await this.searchService.getSuggestions(query, limit);
      return successResponse(c, suggestions);
    } catch (error) {
      console.error('Get suggestions error:', error);
      return errorResponse(c, 'Failed to get suggestions', 500);
    }
  }

  // 获取热门搜索词
  async getPopularSearchTerms(c: Context) {
    try {
      const limit = parseInt(c.req.query('limit') || '10');
      const terms = await this.searchService.getPopularSearchTerms(limit);
      return successResponse(c, terms);
    } catch (error) {
      console.error('Get popular terms error:', error);
      return errorResponse(c, 'Failed to get popular search terms', 500);
    }
  }
}
