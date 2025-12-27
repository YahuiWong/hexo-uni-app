import { describe, it, expect } from 'vitest';

// PostItem URL 构建逻辑测试
describe('PostItem URL Building Logic', () => {
  const buildPostUrl = (post: any) => {
    let targetUrl = post.url;

    // 如果没有 url 字段，尝试根据其他信息构建
    if (!targetUrl) {
      if (post.api) {
        // 从 api 字段提取路径：api/posts/2025/04/09/note-docker-compose.json -> 2025/04/09/note-docker-compose
        targetUrl = post.api.replace(/^api\/posts\//, '').replace(/\.json$/, '');
      } else if (post.date && post.slug) {
        // 根据日期和 slug 构建标准路径
        const date = new Date(post.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        targetUrl = `${year}/${month}/${day}/${post.slug}`;
      } else if (post.slug) {
        // 只有 slug，直接使用
        targetUrl = post.slug;
      }
    }

    return targetUrl;
  };

  describe('使用 url 字段', () => {
    it('应该直接返回 url 字段', () => {
      const post = {
        title: 'Test Post',
        url: '2024/02/13/docker-install/',
        slug: 'docker-install',
        date: '2024-02-13T11:06:41.000Z',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2024/02/13/docker-install/');
    });
  });

  describe('从 api 字段构建', () => {
    it('应该从 api 字段提取路径', () => {
      const post = {
        title: '使用docker machine 管理docker主机',
        slug: 'note-docker-compose',
        date: '2025-04-09T14:04:26.000Z',
        api: 'api/posts/2025/04/09/note-docker-compose.json',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2025/04/09/note-docker-compose');
    });

    it('应该正确处理复杂路径的 api 字段', () => {
      const post = {
        title: '分布式事务-CAP',
        slug: 'TalkAbout/talkabout-Distributed-Transaction-CAP',
        api: 'api/posts/2024/02/05/TalkAbout/talkabout-Distributed-Transaction-CAP.json',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2024/02/05/TalkAbout/talkabout-Distributed-Transaction-CAP');
    });
  });

  describe('根据 date 和 slug 构建', () => {
    it('应该根据日期和 slug 构建路径', () => {
      const post = {
        title: 'Test Post',
        slug: 'test-post',
        date: '2024-12-27T10:00:00.000Z',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2024/12/27/test-post');
    });

    it('应该正确处理单数月份和日期', () => {
      const post = {
        title: 'Test Post',
        slug: 'test-post',
        date: '2024-01-05T10:00:00.000Z',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2024/01/05/test-post');
    });

    it('应该正确处理复杂的 slug', () => {
      const post = {
        title: 'Design Pattern',
        slug: 'DesignPattern/design-pattern-00-principle',
        date: '2023-12-10T11:59:01.000Z',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2023/12/10/DesignPattern/design-pattern-00-principle');
    });
  });

  describe('仅使用 slug', () => {
    it('应该在只有 slug 时直接返回 slug', () => {
      const post = {
        title: 'Test Post',
        slug: 'simple-slug',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('simple-slug');
    });

    it('应该处理复杂的纯 slug', () => {
      const post = {
        title: 'Complex Post',
        slug: 'category/subcategory/post-name',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('category/subcategory/post-name');
    });
  });

  describe('边界情况', () => {
    it('应该在没有任何可用字段时返回 undefined', () => {
      const post = {
        title: 'Test Post',
      };

      const result = buildPostUrl(post);
      expect(result).toBeUndefined();
    });

    it('应该在空 url 时使用 fallback', () => {
      const post = {
        title: 'Test Post',
        url: '',
        slug: 'test-post',
        date: '2024-12-27T10:00:00.000Z',
      };

      const result = buildPostUrl(post);
      // 空字符串也应该触发 fallback 逻辑
      expect(result).toBe('2024/12/27/test-post');
    });

    it('应该优先使用 url 即使有其他字段', () => {
      const post = {
        title: 'Test Post',
        url: '2024/02/13/custom-url/',
        slug: 'different-slug',
        date: '2024-02-13T11:06:41.000Z',
        api: 'api/posts/2024/02/13/api-path.json',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2024/02/13/custom-url/');
    });
  });

  describe('真实文章数据测试', () => {
    it('应该正确处理第一篇文章（缺少 url）', () => {
      const post = {
        title: '使用docker machine 管理docker主机',
        slug: 'note-docker-compose',
        date: '2025-04-09T14:04:26.000Z',
        updated: '2025-04-11T03:51:08.998Z',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2025/04/09/note-docker-compose');
    });

    it('应该正确处理第二篇文章（有 url）', () => {
      const post = {
        title: 'Docker 安装',
        slug: 'docker-install',
        date: '2024-02-13T11:06:41.000Z',
        updated: '2024-02-03T08:39:30.421Z',
        url: '2024/02/13/docker-install/',
        api: 'api/posts/2024/02/13/docker-install.json',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2024/02/13/docker-install/');
    });

    it('应该正确处理复杂路径的文章', () => {
      const post = {
        title: '分布式事务-CAP',
        slug: 'TalkAbout/talkabout-Distributed-Transaction-CAP',
        date: '2024-02-05T04:04:34.000Z',
        updated: '2024-02-05T04:03:22.217Z',
        url: '2024/02/05/TalkAbout/talkabout-Distributed-Transaction-CAP/',
        api: 'api/posts/2024/02/05/TalkAbout/talkabout-Distributed-Transaction-CAP.json',
      };

      const result = buildPostUrl(post);
      expect(result).toBe('2024/02/05/TalkAbout/talkabout-Distributed-Transaction-CAP/');
    });
  });
});
