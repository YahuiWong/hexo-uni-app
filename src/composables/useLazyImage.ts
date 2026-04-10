/**
 * 图片懒加载 Composable
 *
 * 提供图片懒加载功能，优化页面性能
 */

import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export interface LazyImageOptions {
  /**
   * 占位图片 URL
   */
  placeholder?: string;

  /**
   * 加载失败时的图片 URL
   */
  errorImage?: string;

  /**
   * 根边距（用于提前加载）
   * 格式："top right bottom left"
   */
  rootMargin?: string;

  /**
   * 交叉比例阈值
   */
  threshold?: number;
}

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7liqDovb3kuK08L3RleHQ+PC9zdmc+';
const DEFAULT_ERROR_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7liqDovb3lpLHotKU8L3RleHQ+PC9zdmc+';

/**
 * 使用图片懒加载
 */
export function useLazyImage(src: string, options: LazyImageOptions = {}) {
  const {
    placeholder = DEFAULT_PLACEHOLDER,
    errorImage = DEFAULT_ERROR_IMAGE,
    rootMargin = '50px',
    threshold = 0.01
  } = options;

  const currentSrc = ref(placeholder);
  const isLoading = ref(true);
  const isError = ref(false);
  const imageRef: Ref<HTMLImageElement | null> = ref(null);

  let observer: IntersectionObserver | null = null;

  const loadImage = () => {
    if (!src) {
      currentSrc.value = errorImage;
      isLoading.value = false;
      isError.value = true;
      return;
    }

    isLoading.value = true;

    const img = new Image();

    img.onload = () => {
      currentSrc.value = src;
      isLoading.value = false;
      isError.value = false;
    };

    img.onerror = () => {
      currentSrc.value = errorImage;
      isLoading.value = false;
      isError.value = true;
    };

    img.src = src;
  };

  onMounted(() => {
    // #ifdef H5
    if ('IntersectionObserver' in window && imageRef.value) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              if (observer && imageRef.value) {
                observer.unobserve(imageRef.value);
              }
            }
          });
        },
        {
          rootMargin,
          threshold
        }
      );

      observer.observe(imageRef.value);
    } else {
      // 降级方案：直接加载
      loadImage();
    }
    // #endif

    // #ifndef H5
    // 非 H5 环境直接加载
    loadImage();
    // #endif
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return {
    imageRef,
    currentSrc,
    isLoading,
    isError
  };
}

/**
 * 图片预加载
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });

  return Promise.all(promises);
}

/**
 * 批量预加载图片（带并发控制）
 */
export function preloadImagesWithLimit(
  urls: string[],
  limit: number = 3
): Promise<void[]> {
  const results: Promise<void>[] = [];
  let currentIndex = 0;

  const loadNext = (): Promise<void> => {
    if (currentIndex >= urls.length) {
      return Promise.resolve();
    }

    const url = urls[currentIndex++];
    const promise = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`);
        resolve(); // 即使失败也继续
      };
      img.src = url;
    });

    results.push(promise);
    return promise.then(loadNext);
  };

  // 启动并发加载
  const workers = Array(Math.min(limit, urls.length))
    .fill(null)
    .map(() => loadNext());

  return Promise.all(workers).then(() => Promise.all(results));
}
