# uview-plus 集成指南

本文档详细介绍如何在 UniApp 项目中集成和使用 uview-plus UI 组件库。

## 📋 目录

- [安装配置](#安装配置)
- [easycom 配置](#easycom-配置)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

---

## 安装配置

### 1. 安装依赖

```bash
pnpm add uview-plus
```

### 2. 在 main.ts 中引入

```typescript
import { createSSRApp } from 'vue';
import App from './App.vue';
import uviewPlus from 'uview-plus';

export function createApp() {
  const app = createSSRApp(App);
  app.use(uviewPlus);  // 必须在 createSSRApp 之后调用
  return { app };
}
```

**注意事项：**
- ✅ 必须使用 `createSSRApp` 而不是 `createApp`
- ✅ 必须在创建 app 实例后立即调用 `app.use(uviewPlus)`
- ❌ 不要在组件中单独引入 uview-plus

---

## easycom 配置

### 配置文件位置

`src/pages.json`

### 完整配置

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      // 支持 u-parse、u-button 等标准组件
      "^u-(.*)": "uview-plus/components/u-$1/u-$1.vue",
      // 支持 up- 前缀组件，映射到 u- 组件（uview-plus 内部兼容）
      "^up-(.*)": "uview-plus/components/u-$1/u-$1.vue",
      // 支持 u-- 前缀（部分特殊组件）
      "^u--(.*)": "uview-plus/components/u-$1/u-$1.vue"
    }
  }
}
```

### 配置说明

| 前缀 | 映射规则 | 示例 | 说明 |
|------|---------|------|------|
| `u-` | `u-$1/u-$1.vue` | `<u-button>` → `u-button/u-button.vue` | 标准组件 |
| `up-` | `u-$1/u-$1.vue` | `<up-icon>` → `u-icon/u-icon.vue` | ⚠️ 映射到 u- 组件 |
| `u--` | `u-$1/u-$1.vue` | `<u--input>` → `u-input/u-input.vue` | 特殊组件 |

**关键修复：** `up-icon` 必须映射到 `u-icon`，因为 uview-plus 内部没有 `up-icon` 目录。

---

## 常见问题

### 问题 1: up-icon 组件导入失败

**错误信息：**
```
Failed to resolve import "uview-plus/components/up-icon/up-icon.vue"
Does the file exist?
```

**原因：**
uview-plus 组件库内部只有 `u-icon` 目录，没有 `up-icon` 目录，但某些内部组件（如 `u-button`）使用了 `<up-icon>`。

**解决方案：**
修改 `pages.json` 中的 easycom 配置：

```json
// ❌ 错误配置
"^up-(.*)": "uview-plus/components/up-$1/up-$1.vue"

// ✅ 正确配置
"^up-(.*)": "uview-plus/components/u-$1/u-$1.vue"
```

**验证：**
检查 uview-plus 组件目录：
```bash
ls node_modules/uview-plus/components/ | grep icon
# 输出:
# u-icon
# u-loading-icon
# ❌ 没有 up-icon
```

**测试代码：**
```vue
<template>
  <u-button type="primary" icon="checkmark">测试按钮</u-button>
</template>
```

如果配置正确，按钮应该正常显示图标。

### 问题 2: 组件样式不生效

**原因：**
- 未正确引入 uview-plus
- easycom 配置错误
- 使用了不支持的组件名

**检查清单：**
1. ✅ 确认已在 main.ts 中使用 `app.use(uviewPlus)`
2. ✅ 确认 easycom 配置正确
3. ✅ 确认组件名符合规范
4. ✅ 清除缓存：`rm -rf node_modules/.vite`

---

## 最佳实践

### 1. 组件命名规范

```vue
<!-- ✅ 推荐：使用 u- 前缀 -->
<u-button type="primary">按钮</u-button>
<u-icon name="checkmark" />
<u-loading-icon mode="spinner" />

<!-- ❌ 不推荐：避免使用 up- 前缀 -->
<up-button>按钮</up-button>
<up-icon name="checkmark" />
```

### 2. 常用组件示例

#### 按钮组件

```vue
<template>
  <u-button
    type="primary"
    size="normal"
    :loading="isLoading"
    @click="handleClick"
  >
    确定
  </u-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(false);

const handleClick = () => {
  isLoading.value = true;
  // 执行操作...
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
};
</script>
```

#### 图标组件

```vue
<template>
  <view class="icon-demo">
    <!-- 基础用法 -->
    <u-icon name="checkmark" size="24" color="#007aff" />

    <!-- 自定义样式 -->
    <u-icon
      name="close"
      size="32"
      color="#ff3b30"
      :custom-style="{ marginLeft: '10rpx' }"
    />
  </view>
</template>
```

#### 加载图标

```vue
<template>
  <view v-if="loading" class="loading">
    <u-loading-icon mode="spinner" size="40" color="#007aff" />
    <text class="loading-text">加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(true);
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text {
  margin-top: 20rpx;
  color: #999;
}
</style>
```

### 3. TypeScript 支持

uview-plus 提供了 TypeScript 类型定义，但需要正确配置：

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@dcloudio/types", "uview-plus"]
  }
}
```

### 4. 按需引入（不推荐）

uview-plus 推荐使用 easycom 自动引入，无需手动按需引入。

```vue
<!-- ❌ 不推荐：手动引入 -->
<script setup lang="ts">
import UButton from 'uview-plus/components/u-button/u-button.vue';
</script>

<!-- ✅ 推荐：easycom 自动引入 -->
<template>
  <u-button>按钮</u-button>
</template>
```

---

## 性能优化

### 1. 减少不必要的组件使用

```vue
<!-- ❌ 过度使用组件 -->
<u-icon name="checkmark" />
<u-icon name="close" />
<u-icon name="arrow-right" />

<!-- ✅ 使用原生或自定义图标 -->
<view class="icon checkmark"></view>
<view class="icon close"></view>
```

### 2. 懒加载重组件

对于复杂组件（如 u-calendar），考虑懒加载：

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const UCalendar = defineAsyncComponent(
  () => import('uview-plus/components/u-calendar/u-calendar.vue')
);
</script>
```

---

## 调试技巧

### 1. 检查组件是否正确加载

```javascript
// 在浏览器控制台执行
console.log(uni.$u);  // 应该输出 uview-plus 的全局对象
```

### 2. 查看组件文档

```bash
# 在项目根目录执行
open node_modules/uview-plus/README.md
```

### 3. 查看可用图标

访问 uview-plus 官方文档查看所有可用图标：
https://uview-plus.jiangruyi.com/components/icon.html

---

## 参考资源

- [uview-plus 官方文档](https://uview-plus.jiangruyi.com/)
- [UniApp easycom 文档](https://uniapp.dcloud.net.cn/collocation/pages.html#easycom)
- [uview-plus GitHub](https://github.com/ijry/uview-plus)

---

**最后更新**: 2024-12-27
**维护者**: [YahuiWong](https://github.com/YahuiWong)
**版本**: uview-plus 3.6.29
