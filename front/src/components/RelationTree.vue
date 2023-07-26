<template>
  <el-button
    :icon="Refresh"
    v-if="props.level === 1"
    size="small"
    type="danger"
    @click="resetRelation"
    >reset</el-button
  >
  <div class="tree">
    <div class="node" v-if="_node">
      <el-checkbox
        v-model="_node.isChecked"
        style="margin-right: 8px"
        @change="updateNode(_node!.nodeId, { isChecked: _node?.isChecked })"
      ></el-checkbox>
      <!-- 把nodeClicked合并到updateNode -->
      <div @click="nodeClicked(_node!)">{{ _node.label }}</div>
    </div>
    <template v-for="(node, key) in _node?.include" :key="key" class="tree">
      <RelationTree
        :node="node"
        :level="level + 1"
        :parentNodeId="node.nodeId"
        :load="load"
        @nodeUpdated="updateNode"
      ></RelationTree>
    </template>
  </div>
  <el-dialog
    v-if="tableConfig.table"
    v-model="tableConfig.dialogVisible"
    :title="`${tableConfig.table.comment}属性配置`"
    width="50%"
  >
    <!-- 表属性配置 -->
    <el-table
      :data="
        tableConfig.table.columns.filter(
          (column) => column.dataType?.dataType !== 'vrelation'
        )
      "
      style="width: 100%"
    >
      <el-table-column prop="name" label="字段" width="180" />
      <el-table-column prop="comment" label="含义" width="180" />
      <el-table-column label="列表展示">
        <template #default="scope">
          <el-checkbox v-model="scope.row.listShow" size="default" />
        </template>
      </el-table-column>
      <el-table-column label="编辑展示">
        <template #default="scope">
          <el-checkbox v-model="scope.row.updateShow" size="default" />
        </template>
      </el-table-column>
      <el-table-column label="详情展示">
        <template #default="scope">
          <el-checkbox v-model="scope.row.detailShow" size="default" />
        </template>
      </el-table-column>
      <el-table-column label="可排序">
        <template #default="scope">
          <el-checkbox v-model="scope.row.sortable" size="default" />
        </template>
      </el-table-column>
      <el-table-column label="可搜索">
        <template #default="scope">
          <el-checkbox v-model="scope.row.searchable" size="default" />
        </template>
      </el-table-column>
      <el-table-column label="可查找">
        <template #default="scope">
          <el-checkbox v-model="scope.row.findable" size="default" />
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="tableConfig.dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTableConfig"> 保存 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: "RelationTree",
};
</script>

<script setup lang="ts">
import { RelationNode, RelationOutputNode, Table } from "@/types";
import _ from "lodash";
import { watch, ref, nextTick, reactive } from "vue";
import { Refresh } from "@element-plus/icons-vue";

const emit = defineEmits(["nodeUpdated", "treeUpdated"]);

const _node = ref<RelationNode>();

/**
 * 从外部传入的nodes数据，relationTree内部仅展示数据，不改变数据
 */
const props = defineProps<{
  node?: RelationNode;
  level: number;
  parentNodeId: string;
  load: Function;
}>();

const tableConfig = reactive<{
  dialogVisible: boolean;
  node?: Partial<RelationNode>;
  table?: Table;
}>({
  dialogVisible: false,
  node: undefined,
  table: undefined,
});

watch(
  () => props.node,
  async (newNode) => {
    if (!newNode) {
      return;
    }
    _node.value = _.cloneDeep(newNode);
  },
  {
    immediate: true,
    deep: true,
  }
);

const trimRelation = (node: RelationNode) => {
  if (
    !node.include ||
    !node.include.length ||
    !node.include.filter((o) => o.isChecked).length
  ) {
    /**
     * 如果没有被选中的下级节点，则把下级节点置空
     */
    node.include = [];
  } else {
    for (const o of node.include) {
      trimRelation(o);
    }
  }
  return node;
};

/**
 * 点击关系配置中的详情按钮👁按钮, 获取table详情并展示配置项
 *
 * @param node
 */
// async function showTableConfig(node: RelationNode) {
//   try {
//     const tableInfo = await devToolApiClient.getTableInfo(node.tableId);

//     const extraColumn = [
//       { name: "id", comment: "id", order: 0 },
//       { name: "createdAt", comment: "创建时间", order: 998 },
//       { name: "updatedAt", comment: "更新时间", order: 999 },
//     ];

//     tableInfo.columns = tableInfo.columns.concat(extraColumn);

//     tableInfo.columns = tableInfo.columns.sort((column: any, column2: any) =>
//       column.order > column2.order ? 1 : -1
//     );

//     console.log(tableInfo.columns);

//     tableConfig.dialogVisible = true;

//     tableConfig.node = _.cloneDeep(node);

//     for (const column of tableInfo.columns) {
//       if (
//         tableConfig.node &&
//         tableConfig.node.attributes &&
//         column.id in tableConfig.node.attributes
//       ) {
//         /**
//          * column.id in tableConfig.node.attributes 保证了有显式的配置
//          */
//         column.listShow = tableConfig.node.attributes[column.id]["listShow"];
//         column.updateShow =
//           tableConfig.node.attributes[column.id]["updateShow"];
//         column.detailShow =
//           tableConfig.node.attributes[column.id]["detailShow"];
//         column.sortable = tableConfig.node.attributes[column.id]["sortable"];
//         column.searchable =
//           tableConfig.node.attributes[column.id]["searchable"];
//         column.findable = tableConfig.node.attributes[column.id]["findable"];
//       } else {
//         column.listShow = true;
//         column.updateShow = true;
//         column.detailShow = true;
//         column.sortable = false;
//         column.searchable = false;
//         column.findable = false;
//       }
//     }

