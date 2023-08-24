import Vue from "vue";
import App from "./App.vue";
import store from "./vuex/store";

import "./unit/const";
import "./control";
import { subscribeRecord } from "./unit";
subscribeRecord(store); // 업데이트된 상태를 localStorage에 기록합니다.
Vue.config.productionTip = false;
/* eslint-disable no-new */
new Vue({
  el: "#root",
  render: (h) => h(App),
  store: store,
});
