# Vitest 测试文档

本文档介绍如何在项目中使用 Vitest 进行单元测试。

## 📋 目录

- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [编写测试](#编写测试)
- [运行测试](#运行测试)
- [最佳实践](#最佳实践)

---

## 快速开始

### 安装依赖

```bash
pnpm add -D vitest @vue/test-utils @vitest/ui happy-dom
```

### 创建配置文件

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  },
});
```

### 添加测试脚本

`package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  }
}
```

---

## 配置说明

### 测试环境

- **happy-dom**: 轻量级 DOM 环境，性能好
- **jsdom**: 完整 DOM 环境，兼容性好

### 路径别名

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@api': path.resolve(__dirname, 'src/api'),
  },
}
```

### 覆盖率配置

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    'dist/',
    '**/*.d.ts',
    '**/*.config.*',
  ],
}
```

---

## 编写测试

### 基础测试

`src/__tests__/example.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('基础测试', () => {
  it('应该通过', () => {
    expect(1 + 1).toBe(2);
  });
});
```

### 函数测试

```typescript
import { describe, it, expect } from 'vitest';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
};

describe('formatDate', () => {
  it('应该格式化日期', () => {
    const result = formatDate('2024-12-27');
    expect(result).toContain('2024');
  });

  it('应该处理空字符串', () => {
    expect(formatDate('')).toBe('');
  });
});
```

### 测试 URL 处理

```typescript
const getPostPathFromUrl = (url: string): string => {
  let path = url
    .replace(/^\//, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
  return path || 'index';
};

describe('getPostPathFromUrl', () => {
  it('应该移除开头斜杠', () => {
    expect(getPostPathFromUrl('/test')).toBe('test');
  });

  it('应该移除 .html 后缀', () => {
    expect(getPostPathFromUrl('test.html')).toBe('test');
  });

  it('应该移除尾部斜杠', () => {
    expect(getPostPathFromUrl('test/')).toBe('test');
  });
});
```

---

## 运行测试

### 命令行运行

```bash
# 监听模式（开发时使用）
pnpm test

# 单次运行（CI/CD 使用）
pnpm test:run

# UI 界面运行
pnpm test:ui

# 生成覆盖率报告
pnpm coverage
```

### 查看测试结果

```
Test Files  2 passed (2)
     Tests  44 passed (44)
  Duration  692ms
```

### 查看覆盖率报告

```bash
# 在浏览器中打开
open coverage/index.html
```

---

## 最佳实践

### 1. 测试文件组织

```
src/
├── __tests__/
│   ├── detail.test.ts      # 详情页测试
│   ├── postitem.test.ts    # PostItem 组件测试
│   └── utils.test.ts       # 工具函数测试
├── components/
│   └── PostItem.vue
└── pages/
    └── post/
        └── detail.vue
```

### 2. 测试命名规范

```typescript
describe('功能模块名', () => {
  describe('子功能', () => {
    it('应该做什么', () => {
      // 测试代码
    });
  });
});
```

### 3. 断言技巧

```typescript
// 相等性断言
expect(value).toBe(expected);
expect(value).toEqual(expected);

// 包含断言
expect(str).toContain('substring');
expect(array).toContain(item);

// 真值断言
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// 类型断言
expect(value).toBeTypeOf('string');
expect(value).toBeUndefined();
```

### 4. 边界测试

```typescript
it('应该处理边界情况', () => {
  expect(func('')).toBe('default');
  expect(func(null)).toBe('default');
  expect(func(undefined)).toBe('default');
});
```

---

## 现有测试用例

### detail.test.ts (30 个测试)

- URL 路径解析 (6个)
- 日期格式化 (5个)
- 字数统计 (4个)
- 阅读时间计算 (5个)
- HTML 内容处理 (5个)
- 数据结构验证 (2个)
- 边界情况 (3个)

### postitem.test.ts (14 个测试)

- 使用 url 字段 (1个)
- 从 api 字段构建 (2个)
- 根据 date + slug 构建 (3个)
- 仅使用 slug (2个)
- 边界情况 (3个)
- 真实数据测试 (3个)

---

## 调试技巧

### 1. 只运行特定测试

```typescript
it.only('只运行这个测试', () => {
  expect(true).toBe(true);
});
```

### 2. 跳过测试

```typescript
it.skip('跳过这个测试', () => {
  expect(true).toBe(true);
});
```

### 3. 查看详细输出

```bash
pnpm test:run --reporter=verbose
```

---

## 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Happy DOM](https://github.com/capricorn86/happy-dom)

---

**最后更新**: 2024-12-27
**测试统计**: 44 个测试，100% 通过
