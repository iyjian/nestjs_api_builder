import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import {
  Column,
  Table,
  DataType,
  TableSimple,
  NestCodeGenState,
  GitInfo,
  Project,
} from "@/types";
import _ from "lodash";
import { devToolApiClient } from "@/plugins";
import VuexPersistence from "vuex-persist";
import { ElMessage } from "element-plus";
import { getDiff } from "@/libs/CodeUtil";

// const plugins = [new VuexPersistence().plugin];

// export interface State {
//   currentProjectId?: number;
//   table: Table;
//   persistTable: Table;
//   tables: TableSimple[];
//   status: NestCodeGenState;
//   gitInfo: GitInfo;
//   projects: Project[];
//   dataTypes: DataType[];
// }

// export const key: InjectionKey<Store<State>> = Symbol();

// const columnTemplate: Column = {
//   name: "",
//   comment: "",
//   dataTypeId: 1,
//   allowNull: true,
//   refTableId: undefined,
//   defaultValue: "",
//   enumKeys: "",
//   isEnable: true,
//   searchable: false,
//   findable: true,
//   createable: true,
//   updateable: true,
//   order: 0,
//   getCode: "",
//   setCode: "",
//   enumTypeCode: "",
//   remark: "",
//   sampleData: "",
// };

// export const store = createStore<State>({
//   state: {
//     currentProjectId: undefined,
//     projects: [],
//     tables: [],
//     dataTypes: [],
//     table: {
//       id: 0,
//       name: "",
//       module: "",
//       comment: "",
//       project: {
//         id: "",
//         name: "",
//         repo: "",
//         repoId: "",
//       },
//       columns: [] as Column[],
//       relationNodes: undefined,
//     },
//     // 在数据库里的table状态
//     persistTable: {
//       id: 0,
//       name: "",
//       module: "",
//       comment: "",
//       project: {
//         id: "",
//         name: "",
//         repo: "",
//         repoId: "",
//       },
//       columns: [] as Column[],
//     },
//     status: {
//       isTriggerCodePreviewThrottleCalling: false,
//       tableSaving: false,
//       columnSettingDialogVisible: false,
//       codePreviewing: false,
//       ERPreviewer: false,
//       previewTimer: undefined,
//       skipNextSaving: false,
//       selectedCodeTypes: ["enty"],
//       currentPreviewMode: "preview",
//     },
//     gitInfo: {
//       sourceBranch: "dev",
//       // targetBranch: "",
//       comment: "",
//       mergeRequestUrl: "",
//       codes: [],
//     },
//   },
//   getters: {
//     readyColumns(state) {
//       return state.table.columns.filter((column) => column && column.name);
//     },
//     totalColumns(state, getters): number {
//       return getters.readyColumns.length;
//     },
//     /**
//      * 深层的对象的watch, new和old是同一个引用
//      *
//      * https://github.com/vuejs/vue/issues/2164#issuecomment-542766308
//      */
//     stringifiedTable(state, getters) {
//       const clonedTable: any = _.cloneDeep(state.table);
//       clonedTable.columns = getters.readyColumns;
//       return JSON.stringify(clonedTable);
//     },
//     stringifiedPersistTable(state) {
//       return JSON.stringify(state.persistTable);
//     },
//     isTableValid(state) {
//       if (
//         state.table &&
//         state.table.module &&
//         state.table.comment &&
//         state.table.name &&
//         state.table.columns.length === 0
//       ) {
//         return true;
//       } else if (
//         state.table &&
//         state.table.module &&
//         state.table.comment &&
//         state.table.name &&
//         state.table.columns &&
//         state.table.columns.filter((column) => column.name).length > 0
//       ) {
//         for (const column of state.table.columns) {
//           if (column.isFK && !column.refTableId) {
//             ElMessage.error("外键字段必须设置依赖表");
//             return false;
//           }
//           if (column.dataType?.dataType === "enum" && !column.enumKeys) {
//             ElMessage.error("枚举值数据类型必须填写枚举值列表");
//             return false;
//           }
//         }
//         return true;
//       } else {
//         return false;
//       }
//     },
//   },
//   actions: {
//     /**
//      * 刷新项目下的表(删除表，新建表后需要调用此方法)
//      *
//      * @param param0
//      */
//     async refreshTables({ state, commit }) {
//       if (state.table.project.id) {
//         const allTables = await devToolApiClient.loadAllTables(
//           state.table.project.id
//         );
//         commit("updateTables", allTables);
//       } else {
//         console.log("refreshTables - state.table.project.id");
//       }
//     },
//     /**
//      * 页面初始化(加载项目列表、数据类型、项目下表的列表)
//      *
//      */
//     async init({ state, commit, dispatch }) {
//       const projects = await devToolApiClient.getAllProjects();
//       commit("setProjects", projects);

