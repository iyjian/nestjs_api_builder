<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
// import { useStore } from "@/store";
// import { devToolApiClient } from "@/plugins";
import { projectTableStore } from "@/store/projectTable";
const store = projectTableStore();

store.initAsync();
</script>
