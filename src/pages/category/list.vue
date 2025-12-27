<template>
  <view class="container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <u-loading-icon mode="spinner" size="40" color="#007aff" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 分类列表 -->
    <view v-else class="category-list">
      <view
        v-for="category in categories"
        :key="category.name"
        class="category-item"
        @click="toCategory(category)"
      >
        <view class="category-info">
          <u-icon name="folder" size="40" color="#007aff" />
          <view class="category-content">
            <text class="category-name">{{ category.name }}</text>
            <text class="category-count">{{ category.count }} 篇文章</text>
          </view>
        </view>
        <u-icon name="arrow-right" size="20" color="#999" />
      </view>

      <!-- 空状态 -->
      <view v-if="!categories.length" class="empty">
        <u-icon name="inbox" size="80" color="#ccc" />
        <text class="empty-text">暂无分类</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { api } from '@/api';
import { getCategoryShareConfig } from '@/composables/useShare';

// 配置页面分享
onShareAppMessage(() => getCategoryShareConfig());
onShareTimeline(() => getCategoryShareConfig());

interface Category {
  name: string;
  slug: string;
  count: number;
  path?: string;
}

const loading = ref(true);
const categories = ref<Category[]>([]);

onMounted(async () => {
  try {
    const res = await api.getCategories();
    categories.value = res.data || [];
  } catch (err) {
    console.error('加载分类失败', err);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
});

const toCategory = (category: Category) => {
  // 跳转到分类文章列表页
  uni.navigateTo({
    url: `/pages/category/posts?name=${encodeURIComponent(category.name)}&slug=${encodeURIComponent(category.slug)}`
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
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

.category-list {
  padding: 20rpx;
}

.category-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.category-item:active {
  transform: scale(0.98);
  opacity: 0.8;
}

.category-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.category-content {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.category-count {
  font-size: 24rpx;
  color: #999;
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
