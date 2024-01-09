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
         <router-link to="/Spielen">{{ $t("nav.play") }}</router-link>
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
   background-color: rgba($dark-bg, 0.8);
   z-index: 9999;
   position: fixed;
   top: 0;
   width: max(100%, fit-content);
   padding: 3vh;
   box-sizing: border-box;
   border-radius: 0 0 1em 1em;
   left: 50%;
   transform: translateX(-50%);

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
            text-decoration: underline #8db0be 3px;
            // color: #8db0be;
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
