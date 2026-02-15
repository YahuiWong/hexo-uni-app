# Android 平台 Marked 兼容性问题解决方案

## 📋 问题描述

### 错误信息

```
MiniProgramError
SyntaxError: Invalid regular expression: /[\p{L}\p{N}]/u: Invalid property name in character class
Error: SyntaxError: Invalid regular expression: /[\p{L}\p{N}]/u: Invalid property name in character class
```

### 问题根源

1. **Marked 库版本**：项目使用 `marked@^17.0.1`
2. **Unicode 正则表达式**：Marked 使用了 ES2018+ 的 Unicode 属性转义（`\p{L}`, `\p{N}` 等）
3. **平台差异**：
   - ✅ **iOS** - 支持 Unicode 属性转义，运行正常
   - ❌ **Android** - JavaScript 引擎（JSCore/V8 旧版本）不支持，导致崩溃

### 影响范围

项目中使用 `marked` 的文件：
- `src/utils/md2html.ts` (第 2 行)
- `src/pages/post/detailraw.vue` (第 120 行)

## 🔧 解决方案一：Babel 转译（推荐）

### 1. 安装依赖

```bash
pnpm add -D @babel/core @babel/preset-env babel-plugin-transform-unicode-property-regex vite-plugin-babel
```

### 2. 配置 Vite

修改 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'path';
import babel from 'vite-plugin-babel';

export default defineConfig({
  plugins: [
    uni(),
    // Babel 插件：转译 marked 库中的 Unicode 正则表达式
    babel({
      babelConfig: {
        plugins: ['babel-plugin-transform-unicode-property-regex'],
      },
      filter: /node_modules\/marked/,  // 只转译 marked 库
    }),
  ],
  // ... 其他配置
});
```

### 3. 原理说明

- **Babel 插件**会在构建时自动将 `\p{L}` 等 Unicode 属性转义转换为兼容的等效正则表达式
- **仅转译 marked**：通过 `filter` 选项只处理 `node_modules/marked`，避免影响其他代码
- **零运行时成本**：转译在构建时完成，不影响运行性能

### 4. 验证步骤

1. **清理缓存**：
   ```bash
   rm -rf node_modules/.vite
   rm -rf dist
   ```

2. **重新构建**：
   ```bash
   pnpm build:mp-weixin
   ```

3. **测试 Android 端**：在微信开发者工具中测试，确保文章详情页正常渲染

## 🔧 解决方案二：降级 Marked 版本（备选）

如果方案一无效，可以尝试降级到不使用 Unicode 正则的旧版本。

### 1. 查找兼容版本

根据 [GitHub Issue #3133](https://github.com/markedjs/marked/issues/3133)，Marked 在 **v4.3.0** 左右引入了 Unicode 正则。

### 2. 降级操作

```bash
# 降级到 v4.2.x（最后一个不使用 Unicode 正则的稳定版本）
pnpm add marked@4.2.12
```

### 3. 验证兼容性

```bash
pnpm build:mp-weixin
```

### ⚠️ 注意事项

- 降级可能导致 Marked 新特性不可用
- 需要检查是否影响现有的 Markdown 渲染功能
- 长期方案仍建议使用 Babel 转译

## 🔧 解决方案三：替换 Markdown 渲染库（可选）

如果上述方案都无效，考虑替换为其他兼容性更好的库。

### 推荐库

1. **markdown-it**
   ```bash
   pnpm add markdown-it highlight.js
   ```
   - ✅ 兼容性好
   - ✅ 插件生态丰富
   - ✅ 性能优秀

2. **showdown**
   ```bash
   pnpm add showdown
   ```
   - ✅ 轻量级
   - ✅ 兼容性极好
   - ⚠️ 功能相对简单

### 示例：使用 markdown-it

修改 `src/utils/md2html.ts`：

```typescript
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  }
});

export function md2html(markdown: string): string {
  return md.render(markdown);
}
```

## 🧪 测试验证

### 测试用例

创建测试文件 `src/__tests__/markdown-android.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { md2html } from '@/utils/md2html';

