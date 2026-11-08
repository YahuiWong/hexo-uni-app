import { describe, expect, it } from 'vitest';
import { filterSearchIndex, matchSearchItem } from '@/utils/search';
import type { SearchIndexItem } from '@/types';

const index: SearchIndexItem[] = [
  {
    title: 'Docker Compose 笔记',
    slug: 'note-docker',
    url: '2025/04/09/note-docker/',
    content: '<p>只在正文里出现的词：麒麟部署</p>',
    tags: ['Docker', '容器'],
    categories: ['技术']
  },
  {
    title: '标题里有架构',
    slug: 'arch',
    url: '2024/01/01/arch/',
    content: '正文没有那个关键词',
    tags: [{ name: '设计', slug: 'design' }],
    categories: [{ name: '工程', slug: 'eng' }]
  },
  {
    title: '其他文章',
    slug: 'other',
    url: '2024/02/02/other/',
    content: '无关内容'
  }
];

describe('filterSearchIndex', () => {
  it('命中正文中的词', () => {
    const posts = filterSearchIndex(index, '麒麟部署');
    expect(posts.map((post) => post.slug)).toEqual(['note-docker']);
    expect(posts[0].excerpt).toContain('麒麟部署');
    expect(posts[0].tags?.[0].name).toBe('Docker');
    expect(posts[0].categories?.[0].name).toBe('技术');
  });

  it('仅标题命中时也能返回', () => {
    const posts = filterSearchIndex(index, '架构');
    expect(posts.map((post) => post.slug)).toEqual(['arch']);
  });

  it('忽略大小写', () => {
    expect(matchSearchItem(index[0], 'docker compose')).toBe(true);
    expect(filterSearchIndex(index, 'DOCKER').map((post) => post.slug)).toEqual(['note-docker']);
  });

  it('空关键词不返回结果', () => {
    expect(filterSearchIndex(index, '   ')).toEqual([]);
    expect(matchSearchItem(index[0], '')).toBe(false);
  });

  it('标签为字符串或对象时都能命中', () => {
    expect(filterSearchIndex(index, '容器').map((post) => post.slug)).toEqual(['note-docker']);
    expect(filterSearchIndex(index, '设计').map((post) => post.slug)).toEqual(['arch']);
    expect(filterSearchIndex(index, '工程').map((post) => post.slug)).toEqual(['arch']);
  });
});
