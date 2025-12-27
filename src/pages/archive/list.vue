<template>
  <view class="container">
    <!-- 加载中 -->
    <view v-if="loading && archives.length === 0" class="loading">
      <u-loading-icon mode="spinner" size="40" color="#007aff" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 归档时间线 -->
    <view v-else-if="archives.length > 0" class="archive-timeline">
      <view class="timeline-header">
        <text class="header-title">文章归档</text>
        <text class="header-subtitle">共 {{ totalPosts }} 篇文章</text>
      </view>

      <view
        v-for="(yearItem, yearIndex) in archives"
        :key="yearItem.year"
        class="year-section"
      >
        <!-- 年份标题 -->
        <view class="year-header" @click="toggleYear(yearIndex)">
          <view class="year-left">
            <view class="year-dot"></view>
            <text class="year-text">{{ yearItem.year }}</text>
            <text class="post-count">{{ yearItem.totalPosts || 0 }} 篇</text>
          </view>
          <u-icon
            :name="yearItem.expanded ? 'arrow-down' : 'arrow-right'"
            size="16"
            color="#999"
          />
        </view>

        <!-- 月份和文章列表（可展开） -->
        <view v-if="yearItem.expanded" class="months-wrapper">
          <view
            v-for="monthItem in yearItem.data"
            :key="monthItem.month"
            class="month-section"
          >
            <!-- 月份标题 -->
            <view class="month-header" @click="toggleMonth(yearIndex, monthItem.month)">
              <view class="month-left">
                <view class="month-dot"></view>
                <text class="month-text">{{ getMonthName(monthItem.month) }}</text>
                <text class="month-post-count">{{ monthItem.posts?.length || 0 }} 篇</text>
              </view>
              <u-icon
                :name="monthItem.expanded ? 'arrow-down' : 'arrow-right'"
                size="14"
                color="#ccc"
              />
            </view>

            <!-- 文章列表 -->
            <view v-if="monthItem.expanded" class="posts-list">
              <!-- 加载中 -->
              <view v-if="monthItem.loading" class="month-loading">
                <u-loading-icon mode="spinner" size="16" color="#007aff" />
                <text class="month-loading-text">加载中...</text>
              </view>

              <!-- 文章项 -->
              <view
                v-else
                v-for="post in monthItem.posts"
                :key="post.slug"
                class="post-item"
                @click="toPost(post)"
              >
                <view class="post-dot"></view>
                <view class="post-content">
                  <text class="post-title">{{ post.title }}</text>
                  <text class="post-date">{{ formatDate(post.date) }}</text>
                </view>
              </view>

              <!-- 无文章 -->
              <view v-if="!monthItem.loading && (!monthItem.posts || monthItem.posts.length === 0)" class="no-posts">
                <text class="no-posts-text">该月暂无文章</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty">
      <u-icon name="inbox" size="80" color="#ccc" />
      <text class="empty-text">暂无归档</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from '@/api';

interface PostData {
  title: string;
  slug: string;
  date: string;
  url?: string;
}

interface MonthData {
  month: number;
  api: string;
  posts?: PostData[];
  expanded?: boolean;
  loading?: boolean;
}

interface YearData {
  year: number;
  api: string;
  data: MonthData[];
  expanded?: boolean;
  totalPosts?: number;
}

const archives = ref<YearData[]>([]);
const loading = ref(true);

const totalPosts = computed(() => {
  return archives.value.reduce((sum, year) => sum + (year.totalPosts || 0), 0);
});

onMounted(async () => {
  await loadArchives();
  loading.value = false;
});

const loadArchives = async () => {
  try {
    const res = await api.getArchives();
    if (res.data && Array.isArray(res.data)) {
      // 按年份倒序排序（最新年份在前）
      const sortedData = res.data.sort((a: YearData, b: YearData) => b.year - a.year);

      // 默认展开所有年份
      archives.value = sortedData.map((item: YearData) => ({
        ...item,
        expanded: true,
        totalPosts: 0,
        // 每个年份的月份也按倒序排序（12月在前，1月在后）
        data: item.data.sort((a: MonthData, b: MonthData) => b.month - a.month).map((month: MonthData) => ({
          ...month,
          expanded: true, // 默认展开所有月份
          posts: [],
          loading: false
        }))
      }));

      // 加载每个年份的文章数统计和每个月份的文章
      for (let yearIndex = 0; yearIndex < archives.value.length; yearIndex++) {
        const yearItem = archives.value[yearIndex];
        await loadYearPostsCount(yearItem);

        // 加载该年份所有月份的文章
        for (let monthIndex = 0; monthIndex < yearItem.data.length; monthIndex++) {
          await loadMonthPosts(yearIndex, monthIndex);
        }
      }
    }
  } catch (err) {
    console.error('加载归档失败', err);
    uni.showToast({ title: '加载失败，请重试', icon: 'none' });
  }
};

