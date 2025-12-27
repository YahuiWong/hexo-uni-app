<template>
  <view class="detail-container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <u-loading-icon mode="spinner" size="40" color="#007aff" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 文章内容 -->
    <view v-else-if="post.title" class="article">
      <!-- 顶部封面图 -->
      <image
        v-if="post.cover"
        :src="post.cover"
        mode="aspectFill"
        class="hero-cover"
        @click="previewImage(post.cover)"
      />

      <!-- 文章头部 -->
      <view class="article-header">
        <text class="title">{{ post.title }}</text>

        <!-- 元信息 -->
        <view class="meta-info">
          <view class="meta-item">
            <u-icon name="clock" size="14" color="#999" />
            <text class="meta-text">{{ formatDate(post.date) }}</text>
          </view>

          <view v-if="readingTime" class="meta-item">
            <u-icon name="eye" size="14" color="#999" />
            <text class="meta-text">约 {{ readingTime }} 分钟</text>
          </view>

          <view v-if="wordCount" class="meta-item">
            <u-icon name="edit-pen" size="14" color="#999" />
            <text class="meta-text">{{ wordCount }} 字</text>
          </view>
        </view>

        <!-- 标签 -->
        <view v-if="post.tags && post.tags.length" class="tags-section">
          <view v-for="(tag, idx) in post.tags" :key="idx" class="tag-item">
            <u-icon name="tags" size="12" color="#007aff" />
            <text class="tag-text">{{ tag.name || tag }}</text>
          </view>
        </view>

        <!-- 分类 -->
        <view v-if="post.categories && post.categories.length" class="categories-section">
          <view v-for="(category, idx) in post.categories" :key="idx" class="category-item">
            <u-icon name="folder" size="12" color="#34c759" />
            <text class="category-text">{{ category.name || category }}</text>
          </view>
        </view>
      </view>

      <!-- 文章摘要 -->
      <view v-if="post.description" class="description">
        <text class="description-text">{{ post.description }}</text>
      </view>

      <!-- Markdown 渲染内容 -->
      <view class="content-wrapper">
        <rich-text :nodes="renderedContent" class="markdown-content" />
      </view>

      <!-- 底部信息 -->
      <view class="article-footer">
        <view class="footer-item">
          <text class="footer-label">发布于：</text>
          <text class="footer-value">{{ fullDate(post.date) }}</text>
        </view>
        <view v-if="post.updated" class="footer-item">
          <text class="footer-label">更新于：</text>
          <text class="footer-value">{{ fullDate(post.updated) }}</text>
        </view>
      </view>
    </view>

    <!-- 加载失败 -->
    <view v-else class="empty">
      <u-icon name="close-circle" size="80" color="#ccc" />
      <text class="empty-text">文章加载失败</text>
      <u-button
        type="primary"
        size="small"
        @click="retry"
        style="margin-top: 30rpx"
      >
        重新加载
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '@/api';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';

// 导入常用语言的高亮支持
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import go from 'highlight.js/lib/languages/go';

// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('xml', html);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('go', go);

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
  breaks: true,
  gfm: true,
});

// 数据
const post = ref<any>({});
const loading = ref(true);
const currentUrl = ref('');
const renderedContent = ref('');

// 渲染 Markdown
const renderMarkdown = (rawContent: string): string => {
  if (!rawContent) return '';

  // 移除 YAML frontmatter
  let content = rawContent.replace(/^---[\s\S]*?---\n*/m, '');

  // 使用 marked 解析 markdown
  let html = marked.parse(content) as string;

  // 添加内联样式
  html = styleHtml(html);

  return html;
};

