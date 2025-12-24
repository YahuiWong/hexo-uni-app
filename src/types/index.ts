// src/types/index.ts

// 正确方式：命名导出（推荐）
export interface SwiperItem {
  title: string;
  slug: string;
  cover: string;
  url: string;
  description?: string;
}

export interface PostItem {
  title: string;
  slug: string;
  date: string;
  updated?: string;
  excerpt: string;
  cover?: string;
  url: string;
  categories?: string[];
  tags?: string[];
}