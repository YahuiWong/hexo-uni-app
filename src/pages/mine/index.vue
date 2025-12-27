<template>
  <view class="container">
    <!-- 头部信息 -->
    <view class="header">
      <view class="avatar-section">
        <image class="avatar" src="/static/logo.png" mode="aspectFill" />
        <view class="user-info">
          <text class="site-name">{{ siteInfo.title || '雅珲网' }}</text>
          <text class="site-desc">{{ siteInfo.subtitle || '技术博客' }}</text>
        </view>
      </view>
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

    <!-- 功能列表 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="toSearch">
          <view class="menu-left">
            <u-icon name="search" size="20" color="#ff9500" />
            <text class="menu-text">搜索文章</text>
          </view>
          <u-icon name="arrow-right" size="16" color="#ccc" />
        </view>

        <view class="menu-item" @click="toAbout">
          <view class="menu-left">
            <u-icon name="info-circle" size="20" color="#007aff" />
            <text class="menu-text">关于博客</text>
          </view>
          <u-icon name="arrow-right" size="16" color="#ccc" />
        </view>

        <view class="menu-item" @click="toArchive">
          <view class="menu-left">
            <u-icon name="calendar" size="20" color="#5ac8fa" />
            <text class="menu-text">归档</text>
          </view>
          <u-icon name="arrow-right" size="16" color="#ccc" />
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="toggleTheme">
          <view class="menu-left">
            <u-icon :name="isDark ? 'sun' : 'moon'" size="20" color="#ff9500" />
            <text class="menu-text">{{ isDark ? '浅色模式' : '深色模式' }}</text>
          </view>
          <u-icon name="arrow-right" size="16" color="#ccc" />
        </view>

        <view class="menu-item" @click="clearCache">
          <view class="menu-left">
            <u-icon name="trash" size="20" color="#ff3b30" />
            <text class="menu-text">清除缓存</text>
          </view>
          <u-icon name="arrow-right" size="16" color="#ccc" />
        </view>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="footer">
      <text class="version">版本 v1.0.0</text>
      <text class="copyright">© 2025 雅珲网</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { api } from '@/api';

const siteInfo = ref<any>({
  title: '雅珲网',
  subtitle: '技术博客'
});

const stats = ref({
  posts: 0,
  categories: 0,
  tags: 0
});

const isDark = ref(false);

onShow(() => {
  loadSiteInfo();
  loadStats();
});

const loadSiteInfo = async () => {
  try {
    const res = await api.getSite();
    if (res.data) {
      siteInfo.value = res.data;
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

    // 文章数量（从首页获取）
    const postsRes = await api.getPosts(1);
    stats.value.posts = postsRes.data?.length || 0;
  } catch (err) {
    console.error('加载统计信息失败', err);
  }
};

const toSearch = () => {
  uni.navigateTo({
    url: '/pages/search/index'
  });
};

const toAbout = () => {
  uni.navigateTo({
    url: '/pages/about/index'
  });
};

const toArchive = () => {
  uni.navigateTo({
    url: '/pages/archive/list'
  });
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  uni.showToast({
    title: isDark.value ? '已切换到深色模式' : '已切换到浅色模式',
    icon: 'none'
  });
  // TODO: 实现主题切换
};

const clearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储
        uni.clearStorageSync();
        uni.showToast({
          title: '缓存已清除',
          icon: 'success'
        });
      }
    }
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 40rpx;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.site-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.site-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
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

.menu-section {
  padding: 0 30rpx;
}

.menu-group {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background 0.3s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f8f8f8;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 60rpx 0 40rpx;
}

.version,
.copyright {
  font-size: 24rpx;
  color: #999;
}
</style>
