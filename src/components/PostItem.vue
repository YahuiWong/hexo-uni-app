<template>
  <view class="post-item" @click="toDetail(post)">
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
const props = defineProps<{
  post: {
    title: string;
    excerpt: string;
    date: string;
    cover?: string;
    url?: string;
    slug?: string;
    api?: string;
    tags?: string[];
    categories?: string[];
  };
}>();

const toDetail = (post: any) => {
  let targetUrl = post.url;

  // 如果没有 url 字段，尝试根据其他信息构建
  if (!targetUrl) {
    if (post.api) {
      // 从 api 字段提取路径：api/posts/2025/04/09/note-docker-compose.json -> 2025/04/09/note-docker-compose
      targetUrl = post.api.replace(/^api\/posts\//, '').replace(/\.json$/, '');
    } else if (post.date && post.slug) {
      // 根据日期和 slug 构建标准路径
      const date = new Date(post.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      targetUrl = `${year}/${month}/${day}/${post.slug}`;
    } else if (post.slug) {
      // 只有 slug，直接使用
      targetUrl = post.slug;
    }
  }

  if (!targetUrl) {
    console.error('无法获取文章 URL', post);
    uni.showToast({ title: '无法打开文章', icon: 'none' });
    return;
  }

  // 跳转到详情页
  uni.navigateTo({
    url: `/pages/post/detail?url=${encodeURIComponent(targetUrl)}`
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
