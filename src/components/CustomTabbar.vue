<template>
  <view class="custom-tabbar">
    <view
      v-for="(item, index) in tabbarList"
      :key="index"
      class="tabbar-item"
      @click="switchTab(index)"
    >
      <u-icon
        :name="item.icon"
        :size="currentIndex === index ? 24 : 22"
        :color="currentIndex === index ? selectedColor : color"
      />
      <text
        class="tabbar-text"
        :style="{
          color: currentIndex === index ? selectedColor : color,
          fontWeight: currentIndex === index ? 'bold' : 'normal'
        }"
      >
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const color = '#999999';
const selectedColor = '#007aff';

const tabbarList = [
  {
    pagePath: '/pages/index/index',
    text: '首页',
    icon: 'home'
  },
  {
    pagePath: '/pages/category/list',
    text: '分类',
    icon: 'grid'
  },
  {
    pagePath: '/pages/tag/list',
    text: '标签',
    icon: 'tags'
  },
  {
    pagePath: '/pages/archive/list',
    text: '归档',
    icon: 'calendar'
  },
  {
    pagePath: '/pages/about/index',
    text: '关于',
    icon: 'info-circle'
  }
];

const currentIndex = ref(0);

onShow(() => {
  updateCurrentIndex();
});

onMounted(() => {
  updateCurrentIndex();
});

const updateCurrentIndex = () => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    const route = '/' + currentPage.route;

    const index = tabbarList.findIndex(item => item.pagePath === route);
    if (index !== -1) {
      currentIndex.value = index;
    }
  }
};

const switchTab = (index: number) => {
  if (index === currentIndex.value) return;

  const targetPage = tabbarList[index].pagePath;
  uni.switchTab({
    url: targetPage,
    success: () => {
      currentIndex.value = index;
    }
  });
};
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #ffffff;
  display: flex;
  border-top: 1rpx solid #e5e5e5;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 9999;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  padding: 8rpx 0;
}

.tabbar-text {
  font-size: 20rpx;
  line-height: 1.2;
}
</style>
