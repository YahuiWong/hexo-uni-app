<style lang="scss">
/* Must be first, with lang="scss" */
@import 'uview-plus/index.scss'; /* ONLY import index.scss here! */
@import '@/styles/theme.css'; /* 导入主题样式 */
</style>
<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useTheme } from '@/composables/useTheme';

const { initTheme } = useTheme();

onLaunch(() => {
  // 初始化主题
  initTheme();
});
</script>
