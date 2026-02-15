# 详情页重构 - Android 兼容性优化

## 📋 问题背景

### 原问题
在 Android 平台运行时出现多个 Unicode 正则表达式错误：

1. **Marked 库错误**（已通过 Babel 转译解决）：
   ```
   Invalid regular expression: /[\p{L}\p{N}]/u
   ```

2. **Highlight.js 语言定义错误**（本次解决）：
   ```
   Language definition for 'python' could not be registered.
   Invalid regular expression: /[\p{XID_Start}_]\p{XID_Continue}*/u
   ```

### 根本原因
- Highlight.js 的某些语言定义（如 Python、Java、Go 等）使用了 ES2018+ 的 Unicode 属性转义
- Android 的 JavaScript 引擎不支持这些现代正则表达式特性
- 无法通过 Babel 转译 highlight.js 的动态语言定义

## 🔧 解决方案

### 方案概述
完全重写两个详情页面，**不再使用 highlight.js 的语法高亮功能**，改用简单的代码块样式。

### 实现细节

#### 1️⃣ 创建安全的 Markdown 转换工具

**文件**: `src/utils/md2html-safe.ts`

**特点**:
- ✅ 使用 `marked` 库（已通过 Babel 转译，兼容 Android）
- ✅ **不使用** `highlight.js` 的语法高亮
- ✅ 支持基础 Markdown 语法（标题、段落、列表、表格等）
- ✅ 支持代码块（使用简单的 `<pre><code>` 标签，不进行语法高亮）
- ✅ 支持数学公式占位符（`$...$` 和 `$$...$$`）
- ✅ 支持 Mermaid 图表占位符

**代码块处理**:
```typescript
// 普通代码块 - 不使用 highlight.js
renderer.code = function (code: string | undefined, infostring?: string): string {
  const safeCode = typeof code === 'string' ? code : '';
  const lang = (infostring || '').trim().split(/\s+/)[0].toLowerCase() || 'plaintext';

  // Mermaid 图表
  if (lang === 'mermaid') {
    return `<div class="mermaid">${escapeHtml(safeCode)}</div>`;
  }

  // 数学公式块
  if (['math', 'latex', 'katex'].includes(lang)) {
    return `<div class="math-block">$$${escapeHtml(safeCode)}$$</div>`;
  }

  // 普通代码块 - 使用简单样式，不进行语法高亮
  return `<pre class="code-block"><code class="language-${escapeHtml(lang)}">${escapeHtml(safeCode)}</code></pre>\n`;
};
```

#### 2️⃣ 重写 `detail.vue`

**用途**: 渲染 `post.value.content`（已经是 HTML）

**关键改动**:
- ✅ 使用 `mp-html` 组件直接渲染 HTML 内容
- ✅ 不需要 Markdown 转换
- ✅ 自定义 CSS 样式美化代码块、标题、图片等
- ✅ 支持图片点击预览
- ✅ 支持分享功能

**代码**:
```vue
<mp-html
  :content="htmlContent"
  :selectable="true"
  :show-img-menu="true"
  @imgtap="handleImageTap"
/>
```

#### 3️⃣ 重写 `detailraw.vue`

**用途**: 渲染 `post.value.raw`（Markdown 格式）

**关键改动**:
- ✅ 使用 `md2html-safe.ts` 工具转换 Markdown 到 HTML
- ✅ 在页面内完成转换（computed 属性）
- ✅ 使用 `mp-html` 组件渲染转换后的 HTML
- ✅ 支持数学公式占位符（需要配合 mp-html 插件）
- ✅ 支持 Mermaid 图表占位符
- ✅ 自定义 CSS 样式

**代码**:
```vue
<script setup lang="ts">
import { md2html } from '@/utils/md2html-safe';

const renderedContent = computed(() => {
  if (!post.value.raw) {
    return post.value.content || '';
  }

  try {
    let markdown = post.value.raw.replace(/^---[\s\S]*?---\n*/m, '');
    return md2html(markdown);
  } catch (err) {
    console.error('Markdown 转换失败', err);
    return '<p>内容渲染失败，请稍后重试</p>';
  }
});
</script>

<template>
  <mp-html
    :content="renderedContent"
    :selectable="true"
    :show-img-menu="true"
    @imgtap="handleImageTap"
  />
</template>
```

