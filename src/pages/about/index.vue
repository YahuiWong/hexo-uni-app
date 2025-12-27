<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <image class="avatar" src="/static/logo.png" mode="aspectFill" />
      <text class="site-title">{{ siteInfo.title || '雅珲网' }}</text>
      <text class="site-subtitle">{{ siteInfo.subtitle || 'Coding For Fun' }}</text>
      <text class="site-desc">{{ siteInfo.description || 'The pursuit of endless' }}</text>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-value">{{ stats.posts }}</text>
        <text class="stat-label">文章</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.categories }}</text>
        <text class="stat-label">分类</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.tags }}</text>
        <text class="stat-label">标签</text>
      </view>
    </view>

    <!-- 信息卡片 -->
    <view class="info-section">
      <!-- 作者信息 -->
      <view class="info-card">
        <view class="card-header">
          <u-icon name="account" size="20" color="#007aff" />
          <text class="card-title">作者</text>
        </view>
        <view class="card-content">
          <text class="info-text">{{ siteInfo.author || 'Arthur.Wang' }}</text>
        </view>
      </view>

      <!-- 网站地址 -->
      <view class="info-card">
        <view class="card-header">
          <u-icon name="link" size="20" color="#5ac8fa" />
          <text class="card-title">网站</text>
        </view>
        <view class="card-content">
          <text class="info-link" @click="copyUrl">{{ siteInfo.url || 'https://blog.yahui.wang' }}</text>
        </view>
      </view>

      <!-- 语言和时区 -->
      <view class="info-card">
        <view class="card-header">
          <u-icon name="setting" size="20" color="#34c759" />
          <text class="card-title">配置</text>
        </view>
        <view class="card-content">
          <view class="config-item">
            <text class="config-label">语言：</text>
            <text class="config-value">{{ siteInfo.language || 'zh-CN' }}</text>
          </view>
          <view class="config-item">
            <text class="config-label">时区：</text>
            <text class="config-value">{{ siteInfo.timezone || 'Asia/Shanghai' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 技术栈 -->
    <view class="tech-section">
      <view class="section-header">
        <u-icon name="share" size="20" color="#ff9500" />
        <text class="section-title">技术栈</text>
      </view>
      <view class="tech-grid">
        <view class="tech-item">
          <text class="tech-name">UniApp</text>
          <text class="tech-version">v3.x</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">Vue</text>
          <text class="tech-version">v3.x</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">TypeScript</text>
          <text class="tech-version">v4.9</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">Vite</text>
          <text class="tech-version">v5.2</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">uview-plus</text>
          <text class="tech-version">v3.6</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">Hexo API</text>
          <text class="tech-version">OpenAPI</text>
        </view>
      </view>
    </view>

    <!-- 功能特性 -->
    <view class="features-section">
      <view class="section-header">
        <u-icon name="star" size="20" color="#ff3b30" />
        <text class="section-title">功能特性</text>
      </view>
      <view class="features-list">
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="16" color="#34c759" />
          <text class="feature-text">文章浏览与搜索</text>
        </view>
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="16" color="#34c759" />
          <text class="feature-text">分类和标签筛选</text>
        </view>
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="16" color="#34c759" />
          <text class="feature-text">时间轴归档</text>
        </view>
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="16" color="#34c759" />
          <text class="feature-text">响应式设计</text>
        </view>
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="16" color="#34c759" />
          <text class="feature-text">跨平台支持</text>
        </view>
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="16" color="#34c759" />
          <text class="feature-text">离线缓存</text>
        </view>
      </view>
    </view>

    <!-- 版权信息 -->
    <view class="footer">
      <text class="copyright">© 2024 {{ siteInfo.title || '雅珲网' }}</text>
      <text class="version">v1.0.0</text>
      <text class="powered">Powered by UniApp & Hexo</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { api } from '@/api';

const siteInfo = ref<any>({
  title: '雅珲网',
  subtitle: 'Coding For Fun',
  description: 'The pursuit of endless',
  author: 'Arthur.Wang',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  url: 'https://blog.yahui.wang'
});

const stats = ref({
  posts: 0,
  categories: 0,
  tags: 0
});

onShow(() => {
  loadSiteInfo();
  loadStats();
});

const loadSiteInfo = async () => {
  try {
    const res = await api.getSite();
    if (res.data) {
      siteInfo.value = { ...siteInfo.value, ...res.data };
    }
  } catch (err) {
    console.error('加载站点信息失败', err);
  }
};

const loadStats = async () => {
  try {
    // 加载分类数量
    const categoriesRes = await api.getCategories();
    stats.value.categories = categoriesRes.data?.length || 0;

    // 加载标签数量
    const tagsRes = await api.getTags();
    stats.value.tags = tagsRes.data?.length || 0;

    // 文章数量（从首页API获取）
    const postsRes = await api.getPosts(1);
    if (postsRes.data?.posts && postsRes.data?.total) {
      const firstPagePosts = postsRes.data.posts.length;
      const totalPages = postsRes.data.total;

      if (totalPages > 1) {
        // 加载最后一页获取准确数量
        try {
          const lastPageRes = await api.getPosts(totalPages);
          const lastPagePosts = lastPageRes.data?.posts?.length || 0;
          // 总数 = (总页数 - 1) * 第一页文章数 + 最后一页文章数
          stats.value.posts = (totalPages - 1) * firstPagePosts + lastPagePosts;
        } catch (err) {
          // 如果加载失败，使用估算值
          stats.value.posts = totalPages * firstPagePosts;
        }
      } else {
        stats.value.posts = firstPagePosts;
      }
    } else if (postsRes.data && Array.isArray(postsRes.data)) {
      // 兼容旧格式
      stats.value.posts = postsRes.data.length;
    }
  } catch (err) {
    console.error('加载统计信息失败', err);
  }
};

const copyUrl = () => {
  uni.setClipboardData({
    data: siteInfo.value.url,
    success: () => {
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'success'
      });
    }
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 30rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  gap: 16rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  margin-bottom: 10rpx;
}

.site-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
}

.site-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.site-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.stats-section {
  display: flex;
  background: #fff;
  margin: -40rpx 30rpx 30rpx;
  border-radius: 16rpx;
  padding: 40rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.stat-item:not(:last-child) {
  border-right: 1rpx solid #f0f0f0;
}

.stat-value {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.info-section {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-text {
  font-size: 28rpx;
  color: #666;
}

.info-link {
  font-size: 28rpx;
  color: #007aff;
  text-decoration: underline;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.config-label {
  font-size: 28rpx;
  color: #999;
}

.config-value {
  font-size: 28rpx;
  color: #666;
}

.tech-section,
.features-section {
  padding: 0 30rpx 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 30rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.tech-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.tech-version {
  font-size: 22rpx;
  color: #999;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #666;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 40rpx 30rpx;
}

.copyright,
.version,
.powered {
  font-size: 24rpx;
  color: #999;
}
</style>
