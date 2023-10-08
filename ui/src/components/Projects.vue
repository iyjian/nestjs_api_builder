<template>
  <div class="toolbar">
    <el-button type="primary" :icon="Plus" @click="openSubmitForm"
      >新建项目</el-button
    >
  </div>

  <div class="tableView">
    <el-table :data="table" style="width: 100%">
      <el-table-column prop="repoId" label="仓库id" />
      <el-table-column prop="repoName" label="仓库名称" />
      <el-table-column prop="name" label="项目名称" />
      <el-table-column prop="repo" label="克隆地址" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <!-- <el-button type="danger" :icon="Delete" size="small"/> -->
          <el-button
            :icon="Edit"
            size="small"
            @click="openEditForm(scope.row.id)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialog.visible" :show-close="false" :title="dialogTitle">
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
  name: 'Projects',
}
</script>

<script lang="ts" setup>
import { ref, watch, computed, shallowRef, reactive } from 'vue'
import { devToolApiClient } from '@/plugins'
import _ from 'lodash'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import { Project } from '@/types'

let table = reactive<Project[]>([])

async function refreshTable() {
  table = await devToolApiClient.getAllProjects()
}

const dialog = reactive({
  visible: false,
  type: 'add',
  button: {
    loading: false,
  },
})

const dialogTitle = computed(
  () => `${dialog.type === 'add' ? '新建' : '修改'}项目`,
)

const postData = ref({
  repoId: 0,
  repo: '',
  name: '',
  repoName: '',
  projectName: '',
  version: '2',
})

async function openSubmitForm() {
  dialog.visible = true
  dialog.type = 'add'
}

async function submit() {
  try {
    dialog.button.loading = true

    // 从模板项目初始化
    // const result = await devToolApiClient.initProject({
    //   projectName: postData.value.repoName,
    // })

    // 记录项目
    // postData.value.repo = result.ssh_url_to_repo
    // postData.value.repoId = result.id
    await devToolApiClient.postProject(postData.value)
    await refreshTable()

    dialog.visible = false
    dialog.button.loading = false
  } catch (e) {
    dialog.button.loading = false
    console.log(e)
  }
}

async function edit(projectId: number) {
  // TODO:
}

async function openEditForm(projectId: number) {
  const project = await devToolApiClient.getProjectInfo(projectId)
  postData.value = project
  dialog.visible = true
  dialog.type = 'edit'
}

await refreshTable()
</script>

<style lang="stylus" scoped>
.toolbar
  margin: 20px 0px 20px 0px;
</style>