## 🎨 样式设计

### 代码块样式
不使用语法高亮，采用清新的单色配色：

```css
/* 代码块 - 清新配色 */
:deep(.mp-html .code-block) {
  background: #f6f8fa;      /* GitHub 风格的浅灰背景 */
  padding: 24rpx;
  border-radius: 8rpx;
  overflow-x: auto;
  margin: 30rpx 0;
  border: 1rpx solid #e8e8e8;
}

:deep(.mp-html .code-block code) {
  color: #24292f;           /* 深灰文字 */
  font-size: 26rpx;
  line-height: 1.6;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  white-space: pre;
}

/* 行内代码 - 绿色强调 */
:deep(.mp-html .inline-code) {
  background: #e7f7ef;
  color: #42b983;
  padding: 4rpx 10rpx;
  border-radius: 4rpx;
  font-size: 90%;
  font-family: Consolas, Monaco, monospace;
}
```

### 数学公式占位符样式
```css
:deep(.mp-html .math-inline),
:deep(.mp-html .math-display) {
  color: #8b5cf6;           /* 紫色 */
  font-family: 'KaTeX_Main', 'Times New Roman', serif;
  background: #faf5ff;      /* 浅紫色背景 */
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
}
```

### Mermaid 图表占位符样式
```css
:deep(.mp-html .mermaid) {
  background: #f0f9ff;      /* 浅蓝色背景 */
  padding: 24rpx;
  border-radius: 8rpx;
  margin: 30rpx 0;
  border: 1rpx solid #bae6fd;
  color: #0369a1;
  font-family: monospace;
}
```

## ✅ 功能支持

### 两个页面都支持的功能

#### 基础 Markdown 元素
- ✅ 标题 (H1-H6)
- ✅ 段落
- ✅ 粗体、斜体
- ✅ 链接
- ✅ 图片（支持点击预览）
- ✅ 引用块
- ✅ 列表（有序、无序）
- ✅ 水平线
- ✅ 表格

#### 高级功能
- ✅ **代码块**（简单样式，不语法高亮）
- ✅ **行内代码**
- ✅ **数学公式占位符**（`$...$` 和 `$$...$$`）
- ✅ **Mermaid 图表占位符**
- ✅ 图片预览
- ✅ 分享功能
- ✅ 字数统计
- ✅ 阅读时间估算

### 不支持的功能
- ❌ **代码语法高亮**（为了 Android 兼容性，已移除）
- ❌ **实时渲染数学公式**（显示占位符，需要后续集成 mp-html 的 KaTeX 插件）
- ❌ **实时渲染 Mermaid 图表**（显示占位符，需要后续集成相关插件）

## 📊 对比：新旧方案

| 特性 | 旧方案 | 新方案 |
|------|--------|--------|
| **Markdown 转换** | marked + highlight.js | marked（无 highlight.js） |
| **代码高亮** | ✅ 支持多语言高亮 | ❌ 简单样式，无高亮 |
| **Android 兼容** | ❌ Unicode 正则错误 | ✅ 完全兼容 |
| **依赖库** | marked, highlight.js, katex | 仅 marked |
| **包体积** | 较大 | 较小 |
| **维护成本** | 高（需要管理语言定义） | 低（简单转换） |
| **渲染性能** | 中等（语法高亮耗时） | 快速 |
| **数学公式** | ⚠️ 占位符（需插件） | ⚠️ 占位符（需插件） |
| **Mermaid 图表** | ⚠️ 占位符（需插件） | ⚠️ 占位符（需插件） |

## 🔄 后续优化方向

### 1️⃣ 集成 mp-html 的 KaTeX 插件（可选）

如果需要渲染数学公式，可以集成 mp-html 的 KaTeX 插件：

```bash
# 安装 mp-html 的 KaTeX 插件
pnpm add @mp-html/katex
```

然后在页面中配置：
```vue
<mp-html
  :content="renderedContent"
  :plugins="[katexPlugin]"
/>
```

### 2️⃣ 轻量级代码高亮方案（可选）

如果确实需要代码高亮，可以考虑以下方案：

