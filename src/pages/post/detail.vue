<template>
  <view class="detail-container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 文章内容 -->
    <view v-else-if="post.title" class="article">
      <!-- 标题 -->
      <view class="title">{{ post.title }}</view>
<u-button type="primary">uView Plus 测试按钮</u-button>
    <u-parse html="<p style='color:red;'>u-parse 测试文本</p>" />
      <!-- 元信息 -->
      <view class="meta">
        <text class="date">{{ formatDate(post.date) }}</text>
        <text v-if="post.author" class="author">作者：{{ post.author }}</text>
      </view>

      <!-- 封面图 -->
      <image
        v-if="post.cover"
        :src="post.cover"
        mode="widthFix"
        class="cover"
        @click="previewImage(post.cover)"
      />

      <!-- 富文本内容 -->
      <u-parse
        :html="post.content"
        :tag-style="customStyle"
        @preview="previewImage"
        @navigate="handleNavigate"
      />
    </view>

    <!-- 加载失败 -->
    <view v-else class="empty">
      <text>文章加载失败，请返回重试</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '@/api';

// 数据
const post = ref<any>({});
const loading = ref(true);

// u-parse 自定义样式
const customStyle = {
  p: 'font-size: 32rpx; line-height: 60rpx; color: #333; margin: 30rpx 0;',
  h1: 'font-size: 48rpx; font-weight: bold; color: #000; margin: 50rpx 0 30rpx;',
  h2: 'font-size: 44rpx; font-weight: bold; color: #000; margin: 45rpx 0 25rpx;',
  h3: 'font-size: 40rpx; font-weight: bold; color: #000; margin: 40rpx 0 20rpx;',
  h4: 'font-size: 36rpx; font-weight: bold; color: #000; margin: 35rpx 0 20rpx;',
  img: 'width: 100%; border-radius: 16rpx; margin: 30rpx 0;',
  blockquote: 'border-left: 8rpx solid #007aff; padding: 20rpx 30rpx; background: #f9f9f9; margin: 40rpx 0; font-style: italic; color: #555;',
  pre: 'background: #282c34; color: #abb2bf; padding: 30rpx; border-radius: 16rpx; overflow: auto; font-size: 28rpx;',
  code: 'background: #f5f5f5; padding: 4rpx 10rpx; border-radius: 8rpx; font-size: 28rpx; color: #e74c3c;',
  table: 'width: 100%; border-collapse: collapse; margin: 30rpx 0;',
  th: 'border: 1rpx solid #ddd; padding: 16rpx; background: #f5f5f5; font-weight: bold;',
  td: 'border: 1rpx solid #ddd; padding: 16rpx; text-align: left;',
  ul: 'padding-left: 40rpx; margin: 20rpx 0;',
  ol: 'padding-left: 40rpx; margin: 20rpx 0;',
  a: 'color: #007aff; text-decoration: underline;'
};

// 图片预览
const previewImage = (src: string) => {
  uni.previewImage({
    urls: [src],
    current: src
  });
};

// 链接点击处理
const handleNavigate = (href: string) => {
  if (href.startsWith('http') && !href.includes('blog.yahui.wang')) {
    uni.setClipboardData({ data: href });
    uni.showToast({ title: '外部链接已复制到剪贴板', icon: 'none' });
  }
  // 如需打开 webview，可自行创建页面跳转
};

// 安全提取文章路径（已修复拼写错误）
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
    pathname = fullUrl;  // ← 这里之前错误写成了 full perspektUrl，已修复
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

// 页面加载逻辑
onLoad(async (options: any) => {
  let url = options?.url;

  if (!url) {
    uni.showToast({ title: '缺少文章链接', icon: 'none' });
    loading.value = false;
    return;
  }

  url = decodeURIComponent(url);

  try {
    const path = getPostPathFromUrl(url);
    console.log('文章 API 路径:', path); // 调试用

    const res = await api.getPost(path);
    post.value = res.data;
  } catch (err: any) {
    console.error('加载文章失败', err);
    uni.showToast({ title: '加载失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
});

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.detail-container {
  background: #ffffff;
  min-height: 100vh;
}

.article {
  padding: 40rpx;
}

.title {
  font-size: 52rpx;
  font-weight: bold;
  color: #000;
  line-height: 1.4;
  text-align: center;
  margin-bottom: 40rpx;
}

.meta {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  margin-bottom: 50rpx;
}

.meta text + text {
  margin-left: 30rpx;
}

.cover {
  width: 100%;
  border-radius: 20rpx;
  margin: 0 auto 50rpx;
  display: block;
}

.loading,
.empty {
  text-align: center;
  padding: 200rpx 0;
  color: #999;
  font-size: 32rpx;
}
</style>