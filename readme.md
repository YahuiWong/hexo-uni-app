# Hexo UniApp 博客应用

基于 UniApp（Vue3 + TypeScript + uview-plus）的跨平台博客阅读应用，使用 **blog.yahui.wang** 的 OpenAPI 接口。

## 功能特性

### ✅ 已完成功能

1. **首页功能**
   - 精美轮播图展示（支持自动播放、点击跳转）
   - 文章列表展示（支持分页加载）
   - 快速导航（分类、标签入口）
   - 加载状态提示和空状态处理
   - 下拉刷新、加载更多

2. **文章详情页**
   - ✨ **新版重构**：完全重写的详情页面
   - rich-text 组件渲染（替代 u-parse，更稳定）
   - 自动 HTML 样式处理（图片、代码块、标题等）
   - 图片预览功能
   - 字数统计和阅读时间估算
   - 文章元信息展示（发布/更新时间、标签、分类）
   - 文章摘要显示
   - 完整的错误处理和重试功能
   - 响应式布局优化

3. **分类页面**
   - 分类列表展示
   - 文章数量统计
   - 卡片式交互设计
   - 空状态处理

4. **标签页面**
   - 标签云展示
   - 基于文章数量的动态大小
   - 多彩配色方案
   - 空状态处理

5. **组件优化**
   - PostItem 卡片组件
   - 支持封面图、标签、分类显示
   - 智能日期格式化（今天、昨天、N天前等）
   - 图片懒加载

6. **CI/CD 自动部署**
   - GitHub Actions 自动化工作流
   - 推送代码自动构建和上传微信小程序
   - 支持手动触发部署，可指定版本号
   - 完整的错误处理和日志输出

7. **搜索功能**
   - 全文搜索（标题、摘要）
   - 搜索历史记录
   - 实时搜索建议
   - 搜索结果高亮

8. **夜间模式**
   - 浅色/深色主题切换
   - 自动保存主题设置
   - 全局 CSS 变量系统
   - 平滑过渡动画

## 技术栈

- UniApp 3.x（Vue3 Composition API）
- TypeScript 4.9
- uview-plus 3.6.29（UI 组件库）
- Vite 5.2（构建工具）
- pnpm（包管理器）
- **Vitest 4.0**（单元测试框架）
- **Happy-DOM**（测试环境）

## 项目结构

```
hexo-uni-app/
├── .github/               # GitHub 配置
│   └── workflows/         # GitHub Actions 工作流
│       └── deploy-weixin.yml  # 微信小程序自动部署
├── docs/                  # 📚 技术文档
│   ├── README.md          # 文档索引
│   ├── architecture.md    # 项目架构文档
│   ├── uview-plus-integration.md  # UI库集成指南
│   ├── post-detail-page.md        # 详情页实现文档
│   ├── vitest-testing.md          # 测试框架文档
│   ├── url-routing.md             # URL路由处理文档
│   ├── 20-微信小程序CI配置指南.md  # CI/CD配置文档
│   └── 21-代码混淆使用指南.md      # 代码混淆文档
├── scripts/               # 构建脚本
│   ├── upload-weixin.js   # 微信小程序上传脚本
│   └── obfuscate.js       # 代码混淆脚本（可选）
├── src/
│   ├── __tests__/         # 测试文件
│   │   ├── detail.test.ts # 详情页测试（30个用例）
│   │   └── postitem.test.ts # PostItem测试（14个用例）
│   ├── api/               # API 接口封装
│   │   └── index.ts       # 博客 API
│   ├── composables/       # Vue Composables
│   │   └── useTheme.ts    # 主题管理
│   ├── components/        # 公共组件
│   │   └── PostItem.vue   # 文章卡片组件
│   ├── pages/             # 页面
│   │   ├── index/         # 首页（轮播图+文章列表）
│   │   ├── post/          # 文章详情页
│   │   ├── category/      # 分类列表页 + 文章列表
│   │   ├── tag/           # 标签列表页 + 文章列表
│   │   ├── search/        # 搜索页面
│   │   ├── mine/          # 我的页面
│   │   └── about/         # 关于页面
│   ├── styles/            # 全局样式
│   │   └── theme.css      # 主题样式（CSS 变量）
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.vue            # 应用入口
│   ├── main.ts            # 主入口文件
│   └── pages.json         # 页面配置（含 easycom）
├── vitest.config.ts       # Vitest 测试配置
├── vite.config.ts         # Vite 配置
├── package.json
└── README.md
```

