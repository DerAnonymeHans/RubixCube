<!-- @format -->

<script setup lang="ts">
import { computed } from "vue";

export type RotationDirection = "left" | "right" | "up" | "down";

interface Props {
   direction: RotationDirection;
}

const props = defineProps<Props>();

const rotation = computed(() => {
   if (props.direction === "down") return 0;
   if (props.direction === "up") return 180;
   if (props.direction === "left") return 90;
   return 270;
});
const animation = computed(() => {
   if (props.direction === "left" || props.direction === "right") return "bounce-horizontal";
   return "bounce-vertical";
});
</script>

<template>
   <img src="../assets/arrow.png" :style="`transform: rotate(${rotation}deg); animation-name: ${animation}`" />
</template>

<style lang="scss" scoped>
img {
   width: 100%;
   height: 100%;
   animation-duration: 2s;
   animation-iteration-count: infinite;
}
</style>
<style lang="css">
@keyframes bounce-vertical {
   0% {
      translate: 0 1em;
   }
   50% {
      translate: 0 -1em;
   }
   100% {
      translate: 0 1em;
   }
}

@keyframes bounce-horizontal {
   0% {
      translate: 1em;
   }
   50% {
      translate: -1em;
   }
   100% {
      translate: 1em;
   }
}
</style>
