<template>
  <view>
    <!-- 轮播图 -->
    <swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
      <swiper-item v-for="(item, index) in swiperList" :key="index">
        <image :src="item.cover" mode="aspectFill" @click="toPost(item.url)" />
      </swiper-item>
    </swiper>

    <!-- 文章列表 -->
    <view class="post-list">
      <PostItemComponent v-for="post in posts" :key="post.slug" :post="post" />
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore" @click="loadMore" class="load-more">加载更多</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';
import PostItemComponent from '@/components/PostItem.vue';
import type { SwiperItem, PostItem } from '@/types';

const swiperList = ref<SwiperItem[]>([]);
const posts = ref<PostItem[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const hasMore = ref(true);

onMounted(async () => {
  // 加载轮播
  const swiperRes = await api.getSwiper();
  swiperList.value = swiperRes.data;

  // 加载第一页文章
  loadPosts(1);
});

const loadPosts = async (page: number) => {
  const res = await api.getPosts(page);
  posts.value = [...posts.value, ...res.data.posts];
  totalPages.value = res.data.total; // 根据实际字段调整
  hasMore.value = page < totalPages.value;
  currentPage.value = page;
};

const loadMore = () => {
  loadPosts(currentPage.value + 1);
};

const toPost = (url: string) => {
  uni.navigateTo({ url: `/src/pages/post/detail?url=${encodeURIComponent(url)}` });
};
</script>

<style>
.swiper { height: 400rpx; }
swiper-item image { width: 100%; height: 100%; }
.load-more { text-align: center; padding: 20rpx; color: #007aff; }
</style>