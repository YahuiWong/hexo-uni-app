# Hexo UniApp 博客应用

<div align="center">

基于 **UniApp（Vue3 + TypeScript + uview-plus）** 的跨平台博客阅读应用，对接 Hexo 博客 OpenAPI。
支持 H5、微信小程序等多端运行。

[![CI](https://github.com/YahuiWong/hexo-uni-app/actions/workflows/deploy-weixin.yml/badge.svg)](https://github.com/YahuiWong/hexo-uni-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178c6.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6e9ad1.svg)](https://vitest.dev/)

</div>

## 📱 在线体验

作者已部署了一个微信小程序演示版，扫码即可在微信中体验完整功能：

<div align="center">
  <img src="./docs/qrcode.jpg" alt="小程序码" width="200" />
  <p><sub>微信扫码 · 体验作者演示版小程序</sub></p>
</div>

> **默认数据源**：本仓库默认连接作者的示例博客 `blog.yahui.wang`，clone 后即可运行。若要对接你自己的 Hexo 站点，复制 `.env.example` 为 `.env` 并设置 `VITE_API_BASE_URL=https://你的域名/api`；小程序端还需在 `src/manifest.json` 的 `mp-weixin.appid` 填入你自己的 AppID。

## 📸 应用截图

<div align="center">

| 首页 | 文章详情 | 夜间模式 |
|:---:|:---:|:---:|
| <sub>（截图待补充）</sub> | <sub>（截图待补充）</sub> | <sub>（截图待补充）</sub> |

<!--
补充方式：将手机/H5 截图放到 docs/screenshots/ 目录，例如：
| 首页 | 文章详情 | 夜间模式 |
|:---:|:---:|:---:|
| <img src="./docs/screenshots/home.png" width="200" /> | <img src="./docs/screenshots/detail.png" width="200" /> | <img src="./docs/screenshots/dark.png" width="200" /> |
-->

</div>

## ✨ 功能特性

- **首页**：轮播图（自动播放/点击跳转）+ 文章列表（分页加载、下拉刷新）
- **文章详情**：rich-text 富文本渲染、代码高亮、Mermaid 图表、图片预览、字数统计与阅读时间估算
- **分类 / 标签**：分类卡片列表 + 3D 标签云（基于文章数量动态大小）
- **归档**：时间轴展示历史文章
- **搜索**：全文搜索（标题/摘要）、历史记录、实时建议、结果高亮
- **夜间模式**：浅色/深色主题切换，全局 CSS 变量系统，自动保存偏好
- **分享**：微信好友 / 朋友圈分享（小程序端）
- **性能优化**：图片懒加载、分页加载、防抖节流、请求缓存
- **CI/CD**：GitHub Actions 自动构建并上传微信小程序

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | UniApp 3.x（Vue 3 Composition API） |
| 语言 | TypeScript |
| UI 组件库 | uview-plus |
| 构建工具 | Vite + pnpm |
| 单元测试 | Vitest + happy-dom |
| E2E 测试 | Playwright |

## 📂 项目结构

```
hexo-uni-app/
├── .github/                 # GitHub 配置（Actions 工作流、Issue/PR 模板）
├── docs/                    # 📚 技术文档（31 篇，编号命名）
│   ├── README.md            # 文档索引
│   └── ...                  # 01-项目架构 ~ 31-内容渲染功能完整总结
├── scripts/                 # 构建脚本（微信上传、代码混淆）
├── src/
│   ├── __tests__/           # Vitest 单元测试
│   ├── api/                 # API 接口封装
│   ├── composables/         # Vue Composables（主题、分享、懒加载）
│   ├── components/          # 公共组件（PostItem、LazyImage、SharePanel…）
│   ├── pages/               # 页面（首页/详情/分类/标签/归档/搜索/我的/关于）
│   ├── styles/              # 全局样式与主题变量
│   ├── types/               # TypeScript 类型定义
│   └── static/              # 静态资源（tabbar 图标等）
├── tests/e2e/               # Playwright E2E 测试
├── vite.config.ts           # Vite 配置
├── vitest.config.ts         # Vitest 配置
└── package.json
```

## 📚 技术文档

项目提供完整的技术文档（共 31 篇），入口见 [📖 文档索引](./docs/README.md)。精选：

| 文档 | 说明 |
|------|------|
| [🏗️ 项目架构](./docs/01-项目架构.md) | 整体架构、技术栈、设计模式、性能优化 |
| [🎨 UI 组件库集成](./docs/02-UI组件库集成.md) | uview-plus 配置、常见问题、最佳实践 |
| [📝 文章详情页实现](./docs/04-文章详情页实现.md) | rich-text 渲染、代码高亮、Mermaid |
| [🔗 URL 路由处理](./docs/03-URL路由处理.md) | 路由解析、多级 fallback 策略 |
| [🧪 测试框架集成](./docs/05-测试框架集成.md) | Vitest / Playwright 配置与编写规范 |
| [📱 小程序兼容性](./docs/06-小程序兼容性.md) | 平台兼容性问题与解决方案 |
| [🚀 微信小程序 CI 配置](./docs/20-微信小程序CI配置指南.md) | GitHub Actions 自动部署配置 |
| [🔒 代码混淆方案](./docs/21-代码混淆使用指南.md) | JavaScript 代码混淆保护（可选） |

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
# H5 开发（默认 http://localhost:5174/）
pnpm dev:h5

# 微信小程序（构建产物用微信开发者工具导入 dist/dev/mp-weixin）
pnpm dev:mp-weixin
```

### 运行测试

```bash
pnpm test          # 单元测试（Vitest，watch 模式）
pnpm test:run      # 单元测试（单次运行）
pnpm coverage      # 生成覆盖率报告
pnpm type-check    # TypeScript 类型检查

# E2E 测试（Playwright，需先启动 H5 开发服务器）
pnpm dev:h5        # 终端 1
pnpm test:e2e      # 终端 2
```

### 构建发布

```bash
pnpm build:h5           # H5 构建
pnpm build:mp-weixin    # 微信小程序构建
```

### 微信小程序自动部署

项目已配置 GitHub Actions CI/CD：

- **自动触发**：推送到 `main` 分支（`src/**`、`package.json`、`pnpm-lock.yaml` 变更时）自动构建并上传
- **手动触发**：在 Actions 页面手动运行，可指定版本号与描述

需在仓库 Settings → Secrets 中配置 `WEIXIN_APPID` 与 `WEIXIN_PRIVATE_KEY`（私钥以环境变量传入 CI，不落盘）。详见 [微信小程序 CI 配置指南](./docs/20-微信小程序CI配置指南.md)。

## 📡 API 接口说明

项目对接 Hexo 博客 OpenAPI：

| 接口 | 路径 |
|------|------|
| 轮播图 | `/api-blog/swiper.json` |
| 文章列表 | `/api-blog/posts/page.{page}.json` |
| 文章详情 | `/api-blog/posts/{path}.json` |
| 分类列表 | `/api-blog/categories.json` |
| 标签列表 | `/api-blog/tags.json` |
| 站点信息 | `/api-blog/site.json` |

开发环境通过 Vite 代理转发，生产环境通过 `VITE_API_BASE_URL` 环境变量配置。

## ⚠️ 注意事项

1. 确保后端 API 支持跨域或配置了正确的代理
2. 图片路径需要是完整的 URL
3. 富文本内容使用原生 `rich-text` 组件渲染（已替代 u-parse）
4. 小程序环境需在微信后台配置请求合法域名白名单
5. GitHub Actions 自动部署需要配置 `WEIXIN_APPID` 和 `WEIXIN_PRIVATE_KEY` secrets

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！贡献流程见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

[MIT License](./LICENSE) © YahuiWong

---

**最后更新**: 2026-09-11
**维护者**: [YahuiWong](https://github.com/YahuiWong)
