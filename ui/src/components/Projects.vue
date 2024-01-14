<template>
  <div class="toolbar">
    <el-button type="primary" :icon="Plus" @click="openSubmitForm">
      新建项目
    </el-button>
  </div>

  <div class="tableView">
    <el-table :data="table" style="width: 100%">
      <el-table-column prop="id" label="项目编号" />
      <el-table-column prop="repoId" label="仓库编号" />
      <el-table-column prop="repoName" label="仓库名称" />
      <el-table-column prop="name" label="项目名称" />
      <el-table-column prop="repo" label="克隆地址" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button
            :icon="Edit"
            size="small"
            @click="openEditForm(scope.row.id)" />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog
    v-model="dialog.visible"
    :show-close="false"
    :title="dialogTitle"
    @close="resetPostData">
    <el-form :model="postData" label-width="120px">
      <el-form-item label="仓库名称">
        <!-- <el-input
          v-model="postData.repoName"
          placeholder="仅支持英文、数字、_、-" /> -->
        <!-- TODO:锁住仓库名称修改 -->
        <el-input
          v-model="postData.repoName"
          placeholder="仅支持英文、数字、_、-"
          :disabled="dialog.type === 'edit'" />
      </el-form-item>
      <el-form-item label="项目名称">
        <el-input v-model="postData.name" />
      </el-form-item>
      <el-form-item label="项目模板">
        <el-select
          :disabled="dialog.type === 'edit'"
          v-model="postData.version"
          class="project"
          :teleported="false"
          filterable>
          <el-option key="1" label="标准版" value="1" />
          <el-option key="2" label="精简版" value="2" />
        </el-select>
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
export default {
  name: "Projects",
};
</script>

<script lang="ts" setup>
import { ref, watch, computed, shallowRef, reactive } from "vue";
import { devToolApiClient } from "@/plugins";
import _ from "lodash";
import { Plus, Delete, Edit } from "@element-plus/icons-vue";
import { Project } from "@/types";

let table = reactive<Project[]>([]);

async function refreshTable() {
  table = await devToolApiClient.getAllProjects();
}

const dialog = reactive({
  visible: false,
  type: "add",
  button: {
    loading: false,
  },
});

const dialogTitle = computed(
  () => `${dialog.type === "add" ? "新建" : "修改"}项目`
);

const DEFAULT_POST_DATA = {
  repoId: 0,
  repo: "",
  name: "",
  repoName: "",
  version: "2",
};

const postData = ref(_.cloneDeep(DEFAULT_POST_DATA));

function resetPostData() {
  postData.value = _.cloneDeep(DEFAULT_POST_DATA);
}

async function openSubmitForm() {
  dialog.visible = true;
  dialog.type = "add";
}

async function submit() {
  try {
    dialog.button.loading = true;

    if (dialog.type === "add") {
      await devToolApiClient.postProject(postData.value);
    } else {
      await devToolApiClient.updateProject(postData.value);
    }
    await refreshTable();
    dialog.visible = false;
  } catch (e) {
    console.log(e);
  } finally {
    dialog.button.loading = false;
  }
}

async function openEditForm(projectId: number) {
  postData.value = await devToolApiClient.getProjectInfo(projectId);
  dialog.type = "edit";
  dialog.visible = true;
}

await refreshTable();
</script>

<style lang="stylus" scoped>
.toolbar
  margin: 20px 0px 20px 0px;
</style>
