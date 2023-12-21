<template>
  <div class="table-sub-row">
    <div>
      <div class="table-sub-row__columns" style="display: flex">
        <!-- 字段 -->
        <div class="table-sub-row-item" style="width: 150px">
          <el-input :disabled="!column.isEnable" type="text" v-model="column.name" placeholder="">
          </el-input>
        </div>
        <!-- 数据类型 -->
        <div class="table-sub-row-item" style="width: 140px">
          <el-select filterable v-model="column.dataTypeId" placeholder="数据类型" :disabled="!column.isEnable">
            <el-option-group v-for="(subDataTypes, category) in props.groupedDataTypes" :key="category" :label="category">
              <el-option v-for="(dataType, key) in subDataTypes" :key="key" :label="dataType.dataType"
                :value="dataType.id" :disabled="dataType.dataType === 'vrelation'" />
            </el-option-group>
          </el-select>
        </div>
        <!-- 描述 -->
        <div class="table-sub-row-item" style="width: 150px">
          <el-input :disabled="!column.isEnable" type="text" v-model="column.comment" placeholder=""></el-input>
        </div>
        <!-- 样例数据 -->
        <div class="table-sub-row-item" style="width: 150px">
          <el-input :disabled="!column.isEnable" type="text" v-model="column.sampleData" placeholder=""></el-input>
        </div>
        <!-- 是否必填 -->
        <div class="table-sub-row-item" style="width: 60px">
          <el-switch :active-value="false" :inactive-value="true" :disabled="!column.isEnable" v-model="column.allowNull"
            size="small"></el-switch>
        </div>
        <!-- 是否参加搜索 -->
        <div class="table-sub-row-item" style="width: 60px">
          <el-switch :disabled="!column.isEnable" v-model="column.searchable" size="small"></el-switch>
        </div>
      </div>
      <!-- 枚举值定义 换行显示 -->
      <div class="extra-row" style="display: flex">
        <div v-if="dataTypeByDataTypeId[column.dataTypeId] === 'enum'" class="table-sub-row-item">
          <div style="margin-right: 10px">枚举值:</div>
          <el-input type="text" style="width: 280px" v-model="column.enumKeys" placeholder="多个枚举值用逗号分隔"></el-input>
        </div>
      </div>
    </div>

    <!-- 设置 -->
    <div class="table-sub-row-item" style="flex: 1; display: flex; justify-content: flex-end">
      <div style="width: 32px">
        <Setting v-if="column.name && column.isEnable" @click="openSetting(column)" class="setting-icon" />
      </div>
      <div style="width: 32px">
        <Delete v-if="column.name && column.isEnable" @click="deleteColumn(column)" class="delete-icon" />
      </div>
      <div style="width: 32px">
        <Rank v-if="column.name && column.isEnable" class="rank-icon"> </Rank>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Column } from "@/types";
import { Delete, Rank, Setting } from "@element-plus/icons-vue";
import { ref, watch } from 'vue'
const props = defineProps<{
  modelValue: Column;
  groupedDataTypes: {
    [key: string]: any[]
  };
  dataTypeByDataTypeId: {
    [key: string]: any
  };
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: Object): void
  (event: 'openSetting', value: Column): void
  (event: 'deleteColumn', value: Column): void
}>()

const column = ref(props.modelValue)

// TODO： 当modelValue是实时变化的时候
watch(() => props.modelValue, (v) => {
  column.value = v
})

watch(column, (v) => {
  emits('update:modelValue', v)
})

function openSetting(v:any) {
  emits('openSetting', v)
}
function deleteColumn(v:any) {
  emits('deleteColumn', v)
}
</script>

<style lang="stylus" scoped>
  .table-sub-row
        width 100%
        display flex
        flex-direction row
        padding 0px 0px

        .table-sub-row-item
          display flex
          flex-direction row
          justify-content center
          align-items center
          padding 0px 3px
          height 40px
          line-height 40px
          margin-bottom 2px
          align-items center
          .delete-icon
            cursor pointer
            color red
            width 1.3em
            height 1.3em
            margin 0px 5px
          .rank-icon
            cursor pointer
            color gray
            width 1.3em
            height 1.3em
            margin 0px 5px
          .setting-icon
            cursor pointer
            color green
            width 1.3em
            height 1.3em
            margin 0px 5px
</style>