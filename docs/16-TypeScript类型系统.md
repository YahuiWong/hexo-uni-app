# TypeScript 类型系统完善

## 📋 概述

本文档介绍如何为 Hexo UniApp 项目建立完善的 TypeScript 类型系统，包括类型定义、严格模式配置和类型安全实践。

## 🎯 目标

- 为所有 API 接口定义准确的类型
- 启用 TypeScript 严格模式
- 减少运行时错误
- 提升代码质量和可维护性

---

## 📦 核心类型定义

### 1. 站点信息类型

```typescript
// src/types/index.ts
export interface SiteInfo {
  title: string;
  subtitle?: string;
  description?: string;
  author?: string;
  language?: string;
  timezone?: string;
  url?: string;
}
```

### 2. 轮播图类型

```typescript
export interface SwiperItem {
  title: string;
  description?: string;
  cover: string;
  url: string;
}
```

### 3. 文章列表类型

```typescript
export interface PostItem {
  title: string;
  excerpt: string;
  date: string;
  cover?: string;
  url?: string;
  slug?: string;
  api?: string;
  tags?: string[];
  categories?: string[];
}
```

### 4. 文章详情类型

```typescript
export interface PostDetail {
  title: string;
  slug: string;
  date: string;
  updated?: string;
  content: string;      // HTML 内容
  raw?: string;         // Markdown 原始内容
  excerpt?: string;
  description?: string;
  cover?: string;
  url: string;
  images?: string[];
  categories?: CategoryItem[];
  tags?: TagItem[];
  prev?: PostNavigation;
  next?: PostNavigation;
}

export interface PostNavigation {
  title: string;
  url: string;
  slug: string;
}
```

### 5. 分类和标签类型

```typescript
export interface CategoryItem {
  name: string;
  slug: string;
  count: number;
  url?: string;
}

export interface TagItem {
  name: string;
  slug: string;
  count: number;
  url?: string;
}
```

### 6. 归档类型

```typescript
export interface ArchiveYear {
  year: number;
  posts: PostItem[];
  total?: number;
}

export interface ArchiveMonth {
  month: number;
  posts: PostItem[];
}
```

### 7. 分页数据类型

```typescript
export interface PaginationData<T> {
  posts: T[];
  total: number;
  pageSize: number;
  current: number;
  prev?: number;
  next?: number;
  totalPages?: number;  // 兼容字段
}
```

### 8. API 响应类型

```typescript
export interface ApiResponse<T> {
  data: T;
  code?: number;
  message?: string;
}
```

### 9. 搜索结果类型

```typescript
export interface SearchResult {
  title: string;
  excerpt: string;
  url: string;
  date: string;
  categories?: string[];
  tags?: string[];
}
```

### 10. 分享相关类型

```typescript
export interface ShareOptions {
  title: string;
  path?: string;
  imageUrl?: string;
  content?: string;
  url?: string;
}

export type SharePlatform =
  | 'weixin'
  | 'moment'
  | 'qq'
  | 'weibo'
  | 'copy'
  | 'qrcode'
  | 'poster';

export interface ShareResult {
  success: boolean;
  platform: SharePlatform;
  message?: string;
}

export interface PageShareConfig {
  title?: string;
  path?: string;
  imageUrl?: string;
  desc?: string;
  query?: string;
}
```

---

## ⚙️ TypeScript 配置

### tsconfig.json 严格模式

```json
{
  "extends": "@vue/tsconfig/tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ESNext", "DOM"],
    "jsx": "preserve",

    // TypeScript 严格模式配置
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // 额外的类型检查
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // 路径映射
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    "types": [
      "@dcloudio/types",
      "vite/client"
    ],

    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "isolatedModules": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ]
}
```

### 严格模式选项说明

| 选项 | 说明 |
|------|------|
| `strict` | 启用所有严格类型检查选项 |
| `noImplicitAny` | 禁止隐式 any 类型 |
| `strictNullChecks` | 严格的 null 检查 |
| `strictFunctionTypes` | 严格的函数类型检查 |
| `strictBindCallApply` | 严格的 bind/call/apply 检查 |
| `strictPropertyInitialization` | 严格的属性初始化检查 |
| `noImplicitThis` | 禁止隐式 this |
| `alwaysStrict` | 始终使用严格模式 |
| `noUnusedLocals` | 检查未使用的本地变量 |
| `noUnusedParameters` | 检查未使用的参数 |
| `noImplicitReturns` | 检查函数返回值 |
| `noFallthroughCasesInSwitch` | 检查 switch 语句 |

