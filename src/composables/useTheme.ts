/**
 * 主题管理 Composable
 *
 * 提供主题切换功能，支持浅色和深色模式
 */

import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'app_theme';

// 全局主题状态
const themeMode = ref<ThemeMode>('light');

// 主题颜色配置
export const themes = {
  light: {
    // 背景色
    bgPrimary: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#f8f8f8',

    // 文字颜色
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textPlaceholder: '#cccccc',

    // 边框颜色
    borderPrimary: '#f0f0f0',
    borderSecondary: '#e0e0e0',

    // 主题色
    primary: '#007aff',
    success: '#34c759',
    warning: '#ff9500',
    danger: '#ff3b30',

    // 阴影
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.15)',

    // 导航栏
    navBarBg: '#ffffff',
    navBarText: '#000000',

    // TabBar
    tabBarBg: '#ffffff',
    tabBarText: '#999999',
    tabBarActive: '#007aff'
  },
  dark: {
    // 背景色
    bgPrimary: '#1c1c1e',
    bgSecondary: '#2c2c2e',
    bgTertiary: '#3a3a3c',

    // 文字颜色
    textPrimary: '#ffffff',
    textSecondary: '#ebebf5',
    textTertiary: '#8e8e93',
    textPlaceholder: '#636366',

    // 边框颜色
    borderPrimary: '#38383a',
    borderSecondary: '#48484a',

    // 主题色
    primary: '#0a84ff',
    success: '#32d74b',
    warning: '#ff9f0a',
    danger: '#ff453a',

    // 阴影
    shadowLight: 'rgba(0, 0, 0, 0.3)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',

    // 导航栏
    navBarBg: '#1c1c1e',
    navBarText: '#ffffff',

    // TabBar
    tabBarBg: '#1c1c1e',
    tabBarText: '#8e8e93',
    tabBarActive: '#0a84ff'
  }
};

function syncThemeClass(theme: ThemeMode) {
  // #ifdef H5
  if (typeof document === 'undefined') return;
  const nodes: Element[] = [document.documentElement, document.body];
  document.querySelectorAll('uni-page-body').forEach((el) => nodes.push(el));
  nodes.forEach((el) => {
    if (theme === 'dark') el.classList.add('dark');
    else el.classList.remove('dark');
  });
  // #endif
}

/** 把当前主题写到文档、导航栏和整条 TabBar。切页后需要再调一次。 */
export function applyTheme(theme: ThemeMode) {
  const colors = themes[theme];
  syncThemeClass(theme);

  try {
    uni.setNavigationBarColor({
      frontColor: theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: colors.navBarBg,
      animation: {
        duration: 300,
        timingFunc: 'easeInOut'
      }
    });
  } catch (err) {
    console.warn('设置导航栏颜色失败', err);
  }

  try {
    uni.setTabBarStyle({
      backgroundColor: colors.tabBarBg,
      color: colors.tabBarText,
      selectedColor: colors.tabBarActive,
      borderStyle: theme === 'dark' ? 'white' : 'black'
    });
  } catch (err) {
    console.warn('设置 TabBar 样式失败', err);
  }
}

/**
 * 主题管理 Hook
 */
export function useTheme() {
  // 初始化主题（从本地存储加载）
  const initTheme = () => {
    try {
      const savedTheme = uni.getStorageSync(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        themeMode.value = savedTheme;
      }
    } catch (err) {
      console.error('加载主题设置失败', err);
    }

    // 应用主题
    applyTheme(themeMode.value);
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme: ThemeMode = themeMode.value === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // 设置主题
  const setTheme = (theme: ThemeMode) => {
    themeMode.value = theme;

    // 保存到本地存储
    try {
      uni.setStorageSync(THEME_KEY, theme);
    } catch (err) {
      console.error('保存主题设置失败', err);
    }

    applyTheme(theme);
  };

  // 获取当前主题颜色
  const getCurrentColors = () => {
    return themes[themeMode.value];
  };

  // 判断是否为深色模式
  const isDark = () => {
    return themeMode.value === 'dark';
  };

  return {
    themeMode,
    themes,
    initTheme,
    toggleTheme,
    setTheme,
    getCurrentColors,
    isDark,
    applyTheme
  };
}

/** 页面显示时重新套用导航栏和整条 TabBar，并返回模板用的 isDark。 */
export function usePageTheme() {
  const theme = useTheme();
  const isDark = computed(() => theme.themeMode.value === 'dark');

  onShow(() => {
    applyTheme(theme.themeMode.value);
  });

  return {
    ...theme,
    isDark
  };
}
