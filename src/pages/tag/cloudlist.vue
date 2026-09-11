<template>
  <view class="container">
    <!-- 返回按钮 -->
    <view class="back-btn" @click="goBack">
      <u-icon name="arrow-left" size="20" color="#fff" />
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <u-loading-icon mode="spinner" size="50" color="#fff" />
    </view>

    <!-- 3D标签云 -->
    <view
      v-else
      class="tag-cloud"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <view
        v-for="tag in tagItems"
        :key="tag.name"
        class="tag-item"
        :style="tag.style"
        @click="toTag(tag)"
      >
        <text class="tag-name">{{ tag.name }}</text>
        <text class="tag-count">{{ tag.count }}</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!loading && !tags.length" class="empty">
      <u-icon name="inbox" size="100" color="rgba(255, 255, 255, 0.3)" />
      <text class="empty-text">暂无标签</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { api } from '@/api';

interface Tag {
  name: string;
  slug: string;
  count: number;
  path?: string;
}

interface TagItem extends Tag {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  style: any;
}

const loading = ref(true);
const tags = ref<Tag[]>([]);
const tagItems = ref<TagItem[]>([]);

// 3D标签云参数
const radius = 180; // 球体半径
const angleX = ref(0); // X轴旋转角度
const angleY = ref(0); // Y轴旋转角度
const autoRotate = ref(true); // 是否自动旋转
let animationFrame: number | null = null;

// 触摸交互参数
const touchStart = ref({ x: 0, y: 0 });
const lastAngle = ref({ x: 0, y: 0 });

// 颜色方案（更加鲜艳的渐变色）
const colors = [
  '#007aff',
  '#5ac8fa',
  '#34c759',
  '#ff9500',
  '#ff3b30',
  '#af52de',
  '#ff2d55',
  '#5856d6',
  '#00c7be',
  '#ffd60a',
  '#ff375f',
  '#bf5af2'
];

// 缓存统计值，避免重复计算
let cachedMaxCount = 1;
let cachedMinCount = 1;

