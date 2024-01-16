<template>
  <el-menu router :default-active="active" :collapse="isCollapse">
    <el-menu-item
      v-for="item in routes"
      :key="item.name"
      :index="item.path"
      :route="{ name: item.name }">
      {{ item.meta.displayName }}
    </el-menu-item>
    <li class="el-menu-item logout">
      <div @click="logout">退出登录</div>
    </li>
  </el-menu>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AuthenticationClient } from "authing-js-sdk";

const authClient = new AuthenticationClient({
  appId: "62315258ab0a42505a0d6bb8",
});

const route = useRoute();
const router = useRouter();
const isCollapse = ref(false);
const active = computed(() => {
  return route.path;
});
const routes = computed(() => {
  return router.getRoutes().filter((route) => !route.meta.menuIgnore);
});

async function logout() {
  try {
    await authClient.logout();
  } catch (e) {
    //
  }
  router.push("/login");
}
</script>
<style lang="stylus">
.nav-drawer-btn
  position: fixed;
  top: 30%;
  left: 0;
  font-size: 24px !important;
  border-radius: 0 !important;
  width 40px
.el-aside > .el-menu
  position relative
.logout
  position absolute !important
  bottom 0
</style>
