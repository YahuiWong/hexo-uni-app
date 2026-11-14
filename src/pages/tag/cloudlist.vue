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
      <tag-cloud-rotator ref="rotatorRef">
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
      </tag-cloud-rotator>
    </view>

    <!-- 空状态 -->
    <view v-if="!loading && !tags.length" class="empty">
      <u-icon name="inbox" size="100" color="rgba(255, 255, 255, 0.3)" />
      <text class="empty-text">暂无标签</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, onUnmounted } from 'vue';
import { api } from '@/api';
import TagCloudRotator from './TagCloudRotator.vue';

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
  style: Record<string, string>;
}

const loading = ref(true);
const tags = ref<Tag[]>([]);
const tagItems = ref<TagItem[]>([]);

// 球面坐标在初始化时写好。旋转只改 DOM，不触发整页重绘。
let radius = 150;
let fontFloor = 13;
let fontSpan = 8;
let angleX = 0;
let angleY = 0;
let autoRotate = true;
let dirty = true;
let alive = true;
let animationFrame: number | null = null;
let resumeTimer: ReturnType<typeof setTimeout> | null = null;
const rotatorRef = ref<{ setAngles: (x: number, y: number) => void } | null>(null);

const touchStart = { x: 0, y: 0 };
const lastAngle = { x: 0, y: 0 };

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
      const counts = tags.value.map((t) => t.count);
      cachedMaxCount = Math.max(...counts, 1);
      cachedMinCount = Math.min(...counts, 1);
      initTagCloud();
    } else {
      console.warn('标签列表为空');
    }
  } catch (err: any) {
    console.error('加载标签失败', err);

    const errorMsg = err?.errMsg || err?.message || '加载失败，请检查网络';
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
  await nextTick();
  if (!alive) return;
  dirty = true;
  startAutoRotate();
});

onUnmounted(() => {
  alive = false;
  stopAutoRotate();
});

const readLayout = () => {
  const info = uni.getSystemInfoSync();
  const shortSide = Math.min(info.windowWidth, info.windowHeight);
  const compact = shortSide < 520;
  radius = Math.round(Math.min(160, shortSide * (compact ? 0.3 : 0.2)));
  fontFloor = compact ? 10 : 13;
  fontSpan = compact ? 4 : 8;
};

const initTagCloud = () => {
  readLayout();
  const tagCount = tags.value.length;
  const items: TagItem[] = [];

  tags.value.forEach((tag, index) => {
    const phi = Math.acos(-1 + (2 * index) / tagCount);
    const theta = Math.sqrt(tagCount * Math.PI) * phi;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);
    const ratio = (tag.count - cachedMinCount) / (cachedMaxCount - cachedMinCount || 1);
    const fontSize = fontFloor + ratio * fontSpan;
    const color = colors[tag.slug.length % colors.length];

    items.push({
      ...tag,
      x,
      y,
      z,
      style: {
        '--x': `${x}px`,
        '--y': `${y}px`,
        '--z': `${z}px`,
        fontSize: `${fontSize}px`,
        backgroundColor: color
      }
    });
  });

  tagItems.value = items;
};

const applyFrame = () => {
  // #ifdef H5
  const el = document.querySelector('.tag-cloud-rotator') as HTMLElement | null;
  if (!el) return;
  el.style.setProperty('--ax', `${angleX}deg`);
  el.style.setProperty('--ay', `${angleY}deg`);
  // #endif
  // #ifndef H5
  rotatorRef.value?.setAngles(angleX, angleY);
  // #endif
};

// 自动旋转
const startAutoRotate = () => {
  const rotate = () => {
    if (!alive) return;
    if (autoRotate) {
      angleY += 0.25;
      if (angleY >= 360) angleY -= 360;
      dirty = true;
    }
    if (dirty) {
      try {
        applyFrame();
      } catch (err) {
        console.error('标签云刷新失败', err);
      }
      dirty = false;
    }
    if (typeof requestAnimationFrame !== 'undefined') {
      animationFrame = requestAnimationFrame(rotate);
    } else {
      animationFrame = setTimeout(rotate, 16) as unknown as number;
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
  autoRotate = false;
  if (resumeTimer) {
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }
  const touch = e.touches[0];
  touchStart.x = touch.clientX || touch.pageX || 0;
  touchStart.y = touch.clientY || touch.pageY || 0;
  lastAngle.x = angleX;
  lastAngle.y = angleY;
};

const onTouchMove = (e: TouchEventExtra) => {
  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStart.x;
  const deltaY = touch.clientY - touchStart.y;
  angleY = lastAngle.y + deltaX * 0.5;
  angleX = Math.max(-90, Math.min(90, lastAngle.x + deltaY * 0.5));
  dirty = true;
};

const onTouchEnd = () => {
  resumeTimer = setTimeout(() => {
    autoRotate = true;
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
  perspective: 800px;
  touch-action: none;
}

.tag-item {
  position: absolute;
  left: 50%;
  top: 50%;
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.22em 0.55em;
  border-radius: 999px;
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  transform: translate3d(var(--x), var(--y), var(--z)) rotateY(calc(var(--ay) * -1)) rotateX(calc(var(--ax) * -1))
    translate(-50%, -50%);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.tag-item:active {
  opacity: 0.75;
}

.tag-name {
  color: #fff;
  line-height: 1;
  font-size: inherit;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tag-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.08em 0.35em;
  border-radius: 999px;
  font-size: 0.8em;
  color: #fff;
  line-height: 1;
  font-weight: 700;
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
