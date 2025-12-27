# 14-Markdown渲染方案

## 概述

本文档介绍 Hexo UniApp 博客应用中基于 Markdown 的文章渲染方案，包括 `marked` 解析器的集成、`highlight.js` 代码高亮、以及与传统 HTML 渲染方案的对比。

## 背景

### 问题

传统的 `detail.vue` 页面使用服务端渲染的 HTML（`post.content` 字段），存在以下问题：

1. **样式注入困难**：使用正则表达式注入内联样式，容易破坏 HTML 结构
2. **递归更新错误**：CSS 深度选择器（`::v-deep`）导致 rich-text 组件递归更新
3. **渲染效果差**：rich-text 组件对某些 HTML 标签支持有限
4. **维护成本高**：样式注入逻辑复杂，难以调试

### 解决方案

创建新的 `detailraw.vue` 页面，使用以下技术栈：

- **marked**: Markdown 解析器，将 `post.raw` 字段转换为 HTML
- **highlight.js**: 代码语法高亮库
- **内联样式注入**：避免 CSS 深度选择器

## 技术实现

### 1. 依赖安装

```bash
pnpm add marked highlight.js
```

**包体积**：
- `marked`: ~50KB (gzipped)
- `highlight.js` (core + 10 语言): ~100KB (gzipped)
- **总计**: ~150KB

### 2. 配置 marked

```typescript
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';

// 导入语言支持
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
// ... 其他语言

// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
// ...

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('代码高亮失败', err);
      }
    }
    return code;
  },
  breaks: true,  // 支持换行符
  gfm: true,     // GitHub Flavored Markdown
});
```

### 3. Markdown 渲染流程

```typescript
const renderMarkdown = (rawContent: string): string => {
  if (!rawContent) return '';

  // 1. 移除 YAML frontmatter
  let content = rawContent.replace(/^---[\s\S]*?---\n*/m, '');

  // 2. 使用 marked 解析
  let html = marked.parse(content) as string;

  // 3. 添加内联样式
  html = styleHtml(html);

  return html;
};
```

**处理步骤**：

1. **移除 Frontmatter**：Hexo 的 `raw` 字段包含 YAML 头部，需要移除
2. **解析 Markdown**：`marked.parse()` 将 markdown 转换为 HTML
3. **样式注入**：为 HTML 元素添加内联样式

### 4. 样式注入

```typescript
const styleHtml = (html: string): string => {
  let result = html;

  // 标题样式
  result = result.replace(/<h1>/gi, '<h1 style="font-size:44rpx;font-weight:bold;...">');
  result = result.replace(/<h2>/gi, '<h2 style="font-size:38rpx;...">');

  // 段落样式
  result = result.replace(/<p>/gi, '<p style="line-height:1.8;margin:20rpx 0;...">');

  // 图片样式
  result = result.replace(/<img([^>]*?)>/gi, '<img$1 style="width:100%;...">');

  // 引用块样式
  result = result.replace(/<blockquote>/gi, '<blockquote style="border-left:6rpx solid #007aff;...">');

  // 代码块样式
  result = result.replace(/<pre>/gi, '<pre style="background:#282c34;color:#abb2bf;...">');

  // 行内代码样式（需特殊处理，避免影响 pre 内的 code）
  result = result.replace(/<code>/gi, '<code style="background:#f5f5f5;color:#e74c3c;...">');

  // pre 内的 code 特殊处理
  result = result.replace(/<pre([^>]*?)>([\s\S]*?)<\/pre>/gi, (match, preAttrs, preContent) => {
    const cleanedContent = preContent.replace(
      /<code([^>]*?)style="[^"]*?"/gi,
      '<code$1 style="background:transparent;color:inherit;padding:0;font-size:inherit"'
    );
    return `<pre${preAttrs}>${cleanedContent}</pre>`;
  });

  // ... 其他元素

  return result;
};
```

**关键技术点**：

- **正则替换顺序**：先处理特殊情况（pre/code），再处理通用情况
- **避免重复替换**：使用精确的正则表达式
- **性能优化**：只在加载时执行一次，结果存储在 ref 中

### 5. 代码高亮

支持以下语言：

```typescript
// 注册的语言列表
const supportedLanguages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'bash',
  'css',
  'html',
  'xml',
  'json',
  'sql',
  'go'
];
```