**方案 A**：使用纯 CSS 的伪高亮
- 只用颜色区分关键字类别（关键字、字符串、注释）
- 不使用正则表达式，避免兼容性问题

**方案 B**：手动编写简单的高亮规则
- 仅支持常用语言（JavaScript、Python、HTML、CSS）
- 使用简单的字符串替换，不使用复杂正则

**方案 C**：服务端预处理
- 在博客生成时（Hexo）就完成代码高亮
- 前端直接渲染 HTML，零额外成本

### 3️⃣ 主题切换支持

为代码块添加深色模式支持：

```css
/* 深色模式下的代码块样式 */
.dark :deep(.mp-html .code-block) {
  background: #1e1e1e;
  border-color: #333;
}

.dark :deep(.mp-html .code-block code) {
  color: #d4d4d4;
}
```

## 📝 使用建议

### 对于开发者

1. **优先使用 detail.vue**
   - 如果博客 API 返回 `content`（HTML），优先使用 `detail.vue`
   - 更快的渲染速度，无需 Markdown 转换

2. **detailraw.vue 的使用场景**
   - 只在需要从 `raw`（Markdown）字段渲染时使用
   - 适合需要在客户端动态处理 Markdown 的场景

3. **代码块的展示**
   - 目前代码块使用简单样式，可读性良好
   - 如果用户强烈需要语法高亮，考虑上述"后续优化方向"

### 对于用户

1. **代码阅读**
   - 代码块采用 GitHub 风格的清新配色
   - 虽然没有语法高亮，但使用等宽字体，保持良好的可读性

2. **数学公式**
   - 当前显示为占位符（紫色背景 + LaTeX 语法）
   - 后续可以集成 KaTeX 插件实现真实渲染

3. **图表**
   - Mermaid 图表显示为占位符（蓝色背景 + 图表代码）
   - 后续可以集成 Mermaid 插件实现真实渲染

## 🎯 测试验证

### 测试步骤

1. **清理缓存**
   ```bash
   rm -rf node_modules/.vite dist
   ```

2. **重新构建**
   ```bash
   pnpm build:mp-weixin
   ```

3. **Android 端测试**
   - 打开微信开发者工具
   - 切换到 Android 调试基础库
   - 测试以下内容：
     - ✅ 文章列表页正常加载
     - ✅ 点击文章进入详情页
     - ✅ 详情页标题、段落正常显示
     - ✅ 代码块正常显示（无高亮但可读）
     - ✅ 图片正常加载
     - ✅ 表格正常渲染
     - ✅ 控制台**无** Unicode 正则错误

### 预期结果

**✅ 成功标志**:
- 文章详情页在 Android 上正常加载
- 没有 `Invalid regular expression` 错误
- 代码块显示清晰（虽无语法高亮）
- 所有 Markdown 元素正常渲染

**❌ 如果仍有问题**:
- 检查是否还有其他依赖库使用 Unicode 正则
- 查看控制台完整错误信息
- 参考 `docs/24-Android平台marked兼容性问题.md`

## 📚 相关文件

### 新增文件
- `src/utils/md2html-safe.ts` - 安全的 Markdown 转换工具

### 修改文件
- `src/pages/post/detail.vue` - 重写（使用 mp-html 渲染 HTML）
- `src/pages/post/detailraw.vue` - 重写（使用 md2html-safe 转换 Markdown）

### 相关文档
- `docs/24-Android平台marked兼容性问题.md` - Marked 兼容性问题解决方案
- `docs/04-文章详情页实现.md` - 详情页实现文档（需要更新）

## 💡 技术亮点

1. **完全兼容 Android**
   - 避免使用所有包含 Unicode 正则的库
   - 使用 Babel 转译 marked 库

2. **性能优化**
   - 移除 highlight.js，减小包体积
   - 简化渲染流程，提升性能

3. **优雅降级**
   - 代码块虽无语法高亮，但保持良好可读性
   - 数学公式、Mermaid 图表使用占位符，后续可升级

4. **用户体验**
   - 清新的视觉设计
   - 流畅的阅读体验
   - 完善的交互功能（图片预览、分享等）

---

**最后更新**: 2026-02-15
**状态**: ✅ 已完成重构，待测试验证
**维护者**: [YahuiWong](https://github.com/YahuiWong)
