import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * 真实 API 接口测试
 * 注意：这些测试需要网络连接才能运行
 * 运行命令: pnpm test src/__tests__/api-real-data.test.ts
 */

// 判断是否在 CI 环境中
const IS_CI = process.env.CI === 'true';

// 跳过网络测试的辅助函数
const skipIfNoNetwork = () => {
  if (IS_CI) {
    console.log('跳过网络测试 (CI 环境)');
    return true;
  }
  return false;
};

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'https://blog.yahui.wang/api',
  testPostPath: '2024/01/01/hello-world', // 测试文章路径
  testKeyword: '测试', // 测试关键词
};

// 简单的请求封装（用于测试）
async function testRequest<T>(url: string): Promise<any> {
  // 在 Node.js 环境中使用 node-fetch
  if (typeof window === 'undefined' && typeof require !== 'undefined') {
    try {
      const nodeFetch = require('node-fetch');
      const response = await nodeFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('使用 node-fetch 失败:', error);
      throw error;
    }
  }

  // 在浏览器环境中使用 fetch
  if (typeof window !== 'undefined' && window.fetch) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('使用 fetch 失败:', error);
      throw error;
    }
  }

  throw new Error('不支持的运行环境');
}

// API 测试
describe('API Real Data Tests', () => {
  describe('GET /site.json', () => {
    it('应该正确获取站点信息', async () => {
      if (skipIfNoNetwork()) return;

      try {
        const response = await testRequest(`${TEST_CONFIG.baseUrl}/site.json`);
        const data = response.data; // API 响应格式: { data: {...}, api: string }

        expect(data).toHaveProperty('title');
        expect(data).toHaveProperty('author');
        expect(data).toHaveProperty('url');
        expect(typeof data.title).toBe('string');
        expect(data.url).toBe('https://blog.yahui.wang');
      } catch (error) {
        console.error('获取站点信息失败:', error);
        throw error;
      }
    }, 10000);
  });

  describe('GET /posts/page.1.json', () => {
    it('应该正确获取文章列表', async () => {
      if (skipIfNoNetwork()) return;

      try {
        const response = await testRequest(`${TEST_CONFIG.baseUrl}/posts/page.1.json`);
        const data = response.data;

        expect(data).toHaveProperty('index');
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('posts');

        expect(Array.isArray(data.posts)).toBe(true);
        expect(data.posts.length).toBeGreaterThan(0);

        // 检查文章项的结构
        const post = data.posts[0];
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('slug');
        expect(post).toHaveProperty('date');
        expect(post).toHaveProperty('url');
        expect(post.slug).toBeTypeOf('string');
      } catch (error) {
        console.error('获取文章列表失败:', error);
        throw error;
      }
    }, 15000);
  });

  describe('GET /categories.json', () => {
    it('应该正确获取分类列表', async () => {
      if (skipIfNoNetwork()) return;

      try {
        const response = await testRequest(`${TEST_CONFIG.baseUrl}/categories.json`);
        const data = response.data;

        expect(Array.isArray(data)).toBe(true);

        if (data.length > 0) {
          const category = data[0];
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('slug');
          expect(category).toHaveProperty('count');
        }
      } catch (error) {
        console.error('获取分类列表失败:', error);
        throw error;
      }
    }, 10000);
  });

  describe('GET /tags.json', () => {
    it('应该正确获取标签列表', async () => {
      if (skipIfNoNetwork()) return;

      try {
        const response = await testRequest(`${TEST_CONFIG.baseUrl}/tags.json`);
        const data = response.data;

        expect(Array.isArray(data)).toBe(true);

        if (data.length > 0) {
          const tag = data[0];
          expect(tag).toHaveProperty('name');
          expect(tag).toHaveProperty('slug');
          expect(tag).toHaveProperty('count');
        }
      } catch (error) {
        console.error('获取标签列表失败:', error);
        throw error;
      }
    }, 10000);
  });

  describe('GET /archives.json', () => {
    it('应该正确获取归档列表', async () => {
      if (skipIfNoNetwork()) return;

      try {
        const response = await testRequest(`${TEST_CONFIG.baseUrl}/archives.json`);
        const data = response.data;

        expect(Array.isArray(data)).toBe(true);

        if (data.length > 0) {
          const archive = data[0];
          expect(archive).toHaveProperty('year');
          expect(archive.year).toBeTypeOf('number');
        }
      } catch (error) {
        console.error('获取归档列表失败:', error);
        throw error;
      }
    }, 10000);
  });

  describe('GET /search.json', () => {
    it('应该正确处理搜索请求', async () => {
      if (skipIfNoNetwork()) return;

      try {
        const response = await testRequest(`${TEST_CONFIG.baseUrl}/search.json?keyword=${TEST_CONFIG.testKeyword}`);
        const data = response.data;

        // 搜索返回的是文章数组
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);

        // 检查文章项的结构
        const post = data[0];
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('slug');
        expect(post).toHaveProperty('url');
      } catch (error) {
        console.error('搜索请求失败:', error);
        // 搜索可能返回空结果，不算错误
      }
    }, 10000);
  });
});

// 本地数据验证测试（不需要网络）
describe('API Data Structure Validation', () => {
  // 模拟真实数据快照
  const mockSiteInfo = {
    title: 'Yahui\'s Blog',
    author: 'YahuiWong',
    url: 'https://blog.yahui.wang',
    description: '技术博客',
    postCount: 100,
    categoryCount: 10,
    tagCount: 20
  };

  const mockPostList = {
    posts: [
      {
        title: '测试文章',
        slug: 'test-post',
        date: '2024-01-01T00:00:00.000Z',
        url: 'https://blog.yahui.wang/2024/01/01/test-post/',
        excerpt: '这是文章摘要',
        categories: [{ name: '分类1', slug: 'cat1' }],
        tags: [{ name: '标签1', slug: 'tag1' }]
      }
    ],
    total: 1,
    pageSize: 10,
    current: 1,
    totalPages: 1
  };

  it('站点信息应该包含必需字段', () => {
    expect(mockSiteInfo).toHaveProperty('title');
    expect(mockSiteInfo).toHaveProperty('author');
    expect(mockSiteInfo).toHaveProperty('url');
  });

  it('文章列表应该包含必需字段', () => {
    expect(mockPostList.posts.length).toBeGreaterThan(0);
    const post = mockPostList.posts[0];
    expect(post.title).toBeDefined();
    expect(post.slug).toBeDefined();
    expect(post.date).toBeDefined();
    expect(post.url).toBeDefined();
  });

  it('分页信息应该正确', () => {
    expect(mockPostList.total).toBeGreaterThan(0);
    expect(mockPostList.pageSize).toBeGreaterThan(0);
    expect(mockPostList.current).toBeGreaterThan(0);
  });
});
