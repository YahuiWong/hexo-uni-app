# 博客 API 接口文档

## 📋 API 概述

本文档记录 Hexo 博客的 OpenAPI 接口规范，包括所有可用的 API 端点、请求格式和返回数据结构。

## 🌐 基础信息

- **API 基础地址**：`https://blog.yahui.wang/api/`
- **数据格式**：JSON
- **编码格式**：UTF-8
- **请求方法**：GET
- **认证方式**：无需认证（公开 API）

## 📊 API 使用统计

### 已使用 API（10个）

| API | 用途 | 状态 |
|-----|------|------|
| `/api/swiper.json` | 轮播图 | ✅ |
| `/api/site.json` | 站点信息 | ✅ |
| `/api/posts/page.{index}.json` | 文章列表 | ✅ |
| `/api/posts/{path}.json` | 文章详情 | ✅ |
| `/api/categories.json` | 分类列表 | ✅ |
| `/api/categories/{slug}/page.{index}.json` | 分类文章 | ✅ |
| `/api/tags.json` | 标签列表 | ✅ |
| `/api/tags/{slug}/page.{index}.json` | 标签文章 | ✅ |
| `/api/archives.json` | 归档结构 | ✅ |
| `/api/archives/{year}/{month}/page.{index}.json` | 月份归档 | ✅ |

### 未使用 API（2个）

| API | 用途 | 状态 |
|-----|------|------|
| `/api/pages.json` | 独立页面列表 | ❌ |
| `/api/pages/{path}.json` | 独立页面详情 | ❌ |
| `/api/search.json` | 搜索数据 | ✅ |

**API 利用率**：91%（10/11）

## 🔌 API 详细说明

### 1. 轮播图 API

#### 接口地址
```
GET /api/swiper.json
```

