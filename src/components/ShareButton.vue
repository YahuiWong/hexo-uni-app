<template>
  <view class="share-button" @click="handleShare">
    <u-icon :name="icon" :size="iconSize" :color="iconColor" />
    <text v-if="showText" class="share-text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { share } from '@/utils/share';
import type { ShareOptions } from '@/types';

interface Props {
  title: string;           // 分享标题
  url?: string;           // 分享链接
  imageUrl?: string;      // 分享图片
  content?: string;       // 分享描述
  icon?: string;          // 图标名称
  iconSize?: string | number;  // 图标大小
  iconColor?: string;     // 图标颜色
  text?: string;          // 按钮文字
  showText?: boolean;     // 是否显示文字
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'share',
  iconSize: 20,
  iconColor: '#007aff',
  text: '分享',
  showText: true
});

const handleShare = async () => {
  const shareOptions: ShareOptions = {
    title: props.title,
    url: props.url,
    imageUrl: props.imageUrl,
    content: props.content
  };

  try {
    const result = await share(shareOptions);
    if (result.success && result.message) {
      // 某些情况下可能需要显示提示
      // uni.showToast({ title: result.message, icon: 'none' });
    }
  } catch (error) {
    console.error('分享失败:', error);
    uni.showToast({
      title: '分享失败',
      icon: 'none'
    });
  }
};
</script>

<style scoped>
.share-button {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #f0f0f0;
  border-radius: 50rpx;
  cursor: pointer;
  transition: all 0.3s;
}

.share-button:active {
  opacity: 0.7;
  transform: scale(0.95);
}

.share-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1;
}
</style>
