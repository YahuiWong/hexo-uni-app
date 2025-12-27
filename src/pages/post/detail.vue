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
            <u-icon name="tags"  size="12" color="#007aff" />
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

      <!-- 富文本内容 -->
      <view class="content-wrapper">
        <rich-text :nodes="processedContent" class="rich-content" />
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
import { usePostShare } from '@/composables/useShare';

// 数据
const post = ref<any>({});
const loading = ref(true);
const currentUrl = ref('');

// 配置页面分享
usePostShare(() => ({
  title: post.value.title,
  url: currentUrl.value,
  cover: post.value.cover
}));

// 处理后的内容
const processedContent = computed(() => {
  if (!post.value.content) return '';

  let content = post.value.content;

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

  // 处理标题样式
  content = content.replace(/<h1([^>]*?)>/gi, '<h1$1 style="font-size:40rpx;font-weight:bold;margin:40rpx 0 20rpx;line-height:1.4;">');
  content = content.replace(/<h2([^>]*?)>/gi, '<h2$1 style="font-size:36rpx;font-weight:bold;margin:35rpx 0 18rpx;line-height:1.4;">');
  content = content.replace(/<h3([^>]*?)>/gi, '<h3$1 style="font-size:32rpx;font-weight:bold;margin:30rpx 0 16rpx;line-height:1.4;">');

  // 处理段落样式
  content = content.replace(
    /<p>/gi,
    '<p style="line-height:1.8;margin:16rpx 0;text-align:justify;">'
  );

  // 处理引用块样式
  content = content.replace(
    /<blockquote>/gi,
    '<blockquote style="border-left:4rpx solid #007aff;padding:10rpx 20rpx;background:#f9f9f9;margin:20rpx 0;color:#555;">'
  );

  // 处理链接样式
  content = content.replace(
    /<a([^>]*?)>/gi,
    '<a$1 style="color:#007aff;text-decoration:underline;">'
  );

  return content;
});

// 字数统计
const wordCount = computed(() => {
  if (!post.value.content) return 0;
  const text = post.value.content.replace(/<[^>]+>/g, '');
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

  // 尝试作为完整 URL 解析
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

  // 统一处理路径
  let path = pathname
    .replace(/^\//, '')     // 去掉开头 /
    .replace(/\.html$/, '') // 去掉尾部 .html
    .replace(/\/$/, '');    // 去掉尾部 /

  // 空路径兜底
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

.rich-content {
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
