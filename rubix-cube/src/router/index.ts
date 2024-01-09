/** @format */

import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
   {
      path: "/",
      name: "home",
      component: HomeView,
   },
   {
      path: "/Spielen",
      name: "play",
      component: () => import("../views/PlayView.vue"),
   },
];

const router = createRouter({
   history: createWebHashHistory(),
   routes,
});

export default router;
