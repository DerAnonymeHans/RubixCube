<!-- @format -->

<template>
   <RouterLink to="/Solver">Fertig</RouterLink>
   <Scanner />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Scanner from "@/components/Scanner.vue";

export default defineComponent({
   name: "Sanner",
   components: {
      Scanner,
   },
});
</script>
