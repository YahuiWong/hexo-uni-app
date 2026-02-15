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

      <!-- 使用 mp-html 渲染 Markdown 转换后的 HTML -->
      <view class="content-wrapper">
        <mp-html
          :content="renderedContent"
          :selectable="true"
          :show-img-menu="true"
          @imgtap="handleImageTap"
        />
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

        <!-- 分享按钮 -->
        <view class="share-section">
          <view class="share-btn" @click="showSharePanel = true">
            <u-icon name="share" size="18" color="#007aff" />
            <text class="share-btn-text">分享文章</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载失败 -->
    <view v-else class="empty">
      <u-icon name="close-circle" size="80" color="#ccc" />
      <text class="empty-text">文章加载失败</text>
      <u-button type="primary" size="small" @click="retry" style="margin-top: 30rpx">
        重新加载
      </u-button>
    </view>

    <!-- 分享面板 -->
    <SharePanel
      v-model:show="showSharePanel"
      :title="post.title || ''"
      :url="shareUrl"
      :content="post.description || post.excerpt || ''"
      :imageUrl="post.cover"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { api } from '@/api';
import { md2html } from '@/utils/md2html-safe';
import { getPostShareConfig } from '@/composables/useShare';
import SharePanel from '@/components/SharePanel.vue';
import type { PostDetail } from '@/types';

// 导入 mp-html 组件
// @ts-ignore
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue';

// 数据
const post = ref<PostDetail>({} as PostDetail);
const loading = ref(true);
const currentUrl = ref('');
const showSharePanel = ref(false);

// 配置页面分享
onShareAppMessage(() =>
  getPostShareConfig({
    title: post.value.title,
    url: currentUrl.value,
    cover: post.value.cover,
  })
);

onShareTimeline(() =>
  getPostShareConfig({
    title: post.value.title,
    url: currentUrl.value,
    cover: post.value.cover,
  })
);

// 分享链接（完整 URL）
const shareUrl = computed(() => {
  if (!post.value.url) return '';

  // 如果已经是完整 URL
  if (post.value.url.startsWith('http')) {
    return post.value.url;
  }

  // 拼接完整 URL
  const url = post.value.url.startsWith('/') ? post.value.url : `/${post.value.url}`;
  return `https://blog.yahui.wang${url}`;
});

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!post.value.raw) {
    // 如果没有 raw 字段，降级使用 content
    console.warn('没有 raw 字段，使用 content 字段');
    return post.value.content || '';
  }

  try {
    // 移除 YAML frontmatter
    let markdown = post.value.raw.replace(/^---[\s\S]*?---\n*/m, '');

    // 使用安全的 md2html 转换
    return md2html(markdown);
  } catch (err) {
    console.error('Markdown 转换失败', err);
    return '<p>内容渲染失败，请稍后重试</p>';
  }
});

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

// 图片点击事件
const handleImageTap = (e: any) => {
  const { src } = e.detail;
  previewImage(src);
};

// 图片预览
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
  background: #f8f9fa;
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
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}

.article-header {
  padding: 40rpx 30rpx 30rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  display: block;
  margin-bottom: 30rpx;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #546e7a;
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
  background: #e7f7ef;
  border-radius: 20rpx;
}

.tag-text {
  font-size: 24rpx;
  color: #42b983;
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
  background: #e3f2fd;
  border-radius: 20rpx;
}

.category-text {
  font-size: 24rpx;
  color: #3498db;
  line-height: 1;
}

