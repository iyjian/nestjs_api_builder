import { Injectable, Logger } from '@nestjs/common'
import prettier from 'prettier'

@Injectable()
export class FrontcodegenService {
  private readonly logger = new Logger(FrontcodegenService.name)

  constructor() {}

  /**
   * 使用prettier格式化代码
   *
   * @param code - 原始代码
   * @returns
   */
  public codeFormat(code: string): string {
    try {
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        trailingComma: 'all',
        semi: false,
        endOfLine: 'auto',
        parser: 'vue',
        filepath: '/dummy/file.ts',
      })
      return formattedCode
    } catch (e) {
      const { message, loc } = e
      if (loc) {
        console.error(`Error in line ${loc.start.line}: ${message}`)
      } else {
        console.error(`Error formatting code: ${message}`)
      }
      this.logger.error('原始代码: ', code)
      throw new Error('代码格式化出错')
    }
  }

  getLabel(columnConfig: any) {
    if (!columnConfig.comment) {
      return `(${columnConfig.name})`
    }
    return columnConfig.comment
  }

  getTableColumnCode(columnConfig: any) {
    if (columnConfig.dataType.dataType === 'datetime') {
      return `
        <el-table-column  label="${this.getLabel(columnConfig)}" >
          <template #default="scope">
            {{ moment(scope.row.${
              columnConfig.name
            }).format("YYYY-MM-DD HH:mm") }}
          </template>
        </el-table-column>`
    }
    // else if (columnConfig.refTable) {
    //   return `
    //     <el-table-column  label="${this.getLabel(columnConfig)}"   >
    //       <template #default="scope">
    //         <div v-for="item in ${columnConfig.refTable.instanceName}List ">
    //           <el-text  v-if="scope.row.${
    //             columnConfig.name
    //           } === item.id" type="" >{{item.name}}</el-text>
    //         </div>
    //       </template>
    //     </el-table-column>`
    // }
    else if (columnConfig.dataType.dataType === 'boolean') {
      return `
        <el-table-column  label="${this.getLabel(columnConfig)}"   >
          <template #default="scope">
            <el-text v-if="scope.row.${columnConfig.name} === true">是</el-text>
            <el-text v-else>否</el-text>
          </template>
        </el-table-column>`
    } else {
      return `
        <el-table-column prop="${columnConfig.name}" label="${this.getLabel(
        columnConfig,
      )}"/>`
    }
  }

  getFieldCode(
    columnConfig: any,
    type: 'createDialog' | 'updateDialog' | 'viewDialog' | 'filter',
  ) {
    let formItemCode = `` //表单项代码
    let disabledCode = `` //表单项是否启用判断代码
    let objectName = `` //表单项内容存储对象名称

    if (['createDialog', 'updateDialog', 'viewDialog'].includes(type)) {
      objectName = `dialogData`
    } else if (type === 'filter') {
      objectName = `params`
    }

    if (type === 'updateDialog' && !columnConfig.updateable) {
      disabledCode = 'disabled'
    } else if (type === 'viewDialog') {
      disabledCode = 'disabled'
    }
    formItemCode = this.getFormItemCode(
      columnConfig,
      disabledCode,
      objectName,
      type,
    )

    if (formItemCode) {
      return `
        <el-form-item label="${
          columnConfig.refTable
            ? this.getLabel(columnConfig).replace(/id$/, '').replace(/Id$/, '')
            : this.getLabel(columnConfig)
        }">
          ${formItemCode}
        </el-form-item>\n`
    }

    return ``
  }

  getFormItemCode(
    columnConfig: any,
    disabledCode: string,
    objectName: string,
    type: string,
  ) {
    if (columnConfig.dataType.dataType === 'datetime') {
      return `<el-date-picker
                v-model="${objectName}.${columnConfig.name}"
                type="datetime"
                ${disabledCode}/>`
    } else if (columnConfig.refTable) {
      return `<el-select v-model="${objectName}.${columnConfig.name}" class="m-2" placeholder="Select" clearable ${disabledCode}>
                <el-option
                  v-for="item in ${columnConfig.refTable.instanceName}List"
                  :key="item.id"
                  :label="item.${columnConfig.forSelectDisplayName}"
                  :value="item.id"/>
              </el-select>`
    } else if (
      columnConfig.dataType.dataType === 'boolean' &&
      ['createDialog', 'updateDialog', 'viewDialog'].includes(type)
    ) {
      return `<el-switch
                v-model="${objectName}.${columnConfig.name}"
                inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                active-text="是"
                inactive-text="否"
                ${disabledCode}/>`
    } else if (
      columnConfig.dataType.dataType === 'boolean' &&
      type === 'filter'
    ) {
      return `<el-select
                v-model="${objectName}.${columnConfig.name}"
                class="m-2"
                placeholder="Select"
                clearable>
                <el-option
                  v-for="item in flagList"
                  :key="item.key"
                  :label="item.label"
                  :value="item.value" />
              </el-select>`
    } else if (
      ['int', 'varchar(40)'].includes(columnConfig.dataType.dataType) &&
      ['createDialog', 'updateDialog', 'viewDialog'].includes(type)
    ) {
      return `<el-input v-model="${objectName}.${columnConfig.name}" ${disabledCode}/>`
    } else if (
      ['varchar(255)', 'text', 'json(array)', 'longtext'].includes(
        columnConfig.dataType.dataType,
      ) &&
      ['createDialog', 'updateDialog', 'viewDialog'].includes(type)
    ) {
      return `<el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 8 }"
                v-model="${objectName}.${columnConfig.name}"
                ${disabledCode} />`
    }
    return ``
  }

  getRefCode(columnConfig: any) {
    return `
      const ${columnConfig.refTable.instanceName}List = ref<any>([]);
      ${columnConfig.refTable.instanceName}List.value = (
        await ${columnConfig.refTable.instanceName}Api.getAll${columnConfig.refTable.className}({ skipPaging: true })
      ).rows;\n`
  }

  generate(tableConfig: any) {
    let createDialogFieldsCode = `` //新增弹窗内表单项代码
    let updateDialogFieldsCode = `` //修改弹窗内表单项代码
    let viewDialogItemsCode = `` //查看弹窗内容代码
    let interfacesCode = `` //获取下拉列表项接口代码
    let paramsCode = `` //存取输入框内容变量名代码
    let filtersCode = `` //筛选条件项代码
    let columnsCode = `` //表格列代码
    let apiFilesCode = `import * as ${tableConfig.instanceName}Api from '@/plugins/${tableConfig.instanceName}.service';\n` //引用API文件路径
    let dialogDataParamsCode = `` //存取弹窗内容变量名代码

    for (const columnConfig of tableConfig.table.filterItems) {
      if (columnConfig.findable) {
        filtersCode += this.getFieldCode(columnConfig, 'filter')
        paramsCode += `${columnConfig.name}: undefined,\n`
      }

      if (!columnConfig.refTable) {
        continue
      }
      if (
        interfacesCode.indexOf(columnConfig.refTable.instanceName + 'List') ===
        -1
      ) {
        interfacesCode += this.getRefCode(columnConfig)
      }
      if (
        apiFilesCode.indexOf(columnConfig.refTable.instanceName + 'Api') === -1
      ) {
        apiFilesCode += `import * as ${columnConfig.refTable.instanceName}Api from '@/plugins/${columnConfig.refTable.instanceName}.service';\n`
      }
    }

    for (const columnConfig of tableConfig.table.tableColumns) {
      if (columnConfig.showable) {
        columnsCode += this.getTableColumnCode(columnConfig)
      }
    }

    for (const columnConfig of tableConfig.table.createDialogFieldItems) {
      if (columnConfig.createable) {
        createDialogFieldsCode += this.getFieldCode(
          columnConfig,
          'createDialog',
        )
        if (columnConfig.dataType.dataType === 'boolean') {
          dialogDataParamsCode += `${columnConfig.name}: false,\n`
        }
      }
    }

    for (const columnConfig of tableConfig.table.updateDialogFieldItems) {
      updateDialogFieldsCode += this.getFieldCode(columnConfig, 'updateDialog')
    }

    for (const columnConfig of tableConfig.table.viewDialogItems) {
      if (columnConfig.viewable) {
        viewDialogItemsCode += this.getFieldCode(columnConfig, 'viewDialog')
      }
    }

    const code = this.renderTemplate(
      columnsCode,
      interfacesCode,
      paramsCode,
      filtersCode,
      tableConfig.className,
      createDialogFieldsCode,
      updateDialogFieldsCode,
      viewDialogItemsCode,
      tableConfig.instanceName,
      apiFilesCode,
      dialogDataParamsCode,
    )

    return this.codeFormat(code)
  }

  renderTemplate(
    columnsCode: string,
    interfacesCode: string,
    paramsCode: string,
    filtersCode: string,
    className: string,
    createDialogFieldsCode: string,
    updateDialogFieldsCode: string,
    viewDialogItemsCode: string,
    instanceName: string,
    apiFilesCode: string,
    dialogDataParamsCode: string,
  ) {
    return `
      <template>
        <div class="wrapper">
          <div class="tool-bar">
            ${filtersCode}
          </div>
          <div class="table-head">
            <div>
              <el-input v-model="params.search" placeholder="搜索" style="width: 250px">
                <template #prepend>
                  <el-button :icon="Search" />
                </template>
              </el-input>
              ${
                createDialogFieldsCode
                  ? `<el-button :icon="Plus" class="btn-add" @click="openForm('add')">新建</el-button>`
                  : ''
              }
            </div>
            <el-pagination  v-if="table.data.count" :current-page="params.page" :page-size="params.pageSize" layout="total, prev, pager, next"
              :total="table.data.count" @current-change="changeCurrentPage"></el-pagination>
          </div>
          <el-table
          v-loading="table.loading"
          :data="table.data.rows"
          class="table-body"
          @sort-change="onColumnSort"
          :row-class-name="tableRowClassName"
          @row-click="onRowClick">
            <el-table-column prop="id" label="编号" width="90" />
            ${columnsCode}
            <el-table-column  label="创建时间" >
              <template #default="scope">
                {{ moment(scope.row.createdAt).format("YYYY-MM-DD HH:mm") }}
              </template>
            </el-table-column>
            <el-table-column  label="最后更新" >
              <template #default="scope">
                {{ moment(scope.row.updatedAt).format("YYYY-MM-DD HH:mm") }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                  ">
                  <el-button
                    label="编辑"
                    type="primary"
                    size="small"
                    @click="openForm('edit', scope.row)">
                    编辑
                  </el-button>
                  <el-button
                    label="删除"
                    type="danger"
                    size="small"
                    @click="deleteData(scope.row)">
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-dialog v-model="dialog.visible" :show-close="false" :title="dialog.type">
          <el-form label-width="120px">
            <div v-if="dialog.type === 'add'">
              ${createDialogFieldsCode}
            </div>
            <div v-else-if="dialog.type === 'edit'">
              ${updateDialogFieldsCode}
            </div>
            <div v-else-if="dialog.type === 'view'">
              ${viewDialogItemsCode}
            </div>
          </el-form>
          <template #header>
            <span class="dialog-footer">
              <el-button @click="dialog.visible = false">关闭</el-button>
              <el-button type="primary" @click="submit" v-if="dialog.type != 'view'" :loading="dialog.button.loading">保存</el-button>
            </span>
          </template>
        </el-dialog>
      </template>

      <script lang="ts" setup>
        import { ref, watch, computed, shallowRef, reactive, devtools } from "vue";
        ${apiFilesCode}
        import { Search, Plus } from "@element-plus/icons-vue";
        import _ from "lodash";
        import moment from "moment";
        import { ElMessage, ElMessageBox } from "element-plus";

        const table = ref<any>({
          data: ref<any>({}),
          loading: false,
        });
        
        ${interfacesCode}

        const commonParams = {
          page: 1,
          pageSize: 10,
          search: "",
          sortOrder: "asc",
          sortColumn: "id",
        };

        const params = ref<any>({
          ...commonParams,
          ${paramsCode}
        });
        
        const flagList=ref<any>([{label:'是',value:true,key:1},{label:'否',value:false,key:0}])

        function onColumnSort(props: any) {
          const { column, prop, order } = props;
          params.value.sortColumn = prop;
          params.value.sortOrder = order === "descending" ? "desc" : "asc";
        }

        function tableRowClassName(params: any) {
          if (!params.row.isEnable&&'isEnable' in params.row) {
            return 'disabled-row'
          } else {
            return ''
          }
        }

        const stringifiedParams = computed(() => {
          return JSON.stringify(params);
        });

        watch(stringifiedParams, () => {
          await lazyRefreshTable();
        });

        async function refreshTable() {
          try {
            table.value.loading = true;
            table.value.data = await ${instanceName}Api.getAll${className} (
              params.value,
            );
            table.value.loading = false;
          } catch (e) {
            table.value.loading = false;
          }
        }

        const lazyRefreshTable = _.debounce(function () {
          refreshTable();
        }, 200);

        async function changeCurrentPage(page: number) {
          params.value.page = page;
        }

        const dialog = reactive({
          visible: false,
          type: "add",
          button: {
            loading: false,
          },
        });

        const dialogData = ref<any>({});

        async function submit() {
          try {
            dialog.button.loading = true;
            if (dialog.type === "edit") {
              const result = await ${instanceName}Api.patch${className}(
                dialogData.value.id,
                dialogData.value,
                );
            } else if (dialog.type === "add") {
              const result = await ${instanceName}Api.add${className}(dialogData.value);
            }
        
            dialog.button.loading = false;
            dialog.visible = false;
            await lazyRefreshTable();
          } catch (e) {
            console.log(e)
            dialog.button.loading = false;
            ElMessage({ message: '数据更新失败', type: 'warning', })
          }
        }

        async function openForm(openType: string, row?: any) {
          dialog.type = openType;
          dialog.button.loading = false;
          if (dialog.type === "edit") {
            const ${instanceName} = await ${instanceName}Api.get${className}ById(row.id);
            dialogData.value = _.cloneDeep(${instanceName});
          } else if (dialog.type === "add") {
            dialogData.value = {${dialogDataParamsCode}}
            ${createDialogFieldsCode ? '' : 'return'}
          }
          else if(dialog.type === "view"){
            ${viewDialogItemsCode ? '' : 'return'}
            const ${instanceName} = await ${instanceName}Api.get${className}ById(row.id);
            dialogData.value = _.cloneDeep(${instanceName});
          }
          dialog.visible = true;
        }

        function onRowClick(row: any , column: any){
          if (column.label != "操作") {
            openForm('view', row)
          }
        }

        async function deleteData(row: any) {
           try {
             await ElMessageBox.confirm("您确定要删除此条数据吗？", "提示", {
               confirmButtonText: "确认",
               cancelButtonText: "取消",
             });
             const result = await ${instanceName}Api.delete${className}(row.id);
             await lazyRefreshTable();
           } catch (e) {
              if(e === 'cancel'){
                ElMessage({ message: '取消删除', type: 'warning' })
              }
              else{
                ElMessage({ message: '数据删除失败', type: 'warning' })
              }
           }
         }
        
        await lazyRefreshTable();
      </script>
      <style lang="stylus" scoped>
      .wrapper
        display flex
        flex-direction column
        align-items center
        margin-top 10px
    
      .tool-bar
        width 80%
        flex-wrap wrap
        display flex
        align-items left
        margin-top 10px
    
      .tool-bar .el-form-item
        margin 10px
      
      .table-head
        width 80%
        height 32px
        display flex
        flex-direction row
        justify-content space-between
      
      .table-body
        width 80%
        height 77vh
      
      .disabled-row
        color lightgray
      
      .btn-add
        margin-left 20px
      </style>
    `
  }
}
