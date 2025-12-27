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
├── src/
│   ├── api/              # API 接口封装
│   │   └── index.ts      # 博客 API
│   ├── components/       # 公共组件
│   │   └── PostItem.vue  # 文章卡片组件
│   ├── pages/            # 页面
│   │   ├── index/        # 首页（轮播图+文章列表）
│   │   ├── post/         # 文章详情页
│   │   ├── category/     # 分类列表页
│   │   └── tag/          # 标签列表页
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.vue           # 应用入口
│   ├── main.ts           # 主入口文件
│   └── pages.json        # 页面配置（含 easycom）
├── vite.config.ts        # Vite 配置
├── package.json
└── README.md
```

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

1. ✅ uview-plus 组件导入错误（`up-icon` 映射问题）
2. ✅ easycom 配置优化
3. ✅ 页面样式和交互优化
4. ✅ 加载状态和错误处理
5. ✅ **文章详情页重构**（移除 u-parse，使用 rich-text）
6. ✅ **完整的测试覆盖**（30+ 测试用例全部通过）

## 开发进度

- [x] 项目初始化和配置
- [x] uview-plus 集成
- [x] 首页（轮播图 + 文章列表）
- [x] 文章详情页（富文本渲染）**已重构**
- [x] 分类列表页
- [x] 标签列表页
- [x] PostItem 组件优化
- [x] **Vitest 测试集成**（30+ 测试用例）
- [x] **详情页面完全重构**
- [ ] 分类文章列表页（待开发）
- [ ] 标签文章列表页（待开发）
- [ ] 搜索功能（待开发）
- [ ] 夜间模式（待开发）

## 测试覆盖

### 已完成的测试

- ✅ URL 路径解析测试（6个测试）
- ✅ 日期格式化测试（5个测试）
- ✅ 字数统计测试（4个测试）
- ✅ 阅读时间计算测试（5个测试）
- ✅ HTML 内容处理测试（5个测试）
- ✅ 数据结构验证测试（2个测试）
- ✅ 边界情况测试（3个测试）

**总计：30 个测试用例 - 全部通过 ✅**

## 访问地址

开发服务器：http://localhost:5174/

## 注意事项

1. 确保后端 API 支持跨域或配置了正确的代理
2. 图片路径需要是完整的 URL
3. 富文本内容建议使用 u-parse 组件渲染
4. 小程序环境需要配置域名白名单

## 参考链接

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [uview-plus 文档](https://uview-plus.jiangruyi.com/)
- [博客 OpenAPI](https://blog.yahui.wang/api/openapi.json)
