// src/types/index.ts

/**
 * API 响应基础结构
 */
export interface ApiResponse<T> {
  data: T;
  api: string;
}

/**
 * 轮播图项
 */
export interface SwiperItem {
  title: string;
  slug: string;
  cover: string;
  url: string;
  description?: string;
}

/**
 * 文章列表项
 */
export interface PostItem {
  title: string;
  slug: string;
  date: string;
  updated?: string;
  excerpt: string;
  excerptText?: string; // 预处理的纯文本摘要（去除HTML标签）
  cover?: string;
  url: string;
  categories?: CategoryItem[];
  tags?: TagItem[];
  api?: string;
}

/**
 * 文章详情
 */
export interface PostDetail {
  title: string;
  slug: string;
  date: string;
  updated?: string;
  content: string; // HTML 内容
  raw?: string; // Markdown 原始内容
  excerpt?: string;
  description?: string;
  cover?: string;
  url: string;
  images?: string[];
  categories?: CategoryItem[];
  tags?: TagItem[];
  prev?: {
    title: string;
    url: string;
  };
  next?: {
    title: string;
    url: string;
  };
}

/**
 * 分类项
 */
export interface CategoryItem {
  name: string;
  slug: string;
  count: number;
  url?: string;
}

/**
 * 标签项
 */
export interface TagItem {
  name: string;
  slug: string;
  count: number;
  url?: string;
}

/**
 * 分页数据
 */
export interface PaginationData<T> {
  posts: T[];
  /** 总页数 */
  total: number;
  /** 当前页码，从 1 开始 */
  index: number;
  prev?: number;
  next?: number;
}

/**
 * 站点信息
 */
export interface SiteInfo {
  title: string;
  subtitle?: string;
  description?: string;
  author?: string;
  avatar?: string;
  url?: string;
  since?: string;
  postCount?: number;
  categoryCount?: number;
  tagCount?: number;
  [key: string]: any; // 允许其他自定义字段
}

/**
 * 归档年份信息
 */
export interface ArchiveYear {
  year: number;
  count: number;
  months?: ArchiveMonth[];
  api?: string;
  data?: YearData[];
}

/**
 * 归档年份扩展数据（用于页面状态管理）
 */
export interface YearData {
  year: number;
  api: string;
  data: MonthData[];
  expanded?: boolean;
  totalPosts?: number;
}

/**
 * 归档月份信息
 */
export interface ArchiveMonth {
  month: number;
  count: number;
  posts?: PostItem[];
  api?: string;
}

/**
 * 归档月份扩展数据（用于页面状态管理）
 */
export interface MonthData {
  month: number;
  api: string;
  posts?: PostData[];
  expanded?: boolean;
  loading?: boolean;
}

/**
 * 归档文章数据
 */
export interface PostData {
  title: string;
  slug: string;
  date: string;
  url?: string;
}

/**
 * 归档月份信息
 */
export interface ArchiveMonth {
  month: number;
  count: number;
  posts?: PostItem[];
}

/**
 * search.json 中的一篇文章。标签和分类可能是字符串，也可能是带 name 的对象。
 */
export interface SearchIndexItem {
  title: string;
  slug: string;
  url: string;
  content?: string;
  date?: string;
  cover?: string;
  tags?: Array<string | { name?: string; slug?: string }>;
  categories?: Array<string | { name?: string; slug?: string }>;
}

/**
 * 3D 标签云项（扩展 TagItem）
 */
export interface TagCloudItem extends TagItem {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  style: Record<string, any>;
}

/**
 * 分享配置
 */
export interface ShareOptions {
  title: string; // 分享标题
  path?: string; // 分享路径（小程序）
  imageUrl?: string; // 分享图片
  content?: string; // 分享描述
  url?: string; // 分享链接（H5）
}

/**
 * 分享平台类型
 */
export type SharePlatform = 'weixin' | 'moment' | 'qq' | 'weibo' | 'copy' | 'qrcode' | 'poster';

/**
 * 分享结果
 */
export interface ShareResult {
  success: boolean;
  platform?: SharePlatform;
  message?: string;
}