## 📚 技术文档

本项目提供了完整的技术文档，帮助开发者快速理解和上手：

| 文档 | 说明 |
|------|------|
| [📖 文档索引](./docs/README.md) | 所有文档的导航入口 |
| [🏗️ 项目架构](./docs/architecture.md) | 整体架构、技术栈、设计模式、性能优化 |
| [🎨 uview-plus 集成](./docs/uview-plus-integration.md) | UI组件库配置、常见问题、最佳实践 |
| [📝 文章详情页](./docs/post-detail-page.md) | 详情页重构、富文本渲染、功能实现 |
| [🔗 URL 路由处理](./docs/url-routing.md) | 路由解析、多级fallback策略 |
| [🧪 Vitest 测试](./docs/vitest-testing.md) | 测试框架配置、编写规范、调试技巧 |
| [📱 小程序兼容性](./docs/miniprogram-compatibility.md) | 小程序平台兼容性问题和解决方案 |
| [🚀 微信小程序CI配置](./docs/20-微信小程序CI配置指南.md) | GitHub Actions自动部署配置 |
| [🔒 代码混淆方案](./docs/21-代码混淆使用指南.md) | JavaScript代码混淆保护（可选） |
| [🌙 夜间模式实现](./docs/22-夜间模式实现指南.md) | 深色模式/主题切换实现方案 |

**推荐阅读顺序**：架构文档 → uview-plus集成 → URL路由 → 测试文档

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
# H5 开发
pnpm dev:h5

# 微信小程序
pnpm dev:mp-weixin

# 支付宝小程序
pnpm dev:mp-alipay

# 其他平台...
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试（单次）
pnpm test:run

# 运行测试 UI
pnpm test:ui

# 生成测试覆盖率报告
pnpm coverage
```

### 构建发布

```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:mp-weixin
```

### 微信小程序自动部署

项目已配置 GitHub Actions CI/CD，支持自动构建和上传到微信小程序平台：

**自动触发**：推送代码到 `main` 分支时自动构建和上传

**手动触发**：在 GitHub Actions 页面手动触发，可指定版本号和描述

详细配置步骤请查看：[微信小程序CI配置指南](./docs/20-微信小程序CI配置指南.md)

## API 接口说明

项目使用的 API 接口：

- 轮播图：`/api-blog/swiper.json`
- 文章列表：`/api-blog/posts/page.{page}.json`
- 文章详情：`/api-blog/posts/{path}.json`
- 分类列表：`/api-blog/categories.json`
- 标签列表：`/api-blog/tags.json`
- 站点信息：`/api-blog/site.json`

开发环境通过 Vite 代理到 `https://blog.yahui.wang`，生产环境需修改 `src/api/index.ts` 中的 `BASE_URL`。

## 已解决的问题

1. ✅ **uview-plus 组件导入错误**（`up-icon` 映射问题）
   - 问题：`up-icon` 组件无法找到
   - 解决：修正 easycom 配置，将 `up-` 前缀映射到 `u-` 组件
   - 详见：[uview-plus 集成文档](./docs/uview-plus-integration.md)

2. ✅ **文章详情页重构**（移除 u-parse，使用 rich-text）
   - 问题：u-parse 组件不稳定，缺少字数统计等功能
   - 解决：使用原生 rich-text 组件，添加完整功能
   - 详见：[文章详情页文档](./docs/post-detail-page.md)

3. ✅ **文章 URL 路由处理**（第一篇文章无法打开）
   - 问题：部分文章缺少 `url` 字段导致无法跳转
   - 解决：实现多级 fallback 策略（url → api → date+slug → slug）
   - 详见：[URL 路由处理文档](./docs/url-routing.md)

4. ✅ **完整的测试覆盖**（44 个测试用例全部通过）
   - 添加 Vitest 测试框架
   - 覆盖核心功能：URL 解析、日期格式化、字数统计、HTML 处理等
   - 详见：[Vitest 测试文档](./docs/vitest-testing.md)

5. ✅ **easycom 配置优化**
6. ✅ **页面样式和交互优化**
7. ✅ **加载状态和错误处理**

8. ✅ **GitHub Actions CI/CD 配置**（微信小程序自动部署）
   - 问题：需要手动构建和上传微信小程序
   - 解决：配置 GitHub Actions 自动化工作流
   - 详见：[微信小程序CI配置指南](./docs/20-微信小程序CI配置指南.md)

