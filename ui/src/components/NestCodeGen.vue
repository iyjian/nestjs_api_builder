<template>
  <div class="nest-code-gen">
    <div class="toolbar">
      <div style="width: 32px; cursor: pointer" @click="$router.back()">
        <Back />
      </div>
      <el-input
        type="text"
        style="width: 150px"
        v-model="table.project.name"
        :disabled="true"
      />

      <el-input
        type="text"
        style="width: 80px"
        v-model="table.module"
        :disabled="!!table.id"
        placeholder="所属模块"
      />

      <el-input
        type="text"
        style="width: 180px"
        :disabled="!!table.id"
        v-model="table.name"
        placeholder="表名t_****"
      />

      <el-input
        type="text"
        style="width: 180px"
        v-model="table.comment"
        placeholder="表描述"
      />

      <el-input
        type="text"
        style="width: 80px"
        v-model="sourceBranch"
        placeholder="基础分支"
      ></el-input>

      <el-input
        type="text"
        style="width: 100px"
        v-model="gitCommitComment"
        placeholder="提交信息"
      ></el-input>

      <el-button
        type="danger"
        @click="saveAndSubmitPR('commit')"
        :loading="state.tableSaving"
        :disabled="state.tableSaving"
      >
        提交
      </el-button>

      <!-- <el-button
        type="danger"
        @click="saveAndSubmitPR('pr')"
        :loading="state.tableSaving"
        :disabled="state.tableSaving"
      >
        PR
      </el-button> -->

      <el-button
        type="success"
        @click="store.triggerCodePreviewAsync()"
        :loading="state.tableSaving"
        :disabled="state.tableSaving"
      >
        保存
      </el-button>

      <el-button
        type="primary"
        @click="toggerViewMode"
        :loading="state.tableSaving"
        :disabled="state.tableSaving"
      >
        {{ previewButton }}
      </el-button>

      <el-button-group size="small" type="info">
        <el-button @click="setCodeTypes('entity')">仅实体</el-button>
        <el-button @click="setCodeTypes('all')"> 全部 </el-button>
      </el-button-group>
    </div>
    <div class="info">
      <div class="info-left">
        <div style="margin-right: 10px">tableId: {{ table.id }}</div>
        <el-space>
        <ERPreviewer :tableId="table.id"> </ERPreviewer>
        <ColumnSummary :columns="computedReadyColumns"></ColumnSummary>
        <ParseImg />
        <IndexManager :tableId="store.table.id" />
        <SyncPreview :tableId="store.table.id" />
      </el-space>
        <!-- <div
          id="srcImg"
          style="width: 400px; height: 40px; border: 1px solid gray"
        ></div> -->
        <!-- <el-button @click="refreshER">刷新ER</el-button> -->
        <div v-if="gitInfo.mergeRequestUrl">
          <a :href="gitInfo.mergeRequestUrl" target="_blank">查看PR</a>
        </div>
      </div>
      <el-checkbox-group v-model="state.selectedCodeTypes">
        <!-- TODO: 需要设置依赖关系 比如没有勾选dto/req就不能勾选dto/idx -->
        <el-checkbox label="enty" />
        <el-checkbox label="dto/req" />
        <el-checkbox label="ctl" />
        <el-checkbox label="serv" />
        <el-checkbox label="mdu" />
        <el-checkbox label="dto/idx" />
        <el-checkbox label="enty/idx" />
        <el-checkbox label="ctl/idx" />
        <el-checkbox label="serv/idx" />
        <el-checkbox label="mdu/idx" />
        <el-checkbox label="schema" />
      </el-checkbox-group>
    </div>
    <div class="wrapper">
      <div class="table-wrapper">
        <div class="table-row">
          <div style="width: 150px; text-align: center">字段</div>
          <div style="width: 140px; text-align: center">类型</div>
          <div style="width: 150px; text-align: center">描述</div>
          <div style="width: 150px; text-align: center">样例数据</div>
          <div style="width: 60px; text-align: center">必填</div>
          <div style="width: 60px; text-align: center">搜索</div>
        </div>
        <!-- 实体的定义 -->
        <draggable
          v-model="table.columns"
          :move="checkMove"
          handle=".rank-icon"
          item-key="id"
          v-bind="dragOptions"
          :component-data="{ type: 'transtion-group' }"
        >
          <template #item="{ element: column }">
            <div
              class="table-row"
              v-if="column.dataType?.dataType !== 'vrelation'"
            >
              <!-- 表的基本定义 -->
              <div class="table-sub-row">
                <div>
                  <div class="table-sub-row__columns" style="display: flex">
                    <!-- 字段 -->
                    <div class="table-sub-row-item" style="width: 150px">
                      <el-input
                        :disabled="!column.isEnable"
                        type="text"
                        v-model="column.name"
                        placeholder=""
                      >
                      </el-input>
                    </div>
                    <!-- 数据类型 -->
                    <div class="table-sub-row-item" style="width: 140px">
                      <el-select
                        filterable
                        v-model="column.dataTypeId"
                        placeholder="数据类型"
                        :disabled="!column.isEnable"
                      >
                        <el-option-group
                          v-for="(subDataTypes, category) in groupedDataTypes"
                          :key="category"
                          :label="category"
                        >
                          <el-option
                            v-for="(dataType, key) in subDataTypes"
                            :key="key"
                            :label="dataType.dataType"
                            :value="dataType.id"
                            :disabled="dataType.dataType === 'vrelation'"
                          />
                        </el-option-group>
                      </el-select>
                    </div>
                    <!-- 描述 -->
                    <div class="table-sub-row-item" style="width: 150px">
                      <el-input
                        :disabled="!column.isEnable"
                        type="text"
                        v-model="column.comment"
                        placeholder=""
                      ></el-input>
                    </div>
                    <!-- 样例数据 -->
                    <div class="table-sub-row-item" style="width: 150px">
                      <el-input
                        :disabled="!column.isEnable"
                        type="text"
                        v-model="column.sampleData"
                        placeholder=""
                      ></el-input>
                    </div>
                    <!-- 是否必填 -->
                    <div class="table-sub-row-item" style="width: 60px">
                      <el-switch
                        :active-value="false"
                        :inactive-value="true"
                        :disabled="!column.isEnable"
                        v-model="column.allowNull"
                        size="small"
                      ></el-switch>
                    </div>
                    <!-- 是否参加搜索 -->
                    <div class="table-sub-row-item" style="width: 60px">
                      <el-switch
                        :disabled="!column.isEnable"
                        v-model="column.searchable"
                        size="small"
                      ></el-switch>
                    </div>
                  </div>
                  <!-- 枚举值定义 换行显示 -->
                  <div class="extra-row" style="display: flex">
                    <div
                      v-if="dataTypeByDataTypeId[column.dataTypeId] === 'enum'"
                      class="table-sub-row-item"
                    >
                      <div style="margin-right: 10px">枚举值:</div>
                      <el-input
                        type="text"
                        style="width: 280px"
                        v-model="column.enumKeys"
                        placeholder="多个枚举值用逗号分隔"
                      ></el-input>
                    </div>
                  </div>
                </div>

                <!-- 设置 -->
                <div
                  class="table-sub-row-item"
                  style="flex: 1; display: flex; justify-content: flex-end"
                >
                  <div style="width: 32px">
                    <Setting
                      v-if="column.name"
                      @click="openSetting(column)"
                      class="setting-icon"
                    />
                  </div>
                  <div style="width: 32px">
                    <Delete
                      v-if="column.name"
                      @click="deleteColumn(column)"
                      class="delete-icon"
                    />
                  </div>
                  <div style="width: 32px">
                    <Rank v-if="column.name" class="rank-icon"> </Rank>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <!-- 关系字段展示 这里仅展示hasOne和hasMany -->
        <div class="table-row" style="margin-top: 20px">
          <div style="width: 150px; text-align: center">属性</div>
          <div style="width: 200px; text-align: center">关联表</div>
          <div style="width: 200px; text-align: center">关系</div>
          <div style="width: 150px; text-align: center">启用</div>
        </div>
        <template v-for="column in table.columns">
          <div
            class="table-row"
            v-if="
              column.relation &&
              column.dataType?.dataType === 'vrelation' &&
              column.relation !== 'BelongsTo'
            "
          >
            <!-- 关系字段 不可删除 不可配置-->
            <div class="table-sub-row">
              <!-- 属性 -->
              <div class="table-sub-row-item" style="width: 150px">
                <el-input
                  :disabled="!column.isEnable"
                  type="text"
                  v-model="column.name"
                  placeholder=""
                >
                </el-input>
              </div>

              <!-- 依赖表 -->
              <div class="table-sub-row-item" style="width: 200px">
                <el-select :disabled="true" v-model="column.refTableId">
                  <!-- placeholder="依赖表" -->
                  <!-- clearable -->
                  <!-- filterable -->
                  <!-- @change="(refTableId: number) => changeRefTable(column, refTableId)" -->
                  <el-option
                    v-for="refTable in allTables"
                    :key="refTable.id"
                    :label="refTable.name"
                    :value="refTable.id"
                  >
                  </el-option>
                </el-select>
              </div>

              <!-- 依赖关系 -->
              <div class="table-sub-row-item" style="width: 200px">
                <el-select
                  :disabled="
                    !column.isEnable || column.relation === 'BelongsTo'
                  "
                  filterable
                  v-model="column.relation"
                  placeholder="关系"
                >
                  <el-option
                    :disabled="true"
                    label="BelongsTo"
                    value="BelongsTo"
                  >
                  </el-option>
                  <el-option label="HasMany" value="HasMany"> </el-option>
                  <el-option label="HasOne" value="HasOne"> </el-option>
                  <el-option label="BelongsToMany" value="BelongsToMany">
                  </el-option>
                </el-select>
              </div>

              <!-- 是否启用关系 -->
              <div class="table-sub-row-item" style="width: 150px">
                <el-switch size="small" v-model="column.isEnable" />
              </div>
            </div>
          </div>
        </template>
        <!-- 关系字段展示 -->
      </div>

      <!-- codePreview组件+relation配置 -->
      <div
        class="code-wrapper"
        v-loading="state.tableSaving || state.codePreviewing"
      >
        <CodePreivew
          ref="codemirror"
          :tableId="table.id"
          :codes="gitInfo.codes"
        ></CodePreivew>
      </div>
    </div>

    <!-- column settings dialog begin -->
    <el-dialog
      class="column-setting-dialog"
      v-model="state.columnSettingDialogVisible"
      v-if="editingColumn"
      :title="`高级配置 - ${editingColumn?.name}`"
      width="50%"
    >
      <div class="setting-row">
        <div class="title"><span>关系字段</span></div>
        <div class="val">
          <el-switch
            :disabled="
              !editingColumn.isEnable ||
              dataTypeByDataTypeId[editingColumn.dataTypeId]?.dataType !== 'int'
            "
            v-model="editingColumn.isFK"
            size="small"
          ></el-switch>
        </div>
        <template v-if="editingColumn.isFK">
          <div class="title"><span>关联表</span></div>
          <div class="select">
            <el-select
              :disabled="
                !editingColumn.isEnable ||
                dataTypeByDataTypeId[editingColumn.dataTypeId]?.dataType !==
                  'int'
              "
              style="width: 100%"
              clearable
              filterable
              v-model="editingColumn.refTableId"
              @change="(refTableId: number) => changeRefTable(editingColumn, refTableId)"
              placeholder="依赖表"
            >
              <el-option
                v-for="refTable in allTables"
                :key="refTable.id"
                :label="refTable.name"
                :value="refTable.id"
              >
              </el-option>
            </el-select>
          </div>
          <template
            v-if="
              allTables.filter(
                (table) => table.id === editingColumn?.refTableId
              ).length > 0 &&
              allTables.filter(
                (table) => table.id === editingColumn?.refTableId
              )[0]['name'] === 't_enum'
            "
          >
            <div class="title"><span>枚举代码</span></div>
            <div class="val">
              <el-input v-model="editingColumn.enumTypeCode"></el-input>
            </div>
          </template>
        </template>
      </div>

      <div
        class="setting-row"
        v-if="
          editingColumn.isFK &&
          editingColumn.relationColumn?.name &&
          editingColumn.relationColumn?.relation
        "
      >
        <div class="title"><span>属性</span></div>
        <div class="val">
          <el-input
            v-model="editingColumn.relationColumn.name"
            v-if="editingColumn.isFK && editingColumn.relationColumn?.name"
            :disabled="!editingColumn.isEnable"
            type="text"
            placeholder=""
          />
        </div>
        <div class="title"><span>关系</span></div>
        <div class="select">
          <el-select
            style="width: 100%"
            :disabled="
              !editingColumn.relationColumn.isEnable ||
              editingColumn.relationColumn.relation === 'BelongsTo'
            "
            filterable
            v-model="editingColumn.relationColumn.relation"
            placeholder="关系"
          >
            <el-option :disabled="true" label="BelongsTo" value="BelongsTo">
            </el-option>
            <el-option label="HasMany" value="HasMany"> </el-option>
            <el-option label="HasOne" value="HasOne"> </el-option>
            <el-option label="BelongsToMany" value="BelongsToMany"> </el-option>
          </el-select>
        </div>
        <div class="title"><span>启用</span></div>
        <div class="val">
          <el-switch
            size="small"
            v-model="editingColumn.relationColumn.isEnable"
            :disabled="editingColumn.relationColumn.relation === 'BelongsTo'"
          />
        </div>
      </div>

      <div
        class="setting-row"
        v-if="
          dataTypeByDataTypeId[editingColumn.dataTypeId]?.dataType !==
          'vrelation'
        "
      >
        <div class="title"><span>默认值</span></div>
        <div class="val">
          <el-input
            :disabled="!editingColumn.isEnable"
            type="text"
            v-model="editingColumn.defaultValue"
            placeholder=""
          ></el-input>
        </div>
        <!--  -->
        <div class="title"><span>下拉框展示</span></div>
        <div class="val">
          <el-switch
            :disabled="!editingColumn.isEnable"
            v-model="editingColumn.forSelectDisplay"
            size="small"
          ></el-switch>
        </div>
      </div>

      <div class="setting-row">
        <div class="title">可查询</div>
        <div class="val">
          <el-switch
            :disabled="!editingColumn.isEnable"
            v-model="editingColumn.findable"
            size="small"
          ></el-switch>
        </div>
        <div class="title">可创建</div>
        <div class="val">
          <el-switch
            :disabled="!editingColumn.isEnable"
            v-model="editingColumn.createable"
            size="small"
          ></el-switch>
        </div>
        <div class="title">可更新</div>
        <div class="val">
          <el-switch
            :disabled="!editingColumn.isEnable"
            v-model="editingColumn.updateable"
            size="small"
          ></el-switch>
        </div>
      </div>

      <div class="setting-row">
        <div class="title">备注</div>
        <div class="multiple-input">
          <el-input
            type="textarea"
            rows="3"
            v-model="editingColumn.remark"
          ></el-input>
        </div>
      </div>

      <div class="setting-row">
        <div class="title">getter</div>
        <div class="codeEditor">
          <Codemirror
            class="code-edit-box"
            v-model:value="editingColumn.getCode"
            :options="codeMirrorOption"
          />
        </div>
      </div>

      <div class="setting-row">
        <div class="title">setter</div>
        <div class="codeEditor">
          <Codemirror
            class="code-edit-box"
            v-model:value="editingColumn.setCode"
            :options="codeMirrorOption"
          />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="state.columnSettingDialogVisible = false"
            >关闭</el-button
          >
        </span>
      </template>
    </el-dialog>
    <!-- column settings dialog end   -->
  </div>
