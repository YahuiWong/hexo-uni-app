import type {
  ApiResponse,
  SwiperItem,
  SiteInfo,
  PaginationData,
  PostItem,
  PostDetail,
  CategoryItem,
  TagItem,
  SearchResult,
  ArchiveYear
} from '@/types';

const BASE_URL = 'https://blog.yahui.wang/api';  // 开发时走代理，生产时改回真实域名

/**
 * 通用请求封装
 */
async function request<T>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    const res = await uni.request({
      url,
      data,
      method: data ? 'GET' : 'GET'
    });

    // 类型断言：假设后端返回格式正确
    return res.data as ApiResponse<T>;
  } catch (error) {
    console.error('API 请求失败:', error);
    throw error;
  }
}

export const api = {
  /**
   * 获取轮播图列表
   */
  getSwiper(): Promise<ApiResponse<SwiperItem[]>> {
    return request<SwiperItem[]>(`${BASE_URL}/swiper.json`);
  },

  /**
   * 获取站点信息
   */
  getSite(): Promise<ApiResponse<SiteInfo>> {
    return request<SiteInfo>(`${BASE_URL}/site.json`);
  },

  /**
   * 获取文章列表（分页）
   * @param page 页码，从 1 开始
   */
  getPosts(page: number = 1): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(`${BASE_URL}/posts/page.${page}.json`);
  },

  /**
   * 获取文章详情
   * @param path 文章路径，如 2024/12/27/article-slug
   */
  getPost(path: string): Promise<ApiResponse<PostDetail>> {
    return request<PostDetail>(`${BASE_URL}/posts/${path}.json`);
  },

  /**
   * 获取分类列表
   */
  getCategories(): Promise<ApiResponse<CategoryItem[]>> {
    return request<CategoryItem[]>(`${BASE_URL}/categories.json`);
  },

  /**
   * 获取标签列表
   */
  getTags(): Promise<ApiResponse<TagItem[]>> {
    return request<TagItem[]>(`${BASE_URL}/tags.json`);
  },

  /**
   * 获取分类下的文章列表（分页）
   * @param slug 分类 slug
   * @param page 页码
   */
  getCategoryPosts(slug: string, page: number = 1): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(`${BASE_URL}/categories/${slug}/page.${page}.json`);
  },

  /**
   * 获取标签下的文章列表（分页）
   * @param slug 标签 slug
   * @param page 页码
   */
  getTagPosts(slug: string, page: number = 1): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(`${BASE_URL}/tags/${slug}/page.${page}.json`);
  },

  /**
   * 搜索文章
   * @param keyword 搜索关键词
   */
  search(keyword: string): Promise<ApiResponse<SearchResult>> {
    return request<SearchResult>(`${BASE_URL}/search.json`, { keyword });
  },

  /**
   * 获取归档列表（按年份）
   */
  getArchives(): Promise<ApiResponse<ArchiveYear[]>> {
    return request<ArchiveYear[]>(`${BASE_URL}/archives.json`);
  },

  /**
   * 获取指定年份的归档（分页）
   * @param year 年份
   * @param page 页码
   */
  getYearArchive(year: number, page: number = 1): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(`${BASE_URL}/archives/${year}/page.${page}.json`);
  },

  /**
   * 获取指定年月的归档（分页）
   * @param year 年份
   * @param month 月份
   * @param page 页码
   */
  getMonthArchive(year: number, month: number, page: number = 1): Promise<ApiResponse<PaginationData<PostItem>>> {
    const monthStr = String(month).padStart(2, '0');
    return request<PaginationData<PostItem>>(`${BASE_URL}/archives/${year}/${monthStr}/page.${page}.json`);
  }
};