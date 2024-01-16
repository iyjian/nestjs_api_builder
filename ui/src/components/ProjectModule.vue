<template>
  <div class="toolbar">
    <el-select v-model="projectId" class="project" :teleported="false">
      <el-option
        v-for="project in projects"
        :key="project['id']"
        :label="project['name']"
        :value="project['id']" />
    </el-select>
    <div class="searchRow">
      <el-input
        type="text"
        class="search"
        v-model="search"
        placeholder="搜索" />
      <el-button
        :icon="PlusIcon"
        type="primary"
        size="small"
        class="newTable"
        @click="openDialog('create')"></el-button>
    </div>
  </div>

  <el-table :data="projectModules" class="table-customize">
    <el-table-column prop="id" label="编号" width="90" />
    <el-table-column prop="code" label="模块代码" width="120" />
    <el-table-column prop="name" label="简称" width="200" />
    <el-table-column prop="remark" label="说明" />
    <el-table-column label="创建时间">
      <template #default="scope">
        {{ moment(scope.row.createdAt).format("YYYY-MM-DD HH:mm") }}
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="scope">
        <el-icon
          class="icon"
          :size="25"
          @click="openDialog('modify', scope.row)">
          <Edit />
        </el-icon>
        <!-- TODO: 未实现模块删除功能 -->
        <!-- <el-icon
          class="icon"
          :size="25"
          @click="deleteTable(scope.row)"
          style="color: #f56c6c"
          ><DeleteFilled
        /></el-icon> -->
      </template>
    </el-table-column>
  </el-table>

  <el-dialog v-model="dialog.visible" :show-close="true" :title="dialog.title">
    <el-form :model="postData" label-width="120px">
      <el-form-item label="模块代码">
        <el-input
          v-model="postData.code"
          :disabled="dialog.disabledKeys['code']" />
      </el-form-item>
      <el-form-item label="简称">
        <el-input
          v-model="postData.name"
          :disabled="dialog.disabledKeys['name']" />
      </el-form-item>
      <el-form-item label="说明">
        <el-input
          v-model="postData.remark"
          :disabled="dialog.disabledKeys['remark']" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          @click="dialog.visible = false"
          :loading="dialog.button.loading">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="submit"
          :loading="dialog.button.loading">
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
import moment from "moment";
// import { useStore } from "@/store";
import { projectTableStore } from "@/store/projectTable";

let store: ReturnType<typeof projectTableStore>;

const PlusIcon = shallowRef(Plus);

export default defineComponent({
  setup() {
    store = projectTableStore();
  },
  name: "ProjectModule",
  components: {
    DeleteFilled,
    Edit,
  },
  data() {
    return {
      PlusIcon,
      search: "",
      moment,
      // projectId: undefined,
      postData: {
        id: undefined,
        projectId: -1,
        code: "",
        name: "",
        remark: "",
      },
      dialog: {
        title: "",
        openType: "",
        visible: false,
        button: {
          loading: false,
        },
        disabledKeys: {
          code: false,
          name: false,
          remark: false,
        },
      },
      projectModules: [],
    };
  },
  mounted() {
    this.refreshProjectModules();
  },
  watch: {
    projectId() {
      this.refreshProjectModules();
    },
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
    projects() {
      return store.projects;
    },
  },
  methods: {
    async refreshProjectModules() {
      if (this.projectId) {
        this.projectModules = await devToolApiClient.getProjectModules(
          this.projectId
        );
      }
    },
    async submit() {
      try {
        this.dialog.button.loading = true;

        if (this.dialog.openType === "create") {
          if (!/^[a-z]+$/.test(this.postData.code)) {
            ElMessage.error("模块代码必须为英文小写字母");
            return;
          }
          await devToolApiClient.createProjectModule(this.postData);
        } else {
          if (this.postData && this.postData.id) {
            await devToolApiClient.patchProjectModule(
              this.postData.id,
              this.postData
            );
          }
        }

        this.dialog.visible = false;

        this.refreshProjectModules();
      } catch (e: any) {
        ElMessage({
          type: "error",
          message: e.message,
        });
      } finally {
        this.dialog.button.loading = false;
      }
    },
    async openDialog(openType: string, payload?: any) {
      if (!this.projectId) {
        return;
      }
      if (openType === "create") {
        this.dialog.openType = openType;
        this.dialog.title = "新建模块定义信息";
        this.dialog.visible = true;
        this.dialog.disabledKeys = {
          code: false,
          name: false,
          remark: false,
        };
        this.postData = {
          id: undefined,
          projectId: this.projectId,
          code: "",
          name: "",
          remark: "",
        };
      } else {
        this.dialog.openType = openType;
        this.dialog.title = "修改模块定义信息";
        this.dialog.visible = true;
        this.postData = payload;
        this.dialog.disabledKeys = { code: true, name: false, remark: false };
      }
    },
    async modify(payload: { id: number; name: string; remark: string }) {
      this.dialog.visible = true;
      await devToolApiClient.patchProjectModule(payload.id, {
        name: payload.name,
        remark: payload.remark,
      });
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
