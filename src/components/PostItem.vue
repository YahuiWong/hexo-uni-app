<template>
  <view class="post-item" @click="toDetail(post.url)">
    <image
      v-if="post.cover"
      :src="post.cover"
      mode="aspectFill"
      class="cover"
      :lazy-load="true"
    />
    <view class="info">
      <text class="title">{{ post.title }}</text>
      <text class="excerpt">{{ post.excerpt }}</text>

      <!-- 标签 -->
      <view v-if="post.tags && post.tags.length" class="tags">
        <view v-for="(tag, idx) in post.tags.slice(0, 3)" :key="idx" class="tag">
          <u-icon name="tag" size="12" color="#999" />
          <text class="tag-text">{{ tag }}</text>
        </view>
      </view>

      <!-- 底部信息 -->
      <view class="meta">
        <view class="date-info">
          <u-icon name="clock" size="14" color="#999" />
          <text class="date">{{ formatDate(post.date) }}</text>
        </view>
        <view v-if="post.categories && post.categories.length" class="category-info">
          <u-icon name="folder" size="14" color="#007aff" />
          <text class="category">{{ post.categories[0] }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  post: {
    title: string;
    excerpt: string;
    date: string;
    cover?: string;
    url: string;
    tags?: string[];
    categories?: string[];
  };
}>();

const toDetail = (url: string) => {
  uni.navigateTo({
    url: `/pages/post/detail?url=${encodeURIComponent(url)}`
  });
};

const formatDate = (dateStr: string) => {
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
    day: 'numeric'
  });
};
</script>

<style scoped>
.post-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.post-item:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.cover {
  width: 100%;
  height: 350rpx;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  display: block;
}

.info {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.excerpt {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tags {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 6rpx 12rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.tag-text {
  font-size: 22rpx;
  color: #666;
  line-height: 1;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12rpx;
  border-top: 1rpx solid #f0f0f0;
}

.date-info,
.category-info {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.date {
  font-size: 24rpx;
  color: #999;
  line-height: 1;
}

.category {
  font-size: 24rpx;
  color: #007aff;
  line-height: 1;
}
</style>
