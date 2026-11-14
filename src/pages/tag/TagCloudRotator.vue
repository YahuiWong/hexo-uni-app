<template>
  <view class="tag-cloud-rotator" :style="angleStyle">
    <slot />
  </view>
</template>

<script lang="ts">
export default {
  options: {
    virtualHost: true,
    styleIsolation: 'shared'
  }
};
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

const ax = ref('0deg');
const ay = ref('0deg');
const angleStyle = computed(() => ({
  '--ax': ax.value,
  '--ay': ay.value
}));

const setAngles = (x: number, y: number) => {
  const nextX = `${x}deg`;
  const nextY = `${y}deg`;
  if (ax.value === nextX && ay.value === nextY) return;
  ax.value = nextX;
  ay.value = nextY;
};

defineExpose({ setAngles });
</script>

<style scoped>
.tag-cloud-rotator {
  --ax: 0deg;
  --ay: 0deg;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateX(var(--ax)) rotateY(var(--ay));
}
</style>
