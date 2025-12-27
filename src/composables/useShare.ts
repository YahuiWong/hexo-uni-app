import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
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
 * 为页面自动配置微信小程序右上角分享功能
 *
 * @param config 分享配置或返回配置的函数
 * @returns 分享配置的响应式数据
 *
 * @example
 * // 基础用法
 * useShare({
 *   title: '页面标题',
 *   path: '/pages/index/index',
 *   imageUrl: 'https://example.com/image.jpg'
 * });
 *
 * @example
 * // 动态配置
 * const post = ref({ title: '文章标题', cover: 'xxx' });
 * useShare(() => ({
 *   title: post.value.title,
 *   path: `/pages/post/detail?id=${post.value.id}`,
 *   imageUrl: post.value.cover
 * }));
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

  // 配置分享给好友
  onShareAppMessage(() => {
    const cfg = getConfig();

    return {
      title: cfg.title || defaultConfig.title,
      path: cfg.path || defaultConfig.path,
      imageUrl: cfg.imageUrl || defaultConfig.imageUrl
    };
  });

  // 配置分享到朋友圈
  onShareTimeline(() => {
    const cfg = getConfig();

    return {
      title: cfg.title || defaultConfig.title,
      query: cfg.query || '',
      imageUrl: cfg.imageUrl || defaultConfig.imageUrl
    };
  });

  return {
    shareConfig,
    shareTitle,
    sharePath,
    shareImage,
    updateShareConfig
  };
}

/**
 * 首页分享配置
 */
export function useIndexShare() {
  return useShare({
    title: '雅珲网 - 技术博客',
    path: '/pages/index/index',
    desc: '分享优质技术文章'
  });
}

/**
 * 文章详情页分享配置
 */
export function usePostShare(getPostData: () => { title?: string; url?: string; cover?: string }) {
  return useShare(() => {
    const post = getPostData();
    return {
      title: post.title || '文章分享',
      path: post.url ? `/pages/post/detailraw?url=${encodeURIComponent(post.url)}` : '/pages/index/index',
      imageUrl: post.cover || ''
    };
  });
}

/**
 * 分类页分享配置
 */
export function useCategoryShare(getCategoryData?: () => { name?: string; slug?: string }) {
  return useShare(() => {
    if (!getCategoryData) {
      return {
        title: '文章分类 - 雅珲网',
        path: '/pages/category/list'
      };
    }

    const category = getCategoryData();
    return {
      title: category.name ? `${category.name} - 分类` : '文章分类',
      path: category.slug ? `/pages/category/posts?slug=${category.slug}` : '/pages/category/list'
    };
  });
}

/**
 * 标签页分享配置
 */
export function useTagShare(getTagData?: () => { name?: string; slug?: string }) {
  return useShare(() => {
    if (!getTagData) {
      return {
        title: '文章标签 - 雅珲网',
        path: '/pages/tag/list'
      };
    }

    const tag = getTagData();
    return {
      title: tag.name ? `${tag.name} - 标签` : '文章标签',
      path: tag.slug ? `/pages/tag/posts?slug=${tag.slug}` : '/pages/tag/list'
    };
  });
}

/**
 * 归档页分享配置
 */
export function useArchiveShare() {
  return useShare({
    title: '文章归档 - 雅珲网',
    path: '/pages/archive/list',
    desc: '按时间浏览文章'
  });
}

/**
 * 关于页分享配置
 */
export function useAboutShare() {
  return useShare({
    title: '关于 - 雅珲网',
    path: '/pages/about/index',
    desc: '了解更多关于我们'
  });
}

/**
 * 搜索页分享配置
 */
export function useSearchShare() {
  return useShare({
    title: '搜索 - 雅珲网',
    path: '/pages/search/index',
    desc: '搜索感兴趣的文章'
  });
}