const loadYearPostsCount = async (yearItem: YearData) => {
  try {
    // 获取该年第一页数据以了解文章总数
    const res = await api.getYearArchive(yearItem.year, 1);
    const posts = res.data?.posts || [];
    yearItem.totalPosts = posts.length;
  } catch (err) {
    console.error(`加载${yearItem.year}年文章数失败`, err);
  }
};

const loadMonthPosts = async (yearIndex: number, monthIndex: number) => {
  const yearItem = archives.value[yearIndex];
  const monthItem = yearItem.data[monthIndex];

  if (monthItem.posts && monthItem.posts.length > 0) {
    return; // 已加载
  }

  monthItem.loading = true;

  try {
    const res = await api.getMonthArchive(yearItem.year, monthItem.month, 1);
    const posts = res.data?.posts || [];
    monthItem.posts = posts;
  } catch (err) {
    console.error(`加载${yearItem.year}年${monthItem.month}月文章失败`, err);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    monthItem.loading = false;
  }
};

const toggleYear = (index: number) => {
  archives.value[index].expanded = !archives.value[index].expanded;
};

const toggleMonth = async (yearIndex: number, month: number) => {
  const yearItem = archives.value[yearIndex];
  const monthIndex = yearItem.data.findIndex(m => m.month === month);

  if (monthIndex === -1) return;

  const monthItem = yearItem.data[monthIndex];
  monthItem.expanded = !monthItem.expanded;

  // 如果展开且未加载文章，则加载
  if (monthItem.expanded && (!monthItem.posts || monthItem.posts.length === 0)) {
    await loadMonthPosts(yearIndex, monthIndex);
  }
};

const toPost = (post: PostData) => {
  if (!post) {
    uni.showToast({ title: '文章数据错误', icon: 'none' });
    return;
  }

  let targetUrl = post.url;

  // 如果没有 url 字段，根据日期和 slug 构建
  if (!targetUrl && post.date && post.slug) {
    const date = new Date(post.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    targetUrl = `${year}/${month}/${day}/${post.slug}`;
  } else if (!targetUrl && post.slug) {
    targetUrl = post.slug;
  }

  if (!targetUrl) {
    console.error('无法获取文章 URL', post);
    uni.showToast({ title: '文章链接无效', icon: 'none' });
    return;
  }

  uni.navigateTo({
    url: `/pages/post/detail?url=${encodeURIComponent(targetUrl)}`
  });
};

const getMonthName = (month: number) => {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return months[month - 1] || `${month}月`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  gap: 30rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.archive-timeline {
  padding: 30rpx;
}

.timeline-header {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.header-subtitle {
  font-size: 26rpx;
  color: #999;
}

.year-section {
  position: relative;
  margin-bottom: 40rpx;
}

.year-section::before {
  content: '';
  position: absolute;
  left: 30rpx;
  top: 50rpx;
  bottom: 0;
  width: 2rpx;
  background: linear-gradient(to bottom, #007aff, transparent);
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.year-header:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.year-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.year-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
}

.year-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.post-count {
  font-size: 24rpx;
  color: #999;
  padding: 4rpx 12rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.months-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-left: 40rpx;
}

.month-section {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.month-header:active {
  transform: scale(0.98);
  background: #f8f8f8;
}

.month-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.month-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background: #5ac8fa;
}

.month-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
}

.month-post-count {
  font-size: 22rpx;
  color: #999;
  padding: 2rpx 8rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-left: 32rpx;
}

.month-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx;
}

.month-loading-text {
  font-size: 24rpx;
  color: #999;
}

.post-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
}

.post-item:active {
  transform: translateX(8rpx);
  background: #f8f8f8;
}

.post-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: #34c759;
  margin-top: 10rpx;
  flex-shrink: 0;
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.post-title {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.post-date {
  font-size: 22rpx;
  color: #999;
}

.no-posts {
  padding: 20rpx;
  text-align: center;
}

.no-posts-text {
  font-size: 24rpx;
  color: #ccc;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  gap: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
