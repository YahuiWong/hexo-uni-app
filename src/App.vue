
<style lang="scss">  /* Must be first, with lang="scss" */
@import "uview-plus/index.scss";  /* ONLY import index.scss here! */
</style>
<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
