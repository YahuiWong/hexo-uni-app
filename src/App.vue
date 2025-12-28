
<style lang="scss">  /* Must be first, with lang="scss" */
@import "uview-plus/index.scss";  /* ONLY import index.scss here! */
@import "@/styles/theme.css";  /* 导入主题样式 */
</style>
<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useTheme } from "@/composables/useTheme";

const { initTheme } = useTheme();

onLaunch(() => {
  console.log("App Launch");
  // 初始化主题
  initTheme();
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
