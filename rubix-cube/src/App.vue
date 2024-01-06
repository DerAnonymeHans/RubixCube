<!-- @format -->

<script lang="ts" setup>
import { ref } from "vue";
</script>
<template>
   <main>
      <router-view />
   </main>
</template>
<style lang="scss" scoped>
$dark-bg: #1c4557;
nav {
   display: flex;
   background-color: rgba($dark-bg, 0.7);
   // background: linear-gradient(
   //    180deg,
   //    rgba($dark-bg, 0.8) 0%,
   //    // rgba($dark-bg, 0.5) 50%,
   //    rgba($dark-bg, 0) 100%
   // );

   position: fixed;
   top: 0;
   width: 100%;
}
</style>
<style lang="scss">
#app {
   font-family: "Rubik", sans-serif !important;
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   text-align: center;
   color: #2c3e50;
}

html {
   height: 100%;
   width: 100%;

   body {
      height: 100%;
      width: 100%;
      margin: 0;
      background: rgb(115, 4, 249);
      background: linear-gradient(90deg, #7304f9 0%, rgb(208, 7, 235) 51%, rgb(251, 5, 215) 100%);

      font-family: "Rubik", sans-serif !important;
   }
}

nav {
   padding: 30px;

   a {
      font-weight: bold;
      color: #2c3e50;

      &.router-link-exact-active {
         color: #42b983;
      }
   }
}

.fade-enter-active,
.fade-leave-active {
   transition: all 0.5s 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}

.fade-later-enter-active,
.fade-later-leave-active {
   transition: all 0.5s 1.2s ease;
}

.fade-later-enter-from,
.fade-later-leave-to {
   opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
   transition: all 1s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
   transform: translateX(-50vw);
   opacity: 0;
}

.slide-left-later-enter-active,
.slide-left-later-leave-active {
   transition: all 1s 1.5s ease;
}

.slide-left-later-enter-from,
.slide-left-later-leave-to {
   transform: translateX(-50vw);
   opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
   transition: all 1s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
   transform: translateY(-100%);
   opacity: 0;
}
</style>
