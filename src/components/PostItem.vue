<template>
  <view class="post-item" @click="toDetail(post.url)">
    <image v-if="post.cover" :src="post.cover" mode="aspectFill" class="cover" />
    <view class="info">
      <text class="title">{{ post.title }}</text>
      <text class="excerpt">{{ post.excerpt }}</text>
      <text class="date">{{ post.date }}</text>
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
  };
}>();

const toDetail = (url: string) => {
  uni.navigateTo({
    url: `/pages/post/detail?url=${encodeURIComponent(url)}`
  });
};
</script>

<style scoped>
.post-item {
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  display: flex;
}
.cover {
  width: 200rpx;
  height: 200rpx;
  margin-right: 30rpx;
  border-radius: 16rpx;
  background-color: #f5f5f5;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}
.excerpt {
  font-size: 28rpx;
  color: #666;
  margin: 16rpx 0;
  line-height: 1.5;
}
.date {
  font-size: 24rpx;
  color: #999;
}
</style>