onMounted(async () => {
  try {
    const res = await api.getTags();
    tags.value = res.data.filter((tag: Tag) => tag.count > 0) || [];

    if (tags.value.length > 0) {
      // 初始化时预先计算统计值
      const counts = tags.value.map((t) => t.count);
      cachedMaxCount = Math.max(...counts, 1);
      cachedMinCount = Math.min(...counts, 1);
      initTagCloud();
      startAutoRotate();
    } else {
      console.warn('标签列表为空');
    }
  } catch (err: any) {
    console.error('加载标签失败', err);

    // 提供更详细的错误信息
    const errorMsg = err?.errMsg || err?.message || '加载失败，请检查网络';
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  stopAutoRotate();
});

// 初始化3D标签云
const initTagCloud = () => {
  const tagCount = tags.value.length;
  const items: TagItem[] = [];

  tags.value.forEach((tag, index) => {
    // 使用 Fibonacci 球面分布算法，让标签均匀分布在球面上
    const phi = Math.acos(-1 + (2 * index) / tagCount);
    const theta = Math.sqrt(tagCount * Math.PI) * phi;

    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    items.push({
      ...tag,
      x,
      y,
      z,
      scale: 1,
      opacity: 1,
      style: {}
    });
  });

  tagItems.value = items;
  updateTagPositions();
};

// 更新标签位置和样式
const updateTagPositions = () => {
  const radX = (angleX.value * Math.PI) / 180;
  const radY = (angleY.value * Math.PI) / 180;

  tagItems.value = tagItems.value.map((tag) => {
    // 旋转变换
    const x = tag.x;
    const y = tag.y;
    const z = tag.z;

    // 绕Y轴旋转
    const x1 = x * Math.cos(radY) - z * Math.sin(radY);
    const z1 = x * Math.sin(radY) + z * Math.cos(radY);

    // 绕X轴旋转
    const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    // 计算缩放和透明度（近大远小）
    const scale = (radius + z2) / (2 * radius);
    const opacity = 0.4 + scale * 0.6;

    // 计算标签大小（基于文章数量），使用缓存的统计值
    const ratio = (tag.count - cachedMinCount) / (cachedMaxCount - cachedMinCount || 1);
    const fontSize = 14 + ratio * 10; // 14-24px

    // 选择颜色
    const color = colors[tag.slug.length % colors.length];

    const style = {
      transform: `translate(-50%, -50%) translate3d(${x1}px, ${y2}px, ${z2}px) scale(${scale})`,
      opacity: opacity,
      zIndex: Math.floor(z2),
      fontSize: `${fontSize}px`,
      backgroundColor: color,
      boxShadow: `0 ${4 * scale}px ${12 * scale}px rgba(0, 0, 0, ${0.3 * opacity})`
    };

    return {
      ...tag,
      x: tag.x,
      y: tag.y,
      z: tag.z,
      scale,
      opacity,
      style
    };
  });
};

// 自动旋转
const startAutoRotate = () => {
  const rotate = () => {
    if (autoRotate.value) {
      angleY.value += 0.2;
      updateTagPositions();
    }

    // 小程序兼容性处理
    if (typeof requestAnimationFrame !== 'undefined') {
      animationFrame = requestAnimationFrame(rotate);
    } else {
      // 降级到 setTimeout（小程序可能不支持 requestAnimationFrame）
      animationFrame = setTimeout(rotate, 16) as any;
    }
  };
  rotate();
};

const stopAutoRotate = () => {
  if (animationFrame) {
    // 小程序兼容性处理
    if (typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(animationFrame);
    } else {
      clearTimeout(animationFrame);
    }
    animationFrame = null;
  }
};

// 触摸事件处理
interface TouchEventExtra {
  touches: Array<{
    clientX: number;
    clientY: number;
    pageX?: number;
    pageY?: number;
  }>;
}

const onTouchStart = (e: TouchEventExtra) => {
  autoRotate.value = false;
  const touch = e.touches[0];
  touchStart.value = {
    x: touch.clientX || touch.pageX || 0,
    y: touch.clientY || touch.pageY || 0
  };
  lastAngle.value = { x: angleX.value, y: angleY.value };
};

const onTouchMove = (e: TouchEventExtra) => {
  if (!touchStart.value) return;

  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStart.value.x;
  const deltaY = touch.clientY - touchStart.value.y;

  angleY.value = lastAngle.value.y + deltaX * 0.5;
  angleX.value = lastAngle.value.x + deltaY * 0.5;

  // 限制X轴旋转角度
  angleX.value = Math.max(-90, Math.min(90, angleX.value));

  updateTagPositions();
};

const onTouchEnd = () => {
  // 延迟恢复自动旋转
  setTimeout(() => {
    autoRotate.value = true;
  }, 3000);
};

const toTag = (tag: Tag) => {
  uni.navigateTo({
    url: `/pages/tag/posts?name=${encodeURIComponent(tag.name)}&slug=${encodeURIComponent(tag.slug)}`
  });
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.3);
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tag-cloud {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 100vh;
  margin-left: -50vw;
  margin-top: -50vh;
  perspective: 1200px;
  transform-style: preserve-3d;
}

.tag-item {
  position: absolute;
  left: 50%;
  top: 50%;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  border-radius: 50rpx;
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  transform-style: preserve-3d;
  transition: all 0.15s ease-out;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.tag-item:active {
  transform: scale(0.9) !important;
  opacity: 1 !important;
}

.tag-name {
  color: #fff;
  line-height: 1;
  font-size: inherit;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tag-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 6rpx 14rpx;
  border-radius: 30rpx;
  font-size: 0.8em;
  color: #fff;
  line-height: 1;
  font-weight: 700;
  backdrop-filter: blur(4px);
}

.empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}
</style>
