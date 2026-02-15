# Mermaid 和 KaTeX 渲染方案说明

## 📊 当前状态

### ✅ 已实现功能

1. **代码语法高亮** - Prism.js + Okaidia 黑客主题
   - ✅ 全平台支持（H5 + 小程序）
   - ✅ 10+ 编程语言支持
   - ✅ Android 兼容
   - ✅ 85/85 单元测试通过

### ⚠️ 限制功能

2. **Mermaid 图表** - 仅占位符
   - 显示为蓝色背景的文本块
   - 不渲染为实际图形

3. **KaTeX 数学公式** - 仅占位符
   - 显示为紫色背景的 LaTeX 文本
   - 不渲染为数学符号

## 🔍 问题分析

### 为什么 Mermaid 难以集成？

Mermaid 11.x 有 **50+ 个依赖包**，包括：
- `@mermaid-js/parser`, `cytoscape`, `d3`（及其30+子包）
- `dagre-d3-es`, `dompurify`, `elkjs`, `khroma`
- `langium`, `roughjs`, `stylis`, `uuid`
- 等等...

**问题**：
1. 依赖链太长，构建时需要解析所有依赖
2. 即使使用动态导入，Vite 仍会在构建时分析模块
3. 逐个安装依赖不现实（已尝试安装40+个包仍未完成）
4. 会显著增加包体积（Mermaid 核心 > 2MB）

## 🎯 推荐方案

### 方案一：服务端预渲染（最佳）⭐

在 Hexo 生成博客时就完成渲染，前端直接显示 HTML/SVG。

**优点**：
- ✅ 零运行时成本
- ✅ 100% 兼容所有平台
- ✅ 完美的渲染效果
- ✅ 无需客户端依赖

**实现步骤**：

1. 安装 Hexo 插件：
```bash
npm install hexo-filter-mermaid-diagrams --save
npm install hexo-renderer-markdown-it-plus --save
```

2. 在 Hexo `_config.yml` 中配置：
```yaml
# Mermaid 配置
mermaid:
  enable: true
  theme: dark

# Markdown 渲染器配置
markdown_it_plus:
  plugins:
    - markdown-it-katex
```

3. 重新生成博客：
```bash
hexo clean
hexo generate
```

4. API 返回的 HTML 中，Mermaid 已经是 SVG 图形，KaTeX 已经是渲染好的公式

**效果**：客户端无需任何处理，直接显示即可。

---

### 方案二：H5 使用 CDN（次优）

仅在 H5 平台通过 CDN 加载 Mermaid。

**优点**：
- ✅ H5 端可以渲染
- ✅ 不增加构建复杂度
- ✅ 按需加载

**缺点**：
- ❌ 小程序端不可用
- ❌ 依赖外部 CDN

**实现**（未实施）：
在 `index.html` 中添加：
```html
<!-- Mermaid CDN -->
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<!-- KaTeX CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.js"></script>
```

---

### 方案三：使用在线图片服务

将 Mermaid 代码发送到在线服务生成图片。

**示例服务**：
- Mermaid Ink: `https://mermaid.ink/img/[base64编码的代码]`
- Kroki: `https://kroki.io/mermaid/svg/[base64编码的代码]`

**优点**：
- ✅ 简单易用
- ✅ 全平台兼容

**缺点**：
- ❌ 依赖外部服务
- ❌ 需要网络请求
- ❌ 隐私问题（代码发送到第三方）

---

## 📋 当前实现

### 文件说明

1. **`src/utils/md2html-safe.ts`**
   - ✅ Prism.js 代码高亮（完美工作）
   - ✅ Mermaid 占位符 `<div class="mermaid">...</div>`
   - ✅ KaTeX 占位符 `<div class="math-block">$$...$$</div>`

2. **`src/utils/content-renderer.ts`**
   - ⚠️ 包含 Mermaid/KaTeX 渲染代码
   - ⚠️ 但因依赖问题无法构建
   - ⚠️ 建议暂时不使用

3. **`src/pages/post/detail.vue`** 和 **`detailraw.vue`**
   - ✅ 代码高亮正常显示
   - ⚠️ Mermaid 显示为蓝色文本块
   - ⚠️ KaTeX 显示为紫色文本块

### 用户体验

**当前效果**：
```
┌─────────────────────────────┐
│ Mermaid 代码（蓝色背景）     │
│ graph TD                     │
│   A-->B                      │
└─────────────────────────────┘
```

**期望效果（需要服务端预渲染）**：
```
┌─────────────────────────────┐
│     ┌───┐                   │
│     │ A │                   │
│     └─┬─┘                   │
│       │                     │
│       ▼                     │
│     ┌───┐                   │
│     │ B │                   │
│     └───┘                   │
└─────────────────────────────┘
```

---

## 🚀 推荐行动

### 立即行动

1. ✅ **提交当前代码**
   - 代码高亮功能完美
   - Mermaid/KaTeX 显示占位符
   - 文档说明限制

2. ✅ **更新文档**
   - 说明当前状态
   - 提供解决方案

### 后续优化（可选）

1. **Hexo 端配置**
   - 安装 hexo-filter-mermaid-diagrams
   - 安装 hexo-renderer-markdown-it-plus
   - 配置服务端预渲染

2. **验证效果**
   - 重新生成博客
   - 验证 API 返回的 HTML 包含渲染好的 SVG
   - 客户端直接显示

---

## 📊 对比总结

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| 服务端预渲染 | 零成本、完美兼容 | 需要修改 Hexo 配置 | ⭐⭐⭐⭐⭐ |
| H5 CDN | 简单实现 | 仅 H5 可用 | ⭐⭐⭐ |
| 在线图片服务 | 全平台兼容 | 依赖外部服务 | ⭐⭐ |
| NPM 打包（当前尝试）| 完全客户端 | 依赖太多，无法构建 | ❌ |

---

## ✅ 结论

**最佳方案**：在 Hexo 端配置 Mermaid 和 KaTeX 的服务端预渲染

- 客户端无需任何修改
- 性能最优
- 兼容性最好
- 维护成本最低

**当前状态**：
- 代码高亮 ✅ 完美工作 (Prism.js + Okaidia 主题)
- Mermaid ⚠️ 占位符（需要 Hexo 配置）
- KaTeX ⚠️ 占位符（需要 Hexo 配置）

**尝试过的方案**：
- ❌ 客户端 NPM 打包 Mermaid - 依赖太多（50+包），无法构建
- ❌ towxml 集成 - 仅支持微信小程序 WXML，不支持 uni-app，且不支持 Mermaid

**详细配置步骤**: 参见 [30-Hexo服务端Mermaid配置指南.md](./30-Hexo服务端Mermaid配置指南.md)

---

**文档创建时间**: 2026-02-15
**最后更新**: 2026-02-15
**状态**: 方案确定，推荐使用服务端预渲染
