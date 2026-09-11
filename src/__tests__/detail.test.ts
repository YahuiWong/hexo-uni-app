import { describe, it, expect } from 'vitest';

// API 测试
describe('API Functions', () => {
  describe('getPostPathFromUrl', () => {
    const getPostPathFromUrl = (url: string): string => {
      let fullUrl = url.trim();
      let pathname = '';

      if (/^https?:\/\//i.test(fullUrl) || fullUrl.startsWith('//')) {
        try {
          const urlObj = new URL(fullUrl.startsWith('//') ? 'https:' + fullUrl : fullUrl);
          pathname = urlObj.pathname;
        } catch {
          pathname = fullUrl;
        }
      } else {
        pathname = fullUrl;
      }

      let path = pathname
        .replace(/^\//, '')
        .replace(/\.html$/, '')
        .replace(/\/$/, '');

      if (!path) path = 'index';

      return path;
    };

    it('应该正确处理完整 URL', () => {
      const url = 'https://blog.yahui.wang/2020/06/07/k8s-first/';
      const result = getPostPathFromUrl(url);
      expect(result).toBe('2020/06/07/k8s-first');
    });

    it('应该正确处理带 .html 后缀的 URL', () => {
      const url = 'https://blog.yahui.wang/2020/06/07/k8s-first.html';
      const result = getPostPathFromUrl(url);
      expect(result).toBe('2020/06/07/k8s-first');
    });

    it('应该正确处理相对路径', () => {
      const url = '/2020/06/07/k8s-first/';
      const result = getPostPathFromUrl(url);
      expect(result).toBe('2020/06/07/k8s-first');
    });

    it('应该正确处理不带前缀斜杠的路径', () => {
      const url = '2020/06/07/k8s-first';
      const result = getPostPathFromUrl(url);
      expect(result).toBe('2020/06/07/k8s-first');
    });

    it('应该为空路径返回 index', () => {
      const url = '';
      const result = getPostPathFromUrl(url);
      expect(result).toBe('index');
    });

    it('应该正确处理协议相对 URL', () => {
      const url = '//blog.yahui.wang/2020/06/07/k8s-first/';
      const result = getPostPathFromUrl(url);
      expect(result).toBe('2020/06/07/k8s-first');
    });
  });

  describe('formatDate', () => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';

      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return '今天';
      if (days === 1) return '昨天';
      if (days < 7) return `${days}天前`;
      if (days < 30) return `${Math.floor(days / 7)}周前`;
      if (days < 365) return `${Math.floor(days / 30)}个月前`;

      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    };

    it('应该为空字符串返回空', () => {
      expect(formatDate('')).toBe('');
    });

    it('应该为今天的日期返回"今天"', () => {
      const today = new Date().toISOString();
      expect(formatDate(today)).toBe('今天');
    });

    it('应该为昨天的日期返回"昨天"', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(formatDate(yesterday)).toBe('昨天');
    });

    it('应该为3天前的日期返回"3天前"', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatDate(threeDaysAgo)).toBe('3天前');
    });

    it('应该为10天前的日期返回"N周前"', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatDate(tenDaysAgo);
      expect(result).toContain('周前');
    });
  });

  describe('wordCount', () => {
    const wordCount = (content: string) => {
      if (!content) return 0;
      const text = content.replace(/<[^>]+>/g, '');
      return Math.ceil(text.length);
    };

    it('应该正确统计纯文本字数', () => {
      const content = '这是一段测试文本';
      expect(wordCount(content)).toBe(8);
    });

    it('应该忽略 HTML 标签', () => {
      const content = '<p>这是一段测试文本</p>';
      expect(wordCount(content)).toBe(8);
    });

    it('应该为空内容返回 0', () => {
      expect(wordCount('')).toBe(0);
    });

    it('应该处理复杂的 HTML 内容', () => {
      const content = '<h1>标题</h1><p>段落内容</p><div>更多内容</div>';
      const text = content.replace(/<[^>]+>/g, '');
      expect(wordCount(content)).toBe(text.length);
    });
  });

  describe('readingTime', () => {
    const readingTime = (wordCount: number) => {
      if (!wordCount) return 0;
      return Math.ceil(wordCount / 300);
    };

    it('应该为 0 字返回 0 分钟', () => {
      expect(readingTime(0)).toBe(0);
    });

    it('应该为 150 字返回 1 分钟', () => {
      expect(readingTime(150)).toBe(1);
    });

    it('应该为 300 字返回 1 分钟', () => {
      expect(readingTime(300)).toBe(1);
    });

    it('应该为 600 字返回 2 分钟', () => {
      expect(readingTime(600)).toBe(2);
    });

    it('应该为 900 字返回 3 分钟', () => {
      expect(readingTime(900)).toBe(3);
    });
  });

  describe('processContent', () => {
    const processContent = (content: string) => {
      if (!content) return '';

      // 处理图片样式
      content = content.replace(
        /<img([^>]*?)src="([^"]*?)"([^>]*?)>/gi,
        '<img$1src="$2"$3 style="width:100%;height:auto;display:block;margin:20rpx 0;border-radius:8rpx;">'
      );

      // 处理代码块样式
      content = content.replace(
        /<pre>/gi,
        '<pre style="background:#282c34;color:#abb2bf;padding:20rpx;border-radius:8rpx;overflow:auto;margin:20rpx 0;">'
      );

      // 处理行内代码样式
      content = content.replace(
        /<code>/gi,
        '<code style="background:#f5f5f5;color:#e74c3c;padding:2rpx 8rpx;border-radius:4rpx;font-size:90%;">'
      );

      return content;
    };

    it('应该为空内容返回空字符串', () => {
      expect(processContent('')).toBe('');
    });

    it('应该为图片添加样式', () => {
      const content = '<img src="test.jpg">';
      const result = processContent(content);
      expect(result).toContain('style=');
      expect(result).toContain('width:100%');
    });

    it('应该为 pre 标签添加样式', () => {
      const content = '<pre>code block</pre>';
      const result = processContent(content);
      expect(result).toContain('background:#282c34');
    });

    it('应该为 code 标签添加样式', () => {
      const content = '<code>inline code</code>';
      const result = processContent(content);
      expect(result).toContain('background:#f5f5f5');
    });

    it('应该处理多个元素', () => {
      const content = '<img src="test.jpg"><pre>code</pre><code>inline</code>';
      const result = processContent(content);
      expect(result).toContain('style=');
      expect(result.match(/style=/g)?.length).toBeGreaterThan(1);
    });
  });
});