**高亮效果**：

```html
<!-- markdown 代码块 -->
```javascript
function hello() {
  console.log('Hello World');
}
```

<!-- 解析后的 HTML -->
<pre style="...">
  <code style="...">
    <span class="hljs-keyword">function</span> hello() {
      console.<span class="hljs-built_in">log</span>(...);
    }
  </code>
</pre>
```

### 6. 数据加载

```typescript
const loadPost = async (url: string) => {
  loading.value = true;

  try {
    const path = getPostPathFromUrl(url);
    const res = await api.getPost(path);
    post.value = res.data || {};

    // 优先使用 raw 字段
    if (post.value.raw) {
      renderedContent.value = renderMarkdown(post.value.raw);
    } else {
      // 降级到 content
      console.warn('没有 raw 字段，使用 content 字段');
      renderedContent.value = post.value.content || '';
    }
  } catch (err) {
    console.error('加载文章失败', err);
    uni.showToast({ title: '加载失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};
```

**降级策略**：
- 优先使用 `post.raw`（原始 markdown）
- 如果没有 `raw` 字段，降级到 `post.content`（HTML）

## 样式系统

### 完整样式列表

```typescript
const styles = {
  // 标题
  h1: 'font-size:44rpx;font-weight:bold;margin:40rpx 0 20rpx;border-bottom:2rpx solid #eee',
  h2: 'font-size:38rpx;font-weight:bold;margin:35rpx 0 18rpx;border-bottom:1rpx solid #f0f0f0',
  h3: 'font-size:34rpx;font-weight:bold;margin:30rpx 0 16rpx',

  // 文本
  p: 'line-height:1.8;margin:20rpx 0;text-align:justify;color:#333',
  strong: 'font-weight:bold;color:#000',
  em: 'font-style:italic',

  // 媒体
  img: 'width:100%;height:auto;display:block;margin:30rpx 0;border-radius:8rpx',

  // 引用
  blockquote: 'border-left:6rpx solid #007aff;padding:20rpx 24rpx;background:#f7f9fa',

  // 代码
  pre: 'background:#282c34;color:#abb2bf;padding:24rpx;border-radius:8rpx',
  code: 'background:#f5f5f5;color:#e74c3c;padding:4rpx 10rpx;border-radius:4rpx',

  // 列表
  ul: 'margin:20rpx 0;padding-left:40rpx',
  ol: 'margin:20rpx 0;padding-left:40rpx',
  li: 'margin:12rpx 0;line-height:1.8',

  // 表格
  table: 'width:100%;border-collapse:collapse;margin:30rpx 0',
  thead: 'background:#f5f7fa',
  th: 'padding:20rpx 16rpx;border-bottom:2rpx solid #e8e8e8',
  td: 'padding:16rpx;border-bottom:1rpx solid #f0f0f0',

  // 其他
  hr: 'border:none;border-top:2rpx solid #eee;margin:40rpx 0',
  a: 'color:#007aff;text-decoration:underline'
};
```

## 方案对比

### detail.vue (HTML 渲染)

**优点**：
- 无额外依赖
- HTML 已由服务端渲染
- 包体积小

**缺点**：
- 样式注入困难
- rich-text 组件限制多
- 容易出现递归更新错误
- 维护成本高

### detailraw.vue (Markdown 渲染)

**优点**：
- 完全控制渲染流程
- 代码高亮效果专业
- 样式系统清晰
- 无递归更新问题
- 更好的排版效果

**缺点**：
- 需要额外依赖（~150KB）
- 客户端解析消耗性能
- 需要处理 YAML frontmatter

## 性能优化

### 1. 按需加载语言

只导入需要的语言支持：

```typescript
// ❌ 不推荐：导入所有语言
import hljs from 'highlight.js';

// ✅ 推荐：按需导入
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);
```

### 2. 一次性渲染

使用 ref 而非 computed，避免重复计算：

```typescript
// ❌ 不推荐：computed 会在依赖变化时重新计算
const renderedContent = computed(() => renderMarkdown(post.value.raw));

// ✅ 推荐：只在加载时计算一次
const renderedContent = ref('');
renderedContent.value = renderMarkdown(post.value.raw);
```

### 3. 缓存解析结果

