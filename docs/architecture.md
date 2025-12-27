# 项目架构文档

本文档详细介绍 Hexo UniApp 博客应用的整体架构、技术选型和设计决策。

## 📋 目录

- [项目概览](#项目概览)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [核心模块](#核心模块)
- [数据流](#数据流)
- [组件架构](#组件架构)
- [构建部署](#构建部署)

---

## 项目概览

### 基本信息

- **项目名称**: Hexo UniApp 博客客户端
- **项目类型**: 跨平台移动应用
- **数据来源**: Hexo 博客 OpenAPI (`blog.yahui.wang`)
- **支持平台**: H5、小程序（微信/支付宝/百度等）、App

### 核心功能

1. **首页**
   - 轮播图展示精选文章
   - 快速导航入口
   - 文章列表（分页加载）
   - 下拉刷新、上拉加载

2. **分类页面**
   - 卡片式分类展示
   - 文章数量统计
   - 点击进入分类文章列表

3. **标签页面**
   - 标签云展示
   - 动态大小和多彩配色
   - 点击进入标签文章列表

4. **文章详情**
   - 富文本内容渲染
   - 字数统计和阅读时间
   - 标签、分类显示
   - 图片预览

---

## 技术栈

### 前端框架

| 技术 | 版本 | 用途 |
|------|------|------|
| UniApp | 3.0.0 | 跨平台开发框架 |
| Vue 3 | 3.4.21 | 渐进式前端框架 |
| TypeScript | 4.9.4 | 类型安全 |
| Vite | 5.2.8 | 构建工具 |

### UI 组件库

| 组件库 | 版本 | 说明 |
|--------|------|------|
| uview-plus | 3.6.29 | UniApp UI 组件库 |

### 测试框架

| 框架 | 版本 | 用途 |
|------|------|------|
| Vitest | 4.0.16 | 单元测试 |
| @vue/test-utils | 2.4.6 | Vue 组件测试 |
| happy-dom | 20.0.11 | DOM 模拟环境 |

### 代码规范

| 工具 | 版本 | 用途 |
|------|------|------|
| ESLint | 9.39.2 | 代码检查 |
| Prettier | 3.7.4 | 代码格式化 |
| TypeScript | 4.9.4 | 类型检查 |

---

## 目录结构

```
hexo-uni-app/
├── docs/                          # 技术文档
│   ├── README.md                  # 文档索引
│   ├── architecture.md            # 架构文档（本文件）
│   ├── uview-plus-integration.md  # UI库集成指南
│   ├── post-detail-page.md        # 详情页实现
│   ├── vitest-testing.md          # 测试文档
│   └── url-routing.md             # 路由处理文档
│
├── src/                           # 源代码
│   ├── __tests__/                 # 测试文件
│   │   ├── detail.test.ts         # 详情页测试（30个用例）
│   │   └── postitem.test.ts       # PostItem测试（14个用例）
│   │
│   ├── api/                       # API接口
│   │   └── index.ts               # 封装Hexo API
│   │
│   ├── components/                # 公共组件
│   │   └── PostItem.vue           # 文章列表项组件
│   │
│   ├── pages/                     # 页面
│   │   ├── index/                 # 首页
│   │   │   └── index.vue
│   │   ├── category/              # 分类页
│   │   │   └── list.vue
│   │   ├── tag/                   # 标签页
│   │   │   └── list.vue
│   │   └── post/                  # 文章详情
│   │       └── detail.vue
│   │
│   ├── static/                    # 静态资源
│   ├── App.vue                    # 应用入口
│   ├── main.ts                    # 主入口文件
│   ├── manifest.json              # 应用配置
│   ├── pages.json                 # 页面路由配置
│   └── uni.scss                   # 全局样式变量
│
├── vitest.config.ts               # Vitest配置
├── vite.config.ts                 # Vite配置
├── tsconfig.json                  # TypeScript配置
└── package.json                   # 项目依赖
```

---

## 核心模块

### 1. API 模块 (`src/api/index.ts`)

**职责**: 封装所有博客 API 请求

**设计模式**: 单例模式

**接口列表**:

```typescript
export const api = {
  getSwiper(): Promise<ApiResponse<any>>,     // 轮播图
  getSite(): Promise<ApiResponse<any>>,       // 站点信息
  getPosts(page: number): Promise<...>,       // 文章列表
  getPost(path: string): Promise<...>,        // 文章详情
  getCategories(): Promise<ApiResponse<any>>, // 分类列表
  getTags(): Promise<ApiResponse<any>>        // 标签列表
}
```

**API 代理配置** (`vite.config.ts`):

```typescript
proxy: {
  '/api-blog': {
    target: 'https://blog.yahui.wang',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api-blog/, '/api')
  }
}
```

**优点**:
- ✅ 统一的错误处理
- ✅ 类型安全（TypeScript）
- ✅ 易于测试和维护
- ✅ 开发环境代理，生产环境直连

### 2. 组件模块

#### 2.1 PostItem 组件 (`src/components/PostItem.vue`)

**职责**: 文章列表项展示和跳转

**核心功能**:
- 显示文章标题、摘要、日期
- 显示标签和分类
- 多级 URL fallback 策略
- 智能日期格式化（今天/昨天/具体日期）

**URL 构建策略**:

```typescript
// 优先级：url > api > date+slug > slug
if (post.url) {
  // 直接使用
} else if (post.api) {
  // 从 api 字段提取
} else if (post.date && post.slug) {
  // 根据日期和 slug 构建
} else if (post.slug) {
  // 仅使用 slug
}
```

**使用示例**:

```vue
<PostItem
  v-for="post in posts"
  :key="post.slug"
  :post="post"
/>
```

#### 2.2 其他 UI 组件

使用 uview-plus 组件库（通过 easycom 自动引入）:

- `u-button` - 按钮
- `u-icon` - 图标
- `u-loading-icon` - 加载动画
- `rich-text` - 富文本渲染（UniApp 原生）

### 3. 页面模块

#### 3.1 首页 (`src/pages/index/index.vue`)

**功能**:
- 轮播图（带渐变遮罩）
- 快速导航
- 文章列表（分页）
- 下拉刷新、上拉加载

**数据加载流程**:

```typescript
onLoad() -> loadSwiper() + loadPosts(1)
         -> onPullDownRefresh() -> 刷新数据
         -> onReachBottom() -> 加载下一页
```

#### 3.2 分类页 (`src/pages/category/list.vue`)

**功能**:
- 卡片式分类展示
- 图标 + 名称 + 文章数量
- 点击跳转到分类文章列表

#### 3.3 标签页 (`src/pages/tag/list.vue`)

**功能**:
- 标签云展示
- 动态字号（基于文章数量）
- 多彩配色方案

#### 3.4 详情页 (`src/pages/post/detail.vue`)

**技术选型**: 使用 `rich-text` 替代 `u-parse`

**核心功能**:
- HTML 内容自动样式处理
- 字数统计（移除 HTML 标签）
- 阅读时间估算（300字/分钟）
- 图片预览
- 错误重试机制

**HTML 处理示例**:

```typescript
const processedContent = computed(() => {
  let content = post.value.content;

  // 图片响应式
  content = content.replace(
    /<img([^>]*?)>/gi,
    '<img$1 style="width:100%;height:auto;...">'
  );

  // 代码块深色主题
  content = content.replace(
    /<pre>/gi,
    '<pre style="background:#282c34;...">'
  );

  return content;
});
```

---

## 数据流

### 单向数据流

```
┌─────────────┐
│  API Server │ (blog.yahui.wang)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  api/index  │ (封装请求)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Pages     │ (页面组件)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Components  │ (子组件)
└─────────────┘
```

### 典型数据流示例

**场景**: 用户打开首页查看文章列表

```
1. index.vue 调用 api.getPosts(1)
   ↓
2. api/index.ts 发起 uni.request
   ↓
3. Vite 代理转发到 blog.yahui.wang
   ↓
4. 返回 JSON 数据
   ↓
5. index.vue 更新 posts 响应式数据
   ↓
6. PostItem 组件接收 post prop
   ↓
7. 渲染文章列表
```

**场景**: 用户点击文章进入详情

```
1. PostItem 调用 toDetail(post)
   ↓
2. 执行 URL fallback 策略构建路径
   ↓
3. uni.navigateTo 跳转到 detail 页
   ↓
4. detail 页从 query 获取 url 参数
   ↓
5. 调用 getPostPathFromUrl 解析路径
   ↓
6. 调用 api.getPost(path)
   ↓
7. 返回文章详情 JSON
   ↓
8. 计算属性自动处理 HTML、字数、时间
   ↓
9. 渲染详情页
```

---

## 组件架构

### 组件层级

```
App.vue
├── pages/index/index.vue (首页)
│   └── PostItem.vue (文章列表项)
│
├── pages/category/list.vue (分类页)
│
├── pages/tag/list.vue (标签页)
│
└── pages/post/detail.vue (详情页)
```

### 组件通信

| 场景 | 方式 | 示例 |
|------|------|------|
| 父 → 子 | Props | `<PostItem :post="post" />` |
| 子 → 父 | Events | `@click="handleClick"` |
| 页面跳转 | uni.navigateTo | 传递 URL 参数 |
| 全局状态 | - | 暂未使用（项目规模小） |

### 响应式设计

使用 Vue 3 Composition API:

```typescript
// ✅ 推荐
import { ref, computed, onMounted } from 'vue';

const posts = ref<any[]>([]);
const loading = ref(false);

const wordCount = computed(() => {
  return post.value.content.replace(/<[^>]+>/g, '').length;
});

onMounted(() => {
  loadPosts();
});
```

---

## 构建部署

### 开发环境

```bash
# 安装依赖
pnpm install

# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin

# 运行测试
pnpm test

# 查看测试 UI
pnpm test:ui
```

**开发服务器**: http://localhost:5174/

**API 代理**: `/api-blog` → `https://blog.yahui.wang/api`

### 生产构建

```bash
# 构建 H5
pnpm build:h5

# 构建微信小程序
pnpm build:mp-weixin

# 构建支付宝小程序
pnpm build:mp-alipay
```

**输出目录**:
- H5: `dist/build/h5/`
- 小程序: `dist/build/mp-weixin/`

### 类型检查

```bash
pnpm type-check
```

### 测试覆盖率

```bash
pnpm coverage

# 查看报告
open coverage/index.html
```

---

## 设计模式

### 1. 单一职责原则

每个模块只负责一个功能：

- `api/index.ts` - 只负责 API 请求
- `PostItem.vue` - 只负责文章列表项展示
- `detail.vue` - 只负责文章详情展示

### 2. 开放封闭原则

对扩展开放，对修改封闭：

```typescript
// 易于扩展新的 API
export const api = {
  getSwiper() { ... },
  getPosts() { ... },
  // 新增 API 只需添加方法
  getArchives() { ... }
}
```

### 3. DRY 原则（Don't Repeat Yourself）

提取公共组件和工具函数：

```typescript
// ✅ 提取公共日期格式化
const formatDate = (dateStr: string) => {
  // 复用逻辑
}

// ❌ 避免重复代码
```

### 4. 测试驱动开发（TDD）

先写测试，再实现功能：

```typescript
// 1. 先写测试
it('应该正确处理 URL', () => {
  expect(buildPostUrl(post)).toBe('2024/12/27/test');
});

// 2. 再实现功能
const buildPostUrl = (post) => { ... }
```

---

## 性能优化

### 1. 计算属性缓存

使用 `computed` 而不是 `methods`:

```typescript
// ✅ 自动缓存
const wordCount = computed(() => calculateWords());

// ❌ 每次都计算
const getWordCount = () => calculateWords();
```

### 2. 条件渲染

使用 `v-if` 减少不必要的 DOM:

```vue
<view v-if="posts.length > 0">
  <!-- 只在有数据时渲染 -->
</view>
```

### 3. 图片懒加载

```vue
<image :src="cover" lazy-load mode="aspectFill" />
```

### 4. 分页加载

避免一次加载所有数据：

```typescript
// 首次加载第一页
loadPosts(1);

// 下拉加载更多
onReachBottom(() => {
  loadPosts(currentPage + 1);
});
```

---

## 最佳实践

### 1. TypeScript 类型定义

```typescript
interface Post {
  title: string;
  slug: string;
  url?: string;
  date?: string;
  tags?: { name: string }[];
  categories?: { name: string }[];
}
```

### 2. 错误处理

```typescript
try {
  const res = await api.getPost(path);
  post.value = res.data;
} catch (err) {
  console.error('加载失败', err);
  uni.showToast({ title: '加载失败', icon: 'none' });
}
```

### 3. 加载状态

```typescript
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    await api.getData();
  } finally {
    loading.value = false;
  }
};
```

### 4. 测试覆盖

确保核心功能有测试覆盖：

- URL 路径解析 ✅
- 日期格式化 ✅
- 字数统计 ✅
- HTML 处理 ✅

---

## 已知限制

### 1. rich-text 组件限制

- ❌ 不支持部分 CSS 属性（flexbox）
- ❌ 不支持 JavaScript
- ❌ 不支持代码高亮
- ❌ 不支持数学公式

**解决方案**: 对于复杂内容，考虑使用 webview

### 2. 跨平台兼容性

不同平台可能有差异，需要测试：

- H5 ✅
- 微信小程序 （待测试）
- 支付宝小程序 （待测试）

---

## 未来规划

### 短期（v1.1）

- [ ] 添加搜索功能
- [ ] 添加文章收藏
- [ ] 优化图片加载性能
- [ ] 添加夜间模式

### 中期（v1.2）

- [ ] 添加评论功能
- [ ] 添加分享功能
- [ ] 添加离线阅读
- [ ] 优化首页布局

### 长期（v2.0）

- [ ] 支持多主题切换
- [ ] 支持自定义字体大小
- [ ] 支持多语言
- [ ] 添加统计分析

---

## 参考资源

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 文档](https://vuejs.org/)
- [uview-plus 文档](https://uview-plus.jiangruyi.com/)
- [Vitest 文档](https://vitest.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)

---

**最后更新**: 2024-12-27
**维护者**: [YahuiWong](https://github.com/YahuiWong)
**版本**: v1.0.0
