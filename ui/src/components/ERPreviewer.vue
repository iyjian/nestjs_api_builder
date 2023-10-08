<template>
  <el-button @click="openER">ER图</el-button>
  <el-dialog
    v-model="dialogVisible"
    title="ER关系图(一层)"
    width="50%"
    center
    @closed="dialogVisible = false"
  >
    <div class="wrapper">
      <div v-if="dialogVisible" class="mermaid" style="color: white">
        {{ diagram }}
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">已阅</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent } from 'vue'
import { devToolApiClient } from '@/plugins'
import mermaid from 'mermaid'
import { nextTick } from 'vue'
export default defineComponent({
  name: 'ERPreviewer',
  data() {
    return {
      dialogVisible: false,
      diagram: '',
    }
  },
  props: {
    visible: Boolean,
    tableId: Number,
  },
  methods: {
    openER() {
      if (this.tableId) {
        this.getER(this.tableId.toString())
        this.dialogVisible = true
      }
    },
    async getER(tableId: string) {
      this.diagram = await devToolApiClient.getERAll(tableId)
      await nextTick()
      mermaid.initialize({
        startOnLoad: false,
      })
      await mermaid.run({
        querySelector: '.mermaid',
      })
    },
  },
})
</script>

<style lang="stylus" scoped>
.mermaid
  display flex
  justify-content center
  align-items center
</style>