</template>

<script lang="ts">
export default {
  name: "NestCodeGen",
};
</script>

<script lang="ts" setup>
// import { useStore } from "@/store";
import { projectTableStore } from "@/store/projectTable";
import { ref, watch, computed, shallowRef, reactive, onMounted } from "vue";
import CodePreivew from "./CodePreview.vue";
import ERPreviewer from "./ERPreviewer.vue";
import { devToolApiClient } from "@/plugins";
import ColumnSummary from "./ColumnSummary.vue";
import _ from "lodash";
import draggable from "vuedraggable";
import { Column, Table } from "@/types";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Rank, Setting, Back } from "@element-plus/icons-vue";
import Codemirror from "codemirror-editor-vue3";
import ParseImg from "./ParseImg.vue";
import IndexManager from "./IndexManager.vue";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/theme/dracula.css";
import SyncPreview from "@/components/SyncPreview.vue";
// const store = useStore();
const store = projectTableStore();

const codeMirrorOption = {
  mode: "text/javascript",
  tabSize: 2,
  lineNumbers: false,
  readOnly: false,
  showCursorWhenSelecting: true,
  singleCursorHeightPerLine: false,
  styleActiveLine: true,
  theme: "dracula",
  foldGutter: true,
};

const table = computed(() => {
  console.log(store.table);
  return store.table;
});

