/** @format */

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// @ts-expect-error
import { Vue3Mq } from "vue3-mq";

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
   .mount("#app");
