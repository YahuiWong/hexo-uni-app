<template>
  <u-popup
    v-model:show="visible"
    mode="bottom"
    :round="20"
    :closeable="true"
    :safe-area-inset-bottom="true"
  >
    <view class="share-panel">
      <view class="share-header">
        <text class="share-title">分享到</text>
      </view>

      <view class="share-content">
        <view class="share-options">
          <!-- 微信好友 -->
          <view
            v-if="showWeixin"
            class="share-item"
            @click="handleShareItem('weixin')"
          >
            <view class="share-icon weixin-icon">
              <u-icon name="chat" size="32" color="#fff" />
            </view>
            <text class="share-label">微信</text>
          </view>

          <!-- 朋友圈 -->
          <view
            v-if="showMoment"
            class="share-item"
            @click="handleShareItem('moment')"
          >
            <view class="share-icon moment-icon">
              <u-icon name="moments" size="32" color="#fff" />
            </view>
            <text class="share-label">朋友圈</text>
          </view>

          <!-- 复制链接 -->
          <view
            class="share-item"
            @click="handleShareItem('copy')"
          >
            <view class="share-icon copy-icon">
              <u-icon name="share-square" size="32" color="#fff" />
            </view>
            <text class="share-label">复制链接</text>
          </view>

          <!-- 生成海报 -->
          <view
            v-if="showPoster"
            class="share-item"
            @click="handleShareItem('poster')"
          >
            <view class="share-icon poster-icon">
              <u-icon name="photo" size="32" color="#fff" />
            </view>
            <text class="share-label">生成海报</text>
          </view>
        </view>
      </view>

      <view class="share-footer">
        <view class="cancel-btn" @click="close">
          <text class="cancel-text">取消</text>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { copyLink, ShareUtil } from '@/utils/share';
import type { ShareOptions, SharePlatform } from '@/types';

interface Props {
  show: boolean;
  title: string;
  url?: string;
  imageUrl?: string;
  content?: string;
  showWeixin?: boolean;
  showMoment?: boolean;
  showPoster?: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'share', platform: SharePlatform): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  showWeixin: true,
  showMoment: true,
  showPoster: false
});

const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value)
});

const close = () => {
  visible.value = false;
};

const handleShareItem = async (platform: SharePlatform) => {
  const shareOptions: ShareOptions = {
    title: props.title,
    url: props.url,
    imageUrl: props.imageUrl,
    content: props.content
  };

  try {
    let result;

    switch (platform) {
      case 'weixin':
        result = ShareUtil.shareToWeixin(shareOptions);
        if (result.message) {
          uni.showToast({ title: result.message, icon: 'none' });
        }
        break;

      case 'moment':
        result = ShareUtil.shareToMoment(shareOptions);
        if (result.message) {
          uni.showToast({ title: result.message, icon: 'none' });
        }
        break;

      case 'copy':
        if (props.url) {
          await copyLink(props.url);
        } else {
          uni.showToast({ title: '暂无分享链接', icon: 'none' });
        }
        break;

      case 'poster':
        await ShareUtil.generatePoster(shareOptions);
        break;

      default:
        break;
    }

    emit('share', platform);
    close();
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
.share-panel {
  background: #fff;
  padding: 40rpx 0;
}

.share-header {
  padding: 0 30rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.share-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.share-content {
  padding: 40rpx 30rpx;
}

.share-options {
  display: flex;
  justify-content: flex-start;
  gap: 40rpx;
  flex-wrap: wrap;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  width: 120rpx;
  cursor: pointer;
}

.share-item:active {
  opacity: 0.7;
}

.share-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.weixin-icon {
  background: linear-gradient(135deg, #09bb07 0%, #0ac90b 100%);
}

.moment-icon {
  background: linear-gradient(135deg, #00c250 0%, #00da5f 100%);
}

.copy-icon {
  background: linear-gradient(135deg, #007aff 0%, #0088ff 100%);
}

.poster-icon {
  background: linear-gradient(135deg, #ff9500 0%, #ffb800 100%);
}

.share-label {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.share-footer {
  padding: 0 30rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 30rpx;
}

.cancel-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  cursor: pointer;
}

.cancel-btn:active {
  opacity: 0.8;
}

.cancel-text {
  font-size: 32rpx;
  color: #666;
}
</style>
