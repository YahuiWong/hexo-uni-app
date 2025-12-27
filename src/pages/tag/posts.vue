<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <u-icon name="tag" size="40" :color="tagColor" />
        <view class="header-text">
          <text class="tag-name">{{ tagName }}</text>
          <text class="post-count">共 {{ total }} 篇文章</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading && posts.length === 0" class="loading">
      <u-loading-icon mode="spinner" size="40" :color="tagColor" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 文章列表 -->
    <view v-else class="posts-list">
      <PostItem
        v-for="post in posts"
        :key="post.slug"
        :post="post"
      />

      <!-- 加载更多提示 -->
      <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
        <text class="load-more-text" :style="{ color: tagColor }">加载更多</text>
      </view>

      <!-- 加载中 -->
      <view v-if="loading && posts.length > 0" class="loading-more">
        <u-loading-icon mode="spinner" size="24" color="#999" />
        <text class="loading-more-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view v-if="!hasMore && posts.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && posts.length === 0" class="empty">
        <u-icon name="inbox" size="80" color="#ccc" />
        <text class="empty-text">该标签下暂无文章</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { api } from '@/api';
import PostItem from '@/components/PostItem.vue';

const tagName = ref('');
const tagSlug = ref('');
const posts = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const hasMore = ref(true);
const total = ref(0);

// 标签颜色（随机选择）
const colors = [
  '#007aff', '#5ac8fa', '#34c759', '#ff9500',
  '#ff3b30', '#af52de', '#ff2d55', '#5856d6'
];
const tagColor = computed(() => {
  const index = tagName.value.length % colors.length;
  return colors[index];
});

onLoad((options: any) => {
  if (options.name) {
    tagName.value = decodeURIComponent(options.name);
  }
  if (options.slug) {
    tagSlug.value = decodeURIComponent(options.slug);
  }

  console.log('标签文章列表页加载', { name: tagName.value, slug: tagSlug.value });

  loadPosts();
});

const loadPosts = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;

  try {
    const res = await api.getTagPosts(tagSlug.value, currentPage.value);
    const newPosts = res.data || [];

    if (newPosts.length === 0) {
      hasMore.value = false;
    } else {
      posts.value = [...posts.value, ...newPosts];
      currentPage.value++;

      // 如果返回的文章数量少于预期，说明没有更多了
      if (newPosts.length < 10) {
        hasMore.value = false;
      }
    }

    // 更新总数（如果 API 返回了 total 字段）
    if (res.total !== undefined) {
      total.value = res.total;
    } else {
      total.value = posts.value.length;
    }

    console.log(`加载第 ${currentPage.value - 1} 页，获取 ${newPosts.length} 篇文章`);
  } catch (err: any) {
    console.error('加载标签文章失败', err);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  loadPosts();
};

// 触底加载更多
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadPosts();
  }
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.tag-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.post-count {
  font-size: 24rpx;
  color: #999;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.loading-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
}

.posts-list {
  padding: 0 30rpx;
}

.load-more {
  text-align: center;
  padding: 40rpx 0;
  cursor: pointer;
}

.load-more-text {
  font-size: 28rpx;
  font-weight: 500;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 40rpx 0;
}

.loading-more-text {
  font-size: 28rpx;
  color: #999;
}

.no-more {
  text-align: center;
  padding: 40rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: #ccc;
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
  color: #999;
}
</style>
