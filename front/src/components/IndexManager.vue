<template>
  <el-button @click="openIndexManager">索引</el-button>
  <el-dialog
    v-model="dialogVisible"
    title="索引管理器"
    width="50%"
    center
    @closed="dialogVisible = false"
  >
    <div class="wrapper">
      <el-button :icon="Plus" @click="addIndex"></el-button>
      <template v-for="(index, key) in indexes" :key="key">
        <el-row style="margin-bottom: 5px">
          <el-select
            v-model="index.fields"
            multiple
            placeholder="请选择"
            style="width: 400px; margin-right: 10px"
          >
            <el-option
              v-for="column in columns"
              :key="column.id"
              :label="column.name"
              :value="column.id"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="index.type"
            placeholder="请选择"
            style="width: 120px; margin-right: 10px"
          >
            <el-option key="unique" label="唯一索引" value="unique">
            </el-option>
            <el-option key="btree" label="普通索引" value="btree"> </el-option>
          </el-select>
          <el-button
            :icon="Delete"
            @click="deleteIndex(key)"
            type="danger"
          ></el-button>
        </el-row>
      </template>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="saveIndex" type="primary">保存索引</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from "vue";
import { devToolApiClient } from "@/plugins";
import { Plus, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
const PlusShallow = shallowRef(Plus);
const DeleteShallow = shallowRef(Delete);
export default defineComponent({
  name: "IndexManager",
  data() {
    return {
      dialogVisible: false,
      indexes: [{ fields: [], type: "btree" }],
      columns: [] as any,
      Plus: PlusShallow,
      Delete: DeleteShallow,
    };
  },
  props: {
    tableId: Number,
  },
  methods: {
    async openIndexManager() {
      if (!this.tableId) {
        return;
      }
      const table = await devToolApiClient.getTableInfo(this.tableId);
      this.columns = table.columns;
      if (table.indexes) {
        this.indexes = table.indexes;
      } else {
        this.indexes = [{ fields: [], type: "btree" }];
      }
      console.log(table.indexes);
      this.dialogVisible = true;
    },
    addIndex() {
      this.indexes.push({ fields: [], type: "btree" });
    },
    deleteIndex(idx: number) {
      this.indexes.splice(idx, 1);
    },
    async saveIndex() {
      try {
        if (this.tableId) {
          for (const index of this.indexes) {
            if (!index.fields.length || !index.type) {
              ElMessage({
                type: "error",
                message: "索引字段和索引类型均不能为空",
              });
              return;
            }
          }
          await devToolApiClient.updateTableIndex(this.tableId, this.indexes);
          this.dialogVisible = false;
        } else {
          ElMessage({
            type: "error",
            message: "系统错误",
          });
        }
      } catch (e: any) {
        ElMessage({
          type: "error",
          message: e.message,
        });
      }
    },
  },
  computed: {
    // delBtnShow() {},
  },
});
</script>

<style lang="stylus" scoped></style>
