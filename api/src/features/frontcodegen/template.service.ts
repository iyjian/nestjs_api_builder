import { MetaColumn } from '../base/index.js'

export class TemplateService {
  private code: any
  private filterColumns: MetaColumn[]
  private tableColumns: MetaColumn[]
  private editColumns: MetaColumn[]

  constructor(
    baseUrl: string,
    filterColumns: MetaColumn[],
    tableColumns: MetaColumn[],
    editColumns: MetaColumn[],
  ) {
    this.code = {
      type: 'page',
      body: [
        {
          type: 'crud',
          syncLocation: false,
          api: {
            url: `\${API_HOST}/${baseUrl}`,
            data: {
              pageSize: '${perPage}',
              page: '${page}',
              search: '${search}',
              sort: [
                {
                  key: "${orderBy || 'id'}",
                  order: "${orderDir || 'desc'}",
                },
              ],
            },
            responseData: {
              count: '${count}',
              items: '${rows}',
            },
          },
          filter: {
            debug: false,
            title: '',
            body: [
              {
                type: 'group',
                body: [
                  {
                    type: 'input-text',
                    name: 'search',
                    label: '搜索',
                    clearable: true,
                    placeholder: '通过关键字搜索',
                    size: 'sm',
                  },
                ],
              },
            ],
          },
          columns: [
            {
              uuid: 'fu92xe_operationColumnSettings',
              type: 'operation',
              label: '操作',
              buttons: [
                {
                  label: '修改',
                  uuid: 'fu92xe_operationColumnEditButtonSettings',
                  type: 'button',
                  actionType: 'dialog',
                  dialog: {
                    title: '编辑',
                    closeOnEsc: true,
                    body: {
                      type: 'form',
                      api: {
                        url: '${API_HOST}/schoolRepair/${id}',
                        method: 'patch',
                      },
                      body: [
                        // 填充修改表单所需字段
                      ],
                    },
                  },
                },
                {
                  label: '删除',
                  type: 'button',
                  actionType: 'ajax',
                  level: 'danger',
                  confirmText: '确认要删除？',
                  api: {
                    url: `\${API_HOST}/${baseUrl}/\${id}`,
                    method: 'delete',
                  },
                },
              ],
            },
          ],
          itemAction: {
            type: 'button',
            actionType: 'dialog',
            dialog: {
              title: '详情',
              closeOnEsc: true,
              body: {
                type: 'form',
                body: [
                  // 填充详情所需字段
                ],
              },
              actions: [
                {
                  type: 'action',
                  actionType: 'cancel',
                  label: '关闭',
                },
              ],
            },
          },
          filterSettingSource: [],
          perPageAvailable: [10],
          messages: {},
          initFetch: true,
        },
      ],
    }
    this.filterColumns = filterColumns
    this.tableColumns = tableColumns
    this.editColumns = editColumns
  }

  public gen() {
    const crudCode = this.code.body[0]
    // 过滤条件所需字段
    crudCode.filter.body

    // 表格所需字段 crudCode.columns
    for (const column of this.tableColumns) {
      crudCode.columns.unshift({
        name: column.name,
        label: column.comment,
        type: 'text',
      })
    }

    // 查看详情所需字段 crudCode.itemAction.dialog.body.body
    for (const column of this.tableColumns) {
      crudCode.itemAction.dialog.body.body.push({
        type: 'static',
        name: column.name,
        label: column.comment,
      })
    }

    // 表格字段选择器所需字段 crudCode.filterSettingSource
    for (const column of this.tableColumns) {
      crudCode.filterSettingSource.push(column.name)
    }

    const operationColumnCode = crudCode.columns.filter(
      (column: any) => column.uuid === 'fu92xe_operationColumnSettings',
    )[0]
    // console.log(operationColumnCode)
    const editButtonCode = operationColumnCode.buttons.filter(
      (button: any) =>
        button.uuid === 'fu92xe_operationColumnEditButtonSettings',
    )[0]
    // 修改页面所需字段 editButtonCode.dialog.body.body
    for (const column of this.tableColumns) {
      editButtonCode.dialog.body.body.push({
        name: column.name,
        label: column.comment,
        type: 'input-text',
      })
    }
    return JSON.stringify(this.code, null, 2)
  }
}
