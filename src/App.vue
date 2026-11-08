<style lang="scss">
/* Must be first, with lang="scss" */
@import 'uview-plus/index.scss'; /* ONLY import index.scss here! */
@import '@/styles/theme.css'; /* 导入主题样式 */
</style>
<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { applyTheme, useTheme } from '@/composables/useTheme';

const { initTheme, themeMode } = useTheme();

onLaunch(() => {
  initTheme();
});

onShow(() => {
  applyTheme(themeMode.value);
});
</script>
