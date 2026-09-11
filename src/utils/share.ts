import type { ShareOptions, ShareResult } from '@/types';

/**
 * 分享工具类
 */
export class ShareUtil {
  /**
   * 获取当前平台
   */
  private static getPlatform(): string {
    // #ifdef H5
    return 'h5';
    // #endif
    // #ifdef MP-WEIXIN
    return 'weixin';
    // #endif
    // #ifdef APP-PLUS
    return 'app';
    // #endif
    return 'unknown';
  }

  /**
   * 分享到微信好友（仅小程序）
   * 需要在页面中调用 onShareAppMessage 生命周期
   */
  static shareToWeixin(_options?: ShareOptions): ShareResult {
    const platform = this.getPlatform();

    if (platform !== 'weixin') {
      return {
        success: false,
        message: '仅支持微信小程序环境'
      };
    }

    // 小程序分享需要在页面的 onShareAppMessage 中返回配置
    // 这里只是提供配置，实际分享由用户点击右上角触发
    return {
      success: true,
      platform: 'weixin',
      message: '请点击右上角分享'
    };
  }

  /**
   * 分享到朋友圈（仅小程序）
   * 需要在页面中调用 onShareTimeline 生命周期
   */
  static shareToMoment(_options?: ShareOptions): ShareResult {
    const platform = this.getPlatform();

    if (platform !== 'weixin') {
      return {
        success: false,
        message: '仅支持微信小程序环境'
      };
    }

    return {
      success: true,
      platform: 'moment',
      message: '请点击右上角分享到朋友圈'
    };
  }

  /**
   * 复制链接
   */
  static copyLink(url: string): Promise<ShareResult> {
    return new Promise((resolve) => {
      uni.setClipboardData({
        data: url,
        success: () => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success'
          });
          resolve({
            success: true,
            platform: 'copy',
            message: '链接已复制到剪贴板'
          });
        },
        fail: () => {
          resolve({
            success: false,
            platform: 'copy',
            message: '复制失败'
          });
        }
      });
    });
  }

  /**
   * 生成分享海报（暂未实现，返回占位）
   */
  static generatePoster(_options?: ShareOptions): Promise<ShareResult> {
    return new Promise((resolve) => {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
      resolve({
        success: false,
        message: '海报生成功能开发中'
      });
    });
  }

  /**
   * H5 平台使用 Web Share API
   */
  static shareOnH5(options: ShareOptions): Promise<ShareResult> {
    return new Promise((resolve) => {
      // #ifdef H5
      if (navigator.share) {
        navigator
          .share({
            title: options.title,
            text: options.content || '',
            url: options.url || window.location.href
          })
          .then(() => {
            resolve({
              success: true,
              message: '分享成功'
            });
          })
          .catch((error) => {
            console.error('分享失败:', error);
            resolve({
              success: false,
              message: '分享失败'
            });
          });
      } else {
        // 不支持 Web Share API，降级为复制链接
        this.copyLink(options.url || window.location.href).then(resolve);
      }
      // #endif

      // #ifndef H5
      resolve({
        success: false,
        message: '仅支持 H5 环境'
      });
      // #endif
    });
  }

  /**
   * 通用分享方法
   * 根据平台自动选择合适的分享方式
   */
  static share(options: ShareOptions): Promise<ShareResult> {
    const platform = this.getPlatform();

    switch (platform) {
      case 'h5':
        return this.shareOnH5(options);
      case 'weixin':
        // 小程序环境，提示用户使用右上角分享
        uni.showModal({
          title: '分享',
          content: '请点击右上角 "..." 分享给好友或朋友圈',
          showCancel: true,
          cancelText: '复制链接',
          confirmText: '知道了',
          success: (res) => {
            if (res.cancel) {
              // 用户选择复制链接
              if (options.url) {
                this.copyLink(options.url);
              }
            }
          }
        });
        return Promise.resolve({
          success: true,
          platform: 'weixin',
          message: '请使用右上角分享'
        });
      case 'app':
        // App 端可以集成原生分享
        // 这里暂时降级为复制链接
        if (options.url) {
          return this.copyLink(options.url);
        }
        return Promise.resolve({
          success: false,
          message: '分享功能开发中'
        });
      default:
        return Promise.resolve({
          success: false,
          message: '不支持的平台'
        });
    }
  }
}

/**
 * 便捷的分享方法导出
 */
export const share = ShareUtil.share.bind(ShareUtil);
export const copyLink = ShareUtil.copyLink.bind(ShareUtil);
export const shareToWeixin = ShareUtil.shareToWeixin.bind(ShareUtil);
export const shareToMoment = ShareUtil.shareToMoment.bind(ShareUtil);
