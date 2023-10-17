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
}
