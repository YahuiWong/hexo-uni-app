const BASE_URL = 'https://blog.yahui.wang/api';  // 开发时走代理，生产时改回真实域名

interface ApiResponse<T> {
  data: T;
  api: string;
}

export const api = {
  // 轮播图
  getSwiper(): Promise<ApiResponse<{ title: string; slug: string; cover: string; url: string; description?: string }[]>> {
    return uni.request({
      url: `${BASE_URL}/swiper.json`
    }).then(res => res.data as any);
  },

  // 站点信息
  getSite(): Promise<ApiResponse<any>> {
    return uni.request({ url: `${BASE_URL}/site.json` }).then(res => res.data as any);
  },

  // 文章列表（分页）
  getPosts(page: number = 1): Promise<ApiResponse<any>> {
    return uni.request({ url: `${BASE_URL}/posts/page.${page}.json` }).then(res => res.data as any);
  },

  // 文章详情（path 如 2024/xx/xx/slug）
  getPost(path: string): Promise<ApiResponse<any>> {
    return uni.request({ url: `${BASE_URL}/posts/${path}.json` }).then(res => res.data as any);
  },

  // 分类列表
  getCategories(): Promise<ApiResponse<any>> {
    return uni.request({ url: `${BASE_URL}/categories.json` }).then(res => res.data as any);
  },

  // 标签列表
  getTags(): Promise<ApiResponse<any>> {
    return uni.request({ url: `${BASE_URL}/tags.json` }).then(res => res.data as any);
  }
};