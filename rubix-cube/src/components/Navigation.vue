<!-- @format -->

<script lang="ts" setup>
const langs: { key: string; label: string }[] = [
   { key: "de", label: "DE" },
   { key: "en", label: "EN" },
];
</script>

<template>
   <nav>
      <div>
         <router-link to="/">{{ $t("nav.solve") }}</router-link>
         <router-link to="/">{{ $t("nav.play") }}</router-link>
         <router-link to="/">{{ $t("nav.learn") }}</router-link>

         <select v-model="$i18n.locale">
            <option v-for="lang in langs" :key="lang.key" :value="lang.key">
               {{ lang.label }}
            </option>
         </select>
      </div>
   </nav>
</template>

<style lang="scss" scoped>
$dark-bg: #1c4557;
nav {
   background-color: rgba($dark-bg, 0.7);
   z-index: 9999;
   position: fixed;
   top: 0;
   width: 100%;
   padding: 3vh;
   box-sizing: border-box;

   div {
      display: flex;
      margin: auto;
      width: fit-content;
      align-items: center;

      a {
         color: white;
         padding-inline: 1.5em;
         height: fit-content;
         text-decoration: none;

         &.router-link-exact-active {
            color: #8db0be;
         }
      }
   }

   select {
      font-family: "Rubik", sans-serif !important;
      border-radius: 0.5em;
      padding: 0.3em;
   }
}
</style>
