<template>
  <div class="toolbar">
    <el-button type="primary" :icon="Plus" @click="openSubmitForm"
      >新建代码仓库</el-button
    >
  </div>

  <div class="tableView">
    <el-table :data="table" style="width: 100%">
      <el-table-column prop="repoId" label="仓库id" />
      <el-table-column prop="name" label="仓库名称" />
      <el-table-column prop="repo" label="克隆地址" />
      <!-- <el-table-column prop="version" label="代码风格" /> -->
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="danger" :icon="Delete" />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialog.visible" :show-close="false" title="新建代码仓库">
    <el-form :model="postData" label-width="120px">
      <el-form-item label="仓库项目名称">
        <el-input
          v-model="postData.repoName"
          placeholder="仅支持英文、数字、_、-"
        />
      </el-form-item>
      <el-form-item label="项目名称">
        <el-input v-model="postData.name" />
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
export default {
  name: "Projects",
};
</script>

<script lang="ts" setup>
// import { useStore } from "@/store";
// import {projectTableStore} from '@/store/projectTable'
import { ref, watch, computed, shallowRef, reactive } from "vue";
import { devToolApiClient } from "@/plugins";
import _ from "lodash";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { Project } from "@/types";

// const store = projectTableStore();

let table = reactive<Project[]>([]);

async function refreshTable() {
  table = await devToolApiClient.getAllProjects();
}

const dialog = reactive({
  visible: false,
  button: {
    loading: false,
  },
});

const postData = reactive({
  repoId: 0,
  repo: "",
  name: "",
  repoName: "",
  version: "2",
  // templateProjectId: 20,
});

async function openSubmitForm() {
  dialog.visible = true;
}

async function submit() {
  try {
    dialog.button.loading = true;
    const result = await devToolApiClient.initProject({
      projectName: postData.repoName,
      // templateProjectId: postData.templateProjectId,
    });
    postData.repo = result.ssh_url_to_repo;
    postData.repoId = result.id;
    await devToolApiClient.postProject(postData);
    await refreshTable();
    dialog.visible = false;
    dialog.button.loading = false;
  } catch (e) {
    dialog.button.loading = false;
    console.log(e);
  }
}

await refreshTable();
</script>

<style lang="stylus" scoped>
.toolbar
  margin: 20px 0px 20px 0px;
</style>
