<template>
  <div class="toolbar">
    <el-select
      v-model="projectId"
      class="project"
      :teleported="false"
      filterable
    >
      <el-option
        v-for="project in projects"
        :key="project['id']"
        :label="project['name']"
        :value="project['id']"
      />
    </el-select>
    <div class="searchRow">
      <el-input
        type="text"
        class="search"
        v-model="search"
        placeholder="搜索"
      />
      <el-button
        :icon="PlusIcon"
        type="primary"
        size="small"
        class="newTable"
        @click="openDialog"
      ></el-button>
    </div>
  </div>
  <el-table
    :data="tabelsFiltered"
    v-loading="tableLoading"
    class="table-customize"
  >
    <el-table-column prop="id" label="编号" width="90" />
    <el-table-column prop="module" label="模块" width="120" />
    <el-table-column prop="name" label="表名" width="200" />
    <el-table-column prop="comment" label="简称" width="200" />
    <el-table-column
      prop="selectDisplayColumns"
      label="下拉显示列"
      width="200"
    />
    <el-table-column label="创建时间">
      <template #default="scope">
        {{ moment(scope.row.createdAt).format("YYYY-MM-DD HH:mm") }}
      </template>
    </el-table-column>
    <el-table-column label="修改时间">
      <template #default="scope">
        {{ moment(scope.row.updatedAt).format("YYYY-MM-DD HH:mm") }}
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="scope">
        <el-icon class="icon" :size="25" @click="configEntity(scope.row)"
          ><Edit
        /></el-icon>
        <el-icon
          class="icon"
          :size="25"
          @click="deleteTable(scope.row)"
          style="color: #f56c6c"
          ><DeleteFilled
        /></el-icon>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog v-model="dialog.visible" :show-close="false" title="新建表定义">
    <el-form :model="postData" label-width="120px">
      <el-form-item label="模块">
        <!-- <el-input v-model="postData.module" /> -->
        <el-select v-model="postData.module" :teleported="false">
          <el-option
            v-for="projectModule in projectModules"
            :key="projectModule['id']"
            :label="`${projectModule.name}(${projectModule.code})`"
            :value="projectModule['code']"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="表名">
        <el-input v-model="postData.name" />
      </el-form-item>
      <el-form-item label="表简称">
        <el-input v-model="postData.comment" />
      </el-form-item>
      <!-- <el-form-item label="代码风格">
        <el-select v-model="postData.version">
          <el-option key="1" label="所有代码均在module目录" value="1" />
          <el-option key="2" label="分service,controller目录" value="2" />
        </el-select>
      </el-form-item> -->
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          @click="dialog.visible = false"
          :loading="dialog.button.loading"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="submit"
          :loading="dialog.button.loading"
        >
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { defineComponent, shallowRef, PropType } from "vue";
import { devToolApiClient } from "@/plugins";
import {
  Plus,
  DeleteFilled,
  Expand,
  Fold,
  Edit,
} from "@element-plus/icons-vue";
import { TableSimple, Project } from "@/types";
import moment from "moment";
import { projectTableStore } from "@/store/projectTable";

let store: ReturnType<typeof projectTableStore>;

const PlusIcon = shallowRef(Plus);

export default defineComponent({
  setup() {
    store = projectTableStore();
  },
  name: "Entities",
  components: {
    DeleteFilled,
    Edit,
  },
  data() {
    return {
      PlusIcon,
      // projectId: undefined,
      tables: [],
      search: "",
      moment,
      tableLoading: false,
      postData: {
        projectId: -1,
        name: "",
        comment: "",
        module: "",
      },
      dialog: {
        visible: false,
        button: {
          loading: false,
        },
      },
      projectModules: [] as any,
    };
  },
  computed: {
    projectId: {
      get() {
        return store.currentProjectId;
      },
      set(projectId: number) {
        store.setCurrentProjectId(projectId);
      },
    },
    table() {
      return store.table;
    },
    projects() {
      return store.projects;
    },
    tabelsFiltered(): TableSimple[] {
      return this.tables.filter(
        (table: TableSimple) =>
          new RegExp(this.search).test(table.name) ||
          new RegExp(this.search).test(table.module) ||
          new RegExp(this.search).test(table.id.toString()) ||
          new RegExp(this.search).test(table.comment)
      );
    },
  },
  methods: {
    async submit() {
      try {
        this.dialog.button.loading = true;
        const table = await devToolApiClient.saveEntity(this.postData);
        // store.commit("emptyTable");
        // store.commit("updateTable", table);
        store.emptyTable();
        store.updateTable(table);
        this.dialog.button.loading = false;
        this.dialog.visible = false;
        this.$router.push("/nestCodeGen");
      } catch (e: any) {
        this.dialog.button.loading = false;
        ElMessage({
          type: "error",
          message: e.message,
        });
      }
    },
    async deleteTable(table: TableSimple) {
      ElMessageBox.confirm(
        `删除${table.module}: ${table.name}的定义`,
        "是否确认删除",
        {
          distinguishCancelAndClose: true,
          confirmButtonText: "确认删除",
          cancelButtonText: "取消",
        }
      ).then(async () => {
        if (table.id && this.projectId) {
          try {
            await devToolApiClient.deleteTable(table.id);

            this.tables = await devToolApiClient.loadAllTables(
              this.projectId.toString(), true
            );

            ElMessage({
              type: "info",
              message: "已删除",
            });
          } catch (e: any) {
            ElMessage({
              type: "error",
              message: e.message,
            });
          }
        }
      });
    },
    async openDialog() {
      if (this.projectId) {
        this.postData = {
          projectId: this.projectId,
          name: "",
          comment: "",
          module: "",
        };
        this.dialog.visible = true;
      }
    },
    async configEntity(table: TableSimple) {
      try {
        this.tableLoading = true
        console.log(`Entities - configEntity - tableId: ${table.id}`);
        await store.switchTableAsync(table.id);
        this.tableLoading = false
        this.$router.push("/nestCodeGen");
      } catch (e) {
        this.tableLoading = false
      }
    },
  },
  watch: {
    projectId: {
      async handler() {
        if (this.projectId) {
          try {
            this.tableLoading = true;
            this.projectModules = await devToolApiClient.getProjectModules(
              this.projectId
            );
            this.tables = await devToolApiClient.loadAllTables(
              this.projectId.toString()
            );
            this.tableLoading = false;
          } catch (e) {
            this.tableLoading = false;
          }
        } else {
          this.tables = [];
          this.projectModules = [];
        }
      },
      immediate: true,
    },
  },
});
</script>

<style lang="stylus" scoped>
.toolbar
  display flex
  flex-direction row
  align-items center
  justify-content left
  border-bottom 1px solid white
  padding-bottom 10px
  height 50px
  .project
    width 200px
    margin-right 20px
  .searchRow
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    width 200px
    height 32px
    .search
      width 70%
    .newTable
      width 50px
      height 30px
.table-customize
  height: calc(100vh - 90px)
  .icon
    margin-right 10px
    cursor pointer
</style>
