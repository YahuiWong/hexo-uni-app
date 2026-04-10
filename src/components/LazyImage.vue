<template>
  <view class="lazy-image-container" :style="containerStyle">
    <!-- 占位加载动画 -->
    <view v-if="isLoading" class="lazy-image-loading">
      <u-loading-icon mode="circle" size="30" color="#ccc" />
    </view>

    <!-- 图片 -->
    <image
      v-show="!isLoading"
      ref="imageRef"
      :src="currentSrc"
      :mode="mode as any"
      :lazy-load="!disableLazy"
      :class="['lazy-image', { 'lazy-image-loaded': !isLoading }]"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- 错误状态 -->
    <view v-if="isError && showError" class="lazy-image-error">
      <u-icon name="image" size="40" color="#ccc" />
      <text class="error-text">加载失败</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  src: string;                    // 图片地址
  mode?: string;                  // 图片裁剪模式
  width?: string | number;        // 宽度
  height?: string | number;       // 高度
  radius?: string | number;       // 圆角
  placeholder?: string;           // 占位图
  errorImage?: string;            // 错误图片
  disableLazy?: boolean;          // 禁用懒加载
  showError?: boolean;            // 显示错误提示
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';  // 适应方式
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'aspectFill',
  width: '100%',
  height: 'auto',
  radius: 0,
  disableLazy: false,
  showError: true,
  fit: 'cover'
});

const imageRef = ref();
const isLoading = ref(true);
const isError = ref(false);
const currentSrc = ref(props.placeholder || props.src);

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}rpx` : props.width,
  height: typeof props.height === 'number' ? `${props.height}rpx` : props.height,
  borderRadius: typeof props.radius === 'number' ? `${props.radius}rpx` : props.radius
}));

const imageStyle = computed(() => ({
  objectFit: props.fit
}));

const handleLoad = () => {
  isLoading.value = false;
  isError.value = false;
  currentSrc.value = props.src;
};

const handleError = () => {
  isLoading.value = false;
  isError.value = true;
  if (props.errorImage) {
    currentSrc.value = props.errorImage;
  }
};
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background: var(--bg-tertiary, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image-loaded {
  opacity: 1;
}

.lazy-image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: var(--bg-tertiary, #f5f5f5);
}

.error-text {
  font-size: 24rpx;
  color: var(--text-tertiary, #ccc);
}
</style>
