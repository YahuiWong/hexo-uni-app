<template>
  <view class="container" :class="{ dark: isDark }">
    <!-- 轮播图 -->
    <swiper
      v-if="swiperList.length"
      class="swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="500"
      indicator-color="rgba(255, 255, 255, 0.5)"
      indicator-active-color="#007aff"
    >
      <swiper-item v-for="(item, index) in swiperList" :key="index">
        <view class="swiper-item" @click="toPost(item.url)">
          <image :src="item.cover" mode="aspectFill" class="swiper-image" />
          <view class="swiper-overlay">
            <text class="swiper-title">{{ item.title }}</text>
            <text v-if="item.description" class="swiper-desc">{{ item.description }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-item" @click="toPage('/pages/search/index')">
        <u-icon name="search" size="24" color="#ff9500" />
        <text class="nav-text">搜索</text>
      </view>
      <view class="nav-item" @click="toTabPage('/pages/category/list')">
        <u-icon name="grid" size="24" color="#007aff" />
        <text class="nav-text">分类</text>
      </view>
      <view class="nav-item" @click="toTabPage('/pages/tag/list')">
        <u-icon name="tags" size="24" color="#34c759" />
        <text class="nav-text">标签</text>
      </view>
    </view>

    <!-- 文章列表 -->
    <view class="post-list">
      <view class="list-header">
        <text class="list-title">最新文章</text>
        <text class="list-count">已加载 {{ posts.length }} 篇</text>
      </view>

      <!-- 加载中 -->
      <view v-if="loading && !posts.length" class="loading">
        <u-loading-icon mode="spinner" size="40" color="#007aff" />
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 文章项 -->
      <PostItemComponent v-for="post in posts" :key="post.slug" :post="post" />

      <!-- 加载更多 -->
      <view v-if="hasMore" @click="loadMore" class="load-more">
        <u-loading-icon v-if="loadingMore" mode="spinner" size="20" color="#007aff" />
        <text v-else class="load-more-text">加载更多</text>
      </view>

      <!-- 没有更多 -->
      <view v-else-if="posts.length" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && !posts.length" class="empty">
        <u-icon name="inbox" size="80" color="#ccc" />
        <text class="empty-text">暂无文章</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { onReachBottom, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { api } from '@/api';
import PostItemComponent from '@/components/PostItem.vue';
import type { SwiperItem, PostItem } from '@/types';
import { getIndexShareConfig } from '@/composables/useShare';
import { useTheme } from '@/composables/useTheme';

const { themeMode } = useTheme();
const isDark = computed(() => themeMode.value === 'dark');

// 配置页面分享
onShareAppMessage(() => getIndexShareConfig());
onShareTimeline(() => getIndexShareConfig());

const swiperList = ref<SwiperItem[]>([]);
const posts = ref<PostItem[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const hasMore = ref(true);
const loading = ref(true);
const loadingMore = ref(false);

onMounted(async () => {
  try {
    // 加载轮播
    const swiperRes = await api.getSwiper();
    swiperList.value = swiperRes.data || [];
  } catch (err) {
    console.error('加载轮播失败', err);
  }

  // 加载第一页文章
  await loadPosts(1);
  loading.value = false;
});

const loadPosts = async (page: number) => {
  if (page > 1) loadingMore.value = true;

  try {
    const res = await api.getPosts(page);
    const newPosts = res.data.posts || res.data || [];

    if (page === 1) {
      posts.value = newPosts;
    } else {
      posts.value = [...posts.value, ...newPosts];
    }

    totalPages.value = typeof res.data.total === 'number' ? res.data.total : 1;
    hasMore.value = page < totalPages.value;
    currentPage.value = page;
  } catch (err) {
    console.error('加载文章失败', err);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loadingMore.value = false;
  }
};

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    loadPosts(currentPage.value + 1);
  }
};

// 触底加载更多
onReachBottom(() => {
  if (hasMore.value && !loadingMore.value) {
    loadPosts(currentPage.value + 1);
  }
});

const toPost = (url: string) => {
  uni.navigateTo({
    url: `/pages/post/detailraw?url=${encodeURIComponent(url)}`
  });
};

const toPage = (url: string) => {
  uni.navigateTo({ url });
};

const toTabPage = (url: string) => {
  uni.switchTab({ url });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding-bottom: env(safe-area-inset-bottom);
}

.swiper {
  height: 400rpx;
  background: var(--bg-primary);
}

.swiper-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.swiper-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.swiper-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
  line-height: 1.4;
}

.swiper-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-bar {
  display: flex;
  background: var(--bg-primary);
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.nav-item:active {
  background: var(--bg-secondary);
  transform: scale(0.95);
}

.nav-text {
  font-size: 28rpx;
  color: var(--text-primary);
}

.post-list {
  padding: 0 20rpx 40rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx 20rpx;
}

.list-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-primary);
}

.list-count {
  font-size: 24rpx;
  color: var(--text-tertiary);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: var(--text-tertiary);
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: var(--bg-primary);
  border-radius: 16rpx;
  margin-top: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.load-more:active {
  opacity: 0.8;
}

.load-more-text {
  color: var(--color-primary);
  font-size: 28rpx;
}

.no-more {
  text-align: center;
  padding: 40rpx;
  color: var(--text-tertiary);
  font-size: 28rpx;
}

.no-more-text {
  color: var(--text-tertiary);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: var(--text-tertiary);
}
</style>