#### 返回格式
```json
{
  "data": [
    {
      "title": "使用docker machine 管理docker主机",
      "url": "2025/04/09/note-docker-compose/",
      "cover": "https://example.com/cover.jpg",
      "description": "Docker Machine 使用指南"
    }
  ]
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 轮播图标题 |
| url | string | 跳转链接（相对路径） |
| cover | string | 封面图片 URL |
| description | string | 描述信息（可选） |

---

### 2. 站点信息 API

#### 接口地址
```
GET /api/site.json
```

#### 返回格式
```json
{
  "data": {
    "title": "雅珲网",
    "subtitle": "Coding For Fun",
    "description": "The pursuit of endless",
    "author": "Arthur.Wang",
    "language": "zh-CN",
    "timezone": "Asia/Shanghai",
    "url": "https://blog.yahui.wang"
  }
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 网站标题 |
| subtitle | string | 副标题 |
| description | string | 网站描述 |
| author | string | 作者名称 |
| language | string | 语言代码 |
| timezone | string | 时区 |
| url | string | 网站 URL |

---

### 3. 文章列表 API

#### 接口地址
```
GET /api/posts/page.{index}.json
```

#### 请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| index | number | 页码（从1开始） | 1 |

#### 返回格式
```json
{
  "data": {
    "index": 1,
    "total": 13,
    "posts": [
      {
        "title": "使用docker machine 管理docker主机",
        "slug": "note-docker-compose",
        "date": "2025-04-09T14:04:26.000Z",
        "updated": "2025-04-11T03:51:08.998Z",
        "excerpt": "文章摘要...",
        "cover": "封面图URL",
        "tags": ["Docker", "容器"],
        "categories": ["技术"],
        "api": "api/posts/2025/04/09/note-docker-compose.json"
      }
    ]
  }
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| index | number | 当前页码 |
| total | number | 总页数 |
| posts | array | 文章列表 |
| posts[].title | string | 文章标题 |
| posts[].slug | string | URL 标识符 |
| posts[].date | string | 发布日期（ISO 8601） |
| posts[].updated | string | 更新日期（ISO 8601） |
| posts[].excerpt | string | 文章摘要 |
| posts[].cover | string | 封面图 URL |
| posts[].tags | array | 标签列表 |
| posts[].categories | array | 分类列表 |
| posts[].api | string | 详情 API 路径 |

---

### 4. 文章详情 API

#### 接口地址
```
GET /api/posts/{path}.json
```

#### 请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| path | string | 文章路径 | 2025/04/09/note-docker-compose |

#### 返回格式
```json
{
  "data": {
    "title": "使用docker machine 管理docker主机",
    "slug": "note-docker-compose",
    "date": "2025-04-09T14:04:26.000Z",
    "updated": "2025-04-11T03:51:08.998Z",
    "content": "<p>文章HTML内容...</p>",
    "excerpt": "文章摘要",
    "cover": "封面图URL",
    "tags": [
      {
        "name": "Docker",
        "slug": "docker",
        "path": "tags/docker/"
      }
    ],
    "categories": [
      {
        "name": "技术",
        "slug": "tech",
        "path": "categories/tech/"
      }
    ]
  }
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| content | string | 文章HTML内容 |
| tags | array | 标签详情（含路径） |
| categories | array | 分类详情（含路径） |

---

### 5. 分类列表 API

#### 接口地址
```
GET /api/categories.json
```

#### 返回格式
```json
{
  "data": [
    {
      "name": "前端开发",
      "slug": "frontend",
      "count": 15,
      "path": "categories/frontend/"
    }
  ]
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 分类名称 |
| slug | string | URL 标识符 |
| count | number | 文章数量 |
| path | string | 分类路径 |

---

### 6. 分类文章 API

#### 接口地址
```
GET /api/categories/{slug}/page.{index}.json
```

#### 请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| slug | string | 分类标识 | frontend |
| index | number | 页码 | 1 |

#### 返回格式
```json
{
  "data": {
    "posts": [...],
    "total": 3,
    "index": 1,
    "info": {
      "type": "category",
      "slug": "frontend"
    }
  }
}
```

---

### 7. 标签列表 API

#### 接口地址
```
GET /api/tags.json
```

#### 返回格式
```json
{
  "data": [
    {
      "name": "Vue.js",
      "slug": "vue-js",
      "count": 12,
      "path": "tags/vue-js/"
    }
  ]
}
```

#### 字段说明

与分类列表相同。

---

### 8. 标签文章 API

#### 接口地址
```
GET /api/tags/{slug}/page.{index}.json
```

#### 请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| slug | string | 标签标识 | vue-js |
| index | number | 页码 | 1 |

#### 返回格式

与分类文章 API 相同，info.type 为 "tag"。

---

### 9. 归档结构 API

#### 接口地址
```
GET /api/archives.json
```

#### 返回格式
```json
{
  "data": [
    {
      "year": 2024,
      "api": "api/archives/2024.json",
      "data": [
        {
          "month": 12,
          "api": "api/archives/2024/12.json"
        },
        {
          "month": 11,
          "api": "api/archives/2024/11.json"
        }
      ]
    },
    {
      "year": 2023,
      "api": "api/archives/2023.json",
      "data": [...]
    }
  ]
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| year | number | 年份 |
| api | string | 年份归档 API |
| data | array | 月份列表 |
| data[].month | number | 月份（1-12） |
| data[].api | string | 月份归档 API |

---

### 10. 年份归档 API

#### 接口地址
```
GET /api/archives/{year}/page.{index}.json
```

#### 请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| year | number | 年份 | 2024 |
| index | number | 页码 | 1 |

#### 返回格式
```json
{
  "data": {
    "posts": [...],
    "total": 2,
    "index": 1,
    "info": {
      "type": "archive",
      "year": 2024
    }
  }
}
```

---

### 11. 月份归档 API

#### 接口地址
```
GET /api/archives/{year}/{month}/page.{index}.json
```

#### 请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| year | number | 年份 | 2024 |
| month | number | 月份 | 12 |
| index | number | 页码 | 1 |

#### 返回格式
```json
{
  "data": {
    "posts": [
      {
        "title": "使用docker machine 管理docker主机",
        "slug": "note-docker-compose",
        "date": "2024-12-09T14:04:26.000Z",
        "updated": "2024-12-11T03:51:08.998Z"
      }
    ],
    "total": 1,
    "index": 1,
    "info": {
      "type": "archive",
      "year": 2024,
      "month": 12
    }
  }
}
```

---

### 12. 搜索数据 API

#### 接口地址
```
GET /api/search.json
```

#### 返回格式
```json
{
  "data": [
    {
      "title": "文章标题",
      "slug": "post-slug",
      "date": "2024-12-27T00:00:00.000Z",
      "excerpt": "文章摘要",
      "content": "完整文章内容...",
      "tags": ["标签1", "标签2"],
      "categories": ["分类1"]
    }
  ]
}
```

#### 字段说明

包含所有文章的完整数据，用于本地搜索。

---

### 13. 独立页面列表 API（未使用）

#### 接口地址
```
GET /api/pages.json
```

#### 返回格式
```json
{
  "data": [
    {
      "title": "关于",
      "slug": "about",
      "path": "about/"
    }
  ]
}
```

---

### 14. 独立页面详情 API（未使用）

#### 接口地址
```
GET /api/pages/{path}.json
```

#### 返回格式

与文章详情 API 相同。

---

## 🔧 API 封装示例

### TypeScript 接口定义

```typescript
// src/api/index.ts

import request from '@/utils/request';

export const api = {
  // 轮播图
  getSwiper: () => request.get('/api/swiper.json'),

  // 站点信息
  getSite: () => request.get('/api/site.json'),

  // 文章列表
  getPosts: (page: number = 1) =>
    request.get(`/api/posts/page.${page}.json`),

  // 文章详情
  getPost: (path: string) =>
    request.get(`/api/posts/${path}.json`),

  // 分类列表
  getCategories: () =>
    request.get('/api/categories.json'),

  // 分类文章
  getCategoryPosts: (slug: string, page: number = 1) =>
    request.get(`/api/categories/${slug}/page.${page}.json`),

  // 标签列表
  getTags: () =>
    request.get('/api/tags.json'),

  // 标签文章
  getTagPosts: (slug: string, page: number = 1) =>
    request.get(`/api/tags/${slug}/page.${page}.json`),

  // 归档结构
  getArchives: () =>
    request.get('/api/archives.json'),

  // 年份归档
  getYearArchive: (year: number, page: number = 1) =>
    request.get(`/api/archives/${year}/page.${page}.json`),

  // 月份归档
  getMonthArchive: (year: number, month: number, page: number = 1) =>
    request.get(`/api/archives/${year}/${month}/page.${page}.json`),

  // 搜索数据
  getSearch: () =>
    request.get('/api/search.json'),

  // 独立页面列表
  getPages: () =>
    request.get('/api/pages.json'),

  // 独立页面详情
  getPage: (path: string) =>
    request.get(`/api/pages/${path}.json`),
};
```

### Request 工具封装

```typescript
// src/utils/request.ts

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST';
  data?: any;
  header?: any;
}

const baseURL = 'https://blog.yahui.wang';

const request = {
  get: (url: string, data?: any) => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `${baseURL}${url}`,
        method: 'GET',
        data,
        success: (res: any) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: (err: any) => {
          reject(err);
        }
      });
    });
  }
};

export default request;
```

## 📊 分页逻辑说明

### 分页参数

- 所有分页 API 的页码从 **1** 开始
- 每页数量由后端决定（通常为 10）

### 分页示例

```typescript
// 加载第一页
const res = await api.getPosts(1);
console.log(res.data.total);  // 总页数：13
console.log(res.data.posts.length);  // 当前页文章数：10

// 加载最后一页
const lastPage = res.data.total;
const lastRes = await api.getPosts(lastPage);
console.log(lastRes.data.posts.length);  // 最后一页文章数：6
```

### 计算总文章数

```typescript
const firstPagePosts = 10;  // 第一页文章数
const totalPages = 13;      // 总页数
const lastPagePosts = 6;    // 最后一页文章数

// 总文章数 = (总页数 - 1) * 每页数量 + 最后一页数量
const total = (totalPages - 1) * firstPagePosts + lastPagePosts;
// 126 = (13 - 1) * 10 + 6
```

## 🐛 常见问题

### 问题1：CORS 跨域错误
**原因**：H5 平台跨域限制

**解决方案**：
```typescript
// 配置 manifest.json
{
  "h5": {
    "devServer": {
      "proxy": {
        "/api": {
          "target": "https://blog.yahui.wang",
          "changeOrigin": true
        }
      }
    }
  }
}
```

### 问题2：404 错误
**原因**：路径拼接错误

**解决方案**：
- 检查 API 路径是否正确
- 确认参数格式（slug、year、month）
- 使用 `encodeURIComponent` 编码特殊字符

### 问题3：数据为空
**原因**：
- API 返回 `{data: null}`
- 分页超出范围

**解决方案**：
```typescript
// 安全访问
const posts = res.data?.posts || [];
const total = res.data?.total || 0;
```

## 📝 最佳实践

1. **错误处理**
   ```typescript
   try {
     const res = await api.getPosts(1);
     // 处理数据
   } catch (err) {
     console.error('API 错误', err);
     uni.showToast({ title: '加载失败', icon: 'none' });
   }
   ```

2. **加载状态**
   ```typescript
   const loading = ref(true);
   try {
     const res = await api.getPosts(1);
     // ...
   } finally {
     loading.value = false;
   }
   ```

3. **数据缓存**
   ```typescript
   const cache = new Map();
   const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
     if (cache.has(key)) {
       return cache.get(key);
     }
     const data = await fetcher();
     cache.set(key, data);
     return data;
   };
   ```

## 🔗 相关文档

- [分类标签功能](./08-分类标签功能.md)
- [归档功能](./09-归档功能.md)
- [搜索功能](./10-搜索功能.md)
- [文章详情页实现](./04-文章详情页实现.md)

---

**最后更新**：2024-12-27
**维护者**: [YahuiWong](https://github.com/YahuiWong)