// const table = store.table

const allTables = computed(() => store.tables);
const groupedDataTypes = computed<{ [key: string]: any[] }>(() => {
  return _.groupBy(store.dataTypes, (o: any) => o.category);
});

const dataTypeByDataTypeId = computed<{ [key: string]: any }>(() => {
  return _.keyBy(store.dataTypes, (o: any) => o.id);
});

const computedReadyColumns = computed(() => store.readyColumns);
const stringifiedTable = computed(() => store.stringifiedTable);
const state = computed(() => store.status);
const gitInfo = computed(() => store.gitInfo);

const sourceBranch = computed({
  get: () => store.gitInfo.sourceBranch,
  set: (val) => {
    // store.commit("setGitInfoSourceBranch", val);
    store.setGitInfoSourceBranch(val);
  },
});

const gitCommitComment = computed({
  get: () => store.gitInfo.comment,
  set: (val) => {
    // store.commit("setGitInfoComment", val);
    store.setGitInfoComment(val);
  },
});

const previewButton = computed(() =>
  store.status.currentPreviewMode === "preview" ? "查看diff" : "查看生成代码"
);

const dragOptions = computed(() => ({
  animation: 200,
  group: "description",
  disabled: false,
  ghostClass: "ghost",
}));

const checkMove = (evt: any) => {
  return !!evt.draggedContext.element.name && !!evt.relatedContext.element.name;
};

