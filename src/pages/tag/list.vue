<template>
  <view class="container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <u-loading-icon mode="spinner" size="40" color="#007aff" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 标签云 -->
    <view v-else class="tag-list">
      <view
        v-for="tag in tags"
        :key="tag.name"
        class="tag-item"
        :style="getTagStyle(tag.count)"
        @click="toTag(tag)"
      >
        <u-icon name="tags" :size="getIconSize(tag.count)" color="#fff" />
        <text class="tag-name">{{ tag.name }}</text>
        <text class="tag-count">{{ tag.count }}</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!tags.length" class="empty">
        <u-icon name="inbox" size="80" color="#ccc" />
        <text class="empty-text">暂无标签</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';

interface Tag {
  name: string;
  slug: string;
  count: number;
  path?: string;
}

const loading = ref(true);
const tags = ref<Tag[]>([]);

// 颜色方案
const colors = [
  '#007aff', '#5ac8fa', '#34c759', '#ff9500',
  '#ff3b30', '#af52de', '#ff2d55', '#5856d6'
];

onMounted(async () => {
  try {
    const res = await api.getTags();
    tags.value = res.data || [];
  } catch (err) {
    console.error('加载标签失败', err);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
});

// 根据文章数量生成标签样式
const getTagStyle = (count: number) => {
  const maxCount = Math.max(...tags.value.map(t => t.count), 1);
  const minCount = Math.min(...tags.value.map(t => t.count), 1);

  // 计算标签大小（基于文章数量）
  const sizeRange = 20; // rpx
  const baseSize = 24; // rpx
  const ratio = (count - minCount) / (maxCount - minCount || 1);
  const fontSize = baseSize + ratio * sizeRange;

  // 随机选择颜色
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    fontSize: `${fontSize}rpx`,
    backgroundColor: color,
    padding: `${12 + ratio * 8}rpx ${20 + ratio * 10}rpx`
  };
};

// 根据文章数量调整图标大小
const getIconSize = (count: number) => {
  const maxCount = Math.max(...tags.value.map(t => t.count), 1);
  const minCount = Math.min(...tags.value.map(t => t.count), 1);
  const ratio = (count - minCount) / (maxCount - minCount || 1);
  return 14 + ratio * 6; // 14-20
};

const toTag = (tag: Tag) => {
  // 跳转到标签文章列表页
  uni.navigateTo({
    url: `/pages/tag/posts?name=${encodeURIComponent(tag.name)}&slug=${encodeURIComponent(tag.slug)}`
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
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

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 20rpx 0;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  border-radius: 50rpx;
  color: #fff;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.tag-item:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.tag-name {
  color: #fff;
  line-height: 1;
}

.tag-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  color: #fff;
  line-height: 1;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  width: 100%;
}

.empty-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