//       const dataTypes = await devToolApiClient.loadDataTypes();
//       commit("setDataTypes", dataTypes);
//     },
//     /**
//      * 切换项目
//      *
//      * @param param0
//      * @param projectId
//      */
//     async switchProject({ state, commit, dispatch }, projectId) {
//       commit("emptyTable");
//       commit("emptyCode");
//       const projectInfo = await devToolApiClient.getProjectInfo(projectId);
//       commit("updateProject", projectInfo);
//       const allTables = await devToolApiClient.loadAllTables(projectId);
//       commit("updateTables", allTables);
//     },
//     // async reloadProjectTables({state, commit }, projectId) {
//     //   const allTables = await devToolApiClient.loadAllTables(projectId);
//     //   commit("updateTables", allTables);
//     // },
//     /**
//      * 切换表
//      *
//      * @param param0
//      * @param tableId
//      */
//     async switchTable({ state, commit, dispatch }, tableId: number) {
//       commit("emptyTable");
//       commit("emptyCode");
//       const table = await devToolApiClient.getTableInfo(tableId);
//       commit("updateTable", table);
//       commit("updatePersistTable", table);
//       dispatch("addEmptyColumn");
//       dispatch("triggerCodePreview");
//     },

//     /**
//      * 删除字段定义
//      *
//      * @param param0
//      * @param column
//      */
//     async deleteColumn({ state, commit }, column: Column) {
//       if (column.id) {
//         // 老字段(已经同步到数据库里的字段)
//         await devToolApiClient.deleteColumn(column.id);
//         const table = await devToolApiClient.getTableInfo(state.table.id);
//         commit("updateTable", table);
//         commit("updatePersistTable", table);
//       } else {
//         state.table.columns = state.table.columns
//           .filter((_column) => _column.order !== column.order)
//           .map((_column, idx) => {
//             _column.order = idx + 1;
//             return _column;
//           });
//       }
//     },

//     /**
//      * 加一个空行
//      *
//      * @param param0
//      */
//     addEmptyColumn({ state, getters, commit }) {
//       if (getters.isTableValid) {
//         if (state.table.columns.length === 0) {
//           commit(
//             "addColumn",
//             _.extend(_.clone(columnTemplate), {
//               order: getters.totalColumns + 1,
//             })
//           );
//         } else {
//           if (
//             state.table.columns[state.table.columns.length - 1].dataTypeId !==
//               undefined &&
//             state.table.columns[state.table.columns.length - 1].name
//           ) {
//             commit(
//               "addColumn",
//               _.extend(_.clone(columnTemplate), {
//                 order: getters.totalColumns + 1,
//               })
//             );

//             for (const column of state.table.columns) {
//               // TODO: FK 不一定是 int
//               if (!column.isFK && column?.dataType?.dataType === "int") {
//                 column.refTableId = null;
//                 column.relation = undefined;
//                 column.relationColumnId = null;
//               }
//             }
//           } else {
//             console.log(`addEmptyColumn - ignore`);
//           }
//         }
//       }
//     },
//     /**
//      * 同步触发表的保存以及代码预览
//      *
//      * @param param0
//      * @param skipSaving
//      * @returns
//      */
//     async triggerCodePreview(
//       { state, getters, commit, dispatch },
//       skipSaving = false
//     ) {
//       try {
//         if (!getters.isTableValid) {
//           console.log(`store - triggerCodePreview - not valid`);
//           state.status.tableSaving = false;
//           state.status.codePreviewing = false;
//           return;
//         }

//         /**
//          * 如果有延迟预览的倒计时，则本次预览会清空倒计时
//          */
//         if (state.status.previewTimer) {
//           clearTimeout(state.status.previewTimer);
//           state.status.previewTimer = undefined;
//         }

//         /**
//          * 如果表结构发生了改变，则先触发表的保存
//          */
//         if (getters.stringifiedTable !== getters.stringifiedPersistTable) {
//           console.log(
//             "--------stringifiedTable vs stringifiedPersistTable-----------"
//           );
//           console.log(getters.stringifiedTable);
//           console.log(getters.stringifiedPersistTable);
//           console.log(
//             "----------stringifiedTable vs stringifiedPersistTable---------"
//           );
//           state.status.tableSaving = true;
//           const clonedTable = _.cloneDeep(state.table);
//           // clonedTable.columns = clonedTable.columns.map(
//           //   (column, index) => (column.order = index + 1)
//           // );
//           for (const i in clonedTable.columns) {
//             clonedTable.columns[i].order = parseInt(i) + 1;
//           }
//           const savedTable = await devToolApiClient.saveEntity(state.table);
//           store.commit("updateTable", savedTable);
//           store.commit("updatePersistTable", savedTable);
//         }

