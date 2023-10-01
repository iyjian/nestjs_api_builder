import { defineStore } from "pinia";
import {
  Column,
  Table,
  DataType,
  TableSimple,
  NestCodeGenState,
  GitInfo,
  Project,
  RelationNode,
} from "@/types";
import _ from "lodash";
import { ElMessage } from "element-plus";
import { getDiff } from "@/libs/CodeUtil";
import { devToolApiClient } from "@/plugins";

export interface State {
  currentProjectId?: number;
  table: Table;
  persistTable: Table;
  tables: TableSimple[];
  status: NestCodeGenState;
  gitInfo: GitInfo;
  projects: Project[];
  dataTypes: DataType[];
}

const columnTemplate: Column = {
  name: "",
  comment: "",
  dataTypeId: 1,
  allowNull: true,
  refTableId: undefined,
  defaultValue: "",
  enumKeys: "",
  isEnable: true,
  searchable: false,
  findable: true,
  createable: true,
  updateable: true,
  order: 0,
  getCode: "",
  setCode: "",
  enumTypeCode: "",
  remark: "",
  sampleData: "",
};

export const projectTableStore = defineStore("projectTable", {
  state: (): State => ({
    currentProjectId: undefined,
    projects: [],
    tables: [],
    dataTypes: [],
    table: {
      id: 0,
      name: "",
      module: "",
      comment: "",
      project: {
        id: "",
        name: "",
        repo: "",
        repoId: "",
      },
      columns: [] as Column[],
      relationNodes: undefined,
    },
    // 在数据库里的table状态
    persistTable: {
      id: 0,
      name: "",
      module: "",
      comment: "",
      project: {
        id: "",
        name: "",
        repo: "",
        repoId: "",
      },
      columns: [] as Column[],
    },
    status: {
      isTriggerCodePreviewThrottleCalling: false,
      tableSaving: false,
      columnSettingDialogVisible: false,
      codePreviewing: false,
      ERPreviewer: false,
      previewTimer: undefined,
      skipNextSaving: false,
      selectedCodeTypes: ["enty"],
      currentPreviewMode: "preview",
    },
    gitInfo: {
      sourceBranch: "dev",
      // targetBranch: "",
      comment: "",
      mergeRequestUrl: "",
      codes: [],
    },
  }),
  getters: {
    readyColumns(state) {
      return state.table.columns.filter((column) => column && column.name);
    },
    totalColumns(state): number {
      return this.readyColumns.length;
    },
    /**
     * 深层的对象的watch, new和old是同一个引用
     *
     * https://github.com/vuejs/vue/issues/2164#issuecomment-542766308
     */
    stringifiedTable(state) {
      const clonedTable: any = _.cloneDeep(state.table);
      clonedTable.columns = this.readyColumns;
      return JSON.stringify(clonedTable);
    },
    stringifiedPersistTable(state) {
      return JSON.stringify(state.persistTable);
    },
    isTableValid(state) {
      if (
        state.table &&
        state.table.module &&
        state.table.comment &&
        state.table.name &&
        state.table.columns.length === 0
      ) {
        return true;
      } else if (
        state.table &&
        state.table.module &&
        state.table.comment &&
        state.table.name &&
        state.table.columns &&
        state.table.columns.filter((column) => column.name).length > 0
      ) {
        for (const column of state.table.columns) {
          if (column.isFK && !column.refTableId) {
            ElMessage.error("外键字段必须设置依赖表");
            return false;
          }
          if (column.dataType?.dataType === "enum" && !column.enumKeys) {
            ElMessage.error("枚举值数据类型必须填写枚举值列表");
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    },
  },
  actions: {
    setCurrentProjectId(projectId: number) {
      this.currentProjectId = projectId;
    },
    updateTable(table: Table) {
      this.table = table;
      console.log(
        `store - mutations - table: ${this.table.id} update completed`
      );
    },
    updatePersistTable(table: Table) {
      this.persistTable = _.cloneDeep(table);
    },
    updateTables(tables: TableSimple[]) {
      this.tables = tables;
    },
    updateProject(project: Project) {
      this.table.project = project;
    },
    emptyTable() {
      this.table.id = 0;
      this.table.name = "";
      this.table.module = "";
      this.table.comment = "";
      this.table.columns = [] as Column[];
      this.table.relationNodes = undefined;
    },
    emptyCode() {
      this.gitInfo.codes = [];
    },
    toDiffMode() {
      this.gitInfo.codes.map((code) => {
        code.showContent = getDiff(code.originContent, code.content);
        code.codeMirrorOptions = {
          mode: "text/x-diff",
          theme: "dracula",
          lineNumbers: true,
          foldGutter: true,
          styleActiveLine: true,
          readOnly: true,
        };
      });
      this.status.currentPreviewMode = "diff";
    },
    toPreviewMode() {
      this.gitInfo.codes.map((code) => {
        code.showContent = code.content;
        code.codeMirrorOptions = {
          mode: "text/javascript",
          theme: "dracula",
          lineNumbers: true,
          foldGutter: true,
          styleActiveLine: true,
          readOnly: true,
        };
      });
      this.status.currentPreviewMode = "preview";
    },
    addColumn(column: Column) {
      console.log("addColumn", column);
      this.table.columns.push(column);
    },
    setSelectedCodeTypes(payload: string[]) {
      this.status.selectedCodeTypes = payload;
    },
    setDataTypes(payload: DataType[]) {
      this.dataTypes = payload;
    },
    setProjects(payload: Project[]) {
      this.projects = payload;
    },
    startSaving() {
      console.log("debug...............");
      this.status.tableSaving = true;
    },
    stopSaving() {
      this.status.tableSaving = false;
    },
    setGitInfoSourceBranch(sourceBranch: string) {
      this.gitInfo.sourceBranch = sourceBranch;
    },
    setGitInfoComment(comment: string) {
      this.gitInfo.comment = comment;
    },
    setTableRelation(relationNodes: RelationNode[]) {
      this.table.relationNodes = relationNodes;
    },

    /**
     * 刷新项目下的表(删除表，新建表后需要调用此方法)
     *
     * @param param0
     */
    async refreshTablesAsync() {
      if (this.table.project.id) {
        const allTables = await devToolApiClient.loadAllTables(
          this.table.project.id
        );
        this.updateTables(allTables);
      } else {
        console.log("refreshTables - state.table.project.id");
      }
    },
    /**
     * 页面初始化(加载项目列表、数据类型、项目下表的列表)
     *
     */
    async initAsync() {
      const projects = await devToolApiClient.getAllProjects();
      this.setProjects(projects);

      const dataTypes = await devToolApiClient.loadDataTypes();
      this.setDataTypes(dataTypes);
    },
    /**
     * 切换项目
     *
     * @param param0
     * @param projectId
     */
    async switchProjectAsync(projectId: number) {
      this.emptyTable();
      this.emptyCode();
      const projectInfo = await devToolApiClient.getProjectInfo(
        projectId
      );
      this.updateProject(projectInfo);
      const allTables = await devToolApiClient.loadAllTables(
        projectId.toString()
      );
      this.updateTables(allTables);
    },
    /**
     * 切换表
     *
     * @param param0
     * @param tableId
     */
    // async switchTableAsync(tableId: number) {
    //   console.log(`projectTableStore - switchTableAsync - tableId: ${tableId}`);
    //   this.emptyTable();
    //   this.emptyCode();
    //   const table = await devToolApiClient.getTableInfo(tableId);
    //   this.updateTable(table);
    //   this.updatePersistTable(table);
    //   this.addEmptyColumn();
    //   // await this.triggerCodePreviewAsync('switchTableAsync');
    // },
    async switchTableAsyncV2(tableId: number) {
      console.log(`projectTableStore - switchTableAsync - tableId: ${tableId}`);
      this.emptyCode();
      const table = await devToolApiClient.getTableInfo(tableId);
      this.updateTable(table);
      this.updatePersistTable(table);
      this.addEmptyColumn();
      // await this.triggerCodePreviewAsync('switchTableAsync');
    },

    /**
     * 删除字段定义
     *
     * @param param0
     * @param column
     */
    async deleteColumnAsync(column: Column) {
      if (column.id) {
        // 老字段(已经同步到数据库里的字段)
        await devToolApiClient.deleteColumn(column.id);
        const table = await devToolApiClient.getTableInfo(this.table.id);
        this.updateTable(table);
        this.updatePersistTable(table);
      } else {
        this.table.columns = this.table.columns
          .filter((_column) => _column.order !== column.order)
          .map((_column, idx) => {
            _column.order = idx + 1;
            return _column;
          });
      }
    },

    /**
     * 加一个空行
     *
     * @param param0
     */
    addEmptyColumn() {
      if (this.isTableValid) {
        if (this.table.columns.length === 0) {
          this.addColumn(
            _.extend(_.clone(columnTemplate), {
              order: this.totalColumns + 1,
            })
          );
        } else {
          if (
            this.table.columns[this.table.columns.length - 1].dataTypeId !==
              undefined &&
            this.table.columns[this.table.columns.length - 1].name
          ) {
            this.addColumn(
              _.extend(_.clone(columnTemplate), {
                order: this.totalColumns + 1,
              })
            );

            for (const column of this.table.columns) {
              // TODO: FK 不一定是 int
              if (!column.isFK && column?.dataType?.dataType === "int") {
                column.refTableId = null;
                column.relation = undefined;
                column.relationColumnId = null;
              }
            }
          } else {
            console.log(`addEmptyColumn - ignore`);
          }
        }
      }
    },
    /**
     * 同步触发表的保存以及代码预览
     *
     * @param param0
     * @param skipSaving
     * @returns
     */
    async triggerCodePreviewAsync(source: string, skipSaving = false) {
      try {
        console.log(`triggerCodePreviewAsync - start - source: ${source} skipSaving: ${skipSaving}`)
        if (!this.isTableValid) {
          console.log(`store - triggerCodePreview - not valid`);
          this.status.tableSaving = false;
          this.status.codePreviewing = false;
          return;
        }

        /**
         * 如果有延迟预览的倒计时，则本次预览会清空倒计时
         */
        if (this.status.previewTimer) {
          clearTimeout(this.status.previewTimer);
          this.status.previewTimer = undefined;
        }

        /**
         * 如果表结构发生了改变，则先触发表的保存
         */
        if (this.stringifiedTable !== this.stringifiedPersistTable) {
          console.log(
            "--------stringifiedTable vs stringifiedPersistTable-----------"
          );
          console.log(this.stringifiedTable);
          console.log(this.stringifiedPersistTable);
          console.log(
            "----------stringifiedTable vs stringifiedPersistTable---------"
          );
          this.status.tableSaving = true;
          const clonedTable = _.cloneDeep(this.table);

          for (const i in clonedTable.columns) {
            clonedTable.columns[i].order = parseInt(i) + 1;
          }

          const savedTable = await devToolApiClient.saveEntity(this.table);
          this.updateTable(savedTable);
          this.updatePersistTable(savedTable);
        }

        /**
         * 触发代码预览开始
         */
        this.status.codePreviewing = true;
        const response = await devToolApiClient.genPreviewCode(
          this.table.id,
          this.status.selectedCodeTypes,
          this.gitInfo.sourceBranch
        );

        this.gitInfo.codes = response.codes.map((code) => {
          code.type = "code";
          return code;
        });

        this.addEmptyColumn();
        this.toPreviewMode();
        console.log("debug...............");
        this.status.tableSaving = false;
        this.status.codePreviewing = false;
        /**
         * 触发代码预览开始
         */
      } catch (e: any) {
        ElMessage.error(e.message);
        this.status.tableSaving = false;
        this.status.codePreviewing = false;
      }
    },
    /**
     * 延迟触发表的保存以及代码预览
     *
     * @param param0
     */
    async triggerCodePreviewThrottleAsync() {
      if (this.status.previewTimer) {
        clearTimeout(this.status.previewTimer);
        this.status.previewTimer = undefined;
      }

      this.status.previewTimer = setTimeout(async () => {
        await this.triggerCodePreviewAsync('triggerCodePreviewThrottleAsync');
        this.status.isTriggerCodePreviewThrottleCalling = false;
        this.status.previewTimer = undefined;
      }, 1 * 1000);
    },
  },
  persist: {
    enabled: true,
  },
});
