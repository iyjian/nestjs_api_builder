import { Controller, Get, Param } from '@nestjs/common'
import { FrontcodegenService } from './frontcodegen.service.js'
import { MetaTableService } from '../base/index.js'

@Controller('frontcodegen')
export class FrontcodegenController {
  constructor(private readonly frontcodegenService: FrontcodegenService) {}

  @Get('crud/:tableId')
  public genCRUDCode(@Param('tableId') tableId: number) {
    return this.frontcodegenService.genVueCRUDCode(tableId)
  }
}
