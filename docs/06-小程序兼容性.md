# 小程序兼容性问题文档

本文档记录项目在微信小程序等平台的兼容性问题和解决方案。

## 📋 目录

- [事件处理器参数传递问题](#事件处理器参数传递问题)
- [其他兼容性注意事项](#其他兼容性注意事项)

---

## 事件处理器参数传递问题

### 问题描述

**错误信息**:
```
vendor.js? [sm]:12 TypeError: Cannot read property 'url' of undefined
```

**复现场景**:
- 在微信小程序中点击文章列表项
- 尝试跳转到文章详情页时报错

**问题原因**:

在 H5 环境和小程序环境中，事件处理器的参数传递机制不同：

```vue
<!-- ❌ 在小程序中可能失败 -->
<view @click="toDetail(post)">
  {{ post.title }}
</view>

<script setup>
const toDetail = (post) => {
  // 在小程序中，post 可能是 undefined
  console.log(post.url); // TypeError: Cannot read property 'url' of undefined
};
</script>
```

**技术原因**:
- 在 H5 中，`@click="toDetail(post)"` 会正确传递 `post` 参数
- 在微信小程序中，由于编译机制的差异，参数传递可能失败
- 小程序的事件处理器更倾向于使用 `event` 对象或通过 `props` 访问数据

### 解决方案

#### 方案一：直接使用 props（推荐）

```vue
<template>
  <!-- ✅ 不传递参数 -->
  <view class="post-item" @click="toDetail">
    {{ post.title }}
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  post: {
    title: string;
    url?: string;
    slug?: string;
    // ...其他字段
  };
}>();

// ✅ 直接使用 props.post
const toDetail = () => {
  const post = props.post;

  if (!post) {
    console.error('文章数据为空');
    return;
  }

  // 访问文章数据
  console.log(post.url);

  // 跳转逻辑...
};
</script>
```

**优点**:
- ✅ H5 和小程序环境都兼容
- ✅ 代码更简洁
- ✅ 类型安全（TypeScript）
- ✅ 避免参数传递问题

#### 方案二：使用 data 属性（小程序专用）

```vue
<template>
  <!-- 使用 data-* 传递数据 -->
  <view
    class="post-item"
    :data-url="post.url"
    :data-slug="post.slug"
    @click="toDetail"
  >
    {{ post.title }}
  </view>
</template>

<script setup>
const toDetail = (e: any) => {
  // 从事件对象获取数据
  const { url, slug } = e.currentTarget.dataset;
  console.log(url, slug);
};
</script>
```

**缺点**:
- ❌ 需要传递多个属性时很繁琐
- ❌ 只能传递简单数据类型（字符串、数字等）
- ❌ 不推荐用于复杂对象

### 实际修复示例

在 PostItem 组件中的修复：

**修复前**:
```vue
<template>
  <view class="post-item" @click="toDetail(post)">
    <!-- ... -->
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ post: any }>();

const toDetail = (post: any) => {
  // ❌ 小程序中 post 可能是 undefined
  let targetUrl = post.url;
  // ...
};
</script>
```

**修复后**:
```vue
<template>
  <view class="post-item" @click="toDetail">
    <!-- ... -->
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ post: any }>();

const toDetail = () => {
  // ✅ 直接使用 props.post
  const post = props.post;

  if (!post) {
    console.error('文章数据为空');
    uni.showToast({ title: '文章数据错误', icon: 'none' });
    return;
  }

  let targetUrl = post.url;
  // ...
};
</script>
```

### 测试验证

修复后运行测试：

```bash
pnpm test:run
```

**测试结果**:
```
✓ src/__tests__/postitem.test.ts (14 tests) 6ms
✓ src/__tests__/detail.test.ts (30 tests) 10ms

Test Files  2 passed (2)
     Tests  44 passed (44)
  Duration  687ms
```

所有 44 个测试用例全部通过 ✅

---

## 其他兼容性注意事项

### 1. 样式差异

小程序和 H5 的样式渲染可能有差异：

```scss
/* ❌ 小程序可能不支持 */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* ✅ 使用 flex 更兼容 */
.container {
  display: flex;
  flex-wrap: wrap;
}
```

### 2. API 差异

部分 API 在不同平台行为不同：

```typescript
// ✅ 使用条件编译
// #ifdef H5
console.log('H5 环境');
// #endif

// #ifdef MP-WEIXIN
console.log('微信小程序环境');
// #endif

// ✅ 使用 uni.getSystemInfoSync() 判断平台
const systemInfo = uni.getSystemInfoSync();
console.log(systemInfo.platform); // 'ios', 'android', 'windows', 'mac'
```

### 3. 生命周期差异

```typescript
import { onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';

// H5 环境
onMounted(() => {
  console.log('组件挂载');
});

// 小程序环境（推荐同时使用）
onLoad(() => {
  console.log('页面加载');
});

onShow(() => {
  console.log('页面显示');
});
```

### 4. 路由传参限制

小程序对 URL 长度有限制：

```typescript
// ❌ 可能超出长度限制
uni.navigateTo({
  url: `/pages/detail?data=${JSON.stringify(largeObject)}`
});

// ✅ 使用全局状态或本地存储
import { ref } from 'vue';

const globalData = ref<any>(null);

// 页面 A
globalData.value = largeObject;
uni.navigateTo({ url: '/pages/detail?id=123' });

// 页面 B
const data = globalData.value;
```

### 5. rich-text 组件差异

```vue
<!-- ✅ 基础 HTML 标签支持良好 -->
<rich-text :nodes="htmlContent" />

<!-- ❌ 复杂样式可能不支持 -->
<!-- 如：CSS Grid、Flexbox、复杂选择器等 -->

<!-- 解决方案：使用行内样式 -->
<rich-text :nodes="processedContent" />
```

---

## 最佳实践总结

### 1. 事件处理

```vue
<!-- ✅ 推荐 -->
<view @click="handleClick">

<!-- ❌ 避免在小程序中使用 -->
<view @click="handleClick(param)">
```

### 2. 数据传递

```typescript
// ✅ 通过 props
const props = defineProps<{ data: any }>();

// ✅ 通过全局状态
import { reactive } from 'vue';
export const store = reactive({ data: null });

// ❌ 通过 URL 参数（数据量大时）
```

### 3. 样式编写

```scss
// ✅ 使用 rpx 单位
.container {
  width: 750rpx;
  padding: 20rpx;
}

// ✅ 使用 flex 布局
.flex-container {
  display: flex;
  justify-content: space-between;
}

// ❌ 避免使用不兼容的 CSS
.grid-container {
  display: grid; // 小程序可能不支持
}
```

### 4. API 调用

```typescript
// ✅ 统一使用 uni API
uni.request({ url: '/api/data' });
uni.showToast({ title: '提示' });

// ❌ 避免直接使用平台特定 API
// wx.request() // 仅微信小程序
// window.fetch() // 仅 H5
```

---

## 调试技巧

### 1. 开启调试模式

微信开发者工具中：
- 勾选「详细」日志级别
- 开启 SourceMap
- 使用 Console 查看错误堆栈

### 2. 真机调试

```bash
# 生成调试二维码
pnpm dev:mp-weixin

# 在微信开发者工具中：
# 工具 → 真机调试 → 扫码预览
```

### 3. 条件编译调试

```typescript
// #ifdef MP-WEIXIN
console.log('仅在微信小程序中输出');
// #endif

// #ifdef H5
console.log('仅在 H5 中输出');
// #endif
```

---

## 参考资源

- [UniApp 跨平台兼容性说明](https://uniapp.dcloud.net.cn/matter.html)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [UniApp 条件编译](https://uniapp.dcloud.net.cn/tutorial/platform.html)

---

**最后更新**: 2024-12-27
**问题修复**: 文章列表点击跳转报错（小程序）
**相关文件**: `src/components/PostItem.vue`