// store.dispatch("init");

/**
 * 强制刷新页面里的缓存
 */
if (table.value.id) {
  await store.switchTableAsync(table.value.id);
}

/**
 * 关联表的选中与取消选中
 *
 * @param column
 * @param refTableId
 */
function changeRefTable(column?: Column, refTableId?: number) {
  if (!column) {
    return;
  }
  if (refTableId) {
    column.relation = "BelongsTo";
  } else {
    column.refTableId = null;
    column.relation = null;
  }
}

/**
 * 保存代码并发起PR
 * TODO: 经调查后端并没有save，这里需要改名字
 *
 */
async function saveAndSubmitPR(type: "commit" | "pr") {
  try {
    // store.commit("startSaving");
    store.startSaving();
    if (table.value.id) {
      const mergeRequestResult = await devToolApiClient.saveAndSubmitPR(
        table.value.id,
        gitInfo.value.codes.filter((code: any) => code.type === "code"),
        gitInfo.value.sourceBranch,
        type === "commit" ? gitInfo.value.sourceBranch : "",
        gitInfo.value.comment
      );
      // store.commit("stopSaving");
      store.stopSaving();
      if (type === "commit") {
        ElMessage.success("代码已提交");
        gitInfo.value.mergeRequestUrl = "";
        gitInfo.value.comment = "";
      } else {
        ElMessage.success("已发起PR");
        gitInfo.value.mergeRequestUrl =
          mergeRequestResult.MergeInfo.MergeRequestUrl;
      }
    }
  } catch (e: any) {
    ElMessage.warning(e.message);
    // store.commit("stopSaving");
    store.stopSaving();
  }
}

