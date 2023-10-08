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
    缺失的枚举类型: {{ JSON.stringify(missingEnumType) }}
    <!-- <div class="searchRow">
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
    </div> -->
  </div>
  <el-table :data="tables" v-loading="tableLoading" class="table-customize">
    <el-table-column prop="enumCategoryName" label="一级类目" width="120" />
    <el-table-column prop="enumTypeName" label="二级类目" width="150" />
    <el-table-column prop="enumTypeCode" label="类型代码" width="250" />
    <el-table-column prop="enumCnName" label="枚举值中文名" width="300" />
    <el-table-column prop="enumEnName" label="枚举值英文名" width="250" />
    <el-table-column prop="enumCode" label="枚举值代码" width="200" />
    <el-table-column prop="isSystem" label="系统值" width="200" />
    <el-table-column prop="status" label="状态" width="200" />
  </el-table>
</template>

<script lang="ts">
// import { ElMessage, ElMessageBox } from "element-plus";
import { defineComponent, shallowRef, PropType } from 'vue'
import { devToolApiClient } from '@/plugins'
import { Plus, DeleteFilled, Expand, Fold, Edit } from '@element-plus/icons-vue'
import { TableSimple, Project } from '@/types'
import moment from 'moment'
// import { useStore } from "@/store";
import { projectTableStore } from '@/store/projectTable'

let store: ReturnType<typeof projectTableStore>

const PlusIcon = shallowRef(Plus)

export default defineComponent({
  setup() {
    store = projectTableStore()
  },
  name: 'Entities',
  components: {
    DeleteFilled,
    Edit,
  },
  data() {
    return {
      PlusIcon,
      // projectId: undefined,
      tables: [],
      missingEnumType: [],
      search: '',
      moment,
      tableLoading: false,
      postData: {
        projectId: -1,
        name: '',
        comment: '',
        module: '',
      },
      dialog: {
        visible: false,
        button: {
          loading: false,
        },
      },
      projectModules: [] as any,
    }
  },
  computed: {
    projectId: {
      get() {
        return store.currentProjectId
      },
      set(projectId: number) {
        // store.commit("setCurrentProjectId", projectId);
        store.setCurrentProjectId(projectId)
      },
    },
    table() {
      return store.table
    },
    projects() {
      return store.projects
    },
  },
  methods: {
    async openDialog() {
      if (this.projectId) {
        this.postData = {
          projectId: this.projectId,
          name: '',
          comment: '',
          module: '',
        }
        this.dialog.visible = true
      }
    },
  },
  watch: {
    projectId: {
      async handler() {
        if (this.projectId) {
          try {
            this.tableLoading = true
            const result = await devToolApiClient.getEnumReport(this.projectId)
            this.tables = result.enumReport
            this.missingEnumType = result.missingEnumType
            this.tableLoading = false
          } catch (e) {
            this.tableLoading = false
          }
        } else {
          this.tables = []
        }
      },
      immediate: true,
    },
  },
})
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