//         /**
//          * 触发代码预览开始
//          */
//         state.status.codePreviewing = true;
//         const response = await devToolApiClient.genPreviewCode(
//           state.table.id,
//           state.status.selectedCodeTypes,
//           state.gitInfo.sourceBranch
//         );

//         state.gitInfo.codes = response.codes.map((code) => {
//           code.type = "code";
//           return code;
//         });

//         dispatch("addEmptyColumn");
//         commit("toPreviewMode");
//         console.log("debug...............");
//         state.status.tableSaving = false;
//         state.status.codePreviewing = false;
//         /**
//          * 触发代码预览开始
//          */
//       } catch (e: any) {
//         ElMessage.error(e.message);
//         state.status.tableSaving = false;
//         state.status.codePreviewing = false;
//       }
//     },
//     /**
//      * 延迟触发表的保存以及代码预览
//      *
//      * @param param0
//      */
//     async triggerCodePreviewThrottle({ state, getters, commit, dispatch }) {
//       if (state.status.previewTimer) {
//         clearTimeout(state.status.previewTimer);
//         state.status.previewTimer = undefined;
//       }

//       state.status.previewTimer = setTimeout(async () => {
//         await dispatch("triggerCodePreview");
//         state.status.isTriggerCodePreviewThrottleCalling = false;
//         state.status.previewTimer = undefined;
//       }, 1 * 1000);
//     },
//   },
//   mutations: {
//     setCurrentProjectId(state, projectId: number) {
//       state.currentProjectId = projectId;
//     },
//     updateTable(state, table: Table) {
//       state.table = table;
//       console.log(
//         `store - mutations - table: ${state.table.id} update completed`
//       );
//     },
//     updatePersistTable(state, table: Table) {
//       state.persistTable = _.cloneDeep(table);
//     },
//     updateTables(state, tables: TableSimple[]) {
//       state.tables = tables;
//     },
//     updateProject(state, project) {
//       state.table.project = project;
//     },
//     emptyTable(state) {
//       state.table.id = 0;
//       state.table.name = "";
//       state.table.module = "";
//       state.table.comment = "";
//       state.table.columns = [] as Column[];
//       state.table.relationNodes = undefined;
//     },
//     emptyCode(state) {
//       state.gitInfo.codes = [];
//     },
//     toDiffMode(state) {
//       state.gitInfo.codes.map((code) => {
//         code.showContent = getDiff(code.originContent, code.content);
//         code.codeMirrorOptions = {
//           mode: "text/x-diff",
//           theme: "dracula",
//           lineNumbers: true,
//           foldGutter: true,
//           styleActiveLine: true,
//           readOnly: true,
//         };
//       });
//       state.status.currentPreviewMode = "diff";
//     },
//     toPreviewMode(state) {
//       state.gitInfo.codes.map((code) => {
//         code.showContent = code.content;
//         code.codeMirrorOptions = {
//           mode: "text/javascript",
//           theme: "dracula",
//           lineNumbers: true,
//           foldGutter: true,
//           styleActiveLine: true,
//           readOnly: true,
//         };
//       });
//       state.status.currentPreviewMode = "preview";
//     },
//     addColumn(state, column) {
//       console.log("addColumn", column);
//       state.table.columns.push(column);
//     },
//     setSelectedCodeTypes(state, payload) {
//       state.status.selectedCodeTypes = payload;
//     },
//     setDataTypes(state, payload) {
//       state.dataTypes = payload;
//     },
//     setProjects(state, payload) {
//       state.projects = payload;
//     },
//     startSaving(state) {
//       console.log("debug...............");
//       state.status.tableSaving = true;
//     },
//     stopSaving(state) {
//       state.status.tableSaving = false;
//     },
//     setGitInfoSourceBranch(state, sourceBranch) {
//       state.gitInfo.sourceBranch = sourceBranch;
//     },
//     setGitInfoComment(state, comment) {
//       state.gitInfo.comment = comment;
//     },
//     setTableRelation(state, relationNodes) {
//       state.table.relationNodes = relationNodes;
//     },
//   },
//   plugins,
// });

// export function useStore() {
//   return baseUseStore(key);
// }