---

## 🔧 API 接口类型化

### API 模块类型定义

```typescript
// src/api/index.ts
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

const BASE_URL = 'https://blog.yahui.wang/api';

async function request<T>(
  url: string,
  data?: Record<string, any>
): Promise<ApiResponse<T>> {
  try {
    const res = await uni.request({
      url,
      data,
      method: 'GET'
    });
    return res.data as ApiResponse<T>;
  } catch (error) {
    console.error('API 请求失败:', error);
    throw error;
  }
}

export const api = {
  // 获取轮播图
  getSwiper(): Promise<ApiResponse<SwiperItem[]>> {
    return request<SwiperItem[]>(`${BASE_URL}/swiper.json`);
  },

  // 获取站点信息
  getSite(): Promise<ApiResponse<SiteInfo>> {
    return request<SiteInfo>(`${BASE_URL}/site.json`);
  },

  // 获取文章列表
  getPosts(page: number): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(
      `${BASE_URL}/posts/page.${page}.json`
    );
  },

  // 获取文章详情
  getPost(path: string): Promise<ApiResponse<PostDetail>> {
    return request<PostDetail>(`${BASE_URL}/posts/${path}.json`);
  },

  // 获取分类列表
  getCategories(): Promise<ApiResponse<CategoryItem[]>> {
    return request<CategoryItem[]>(`${BASE_URL}/categories.json`);
  },

  // 获取分类文章
  getCategoryPosts(
    slug: string,
    page: number = 1
  ): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(
      `${BASE_URL}/categories/${slug}/page.${page}.json`
    );
  },

  // 获取标签列表
  getTags(): Promise<ApiResponse<TagItem[]>> {
    return request<TagItem[]>(`${BASE_URL}/tags.json`);
  },

  // 获取标签文章
  getTagPosts(
    slug: string,
    page: number = 1
  ): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(
      `${BASE_URL}/tags/${slug}/page.${page}.json`
    );
  },

  // 获取归档列表
  getArchives(): Promise<ApiResponse<ArchiveYear[]>> {
    return request<ArchiveYear[]>(`${BASE_URL}/archives.json`);
  },

  // 获取年份归档
  getYearArchive(
    year: number,
    page: number = 1
  ): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(
      `${BASE_URL}/archives/${year}/page.${page}.json`
    );
  },

  // 获取月份归档
  getMonthArchive(
    year: number,
    month: number,
    page: number = 1
  ): Promise<ApiResponse<PaginationData<PostItem>>> {
    return request<PaginationData<PostItem>>(
      `${BASE_URL}/archives/${year}/${month}/page.${page}.json`
    );
  },

  // 搜索文章
  search(keyword: string): Promise<ApiResponse<SearchResult[]>> {
    return request<SearchResult[]>(
      `${BASE_URL}/search.json?q=${encodeURIComponent(keyword)}`
    );
  }
};
```

---

## 🎨 类型安全实践

### 1. 组件 Props 类型定义

```typescript
// src/components/PostItem.vue
<script setup lang="ts">
import type { PostItem } from '@/types';

interface Props {
  post: PostItem;
  showCover?: boolean;
  showExcerpt?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showCover: true,
  showExcerpt: true
});
</script>
```

### 2. 页面数据类型定义

```typescript
// src/pages/index/index.vue
<script setup lang="ts">
import { ref } from 'vue';
import type { SwiperItem, PostItem } from '@/types';

const swiperList = ref<SwiperItem[]>([]);
const posts = ref<PostItem[]>([]);
const currentPage = ref<number>(1);
const totalPages = ref<number>(1);
const loading = ref<boolean>(true);
</script>
```

### 3. 事件处理类型

```typescript
const handleClick = (post: PostItem): void => {
  uni.navigateTo({
    url: `/pages/post/detailraw?url=${encodeURIComponent(post.url)}`
  });
};

const handleLoad = async (): Promise<void> => {
  try {
    const res = await api.getPosts(1);
    posts.value = res.data.posts;
  } catch (error) {
    console.error('加载失败', error);
  }
};
```

### 4. Composable 类型定义