describe('Markdown 渲染 - Android 兼容性', () => {
  it('应该能够渲染基本 Markdown', () => {
    const markdown = '# 标题\n\n这是一段文字';
    const html = md2html(markdown);
    expect(html).toContain('<h1');
    expect(html).toContain('标题');
  });

  it('应该能够渲染代码块', () => {
    const markdown = '```javascript\nconst a = 1;\n```';
    const html = md2html(markdown);
    expect(html).toContain('const a = 1');
  });

  it('应该能够渲染中文内容', () => {
    const markdown = '这是**中文**内容';
    const html = md2html(markdown);
    expect(html).toContain('中文');
  });

  it('应该能够渲染数学公式', () => {
    const markdown = '$$E = mc^2$$';
    const html = md2html(markdown);
    expect(html).toBeTruthy();
  });
});
```

运行测试：

```bash
pnpm test markdown-android
```

## 📊 各方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Babel 转译** | • 保留所有功能<br>• 零运行时成本<br>• 自动化处理 | • 需要额外配置<br>• 增加构建复杂度 | ⭐⭐⭐⭐⭐ |
| **降级版本** | • 简单快速<br>• 无需配置 | • 功能受限<br>• 不是长期方案 | ⭐⭐⭐ |
| **替换库** | • 可选择更合适的库<br>• 可能性能更好 | • 需要重构代码<br>• 可能影响现有功能 | ⭐⭐ |

## 🔍 问题排查

如果问题仍然存在，按以下步骤排查：

### 1. 检查构建产物

```bash
# 构建后检查 dist 目录中的 marked 代码
cat dist/build/mp-weixin/common/vendor.js | grep "\\\\p{L}"
```

- **如果仍有 `\p{L}`**：说明 Babel 转译未生效
- **如果没有**：说明转译成功，问题可能在其他地方

### 2. 验证 Babel 配置

创建测试脚本 `scripts/test-babel.js`：

```javascript
const babel = require('@babel/core');
const fs = require('fs');

const code = fs.readFileSync('node_modules/marked/lib/marked.esm.js', 'utf-8');

const result = babel.transformSync(code, {
  plugins: ['babel-plugin-transform-unicode-property-regex'],
});

// 检查是否还包含 Unicode 正则
if (result.code.includes('\\p{L}')) {
  console.error('❌ Babel 转译失败，仍包含 Unicode 正则');
} else {
  console.log('✅ Babel 转译成功');
}
```

运行：

```bash
node scripts/test-babel.js
```

### 3. 检查其他依赖

除了 `marked`，还需要检查其他依赖：

```bash
# 搜索项目中使用 Unicode 正则的代码
grep -r "\\\\p{" node_modules/
```

可能的问题库：
- `html-to-text`
- `katex`

## 📚 参考资料

1. **GitHub Issue**：[markedjs/marked#3133](https://github.com/markedjs/marked/issues/3133)
2. **Babel 插件文档**：[@babel/plugin-proposal-unicode-property-regex](https://babeljs.io/docs/en/babel-plugin-proposal-unicode-property-regex)
3. **Unicode 正则兼容性**：[Can I Use - RegExp Unicode Property Escapes](https://caniuse.com/mdn-javascript_regular_expressions_unicode_character_class_escape)
4. **Vite Babel 插件**：[vite-plugin-babel](https://github.com/owlsdepartment/vite-plugin-babel)

## ✅ 解决方案总结

### 已采用方案

**方案一：Babel 转译**

1. ✅ 已安装依赖：
   - `@babel/core@7.29.0`
   - `@babel/preset-env@7.29.0`
   - `babel-plugin-transform-unicode-property-regex@2.0.5`
   - `vite-plugin-babel@1.5.1`

2. ✅ 已配置 `vite.config.ts`：
   - 添加 Babel 插件
   - 配置 `filter: /node_modules\/marked/`

3. ⏳ **待验证**：重新构建并在 Android 端测试

### 下一步行动

1. **清理构建缓存**：
   ```bash
   rm -rf node_modules/.vite dist
   ```

2. **重新构建项目**：
   ```bash
   pnpm build:mp-weixin
   ```

3. **Android 端测试**：
   - 在微信开发者工具中打开项目
   - 切换到 Android 模拟器或真机
   - 打开文章详情页
   - 确认 Markdown 内容正常渲染

4. **如果仍有问题**：
   - 查看控制台错误信息
   - 检查构建产物中是否仍包含 `\p{L}`
   - 考虑使用备选方案二（降级）或方案三（替换库）

## 🎯 预期结果

修复后的效果：
- ✅ Android 端能够正常加载文章详情页
- ✅ Markdown 内容正常渲染（标题、段落、代码块等）
- ✅ 代码高亮功能正常
- ✅ 数学公式（KaTeX）正常渲染
- ✅ 图片、表格等元素正常显示

---

**最后更新**：2026-02-15
**问题状态**：✅ 已配置 Babel 转译方案，待验证
**维护者**: [YahuiWong](https://github.com/YahuiWong)