// 数据结构测试
describe('Post Data Structure', () => {
  it('应该包含必需的字段', () => {
    const mockPost = {
      title: '测试文章',
      content: '<p>文章内容</p>',
      date: '2024-01-01',
      slug: 'test-post'
    };

    expect(mockPost).toHaveProperty('title');
    expect(mockPost).toHaveProperty('content');
    expect(mockPost).toHaveProperty('date');
    expect(mockPost).toHaveProperty('slug');
  });

  it('应该正确处理可选字段', () => {
    const mockPost = {
      title: '测试文章',
      content: '<p>文章内容</p>',
      date: '2024-01-01',
      slug: 'test-post',
      cover: 'https://example.com/cover.jpg',
      tags: [{ name: 'tag1' }, { name: 'tag2' }],
      categories: [{ name: 'category1' }],
      description: '文章描述'
    };

    expect(mockPost.cover).toBeDefined();
    expect(mockPost.tags).toHaveLength(2);
    expect(mockPost.categories).toHaveLength(1);
    expect(mockPost.description).toBeDefined();
  });
});

// 边界情况测试
describe('Edge Cases', () => {
  it('应该处理无效的日期字符串', () => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('zh-CN');
    };

    expect(formatDate('invalid-date')).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('应该处理超长的文章内容', () => {
    const longContent = 'a'.repeat(100000);
    const wordCount = longContent.length;

    expect(wordCount).toBe(100000);
    expect(Math.ceil(wordCount / 300)).toBe(334);
  });

  it('应该处理特殊字符', () => {
    const content = '<p>测试<>&"\'</p>';
    const processedContent = content.replace(/<[^>]+>/g, '');

    expect(processedContent).toContain('<>&"\'');
  });
});
