import { describe, expect, it } from 'vitest';
import { siteOriginFromApiBase } from '@/utils/site';

describe('siteOriginFromApiBase', () => {
  it('未配置时回落到示例站', () => {
    expect(siteOriginFromApiBase()).toBe('https://blog.yahui.wang');
    expect(siteOriginFromApiBase('   ')).toBe('https://blog.yahui.wang');
  });

  it('去掉末尾的 /api', () => {
    expect(siteOriginFromApiBase('https://example.com/api')).toBe('https://example.com');
    expect(siteOriginFromApiBase('https://example.com/api/')).toBe('https://example.com');
  });

  it('保留 /api 之前的路径', () => {
    expect(siteOriginFromApiBase('https://example.com/blog/api')).toBe('https://example.com/blog');
  });
});