// 为 HTML 添加样式
const styleHtml = (html: string): string => {
  let result = html;

  // 标题样式
  result = result.replace(/<h1>/gi, '<h1 style="font-size:44rpx;font-weight:bold;margin:40rpx 0 20rpx;line-height:1.4;color:#000;padding-bottom:16rpx;border-bottom:2rpx solid #eee">');
  result = result.replace(/<h2>/gi, '<h2 style="font-size:38rpx;font-weight:bold;margin:35rpx 0 18rpx;line-height:1.4;color:#000;padding-bottom:12rpx;border-bottom:1rpx solid #f0f0f0">');
  result = result.replace(/<h3>/gi, '<h3 style="font-size:34rpx;font-weight:bold;margin:30rpx 0 16rpx;line-height:1.4;color:#000">');
  result = result.replace(/<h4>/gi, '<h4 style="font-size:32rpx;font-weight:bold;margin:28rpx 0 14rpx;line-height:1.4;color:#000">');
  result = result.replace(/<h5>/gi, '<h5 style="font-size:30rpx;font-weight:bold;margin:26rpx 0 12rpx;line-height:1.4;color:#000">');
  result = result.replace(/<h6>/gi, '<h6 style="font-size:30rpx;font-weight:bold;margin:24rpx 0 12rpx;line-height:1.4;color:#000">');

  // 段落样式
  result = result.replace(/<p>/gi, '<p style="line-height:1.8;margin:20rpx 0;text-align:justify;color:#333">');

  // 图片样式
  result = result.replace(/<img([^>]*?)>/gi, '<img$1 style="width:100%;height:auto;display:block;margin:30rpx 0;border-radius:8rpx;box-shadow:0 4rpx 12rpx rgba(0,0,0,0.1)">');

  // 引用块样式
  result = result.replace(/<blockquote>/gi, '<blockquote style="border-left:6rpx solid #007aff;padding:20rpx 24rpx;background:#f7f9fa;margin:30rpx 0;color:#555;border-radius:0 8rpx 8rpx 0">');

  // 代码块样式
  result = result.replace(/<pre>/gi, '<pre style="background:#282c34;color:#abb2bf;padding:24rpx;border-radius:8rpx;overflow-x:auto;margin:30rpx 0;font-size:26rpx;line-height:1.6;box-shadow:0 2rpx 8rpx rgba(0,0,0,0.15)">');

  // 行内代码样式
  result = result.replace(/<code>/gi, '<code style="background:#f5f5f5;color:#e74c3c;padding:4rpx 10rpx;border-radius:4rpx;font-size:90%;font-family:Consolas,Monaco,monospace">');

  // pre 内的 code 特殊处理
  result = result.replace(/<pre([^>]*?)>([\s\S]*?)<\/pre>/gi, (match, preAttrs, preContent) => {
    const cleanedContent = preContent.replace(
      /<code([^>]*?)style="[^"]*?"/gi,
      '<code$1 style="background:transparent;color:inherit;padding:0;font-size:inherit"'
    );
    return `<pre${preAttrs}>${cleanedContent}</pre>`;
  });

  // 链接样式
  result = result.replace(/<a([^>]*?)>/gi, '<a$1 style="color:#007aff;text-decoration:underline;word-break:break-all">');

  // 列表样式
  result = result.replace(/<ul>/gi, '<ul style="margin:20rpx 0;padding-left:40rpx">');
  result = result.replace(/<ol>/gi, '<ol style="margin:20rpx 0;padding-left:40rpx">');
  result = result.replace(/<li>/gi, '<li style="margin:12rpx 0;line-height:1.8">');

  // 表格样式
  result = result.replace(/<table>/gi, '<table style="width:100%;border-collapse:collapse;margin:30rpx 0;font-size:28rpx">');
  result = result.replace(/<thead>/gi, '<thead style="background:#f5f7fa">');
  result = result.replace(/<th>/gi, '<th style="padding:20rpx 16rpx;text-align:left;font-weight:bold;color:#333;border-bottom:2rpx solid #e8e8e8">');
  result = result.replace(/<td>/gi, '<td style="padding:16rpx;border-bottom:1rpx solid #f0f0f0;color:#666">');

  // 水平线样式
  result = result.replace(/<hr>/gi, '<hr style="border:none;border-top:2rpx solid #eee;margin:40rpx 0">');

  // 粗体、斜体样式
  result = result.replace(/<strong>/gi, '<strong style="font-weight:bold;color:#000">');
  result = result.replace(/<em>/gi, '<em style="font-style:italic">');

  return result;
};

// 字数统计（基于 raw 内容）
const wordCount = computed(() => {
  if (!post.value.raw) return 0;
  // 移除 frontmatter 和 markdown 语法
  const text = post.value.raw
    .replace(/^---[\s\S]*?---\n*/m, '')
    .replace(/[#*`~\[\]()]/g, '');
  return Math.ceil(text.length);
});

// 阅读时间（假设每分钟阅读300字）
const readingTime = computed(() => {
  if (!wordCount.value) return 0;
  return Math.ceil(wordCount.value / 300);
});

// 图片预览
const previewImage = (src: string) => {
  if (!src) return;
  const images = post.value.images || [];
  const urls = images.length ? images : [src];
  uni.previewImage({
    urls,
    current: src,
  });
};

// 安全提取文章路径
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

// 加载文章
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

    // 使用 raw 字段渲染 markdown
    if (post.value.raw) {
      renderedContent.value = renderMarkdown(post.value.raw);
    } else {
      // 降级到使用 content
      console.warn('没有 raw 字段，使用 content 字段');
      renderedContent.value = post.value.content || '';
    }
  } catch (err: any) {
    console.error('加载文章失败', err);
    uni.showToast({ title: '加载失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 重试
const retry = () => {
  if (currentUrl.value) {
    loadPost(currentUrl.value);
  }
};

// 页面加载逻辑
onLoad(async (options: any) => {
  let url = options?.url;

  if (!url) {
    uni.showToast({ title: '缺少文章链接', icon: 'none' });
    loading.value = false;
    return;
  }

  url = decodeURIComponent(url);
  currentUrl.value = url;

  await loadPost(url);
});

// 格式化日期（相对时间）
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
    day: 'numeric',
  });
};

// 完整日期
const fullDate = (dateStr: string) => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.detail-container {
  background: #f5f5f5;
  min-height: 100vh;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  background: #fff;
}

.loading-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
}

.article {
  background: #fff;
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
  display: block;
  margin-bottom: 30rpx;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999;
  line-height: 1;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  background: #e3f2fd;
  border-radius: 20rpx;
}

.tag-text {
  font-size: 24rpx;
  color: #007aff;
  line-height: 1;
}

.categories-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  background: #e8f5e9;
  border-radius: 20rpx;
}

.category-text {
  font-size: 24rpx;
  color: #34c759;
  line-height: 1;
}

.description {
  padding: 0 30rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.description-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  font-style: italic;
}

.content-wrapper {
  padding: 30rpx;
}

.markdown-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  word-break: break-word;
}

.article-footer {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  background: #fafafa;
}

.footer-item {
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}

.footer-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 10rpx;
}

.footer-value {
  font-size: 24rpx;
  color: #666;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 30rpx;
  background: #fff;
}

.empty-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
