<template>
  <el-tabs v-model="activeCodeTab" @tab-click="switchCodeTab">
    <el-tab-pane
      v-for="(label, idx) in labels"
      :key="idx"
      :label="label"
      :name="label"
    >
      <div class="codeMirrorWrapper">
        <template v-if="label !== 'relation' && codesByLabel[label]">
          <div>
            {{
              codesByLabel[label].isExist ? "修改" : "新增"
            }}&nbsp;&nbsp;代码路径:{{ codesByLabel[label].path }}
          </div>
          <Codemirror
            v-if="codesByLabel[label].type === 'code'"
            v-model:value="codesByLabel[label].showContent"
            :options="codesByLabel[label].codeMirrorOptions"
            border
            @ready="(cm: any) => onCodeMirrorReady(cm, codesByLabel[label].label)"
          />
        </template>
      </div>
    </el-tab-pane>
    <el-tab-pane label="all" name="all">
      <div style="height: 100%; overflow: scroll">
        <RelationTree
          :level="1"
          parentNodeId="0-0"
          :node="relations"
          :load="loadRelation"
          @tree-updated="RelationTreeUpdated"
        ></RelationTree>
      </div>
    </el-tab-pane>
    <el-tab-pane label="one" name="one">
      <div style="height: 100%; overflow: scroll">
        <RelationTree
          :level="1"
          parentNodeId="0-0"
          :node="relationsOne"
          :load="loadRelation"
          @tree-updated="RelationTreeUpdatedOne"
        ></RelationTree>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts">
export default {
  name: "CodePreview",
};
</script>

<script lang="ts" setup>
import { ref, watch, computed, nextTick, Ref } from "vue";
import Codemirror from "codemirror-editor-vue3";
import { Editor } from "codemirror";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/theme/dracula.css";
import _ from "lodash";
import { CodeType, Code, RelationNode } from "@/types";
import { devToolApiClient } from "@/plugins";
// import { useStore } from "@/store";
import { projectTableStore } from "@/store/projectTable";
import RelationTree from "./RelationTree.vue";

const store = projectTableStore();

const table = computed(() => store.table);

const cminstance = ref<{ [label in CodeType]?: Editor }>({});

const props = defineProps<{
  tableId: number;
  codes: Code[];
  highlightClassPropName?: string;
}>();

const activeCodeTab = ref("enty");

const relations: Ref<RelationNode | undefined> = ref();
const relationsOne: Ref<RelationNode | undefined> = ref();

const labels = computed<string[]>(() => {
  const results = [];
  if (props.codes && props.codes.length > 0) {
    for (const code of props.codes) {
      results.push(code.label);
    }
  }
  return results;
});

const codesByLabel = computed(() => {
  return _.keyBy(props.codes, "label");
});

function onCodeMirrorReady(cm: Editor, label: CodeType) {
  console.log(`CodePreview - onCodeMirrorReady - label: ${label}`);
  cminstance.value[label] = cm;
}

function switchCodeTab(tab: { props: { name: CodeType } }) {
  setTimeout(() => {
    cminstance.value[tab.props.name]?.refresh();
  }, 200);
}

/**
 * 提供根据父级节点加载下级节点的方法
 * 用于relationTree的数据加载以及节点展开方法
 *
 * @param node - RelationNode - 需要加载下级节点的节点
 */
async function loadRelation(node: RelationNode, force = false) {
  const children = await devToolApiClient.getRelations(
    node.tableId,
    node.level,
    node.nodeId
  );
  if (
    (!node.include || node.include.length === 0 || force) &&
    children &&
    children.length > 0
  ) {
    /**
     * 节点无展开的下级节点时才返回下级节点数据
     */
    console.log(
      `CodePreview - loadRelation - nodeId: ${node.nodeId} load children`
    );
    return children;
  } else {
    /**
     * 节点已有展开的下级节点时不返回下级节点数据
     */
    return;
  }
}

/**
 * 关系树更新事件的监听
 *
 */
async function RelationTreeUpdated(payload: any) {
  if (!props.tableId) {
    return;
  }
  const { checkedKeys, relationTree } = payload;

  console.log(
    `CodePreview - RelationTreeUpdated - tableId: ${props.tableId} saved checkedNodes:`
  );

  console.log(`>>`, checkedKeys);

  await devToolApiClient.updateRelation(props.tableId, checkedKeys);

  if (!relationsOne.value || relationsOne.value.include.length === 0) {
    relationsOne.value = checkedKeys[0];
  }
}

async function RelationTreeUpdatedOne(payload: any) {
  if (!props.tableId) {
    return;
  }
  const { checkedKeys, relationTree } = payload;

  console.log(
    `CodePreview - RelationTreeUpdated - tableId: ${props.tableId} saved checkedNodes:`
  );

  console.log(`>>`, checkedKeys);

  await devToolApiClient.updateRelationForOne(props.tableId, checkedKeys);
}

watch(
  () => props.codes,
  (codes) => {
    if (codes && codes.length > 0) {
      activeCodeTab.value = codes[0].label;
    }
  }
);

function getRelation(relationNodes?: any[]) {
  if (relationNodes && relationNodes.length > 0) {
    return relationNodes[0];
  } else if (props.tableId) {
    /**
     * 根节点
     */
    return {
      label: "root",
      tableId: props.tableId,
      include: [],
      level: 0,
      parentNodeId: "",
      leaf: false,
      nodeId: "0-0",
      isChecked: false,
    };
  }
  return;
}

watch(
  () => props.tableId,
  (tableId, oldTableId) => {
    if (tableId !== oldTableId) {
      console.log(
        `CodePreview - watch: props.tableId (changed) - tableId: ${tableId} oldTableId: ${oldTableId}`
      );
      console.log(
        "CodePreview - watch - table.value.relationNodes",
        table.value.relationNodes,
        typeof table.value.relationNodes
      );
      relations.value = getRelation(table.value.relationNodes);
      relationsOne.value = getRelation(table.value.relationNodesForOne);
    } else {
      console.log(
        `CodePreview - watch: props.tableId (unchanged) - tableId: ${tableId} oldTableId: ${oldTableId}`
      );
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="stylus" scoped>
.codeMirrorWrapper
  height calc(100vh - 160px)

.codeMirrorWrapper :deep(.CodeMirror)
  font-size: 16px!important;
  height: 100%;

.custom-tree-node
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
</style>

<style>
.code-tree .el-tree-node__label {
  font-size: 18px;
}
.code-tree .el-tree-node__content {
  margin: 5px 0px;
}
</style>
