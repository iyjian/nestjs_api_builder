import { Injectable } from '@nestjs/common'
import { MetaTableService } from '../base/services/meta.table.service.js'
import { TemplateService } from './template.service'
@Injectable()
export class FrontcodegenService {
  constructor(private readonly metaTableService: MetaTableService) {}

  public async genCRUDCode(tableId: number) {
    const table = await this.metaTableService.findOneMetaTable(tableId)

    const templateService = new TemplateService(
      table.instanceName,
      table.columns,
      table.columns,
      table.columns,
    )

    return templateService.gen()
  }

  public async genVueCRUDCode(tableId: number) {
    const table = await this.metaTableService.findOneMetaTable(tableId)

    let tableColumnsCode = ''
    let dialogFormCode = ''

    for (const column of table.columns) {
      if (column.relation) {
        continue
      }
      if (['text', 'varchar(4000)'].includes(column.dataType.dataType)) {
        dialogFormCode += `<el-form-item label="${column.comment}"><el-input type="textarea" :autosize="{minRows:2, maxRows:8}" v-model="dialogData.${column.name}" /></el-form-item>`
      } else {
        dialogFormCode += `<el-form-item label="${column.comment}"><el-input v-model="dialogData.${column.name}" /></el-form-item>`
      }

      tableColumnsCode += `<el-table-column prop="${column.name}" label="${column.comment}"/>`
    }

    return {
      tableColumnsCode,
      dialogFormCode,
    }
  }
}
