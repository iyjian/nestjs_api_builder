<template>
  <el-button @click="dialog.visible = true" type="success">字段导入</el-button>
  <el-dialog
    @close="closeDialog"
    v-model="dialog.visible"
    :title="`字段导入`"
    width="80%"
    center
  >
    <div class="wrapper">
      <div class="imageBoard" @paste.native="onPaste">
        <span v-if="!imgSrc" class="hint">粘贴表格图片至此</span>
        <img
          v-if="imgSrc"
          style="width: 98%; margin-top: 20px; margin-bottom: 20px"
          :src="imgSrc"
        />
      </div>
      <!-- <input class="imageBoard" disabled /> -->
      <table class="classic" v-if="recoData && recoData.length > 0">
        <thead>
          <tr>
            <th>字段名</th>
            <th>描述</th>
            <th>示例数据</th>
          </tr>
        </thead>
        <tr v-for="(row, idx) in recoData">
          <td>{{ row.name }}</td>
          <td>{{ row.comment }}</td>
          <td>{{ row.sampleData }}</td>
        </tr>
      </table>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">关闭&取消</el-button>
        <el-button
          @click="importColumns"
          type="primary"
          :disabled="!recoData || recoData.length === 0"
          >导入</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { devToolApiClient } from '@/plugins'
import { Column } from '@/types'
import _ from 'lodash'
// import { useStore } from "@/store";
import { projectTableStore } from '@/store/projectTable'

export default defineComponent({
  name: 'ParseImg',
  data() {
    return {
      imgSrc: '',
      recoData: [],
      store: projectTableStore(),
      dialog: {
        visible: false,
      },
    } as any
  },
  methods: {
    importColumns() {
      for (const column of this.recoData) {
        const newColumn: Column = {
          name: column.name,
          comment: column.comment,
          dataTypeId: column.dataTypeId,
          allowNull: true,
          refTableId: undefined,
          defaultValue: '',
          enumKeys: '',
          isEnable: true,
          searchable: false,
          findable: true,
          createable: true,
          updateable: true,
          order: 0,
          getCode: '',
          setCode: '',
          enumTypeCode: '',
          remark: '',
          sampleData: column.sampleData,
        }
        // this.store.commit("addColumn", newColumn);
        this.store.addColumn(newColumn)
      }
      this.closeDialog()
    },
    closeDialog() {
      this.dialog.visible = false
      this.imgSrc = ''
      this.recoData = []
    },
    onPaste(evt: any) {
      if (
        evt.clipboardData &&
        evt.clipboardData.files &&
        evt.clipboardData.files.length > 0
      ) {
        const reader = new FileReader()
        reader.readAsDataURL(evt.clipboardData.files[0])
        reader.onload = async () => {
          if (reader.result) {
            this.imgSrc = reader.result.toString()
            const tableName = this.store.table.name
            const base64Img = this.imgSrc.split('base64,')[1]
            const result = await devToolApiClient.parseTableImg(
              tableName,
              base64Img,
            )
            this.recoData = result
          }
        }
      }
    },
  },
  async mounted() {},
})
</script>

<style scoped lang="stylus">
.wrapper
  display flex
  flex-direction row
  align-items left
  .imageBoard
    width 400px
    height 200px
    border 1px dashed lightgray
    display flex
    flex-direction column
    align-items center
    justify-content center
    .hint
      font-size 18px
      color lightgray
    .imageBoard:active
      background-color lightgreen

.classic
  font-family Arial, Helvetica, sans-serif
  border-collapse  collapse
  width 80%
  tr
    td, th
      border  1px solid #ddd
      padding  8px
      .columnFK
        font-weight bold
        color red
    td > .rowNotNull
      font-weight bold
    th
      padding-top  12px
      padding-bottom  12px
      text-align  left
      background-color  #04AA6D
      color  white
    .rowDisable
      color lightgray
  tr.relationRow
    background-color  #f2f2f2
</style>