//     tableConfig.table = tableInfo;
//   } catch (e) {
//     tableConfig.dialogVisible = false;
//   }
// }

async function saveTableConfig() {
  if (tableConfig.node && tableConfig.node.nodeId && tableConfig.table) {
    console.log(`RelationTree - saveTableConfig - updateNode`);
    updateNode(tableConfig.node.nodeId, {
      attributes: _.keyBy(
        tableConfig.table.columns.map((column) =>
          _.pick(column, [
            "id",
            "listShow",
            "updateShow",
            "detailShow",
            "sortable",
            "searchable",
            "findable",
          ])
        ),
        "id"
      ),
    });
    tableConfig.dialogVisible = false;
  } else {
    console.log(`RelationTree - saveTableConfig - failed: ${tableConfig}`);
  }
}

/**
 * 递归的获取关系树的所有节点(打平)
 *
 * @param nodes
 */
function _getAllNodes(node: RelationNode, allNodes: RelationNode[] = []) {
  allNodes.push(node);
  if (node.include && node.include.length > 0) {
    for (const subNode of node.include) {
      const subNodeCloned = _.cloneDeep(subNode);
      _getAllNodes(subNodeCloned, allNodes);
    }
  }
  return allNodes;
}

function getAllNodes() {
  if (_node.value) {
    return _getAllNodes(_node.value);
  } else {
    return [];
  }
}

/**
 * 获取选中的节点的平铺数据(非树型结构)
 */
function getCheckedNodesFlat() {
  return getAllNodes().filter((node) => node.isChecked === true);
}

/**
 * 根据nodeId找到对应的节点
 */
function findTreeNodeById(
  node: RelationNode,
  nodeId: string
): RelationNode | undefined {
  let foundNode: RelationNode | undefined;
  if (node.nodeId === nodeId) {
    return node;
  } else if (node.include && node.include.length > 0) {
    for (const subNode of node.include) {
      foundNode = findTreeNodeById(subNode, nodeId);
      if (foundNode) {
        return foundNode;
      }
    }
  } else {
    console.log(
      `RelationTree - findTreeNodeById - nodeId not found: ${nodeId}`
    );
  }
}

// function _getCheckedNodesTree(node: RelationOutputNode): RelationOutputNode[] {
//   const clonedNodes = _.cloneDeep(node);
//   const cleandNodes = clonedNodes
//     .filter((node) => node.isChecked === true)
//     .map((node) => ({
//       model: node.model,
//       as: node.as,
//       required: node.required,
//       include: node.include,
//     }));
//   for (const node of cleandNodes) {
//     if (node.include) {
//       const include = _getCheckedNodesTree(node.include);
//       node.include = include && include.length > 0 ? include : undefined;
//     }
//   }
//   return cleandNodes;
// }

// function getCheckedNodesTree() {
//   return _getCheckedNodesTree(_node.value);
// }

/**
 * 点击节点将加载节点的children, 将：
 * 1. 展开节点
 * 2. 触发 nodeClicked 事件
 *
 * @param node
 */
async function nodeClicked(node: RelationNode) {
  /**
   * 非根组件接收到事件，则继续上报
   */
  const children = await props.load(node);

  console.log(
    `RelationTree - nodeClicked - level: ${props.level} children: `,
    children
  );

  updateNode(node.nodeId, { isChecked: true, include: children });
}

function resetRelation() {
  updateNode("0-0", {
    label: "root",
    isChecked: false,
    include: [],
  });
}

/**
 * 更新树节点数据
 *
 * 所有的节点数据更新都发生在根组件，递归的子组件只负责上报变更的数据，根组件以外的节点接收到变更事件后通过`nodeUpdated`事件
 *
 * @param nodeId - string -
 * @param obj    - string -
 */
function updateNode(
  nodeId: string,
  obj: Partial<RelationNode>,
  triggerTreeUpdated = true
) {
  if (props.level !== 1) {
    // 如果更新指令不是在根节点，则上报
    emit("nodeUpdated", nodeId, obj, triggerTreeUpdated);
    return;
  }

  if (!_node.value) {
    return;
  }

  // 如果在根节点，则更新节点数据
  const node = findTreeNodeById(_node.value, nodeId);

  if (node) {
    console.log(
      `RelationTree - method - updateNode - nodeId: ${nodeId} level: ${props.level} children: `,
      obj
    );
    if ("label" in obj && obj.label) {
      node.label = obj.label;
    }
    if ("isChecked" in obj) {
      node.isChecked = obj["isChecked"] || false;
    }
    if ("attributes" in obj) {
      node.attributes = obj["attributes"];
    }
    if ("include" in obj && obj.include /**&& obj.include.length > 0 */) {
      node.include = obj.include;
    }

    if (triggerTreeUpdated) {
      const checkedKeys = getCheckedNodesFlat();
      // const relationTree = getCheckedNodesTree();
      emit("treeUpdated", { checkedKeys });
    }
  } else {
    console.log(
      `RelationTree - method - updateNode failed - level: ${props.level} nodeId: ${nodeId} update: ${obj}`
    );
  }
}
</script>

<style lang="stylus" scoped>
.tree
  display flex
  flex-direction column
  .node
    display flex
    flex-direction row
    height 36px
    align-items center
    font-size 18px
    cursor pointer
    .smallIcon
      cursor pointer;
      color green;
      width 0.8em;
      height 0.8em;
      margin 0px 5px;
    *
      margin-right 4px
.tree > .tree
  margin-left 30px
</style>
