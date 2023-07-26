import { Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ERService } from '../services/er.service'

@Controller('er')
export class ERController {
  constructor(private readonly erService: ERService) {}

  @Get('all')
  getERAll(@Query('tableId') tableId: number) {
    return this.erService.genERFromNode(tableId)
  }

  @Post('cache/:projectId')
  buildCache(@Param('projectId') projectId: number) {
    return this.erService.buildGraphCache(projectId)
  }
}
