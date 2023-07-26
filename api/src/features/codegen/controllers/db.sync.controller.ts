import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { DBSyncService } from '../services/db.sync.service'

@Controller('dbsync')
export class DBSyncController {
  constructor(private readonly dbSyncService: DBSyncService) {}

  @Get('column/diff')
  getDiff(@Query('tableId') tableId: number) {
    return this.dbSyncService.getColumnDiffs(tableId)
  }

  @Post('column/executionsql')
  executionSql(@Body('tableId') tableId: number, @Body('sql') sql: string) {
    return this.dbSyncService.executionSql(tableId, sql)
  }

  @Post('column/diff/production')
  getDiff_json(@Body('') json: JSON) {
    return this.dbSyncService.getColumnDiffsbyJson(json)
  }

  @Get('enumReport/project/:projectId')
  getEnumReport(@Param('projectId') projectId: number) {
    return this.dbSyncService.getEnumReport(projectId)
  }
}