/**
 * 删除column
 *
 * @param columnToBeDeleted
 */
async function deleteColumn(columnToBeDeleted: Column) {
  try {
    await ElMessageBox.confirm(
      `删除列${columnToBeDeleted.name}`,
      "是否确认删除",
      {
        distinguishCancelAndClose: true,
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
      }
    );
    // store.dispatch("deleteColumn", columnToBeDeleted);
    await store.deleteColumnAsync(columnToBeDeleted);
  } catch (e) {
    console.log(e);
  }
}

/**
 * 字段 settings 弹出框
 *
 * @param column
 */
// const editingColumn = ref<Partial<Column>>({});
const editingColumn = ref<Column>();

async function openSetting(column: Column) {
  console.log("column:::::::::::::::::", column);
  editingColumn.value = column;
  if (
    column.relationColumnId &&
    table.value.columns.filter(
      (column_) => column_.id === column.relationColumnId
    ).length
  ) {
    editingColumn.value.relationColumn = table.value.columns.filter(
      (column_) => column_.id === column.relationColumnId
    )[0];
  }
  state.value.columnSettingDialogVisible = true;
}
/**
 * 字段 settings 弹出框
 */

function toggerViewMode() {
  if (store.status.currentPreviewMode === "preview") {
    // store.commit("toDiffMode");
    store.toDiffMode();
  } else {
    // store.commit("toPreviewMode");
    store.toPreviewMode();
  }
}

