# URL 路由处理文档

本文档介绍项目中的 URL 路由处理机制。

## 问题背景

博客文章在列表中的数据格式不统一：

```json
// 有些文章有完整的 url 字段
{
  "title": "Docker 安装",
  "url": "2024/02/13/docker-install/",
  "slug": "docker-install"
}

// 有些文章缺少 url 字段
{
  "title": "使用docker machine",
  "slug": "note-docker-compose",
  "date": "2025-04-09T14:04:26.000Z"
}
```

## 解决方案

### 多级 Fallback 策略

PostItem 组件使用以下策略构建 URL：

```typescript
const toDetail = (post: any) => {
  let targetUrl = post.url;

  if (!targetUrl) {
    // 方案1: 从 api 字段提取
    if (post.api) {
      targetUrl = post.api
        .replace(/^api\/posts\//, '')
        .replace(/\.json$/, '');
    }
    // 方案2: 根据 date + slug 构建
    else if (post.date && post.slug) {
      const date = new Date(post.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      targetUrl = `${year}/${month}/${day}/${post.slug}`;
    }
    // 方案3: 直接使用 slug
    else if (post.slug) {
      targetUrl = post.slug;
    }
  }

  uni.navigateTo({
    url: `/pages/post/detail?url=${encodeURIComponent(targetUrl)}`
  });
};
```

### 测试用例

14 个测试用例覆盖所有场景：

```typescript
// 真实数据测试
it('应该正确处理第一篇文章（缺少 url）', () => {
  const post = {
    slug: 'note-docker-compose',
    date: '2025-04-09T14:04:26.000Z',
  };
  expect(buildPostUrl(post)).toBe('2025/04/09/note-docker-compose');
});
```

## 详情页 URL 解析

详情页接收 URL 参数后的处理：

```typescript
const getPostPathFromUrl = (url: string): string => {
  let fullUrl = url.trim();
  let pathname = '';

  // 处理完整 URL
  if (/^https?:\/\//i.test(fullUrl)) {
    const urlObj = new URL(fullUrl);
    pathname = urlObj.pathname;
  } else {
    pathname = fullUrl;
  }

  // 统一处理
  return pathname
    .replace(/^\//, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
};
```

---

**最后更新**: 2024-12-27
**测试文件**: `src/__tests__/postitem.test.ts`