9. ✅ **miniprogram-ci 上传错误**（lru-cache 构造函数错误）
   - 问题：`_lruCache is not a constructor` 错误
   - 解决：禁用 miniprogram-ci 编译优化，由 UniApp 处理编译
   - 详见：[微信小程序CI配置指南](./docs/20-微信小程序CI配置指南.md)

10. ✅ **3D标签云小程序兼容性**（正式版加载失败）
    - 问题：requestAnimationFrame 在小程序中不完全支持
    - 解决：添加 setTimeout 降级方案，增强错误提示
    - 详见：[小程序兼容性文档](./docs/06-小程序兼容性.md)

## 开发进度

- [x] 项目初始化和配置
- [x] uview-plus 集成和配置修复
- [x] 首页（轮播图 + 文章列表）
- [x] 文章详情页（富文本渲染）**已重构**
- [x] 分类列表页
- [x] 标签列表页
- [x] PostItem 组件优化（多级 URL fallback）
- [x] **Vitest 测试集成**（44 个测试用例）
- [x] **详情页面完全重构**（rich-text + 字数统计）
- [x] **URL 路由处理优化**（解决文章无法打开问题）
- [x] **技术文档编写**（6 份完整文档）
- [x] **GitHub Actions CI/CD 配置**（自动构建上传微信小程序）
- [x] **小程序兼容性修复**（3D标签云、requestAnimationFrame）
- [x] **分类文章列表页**（完整实现）
- [x] **标签文章列表页**（完整实现）
- [x] **搜索功能**（全文搜索 + 历史记录）
- [x] **夜间模式**（深色/浅色主题切换）
- [ ] 评论功能集成（可选）

## 测试覆盖

### 已完成的测试

#### 详情页测试 (`src/__tests__/detail.test.ts`) - 30 个用例

- ✅ URL 路径解析测试（6个测试）
- ✅ 日期格式化测试（5个测试）
- ✅ 字数统计测试（4个测试）
- ✅ 阅读时间计算测试（5个测试）
- ✅ HTML 内容处理测试（5个测试）
- ✅ 数据结构验证测试（2个测试）
- ✅ 边界情况测试（3个测试）

#### PostItem 组件测试 (`src/__tests__/postitem.test.ts`) - 14 个用例

- ✅ 使用 url 字段构建 URL（1个测试）
- ✅ 从 api 字段提取 URL（2个测试）
- ✅ 根据 date + slug 构建 URL（3个测试）
- ✅ 仅使用 slug 构建 URL（2个测试）
- ✅ 边界情况处理（3个测试）
- ✅ 真实数据测试（3个测试）

**总计：44 个测试用例 - 全部通过 ✅**

查看详细测试文档：[Vitest 测试文档](./docs/vitest-testing.md)

## 访问地址

开发服务器：http://localhost:5174/

## 注意事项

1. 确保后端 API 支持跨域或配置了正确的代理
2. 图片路径需要是完整的 URL
3. 富文本内容使用原生 `rich-text` 组件渲染（已替代 u-parse）
4. 小程序环境需要配置域名白名单（将 `https://blog.yahui.wang` 添加到请求合法域名）
5. 部分文章可能缺少 `url` 字段，已通过多级 fallback 策略处理
6. GitHub Actions 自动部署需要配置 `WEIXIN_APPID` 和 `WEIXIN_PRIVATE_KEY` secrets
7. 3D 标签云在小程序中使用 setTimeout 降级方案，确保兼容性

## 参考链接

### 官方文档
- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 官方文档](https://vuejs.org/)
- [uview-plus 文档](https://uview-plus.jiangruyi.com/)
- [Vitest 官方文档](https://vitest.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)

### 项目文档
- [📚 技术文档目录](./docs/README.md)
- [🏗️ 项目架构文档](./docs/architecture.md)
- [🎨 uview-plus 集成指南](./docs/uview-plus-integration.md)
- [📝 文章详情页实现](./docs/post-detail-page.md)
- [🔗 URL 路由处理](./docs/url-routing.md)
- [🧪 Vitest 测试文档](./docs/vitest-testing.md)
- [📱 小程序兼容性文档](./docs/miniprogram-compatibility.md)

### API 接口
- [博客 OpenAPI](https://blog.yahui.wang/api/openapi.json)

---

**最后更新**: 2025-12-28
**维护者**: [YahuiWong](https://github.com/YahuiWong)
**版本**: v1.1.0
