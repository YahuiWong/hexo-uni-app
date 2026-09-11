<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <u-icon name="search" size="18" color="#999" />
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索文章"
          confirm-type="search"
          @confirm="handleSearch"
          @input="onInput"
          focus
        />
        <u-icon
          v-if="keyword"
          name="close-circle-fill"
          size="18"
          color="#ccc"
          @click="clearKeyword"
        />
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 搜索历史 -->
    <view v-if="!keyword && searchHistory.length > 0" class="history-section">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text class="clear-history" @click="clearHistory">清空</text>
      </view>
      <view class="history-list">
        <view
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          @click="searchFromHistory(item)"
        >
          <u-icon name="clock" size="14" color="#999" />
          <text class="history-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索建议 -->
    <view v-if="keyword && !searching && results.length === 0 && !searched" class="suggestion">
      <u-icon name="bulb" size="20" color="#ff9500" />
      <text class="suggestion-text">输入关键词，按回车搜索</text>
    </view>

    <!-- 搜索中 -->
    <view v-if="searching" class="loading">
      <u-loading-icon mode="spinner" size="40" color="#007aff" />
      <text class="loading-text">搜索中...</text>
    </view>

    <!-- 搜索结果 -->
    <view v-else-if="searched && results.length > 0" class="results">
      <view class="result-count">
        <text class="count-text">找到 {{ results.length }} 篇相关文章</text>
      </view>
      <PostItem v-for="post in results" :key="post.slug" :post="post" />
    </view>

    <!-- 无结果 -->
    <view v-else-if="searched && results.length === 0" class="empty">
      <u-icon name="inbox" size="80" color="#ccc" />
      <text class="empty-text">未找到相关文章</text>
      <text class="empty-tip">换个关键词试试</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { api } from '@/api';
import PostItem from '@/components/PostItem.vue';
import { getSearchShareConfig } from '@/composables/useShare';
import type { PostItem as PostItemType } from '@/types';

// 配置页面分享
onShareAppMessage(() => getSearchShareConfig());
onShareTimeline(() => getSearchShareConfig());

interface SearchablePost extends PostItemType {
  excerptText?: string;
}

const keyword = ref('');
const searching = ref(false);
const searched = ref(false);
const results = ref<SearchablePost[]>([]);
const searchHistory = ref<string[]>([]);

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;
const MAX_SEARCH_PAGES = 3; // 限制搜索加载的页数

onLoad((options: any) => {
  // 加载搜索历史
  loadHistory();

  // 如果有传入的关键词，直接搜索
  if (options.keyword) {
    keyword.value = decodeURIComponent(options.keyword);
    handleSearch();
  }
});

const loadHistory = () => {
  try {
    const history = uni.getStorageSync(HISTORY_KEY);
    if (history) {
      searchHistory.value = JSON.parse(history);
    }
  } catch (err) {
    console.error('加载搜索历史失败', err);
  }
};

const saveHistory = (kw: string) => {
  if (!kw.trim()) return;

  // 移除重复项
  const history = searchHistory.value.filter((item) => item !== kw);

  // 添加到最前面
  history.unshift(kw);

  // 限制数量
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }

  searchHistory.value = history;

  // 保存到本地存储
  try {
    uni.setStorageSync(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('保存搜索历史失败', err);
  }
};

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = [];
        try {
          uni.removeStorageSync(HISTORY_KEY);
          uni.showToast({ title: '已清空', icon: 'success' });
        } catch (err) {
          console.error('清空搜索历史失败', err);
        }
      }
    }
  });
};

const handleSearch = async () => {
  const kw = keyword.value.trim();
  if (!kw) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' });
    return;
  }

  searching.value = true;
  searched.value = false;

  try {
    // 这里使用本地搜索（遍历所有文章）
    // 因为 API 可能不支持搜索功能
    const res = await searchPosts(kw);
    results.value = res;
    searched.value = true;

    // 保存搜索历史
    saveHistory(kw);
  } catch (err) {
    console.error('搜索失败', err);
    uni.showToast({ title: '搜索失败，请重试', icon: 'none' });
  } finally {
    searching.value = false;
  }
};

// 本地搜索实现（因为 API 可能不支持）
const searchPosts = async (kw: string) => {
  const allPosts: any[] = [];

  // 获取所有页的文章
  try {
    // 先获取第一页，了解总页数
    const firstPage = await api.getPosts(1);
    if (firstPage.data?.posts) {
      allPosts.push(...firstPage.data.posts);
    }

    // 限制搜索加载的页数，避免消耗过多内存
    const maxPages = Math.min(MAX_SEARCH_PAGES, firstPage.data?.total || 1);
    const promises = [];
    for (let i = 2; i <= maxPages; i++) {
      promises.push(api.getPosts(i));
    }

    const results = await Promise.all(promises);
    results.forEach((res) => {
      if (res.data?.posts) {
        allPosts.push(...res.data.posts);
      }
    });
  } catch (err) {
    console.error('加载文章失败', err);
  }

  // 在标题、摘要中搜索关键词
  const lowerKw = kw.toLowerCase();
  return allPosts.filter((post) => {
    const title = (post.title || '').toLowerCase();
    const excerpt = (post.excerpt || '').toLowerCase();
    return title.includes(lowerKw) || excerpt.includes(lowerKw);
  });
};

const searchFromHistory = (kw: string) => {
  keyword.value = kw;
  handleSearch();
};

const clearKeyword = () => {
  keyword.value = '';
  results.value = [];
  searched.value = false;
};

const onInput = () => {
  // 如果清空了关键词，重置状态
  if (!keyword.value) {
    results.value = [];
    searched.value = false;
  }
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.cancel-btn {
  font-size: 28rpx;
  color: #007aff;
}

.history-section {
  padding: 30rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.history-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.clear-history {
  font-size: 24rpx;
  color: #999;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #fff;
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.history-text {
  font-size: 26rpx;
  color: #666;
}

.suggestion {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  gap: 20rpx;
}

.suggestion-text {
  font-size: 28rpx;
  color: #999;
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

.results {
  padding: 30rpx;
}

.result-count {
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.count-text {
  font-size: 26rpx;
  color: #666;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  gap: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-top: 30rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #ccc;
}
</style>