```typescript
// src/composables/useShare.ts
import type { PageShareConfig } from '@/types';

export function useShare(
  config?: PageShareConfig | (() => PageShareConfig)
) {
  const defaultConfig: PageShareConfig = {
    title: '雅珲网',
    path: '/pages/index/index',
    imageUrl: '',
    desc: '分享来自雅珲网的精彩内容'
  };

  const getConfig = (): PageShareConfig => {
    if (typeof config === 'function') {
      return { ...defaultConfig, ...config() };
    }
    return { ...defaultConfig, ...config };
  };

  // ...
}
```

---

## 🔍 常见类型错误及解决

### 1. 隐式 any 类型

**错误示例：**
```typescript
// ❌ 参数隐式具有 any 类型
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
```

**正确示例：**
```typescript
// ✅ 明确指定参数类型
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}
```

### 2. 可能为 null/undefined

**错误示例：**
```typescript
// ❌ 对象可能为 undefined
const title = post.value.title;
```

**正确示例：**
```typescript
// ✅ 使用可选链
const title = post.value?.title;

// ✅ 或提供默认值
const title = post.value?.title || '无标题';
```

### 3. 未使用的变量

**错误示例：**
```typescript
// ❌ 声明但未使用
import { onMounted } from 'vue';
const unused = ref(0);
```

**正确示例：**
```typescript
// ✅ 移除未使用的导入
// ✅ 或使用下划线前缀标记有意未使用
const _intentionallyUnused = ref(0);
```

### 4. 数组类型不匹配

**错误示例：**
```typescript
// ❌ 类型不兼容
const posts = ref<PostItem[]>([]);
posts.value = res.data; // res.data 可能不是 PostItem[]
```

**正确示例：**
```typescript
// ✅ 确保类型匹配
const posts = ref<PostItem[]>([]);
posts.value = res.data.posts || [];

// ✅ 或进行类型断言（谨慎使用）
posts.value = res.data as PostItem[];
```

---

## 📊 类型检查命令

### 运行类型检查

```bash
# 完整类型检查
pnpm run type-check

# 监听模式
pnpm run type-check -- --watch
```

### package.json 配置

```json
{
  "scripts": {
    "type-check": "vue-tsc --noEmit"
  }
}
```

---

## ✅ 类型系统最佳实践

### 1. 优先使用接口而非类型别名

```typescript
// ✅ 推荐：接口
interface User {
  name: string;
  age: number;
}

// ⚠️ 类型别名也可以，但接口更适合对象
type User = {
  name: string;
  age: number;
};
```

### 2. 使用联合类型而非枚举

```typescript
// ✅ 推荐：字符串字面量联合类型
type Status = 'pending' | 'loading' | 'success' | 'error';

// ⚠️ 枚举会增加运行时代码
enum Status {
  Pending = 'pending',
  Loading = 'loading',
  Success = 'success',
  Error = 'error'
}
```

### 3. 使用泛型提高复用性

```typescript
// ✅ 通用的分页数据类型
interface PaginationData<T> {
  posts: T[];
  total: number;
  current: number;
}

// 使用
const articlePages = ref<PaginationData<PostItem>>();
const categoryPages = ref<PaginationData<CategoryItem>>();
```

### 4. 避免使用 any

```typescript
// ❌ 避免
function process(data: any) {
  return data;
}

// ✅ 使用 unknown 或泛型
function process<T>(data: T): T {
  return data;
}

// ✅ 或使用具体类型
function process(data: PostItem | CategoryItem) {
  return data;
}
```

### 5. 善用类型守卫

```typescript
function isPostItem(item: any): item is PostItem {
  return item && typeof item.title === 'string';
}

// 使用
if (isPostItem(data)) {
  // data 在这里被推断为 PostItem 类型
  console.log(data.title);
}
```

---

## 📈 效果评估

### 类型覆盖率

- ✅ API 接口：100% 类型覆盖
- ✅ 组件 Props：100% 类型覆盖
- ✅ 页面数据：100% 类型覆盖
- ✅ Composables：100% 类型覆盖

### 严格模式检查

- ✅ 所有严格模式选项已启用
- ✅ 无隐式 any 类型
- ✅ 严格的 null 检查
- ✅ 未使用变量检查

### 开发体验提升

- 🎯 更好的代码提示
- 🔒 编译时类型检查
- 🐛 更早发现错误
- 📝 更好的代码文档

---

## 🔗 相关文档

- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vue 3 TypeScript 指南](https://vuejs.org/guide/typescript/overview.html)
- [uni-app TypeScript 支持](https://uniapp.dcloud.net.cn/tutorial/typescript.html)

---

**最后更新**: 2025-12-27
**维护者**: [YahuiWong](https://github.com/YahuiWong)
