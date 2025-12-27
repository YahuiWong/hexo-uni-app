import { ref, computed } from 'vue';

/**
 * 页面分享配置接口
 */
export interface PageShareConfig {
  title?: string;          // 分享标题
  path?: string;           // 分享路径（小程序）
  imageUrl?: string;       // 分享图片
  desc?: string;           // 分享描述
  query?: string;          // 朋友圈分享的查询参数
}

/**
 * 通用页面分享 Composable
 * 返回分享配置，需要在页面中手动调用 onShareAppMessage
 *
 * @param config 分享配置或返回配置的函数
 * @returns 分享配置对象，用于在页面中手动调用 onShareAppMessage
 *
 * @example
 * // 在页面的 script setup 中
 * import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
 *
 * const shareConfig = useShare({
 *   title: '页面标题',
 *   path: '/pages/index/index'
 * });
 *
 * onShareAppMessage(() => shareConfig.getShareConfig());
 * onShareTimeline(() => shareConfig.getTimelineConfig());
 */
export function useShare(config?: PageShareConfig | (() => PageShareConfig)) {
  // 默认配置
  const defaultConfig: PageShareConfig = {
    title: '雅珲网',
    path: '/pages/index/index',
    imageUrl: '',
    desc: '分享来自雅珲网的精彩内容'
  };

  // 获取当前配置
  const getConfig = (): PageShareConfig => {
    if (typeof config === 'function') {
      return { ...defaultConfig, ...config() };
    }
    return { ...defaultConfig, ...config };
  };

  // 响应式配置
  const shareConfig = ref<PageShareConfig>(getConfig());

  // 分享标题
  const shareTitle = computed(() => shareConfig.value.title || defaultConfig.title);

  // 分享路径
  const sharePath = computed(() => shareConfig.value.path || defaultConfig.path);

  // 分享图片
  const shareImage = computed(() => shareConfig.value.imageUrl || defaultConfig.imageUrl);

  // 更新配置方法
  const updateShareConfig = (newConfig: Partial<PageShareConfig>) => {
    shareConfig.value = { ...shareConfig.value, ...newConfig };
  };

  // 获取分享给好友的配置
  const getShareConfig = () => {
    const cfg = getConfig();

    const shareData: any = {
      title: cfg.title || defaultConfig.title,
      path: cfg.path || defaultConfig.path
    };

    // 只在有图片时才添加 imageUrl
    if (cfg.imageUrl) {
      shareData.imageUrl = cfg.imageUrl;
    }

    console.log('[分享给好友] 配置:', shareData);
    return shareData;
  };

  // 获取分享到朋友圈的配置
  const getTimelineConfig = () => {
    const cfg = getConfig();

    const shareData: any = {
      title: cfg.title || defaultConfig.title
    };

    // 添加查询参数
    if (cfg.query) {
      shareData.query = cfg.query;
    }

    // 只在有图片时才添加 imageUrl
    if (cfg.imageUrl) {
      shareData.imageUrl = cfg.imageUrl;
    }

    console.log('[分享到朋友圈] 配置:', shareData);
    return shareData;
  };

  return {
    shareConfig,
    shareTitle,
    sharePath,
    shareImage,
    updateShareConfig,
    getShareConfig,      // 用于 onShareAppMessage
    getTimelineConfig    // 用于 onShareTimeline
  };
}

/**
 * 获取首页分享配置
 */
export function getIndexShareConfig() {
  return {
    title: '雅珲网 - 技术博客',
    path: '/pages/index/index'
  };
}

/**
 * 获取文章详情页分享配置
 */
export function getPostShareConfig(post: { title?: string; url?: string; cover?: string }) {
  const config: any = {
    title: post.title || '文章分享',
    path: post.url ? `/pages/post/detailraw?url=${encodeURIComponent(post.url)}` : '/pages/index/index'
  };

  if (post.cover) {
    config.imageUrl = post.cover;
  }

  return config;
}

/**
 * 获取分类页分享配置
 */
export function getCategoryShareConfig(category?: { name?: string; slug?: string }) {
  if (!category) {
    return {
      title: '文章分类 - 雅珲网',
      path: '/pages/category/list'
    };
  }

  return {
    title: category.name ? `${category.name} - 分类` : '文章分类',
    path: category.slug ? `/pages/category/posts?slug=${category.slug}` : '/pages/category/list'
  };
}

/**
 * 获取标签页分享配置
 */
export function getTagShareConfig(tag?: { name?: string; slug?: string }) {
  if (!tag) {
    return {
      title: '文章标签 - 雅珲网',
      path: '/pages/tag/list'
    };
  }

  return {
    title: tag.name ? `${tag.name} - 标签` : '文章标签',
    path: tag.slug ? `/pages/tag/posts?slug=${tag.slug}` : '/pages/tag/list'
  };
}

/**
 * 获取归档页分享配置
 */
export function getArchiveShareConfig() {
  return {
    title: '文章归档 - 雅珲网',
    path: '/pages/archive/list'
  };
}

/**
 * 获取关于页分享配置
 */
export function getAboutShareConfig() {
  return {
    title: '关于 - 雅珲网',
    path: '/pages/about/index'
  };
}

/**
 * 获取搜索页分享配置
 */
export function getSearchShareConfig() {
  return {
    title: '搜索 - 雅珲网',
    path: '/pages/search/index'
  };
}
