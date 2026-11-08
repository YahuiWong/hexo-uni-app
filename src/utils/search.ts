import type { CategoryItem, PostItem, SearchIndexItem, TagItem } from '@/types';

const EXCERPT_LENGTH = 120;

let indexCache: SearchIndexItem[] | null = null;

export function getCachedSearchIndex(): SearchIndexItem[] | null {
  return indexCache;
}

export function cacheSearchIndex(items: SearchIndexItem[]): SearchIndexItem[] {
  indexCache = items;
  return indexCache;
}

export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesOf(value: SearchIndexItem['tags']): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item.name === 'string') return item.name.trim();
      return '';
    })
    .filter((name) => name.length > 0);
}

function toTags(value: SearchIndexItem['tags']): TagItem[] {
  return namesOf(value).map((name) => ({
    name,
    slug: name,
    count: 0
  }));
}

function toCategories(value: SearchIndexItem['categories']): CategoryItem[] {
  return namesOf(value).map((name) => ({
    name,
    slug: name,
    count: 0
  }));
}

export function toPostItem(item: SearchIndexItem): PostItem {
  const plain = stripHtml(item.content || '');
  const excerpt = plain.slice(0, EXCERPT_LENGTH);

  return {
    title: item.title || '',
    slug: item.slug || '',
    date: item.date || '',
    excerpt,
    excerptText: excerpt,
    url: item.url || '',
    cover: item.cover,
    tags: toTags(item.tags),
    categories: toCategories(item.categories)
  };
}

export function matchSearchItem(item: SearchIndexItem, keyword: string): boolean {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return false;

  const title = (item.title || '').toLowerCase();
  const content = stripHtml(item.content || '').toLowerCase();
  const tags = namesOf(item.tags).join(' ').toLowerCase();
  const categories = namesOf(item.categories).join(' ').toLowerCase();

  return (
    title.includes(kw) || content.includes(kw) || tags.includes(kw) || categories.includes(kw)
  );
}

export function filterSearchIndex(items: SearchIndexItem[], keyword: string): PostItem[] {
  const kw = keyword.trim();
  if (!kw) return [];

  return items.filter((item) => matchSearchItem(item, kw)).map(toPostItem);
}
