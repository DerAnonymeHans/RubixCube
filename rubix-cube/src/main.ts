/** @format */

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// @ts-expect-error
import { Vue3Mq } from "vue3-mq";
import { createI18n } from "vue-i18n";
import { langs } from "./i18/langs";

const i18n = createI18n({
   locale: "en",
   fallbackLocale: "en",
   messages: langs,
});

createApp(App)
   .use(router)
   .use(Vue3Mq, {
      breakpoints: {
         xs: 0,
         sm: 450,
         md: 768,
         lg: 992,
         xl: 1200,
         xxl: 1400,
      },
   })
   .use(i18n)
   .mount("#app");
