<template>
  <el-container id="root">
    <el-aside>
      <NavMenu />
    </el-aside>
    <el-main style="padding: 0px 10px">
      <suspense>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </suspense>
    </el-main>
  </el-container>
</template>
<script lang="ts" setup>
import NavMenu from "./../components/NavMenu.vue";
</script>
