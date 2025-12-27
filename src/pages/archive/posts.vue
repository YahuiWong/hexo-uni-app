<template>
  <view class="container">
    <!-- 归档头部 -->
    <view class="archive-header">
      <view class="header-content">
        <u-icon name="calendar" size="32" color="#fff" />
        <view class="header-info">
          <text class="archive-title">{{ archiveTitle }}</text>
          <text class="archive-subtitle">{{ total }} 篇文章</text>
        </view>
      </view>
    </view>

    <!-- 文章列表 -->
    <view class="post-list">
      <!-- 加载中 -->
      <view v-if="loading && posts.length === 0" class="loading">
        <u-loading-icon mode="spinner" size="40" color="#007aff" />
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 文章项 -->
      <PostItem
        v-for="post in posts"
        :key="post.slug"
        :post="post"
      />

      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" @click="loadMore" class="load-more">
        <text class="load-more-text">加载更多</text>
      </view>

      <!-- 加载中（翻页） -->
      <view v-if="loading && posts.length > 0" class="loading-more">
        <u-loading-icon mode="spinner" size="20" color="#007aff" />
        <text class="loading-more-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view v-else-if="!hasMore && posts.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && posts.length === 0" class="empty">
        <u-icon name="inbox" size="80" color="#ccc" />
        <text class="empty-text">该时间段暂无文章</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { api } from '@/api';
import PostItem from '@/components/PostItem.vue';

const year = ref(0);
const month = ref(0);
const posts = ref<any[]>([]);
const currentPage = ref(1);
const total = ref(0);
const hasMore = ref(true);
const loading = ref(false);

const archiveTitle = computed(() => {
  if (!year.value) return '归档';

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  if (month.value) {
    return `${year.value} 年 ${monthNames[month.value - 1]}`;
  }

  return `${year.value} 年`;
});

onLoad((options: any) => {
  year.value = parseInt(options.year) || 0;
  month.value = parseInt(options.month) || 0;

  if (!year.value) {
    uni.showToast({ title: '参数错误', icon: 'none' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
    return;
  }

  loadPosts();
});

onReachBottom(() => {
  if (!loading.value && hasMore.value) {
    loadMore();
  }
});

const loadPosts = async () => {
  if (loading.value || !hasMore.value) return;
  loading.value = true;

  try {
    let res;

    // 根据是否有月份参数调用不同的 API
    if (month.value) {
      res = await api.getMonthArchive(year.value, month.value, currentPage.value);
    } else {
      res = await api.getYearArchive(year.value, currentPage.value);
    }

    // API 返回格式：{ data: { posts: [...], total: 2, index: 1, info: {...} } }
    const newPosts = res.data?.posts || [];

    if (newPosts.length === 0) {
      hasMore.value = false;
    } else {
      posts.value = [...posts.value, ...newPosts];
      currentPage.value++;

      const totalPages = res.data?.total || 0;
      if (currentPage.value > totalPages) {
        hasMore.value = false;
      }
    }

    total.value = posts.value.length;
  } catch (err: any) {
    console.error('加载归档文章失败', err);
    uni.showToast({ title: '加载失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  loadPosts();
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.archive-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.archive-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.archive-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.post-list {
  padding: 30rpx;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  gap: 30rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-top: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.load-more:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.load-more-text {
  color: #007aff;
  font-size: 28rpx;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 40rpx;
}

.loading-more-text {
  font-size: 28rpx;
  color: #999;
}

.no-more {
  text-align: center;
  padding: 40rpx;
}

.no-more-text {
  font-size: 28rpx;
  color: #999;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  gap: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
