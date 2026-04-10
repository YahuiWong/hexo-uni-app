# 贡献指南

感谢您对本项目的关注和支持！本文档将帮助您了解如何参与项目的开发。

## 📋 目录

- [代码贡献流程](#代码贡献流程)
- [开发环境](#开发环境)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [问题反馈](#问题反馈)

## 代码贡献流程

1. **Fork 项目**
   ```bash
   # 访问 https://github.com/YahuiWong/hexo-uni-app
   # 点击 Fork 按钮
   ```

2. **克隆到本地**
   ```bash
   git clone https://github.com/your-username/hexo-uni-app.git
   cd hexo-uni-app
   ```

3. **创建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **开发并提交**
   ```bash
   # 开发您的功能
   git add .
   git commit -m "feat: 添加新功能"
   git push origin feature/your-feature-name
   ```

5. **提交 Pull Request**
   - 访问 GitHub 页面
   - 点击 "Compare & pull request"
   - 填写 PR 描述并提交

## 开发环境

### 前置要求

- Node.js >= 18
- pnpm >= 8
- UniApp CLI

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin
```

### 代码检查

```bash
# TypeScript 类型检查
pnpm check

# ESLint 检查
pnpm lint

# 单元测试
pnpm test
```

### 构建生产

```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:mp-weixin
```

## 代码规范

### JavaScript/TypeScript 规范

- 遵循 [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- 使用 TypeScript 严格模式
- 函数命名使用 camelCase
- 类名使用 PascalCase
- 常量使用 UPPER_SNAKE_CASE

### Vue 组件规范

- 使用 `<script setup>` 语法
- Props 定义类型
- 使用 `defineEmits` 声明事件
- 组件名使用 PascalCase

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建过程或辅助工具变动

#### 示例

```
feat(api): 添加搜索功能
fix(post): 修复文章详情页日期显示问题
docs(readme): 更新安装说明
refactor(utils): 提取日期格式化函数
```

## 问题反馈

### 报告 Bug

创建 Issue 时请包含：

1. **标题**：简洁描述问题
2. **环境信息**：
   - 操作系统
   - 浏览器/微信版本
   - 项目版本
3. **复现步骤**：详细的步骤
4. **预期结果**：期望的行为
5. **实际结果**：实际发生的行为
6. **截图/日志**：如有

### 请求新功能

创建 Issue 时请包含：

1. **功能描述**：清晰描述
2. **使用场景**：为什么需要
3. **可能的实现方案**（可选）

## 质量保证

### 测试要求

- 新功能必须包含测试
- Bug 修复必须包含回归测试
- 测试覆盖率保持在 80% 以上

### 代码审查

所有 PR 需要通过：

- CI 自动检查（测试、类型检查）
- 代码审查
- 合并前解决所有评论

## 许可证

本项目采用 [MIT 许可证](../LICENSE)。贡献意味着您同意将您的贡献按照同一许可证授权。

## 联系方式

- GitHub Issues: [https://github.com/YahuiWong/hexo-uni-app/issues](https://github.com/YahuiWong/hexo-uni-app/issues)
- Email: yahui.wong@example.com

---

感谢您的贡献！ 🎉