```typescript
const contentCache = new Map<string, string>();

const renderMarkdown = (rawContent: string): string => {
  // 检查缓存
  const cached = contentCache.get(rawContent);
  if (cached) return cached;

  // 解析
  const result = /* ... */;

  // 存入缓存
  contentCache.set(rawContent, result);
  return result;
};
```

## 使用示例

### 跳转到 Markdown 渲染页面

```typescript
uni.navigateTo({
  url: `/pages/post/detailraw?url=${encodeURIComponent(postUrl)}`
});
```

### 在列表页中选择渲染方式

```typescript
const toPostDetail = (post: Post, useMarkdown = false) => {
  const page = useMarkdown ? 'detailraw' : 'detail';
  uni.navigateTo({
    url: `/pages/post/${page}?url=${encodeURIComponent(post.url)}`
  });
};
```

## 页面配置

在 `pages.json` 中注册新页面：

```json
{
  "path": "pages/post/detailraw",
  "style": {
    "navigationBarTitleText": "文章详情（Markdown）"
  }
}
```

## 兼容性

### API 字段要求

需要后端 API 返回 `raw` 字段：

```json
{
  "title": "文章标题",
  "content": "<p>HTML 内容</p>",
  "raw": "---\ntitle: 文章标题\n---\n\nMarkdown 内容",
  "..."
}
```

### 平台支持

- ✅ H5（完全支持）
- ✅ App（完全支持）
- ✅ 微信小程序（需测试代码高亮性能）
- ⚠️ 其他小程序（highlight.js 可能受限）

## 常见问题

### 1. 代码高亮不生效

**原因**：语言未注册或语言名称不匹配

**解决方案**：
```typescript
// 检查语言是否注册
console.log(hljs.listLanguages()); // ['javascript', 'python', ...]

// 使用别名
hljs.registerLanguage('js', javascript); // javascript 的别名
```

### 2. YAML Frontmatter 显示在页面上

**原因**：未正确移除 frontmatter

**解决方案**：
```typescript
// 确保正则表达式正确
content = rawContent.replace(/^---[\s\S]*?---\n*/m, '');
```

### 3. 行内代码样式被代码块影响

**原因**：`<code>` 样式同时影响了行内代码和代码块内的代码

**解决方案**：
```typescript
// 先处理代码块内的 code
result = result.replace(/<pre([^>]*?)>([\s\S]*?)<\/pre>/gi, (match, preAttrs, preContent) => {
  const cleanedContent = preContent.replace(
    /<code([^>]*?)style="[^"]*?"/gi,
    '<code$1 style="background:transparent;color:inherit"'
  );
  return `<pre${preAttrs}>${cleanedContent}</pre>`;
});
```

### 4. 包体积过大

**解决方案**：
- 只导入必要的语言支持
- 使用动态导入（按需加载）
- 考虑使用 CDN

```typescript
// 动态导入示例
const loadLanguage = async (lang: string) => {
  const module = await import(`highlight.js/lib/languages/${lang}`);
  hljs.registerLanguage(lang, module.default);
};
```

## 未来优化方向

### 1. 服务端渲染

将 Markdown 解析移到服务端，客户端直接使用渲染好的 HTML：

```javascript
// Hexo 插件
hexo.extend.filter.register('after_post_render', (data) => {
  data.markdown_html = marked.parse(data.raw);
  return data;
});
```

### 2. 自定义渲染器

扩展 marked 的渲染器，实现自定义功能：

```typescript
const renderer = new marked.Renderer();

// 自定义图片渲染
renderer.image = (href, title, text) => {
  return `<image src="${href}" mode="widthFix" lazy-load />`;
};

marked.setOptions({ renderer });
```

### 3. 数学公式支持

集成 KaTeX 或 MathJax 支持数学公式：

```typescript
import katex from 'katex';

// 渲染数学公式
const renderMath = (latex: string): string => {
  return katex.renderToString(latex, { throwOnError: false });
};
```

## 相关文档

- [04-文章详情页实现](./04-文章详情页实现.md) - 传统 HTML 渲染方案
- [12-博客API接口](./12-博客API接口.md) - API 数据结构

## 参考资料

- [marked 官方文档](https://marked.js.org/)
- [highlight.js 官方文档](https://highlightjs.org/)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)

---

**最后更新**: 2024-12-27
**维护者**: [YahuiWong](https://github.com/YahuiWong)