function setCodeTypes(shortcut: string) {
  if (shortcut === "entity") {
    // store.commit("setSelectedCodeTypes", ["enty"]);
    store.setSelectedCodeTypes(["enty"]);
  } else if (shortcut === "all") {
    if (table.value.project.version === 1) {
      store.setSelectedCodeTypes([
        "enty",
        "dto/req",
        "ctl",
        "serv",
        "mdu",
        "dto/idx",
        "enty/idx",
        "mdu/idx",
      ]);
      // store.commit("setSelectedCodeTypes", [
      //   "enty",
      //   "dto/req",
      //   "ctl",
      //   "serv",
      //   "mdu",
      //   "dto/idx",
      //   "enty/idx",
      //   "mdu/idx",
      // ]);
    } else {
      store.setSelectedCodeTypes([
        "enty",
        "dto/req",
        "ctl",
        "serv",
        "mdu",
        "dto/idx",
        "enty/idx",
        "ctl/idx",
        "serv/idx",
        "mdu/idx",
        "schema",
      ]);
      // store.commit("setSelectedCodeTypes", [
      //   "enty",
      //   "dto/req",
      //   "ctl",
      //   "serv",
      //   "mdu",
      //   "dto/idx",
      //   "enty/idx",
      //   "ctl/idx",
      //   "serv/idx",
      //   "mdu/idx",
      //   "schema",
      // ]);
    }
  }
}

/**
 * 代码类别更新后的watch
 */
watch(
  () => store.status.selectedCodeTypes,
  async () => {
    // store.dispatch("triggerCodePreview");
    await store.triggerCodePreviewAsync();
  }
);

watch(
  stringifiedTable,
  async (_newStringifiedTableDefinition, _oldStringifiedTableDefinition) => {
    if (_newStringifiedTableDefinition === _oldStringifiedTableDefinition) {
      console.log(`NestCodeGen - watch stringifiedTable - no change detected`);
      return;
    }

    if (!_oldStringifiedTableDefinition) {
      // 首次加载则触发代码预览
      // await store.dispatch("triggerCodePreview", true);
      await store.triggerCodePreviewAsync(true);
      return;
    }

    // 检查是否需要增加下一列
    // store.dispatch("addEmptyColumn");
    await store.addEmptyColumn();

    const newTable: Table = JSON.parse(_newStringifiedTableDefinition) as Table;
    const oldTable: Table = JSON.parse(_oldStringifiedTableDefinition) as Table;

    if (!oldTable.id && newTable.id) {
      // await store.dispatch("refreshTables");
      await store.refreshTablesAsync();
    }

    if (newTable.id !== oldTable.id) {
      /**
       * 切换表在TableList.vue里的emitShowEntity中处理，不需要在watch里处理
       * 调用了store中的**switchTable**方法
       */
      return;
    }

    console.log(
      `NestCodeGen - watch stringifiedTable - column change detected`
    );
  },
  { immediate: true }
);
</script>

<style lang="stylus" scoped>
.nest-code-gen
  height 100%
  display flex
  flex-direction column

.toolbar
  height 50px
  padding 0px 20px
  display flex
  align-items center
  *
    margin-right 5px
.info
  height 50px
  padding 3px 20px
  font-size: 18px
  display flex
  flex-direction row
  align-items center
  justify-content space-between
  .info-left
    display flex
    flex-direction row
    align-items center
    font-size 0.8em
.wrapper
  flex 1
  height 100%
  display flex
  flex-direction row
  overflow hidden
  .table-wrapper
    padding 10px 10px
    width 59%
    height  100%
    overflow scroll
    display flex
    flex-direction column
    .ghost
      opacity: 0.0;
      background: #c8ebfb;
    .table-row
      display flex
      flex-direction row
      padding 2px 10px
      background-color white
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

  .code-wrapper
    width 41%
    padding 0px 10px
    height  100%

.column-setting-dialog
  .code-edit-box
    margin-bottom 10px
    width 100%
    height 100px
    // border 1px solid lightgray
  .code-edit-box :deep(.CodeMirror)
    font-size: 16px!important;
    height: 100%;
  .setting-row
    display flex
    flex-direction row
    .title
      width 100px
      height 40px
      line-height 40px
      text-align right
      padding-right 15px
      font-weight bold
    .val
      width 200px
      display flex
      flex-direction row
      align-items center
    .multiple-input
      width 100%
      margin-bottom 10px
    .codeEditor
      width 100%
    .switch
      width 80px
    .select
      width 150px
      display flex
      flex-direction row
      align-items center
</style>
