# 文章详情页实现文档

本文档详细介绍文章详情页的重构过程、技术选型和实现细节。

## 📋 目录

- [背景](#背景)
- [技术选型](#技术选型)
- [核心功能](#核心功能)
- [实现细节](#实现细节)
- [性能优化](#性能优化)
- [已知问题](#已知问题)

---

## 背景

### 旧版本问题

旧版详情页存在以下问题：

1. ❌ 使用 `u-parse` 组件渲染富文本，稳定性差
2. ❌ 包含测试代码（u-button、u-parse 测试）
3. ❌ 缺少字数统计和阅读时间
4. ❌ 标签和分类显示不完整
5. ❌ 错误处理不完善

### 重构目标

1. ✅ 使用原生 `rich-text` 组件替代 `u-parse`
2. ✅ 移除所有测试代码
3. ✅ 添加字数统计和阅读时间估算
4. ✅ 完善文章信息展示
5. ✅ 改进错误处理和重试机制

---

## 技术选型

### rich-text vs u-parse

| 特性 | rich-text | u-parse |
|------|-----------|---------|
| 来源 | UniApp 原生 | 第三方组件 |
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 性能 | 更好 | 一般 |
| 兼容性 | 全平台 | 部分平台 |
| 自定义 | 有限 | 灵活 |
| 维护 | 官方维护 | 社区维护 |

**选择 rich-text 的原因：**
- ✅ 原生组件，性能更好
- ✅ 稳定性高，官方维护
- ✅ 全平台兼容
- ✅ 满足当前需求

---

## 核心功能

### 1. HTML 内容处理

使用 `computed` 自动处理 HTML 内容样式：

```typescript
const processedContent = computed(() => {
  if (!post.value.content) return '';

  let content = post.value.content;

  // 处理图片样式
  content = content.replace(
    /<img([^>]*?)src="([^"]*?)"([^>]*?)>/gi,
    '<img$1src="$2"$3 style="width:100%;height:auto;display:block;margin:20rpx 0;border-radius:8rpx;">'
  );

  // 处理代码块
  content = content.replace(
    /<pre>/gi,
    '<pre style="background:#282c34;color:#abb2bf;padding:20rpx;border-radius:8rpx;overflow:auto;margin:20rpx 0;">'
  );

  // 处理行内代码
  content = content.replace(
    /<code>/gi,
    '<code style="background:#f5f5f5;color:#e74c3c;padding:2rpx 8rpx;border-radius:4rpx;font-size:90%;">'
  );

  return content;
});
```

**支持的元素样式：**
- 图片：响应式宽度、圆角
- 代码块：深色背景、滚动
- 行内代码：浅色背景、高亮
- 标题：层级字号、间距
- 段落：行高、对齐
- 引用块：左边框、背景色
- 链接：颜色、下划线

### 2. 字数统计

```typescript
const wordCount = computed(() => {
  if (!post.value.content) return 0;
  // 移除 HTML 标签后统计字数
  const text = post.value.content.replace(/<[^>]+>/g, '');
  return Math.ceil(text.length);
});
```

### 3. 阅读时间估算

```typescript
const readingTime = computed(() => {
  if (!wordCount.value) return 0;
  // 假设每分钟阅读 300 字
  return Math.ceil(wordCount.value / 300);
});
```

### 4. 图片预览

```typescript
const previewImage = (src: string) => {
  if (!src) return;

  // 收集文章中的所有图片
  const images = post.value.images || [];
  const urls = images.length ? images : [src];

  uni.previewImage({
    urls,
    current: src,
  });
};
```

### 5. URL 路径解析

```typescript
const getPostPathFromUrl = (url: string): string => {
  let fullUrl = url.trim();
  let pathname = '';

  // 尝试作为完整 URL 解析
  if (/^https?:\/\//i.test(fullUrl) || fullUrl.startsWith('//')) {
    try {
      const urlObj = new URL(
        fullUrl.startsWith('//') ? 'https:' + fullUrl : fullUrl
      );
      pathname = urlObj.pathname;
    } catch {
      pathname = fullUrl;
    }
  } else {
    pathname = fullUrl;
  }

  // 统一处理路径
  let path = pathname
    .replace(/^\//, '')     // 去掉开头 /
    .replace(/\.html$/, '') // 去掉尾部 .html
    .replace(/\/$/, '');    // 去掉尾部 /

  // 空路径兜底
  if (!path) path = 'index';

  return path;
};
```

---

## 实现细节

### 页面结构

```vue
<template>
  <view class="detail-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <u-loading-icon />
      <text>加载中...</text>
    </view>

    <!-- 文章内容 -->
    <view v-else-if="post.title" class="article">
      <!-- 封面图 -->
      <image v-if="post.cover" :src="post.cover" class="hero-cover" />

      <!-- 文章头部 -->
      <view class="article-header">
        <text class="title">{{ post.title }}</text>

        <!-- 元信息 -->
        <view class="meta-info">
          <view class="meta-item">
            <u-icon name="clock" />
            <text>{{ formatDate(post.date) }}</text>
          </view>
          <view class="meta-item">
            <u-icon name="eye" />
            <text>约 {{ readingTime }} 分钟</text>
          </view>
          <view class="meta-item">
            <u-icon name="edit-pen" />
            <text>{{ wordCount }} 字</text>
          </view>
        </view>

        <!-- 标签 -->
        <view class="tags-section">
          <view v-for="tag in post.tags" :key="tag.name" class="tag-item">
            <u-icon name="tag" />
            <text>{{ tag.name }}</text>
          </view>
        </view>
      </view>

      <!-- 富文本内容 -->
      <view class="content-wrapper">
        <rich-text :nodes="processedContent" class="rich-content" />
      </view>

      <!-- 底部信息 -->
      <view class="article-footer">
        <text>发布于：{{ fullDate(post.date) }}</text>
        <text v-if="post.updated">更新于：{{ fullDate(post.updated) }}</text>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="empty">
      <u-icon name="close-circle" size="80" />
      <text>文章加载失败</text>
      <u-button @click="retry">重新加载</u-button>
    </view>
  </view>
</template>
```

### 数据加载

```typescript
const loadPost = async (url: string) => {
  loading.value = true;

  try {
    const path = getPostPathFromUrl(url);
    console.log('文章 API 路径:', path);

    const res = await api.getPost(path);
    post.value = res.data || {};

    if (!post.value.title) {
      throw new Error('文章数据无效');
    }
  } catch (err: any) {
    console.error('加载文章失败', err);
    uni.showToast({ title: '加载失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};
```

### 样式设计

```scss
.detail-container {
  background: #f5f5f5;
  min-height: 100vh;
}

.hero-cover {
  width: 100%;
  height: 450rpx;
  display: block;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.article-header {
  padding: 40rpx 30rpx 30rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #000;
  line-height: 1.4;
  margin-bottom: 30rpx;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  background: #e3f2fd;
  border-radius: 20rpx;
}

.rich-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  word-break: break-word;
}
```

---

## 性能优化

### 1. 计算属性缓存

使用 `computed` 而不是 `methods`：

```typescript
// ✅ 推荐：使用 computed，自动缓存
const processedContent = computed(() => {
  return processContent(post.value.content);
});

// ❌ 不推荐：每次渲染都执行
const getProcessedContent = () => {
  return processContent(post.value.content);
};
```

### 2. 图片懒加载

```vue
<image
  :src="post.cover"
  mode="aspectFill"
  lazy-load
  class="hero-cover"
/>
```

### 3. 条件渲染优化

```vue
<!-- ✅ 使用 v-if，完全不渲染 -->
<view v-if="post.cover">
  <image :src="post.cover" />
</view>

<!-- ❌ 使用 v-show，仍然渲染 -->
<view v-show="post.cover">
  <image :src="post.cover" />
</view>
```

### 4. 正则表达式优化

使用全局标志避免多次编译：

```typescript
// ✅ 推荐：使用 /gi 全局替换
content = content.replace(/<img([^>]*?)>/gi, '...');

// ❌ 不推荐：多次调用 replace
content = content.replace(/<img([^>]*?)>/, '...');
content = content.replace(/<img([^>]*?)>/, '...');
```

---

## 测试用例

详情页相关测试位于 `src/__tests__/detail.test.ts`，包含 30 个测试用例：

### URL 路径解析测试

```typescript
it('应该正确处理完整 URL', () => {
  const url = 'https://blog.yahui.wang/2020/06/07/k8s-first/';
  const result = getPostPathFromUrl(url);
  expect(result).toBe('2020/06/07/k8s-first');
});
```

### 日期格式化测试

```typescript
it('应该为今天的日期返回"今天"', () => {
  const today = new Date().toISOString();
  expect(formatDate(today)).toBe('今天');
});
```

### 字数统计测试

```typescript
it('应该忽略 HTML 标签', () => {
  const content = '<p>这是一段测试文本</p>';
  expect(wordCount(content)).toBe(8);
});
```

**运行测试：**
```bash
pnpm test:run
```

---

## 已知问题

### 1. rich-text 限制

rich-text 组件有以下限制：

- ❌ 不支持部分 CSS 属性（如 flexbox）
- ❌ 不支持 JavaScript
- ❌ 不支持自定义组件
- ❌ 图片高度需要固定或使用 aspectFill

**解决方案：**
- 使用行内样式
- 预处理 HTML 内容
- 对于复杂内容，考虑使用 webview

### 2. 代码高亮

rich-text 不支持代码高亮插件（如 highlight.js）。

**当前方案：**
- 使用预定义的代码块样式
- 深色背景 + 浅色文字

**未来改进：**
- 考虑使用 webview 渲染
- 或使用服务端预渲染

### 3. 数学公式

rich-text 不支持 LaTeX 或 MathJax。

**建议：**
- 使用图片替代
- 或使用 webview 专门渲染

---

## 参考资源

- [UniApp rich-text 文档](https://uniapp.dcloud.net.cn/component/rich-text.html)
- [Vue3 Computed 文档](https://vuejs.org/api/reactivity-core.html#computed)
- [正则表达式教程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)

---

**最后更新**: 2024-12-27
**维护者**: [YahuiWong](https://github.com/YahuiWong)
**文件位置**: `src/pages/post/detail.vue`