.description {
  padding: 0 30rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.description-text {
  font-size: 28rpx;
  color: #546e7a;
  line-height: 1.6;
  font-style: italic;
}

.content-wrapper {
  padding: 30rpx;
  background: #fff;
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

.share-section {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  justify-content: center;
}

.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  cursor: pointer;
  transition: all 0.3s;
}

.share-btn:active {
  opacity: 0.8;
  transform: scale(0.95);
}

.share-btn-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
  line-height: 1;
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

/* mp-html 自定义样式 */
:deep(.mp-html) {
  font-size: 30rpx;
  line-height: 1.8;
  color: #4a4a4a;
}

/* 代码块样式 - 清新配色 */
:deep(.mp-html .code-block) {
  background: #f6f8fa;
  padding: 24rpx;
  border-radius: 8rpx;
  overflow-x: auto;
  margin: 30rpx 0;
  border: 1rpx solid #e8e8e8;
}

:deep(.mp-html .code-block code) {
  color: #24292f;
  font-size: 26rpx;
  line-height: 1.6;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  white-space: pre;
  display: block;
}

/* 行内代码样式 */
:deep(.mp-html .inline-code) {
  background: #e7f7ef;
  color: #42b983;
  padding: 4rpx 10rpx;
  border-radius: 4rpx;
  font-size: 90%;
  font-family: Consolas, Monaco, monospace;
}

/* 标题样式 */
:deep(.mp-html h1) {
  font-size: 42rpx;
  font-weight: 600;
  margin: 50rpx 0 30rpx;
  color: #2c3e50;
  border-bottom: 3rpx solid #42b983;
  padding-bottom: 16rpx;
}

:deep(.mp-html h2) {
  font-size: 38rpx;
  font-weight: 600;
  margin: 45rpx 0 25rpx;
  color: #2c3e50;
  border-bottom: 2rpx solid #e8e8e8;
  padding-bottom: 12rpx;
}

:deep(.mp-html h3) {
  font-size: 34rpx;
  font-weight: 600;
  margin: 40rpx 0 20rpx;
  color: #2c3e50;
}

:deep(.mp-html h4) {
  font-size: 32rpx;
  font-weight: 600;
  margin: 35rpx 0 18rpx;
  color: #546e7a;
}

/* 段落样式 */
:deep(.mp-html p) {
  line-height: 1.8;
  margin: 24rpx 0;
  color: #4a4a4a;
  text-align: justify;
}

/* 图片样式 */
:deep(.mp-html img) {
  max-width: 100%;
  border-radius: 12rpx;
  margin: 40rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

/* 引用块样式 */
:deep(.mp-html blockquote) {
  border-left: 4rpx solid #42b983;
  padding: 20rpx 24rpx;
  background: #f9fafb;
  margin: 30rpx 0;
  color: #546e7a;
  border-radius: 0 8rpx 8rpx 0;
}

/* 链接样式 */
:deep(.mp-html a) {
  color: #3498db;
  text-decoration: none;
  border-bottom: 1rpx solid #3498db;
  word-break: break-all;
}

/* 列表样式 */
:deep(.mp-html ul),
:deep(.mp-html ol) {
  margin: 24rpx 0;
  padding-left: 40rpx;
  color: #4a4a4a;
}

:deep(.mp-html li) {
  margin: 12rpx 0;
  line-height: 1.8;
}

/* 表格样式 */
:deep(.mp-html table) {
  width: 100%;
  border-collapse: collapse;
  margin: 30rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border-radius: 8rpx;
  overflow: hidden;
}

:deep(.mp-html th) {
  padding: 20rpx 16rpx;
  background: #fafbfc;
  font-weight: 600;
  color: #2c3e50;
  border: 1rpx solid #e8e8e8;
  text-align: left;
}

:deep(.mp-html td) {
  padding: 16rpx;
  border: 1rpx solid #e8e8e8;
  color: #4a4a4a;
}

/* 水平线样式 */
:deep(.mp-html hr) {
  border: none;
  border-top: 1rpx solid #e8e8e8;
  margin: 50rpx 0;
  opacity: 0.5;
}

/* 数学公式占位符样式 */
:deep(.mp-html .math-inline),
:deep(.mp-html .math-display),
:deep(.mp-html .math-block) {
  color: #8b5cf6;
  font-family: 'KaTeX_Main', 'Times New Roman', serif;
  background: #faf5ff;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  display: inline-block;
}

:deep(.mp-html .math-display),
:deep(.mp-html .math-block) {
  display: block;
  margin: 20rpx 0;
  padding: 16rpx;
  text-align: center;
}

/* Mermaid 图表占位符样式 */
:deep(.mp-html .mermaid) {
  background: #f0f9ff;
  padding: 24rpx;
  border-radius: 8rpx;
  margin: 30rpx 0;
  border: 1rpx solid #bae6fd;
  color: #0369a1;
  font-family: monospace;
  overflow-x: auto;
  white-space: pre;
}
</style>
