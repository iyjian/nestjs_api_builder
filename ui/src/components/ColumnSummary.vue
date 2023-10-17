<template>
  <el-button @click="dialogVisible = true" type="primary">字段预览</el-button>
  <el-dialog
    @close="closeDialog"
    v-model="dialogVisible"
    title="字段预览"
    width="90%"
    center
  >
    <div class="wrapper">
      <el-button @click="copyCommaSpeperate">复制逗号分隔的字段</el-button>

      <table class="classic">
        <tr>
          <th>序号</th>
          <th>字段名</th>
          <th>数据类型</th>
          <th>示例数据</th>
          <th>字段含义</th>
        </tr>
        <!-- prettier-ignore -->
        <template
          v-for="(column, idx) in columns.filter((column) => column.dataType?.dataType !== 'vrelation')"
          :key="idx"
        >
          <tr
            :class="{
              rowNotNull: !column.allowNull,
            }"
          >
            <td>{{ idx + 1 }}</td>
            <td>
              {{ column.allowNull ? "" : "*" }}
              <span :class="{ rowNotNull: !column.allowNull }">{{
                column.name
              }}</span>
              <span class="columnFK" v-if="column.isFK">&nbsp;&nbsp;(FK)</span>
            </td>
            <td>{{ column.dataType?.dataType }}</td>
            <td>{{ column.sampleData }}</td>
            <td>
              {{ column.comment }}
            </td>
          </tr>
          <template
            v-if="column.id && relationColumnHash[column.id.toString()]"
          >
            <!-- prettier-ignore -->
            <tr
              v-for="(relationColumn, idx2) in relationColumnHash[column.id.toString()]"
              class="relationRow"
              :class="{rowDisable: !relationColumn.isEnable}"
              :key="idx2"
            >
              <td></td>
              <td></td>
              <td>{{ relationColumn.dataType?.dataType }}</td>
              <td>
                {{ relationColumn.relation }} ->
                {{ relationColumn.refTable?.name }}
              </td>
            </tr>
          </template>
        </template>
      </table>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">已阅</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'ColumnSummary',
}
</script>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import useClipboard from 'vue-clipboard3'
import { Column, Table } from '@/types'
import _ from 'lodash'

const dialogVisible = ref(false)

const props = defineProps<{
  columns: Column[]
}>()

const { toClipboard } = useClipboard()

const relationColumnHash = computed(() => {
  return _.groupBy(
    props.columns.filter((column) => column.relationColumnId),
    'relationColumnId',
  )
})

const closeDialog = () => {
  dialogVisible.value = false
}

const copyCommaSpeperate = async () => {
  try {
    await toClipboard(
      props.columns
        .filter((column) => column.dataType?.dataType !== 'vrelation')
        .map((column) => column.name)
        .join(','),
    )
  } catch (e) {
    console.error(e)
  }
}

// watch(
//   (visiable: boolean) => {
//     dialogVisible.value = visiable;
//   }
// );
</script>

<style lang="stylus" scoped>
.classic
  font-family Arial, Helvetica, sans-serif
  border-collapse  collapse
  width  100%
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
