<template>
  <el-badge :value="toBeSyncCount">
    <el-button :loading="button.openDialogLoading" @click="open" type="primary">
      同步
    </el-button>
  </el-badge>
  <el-dialog title="字段diff" v-model="dialogVisible" width="60%">
    <table class="classic-table">
      <tr>
        <th>类型</th>
        <th>语句</th>
        <!-- <th>警告</th> -->
        <th></th>
      </tr>
      <tr v-for="columnDiff in columnDiffs">
        <td>
          {{ columnDiff.reason }}
          {{
            columnDiff.columnModifiedItem
              ? `(${columnDiff.columnModifiedItem})`
              : ""
          }}
        </td>
        <td>{{ columnDiff.sql }}</td>
        <!-- <td>{{ columnDiff.mysqlDefinition }}</td> -->
        <td>
          <!-- :disabled="!!columnDiff.error.length" -->
          <el-button
            type="danger"
            @click="execSyncSql(columnDiff.sql)"
            :loading="button.execLoading">
            执行
          </el-button>
        </td>
      </tr>
    </table>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { devToolApiClient } from "@/plugins";

export enum SYNC_REASON {
  SYNC_CONSTRAINT_NEW,
  SYNC_CONSTRAINT_MODIFY,
  SYNC_ALLOWNULL_MODIFY,
  SYNC_DEFAULTVALUE_MODIFY,
  SYNC_COMMENT_MODIFY,
  SYNC_DTATTYPE_MODIFY,
  SYNC_FEILD_NEW,
  SYNC_FEILD_DELETE,
  SYNC_CONSTRAINT_DROP,
}

export enum ERROR_REASON {
  ERROR_CONSTRAINT_NEW,
}

export default defineComponent({
  name: "SyncPreview",
  props: {
    tableId: Number,
  },
  data() {
    return {
      dialogVisible: false,
      columnDiffs: [],
      button: {
        openDialogLoading: false,
        execLoading: false,
      },
      toBeSyncCount: undefined,
    } as any;
  },
  watch: {
    async tableId(newTableId) {
      if (newTableId) {
        const results = await devToolApiClient.getDBSyncColumnDiffs(
          this.tableId
        );
        this.toBeSyncCount = results.length;
      }
    },
  },
  methods: {
    async refreshSyncResult() {
      const results = await devToolApiClient.getDBSyncColumnDiffs(this.tableId);
      this.toBeSyncCount = results.length;
      this.columnDiffs = results;
    },
    async execSyncSql(sql: string) {
      try {
        this.button.execLoading = true;
        await devToolApiClient.executeSyncDB(this.tableId, sql);
        await this.refreshSyncResult();
        this.button.execLoading = false;
      } catch (e) {
        this.button.execLoading = false;
      }
    },
    async open() {
      if (this.tableId) {
        try {
          this.button.openDialogLoading = true;
          await this.refreshSyncResult();
          this.dialogVisible = true;
          this.button.openDialogLoading = false;
        } catch (e) {
          this.button.openDialogLoading = false;
        }
      }
    },
    close() {
      this.dialogVisible = false;
    },
  },
});
</script>
