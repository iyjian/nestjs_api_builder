import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { COLUMN_DEFINITION, DBSyncService } from '../services/db.sync.service'

@Controller('dbsync')
export class DBSyncController {
  constructor(private readonly dbSyncService: DBSyncService) {}

  @Get('column/diff')
  getDiff(@Query('tableId') tableId: number) {
    return this.dbSyncService.getColumnDiffs(+tableId)
  }

  /**
   * 二次处理mysql的definition(polyfill)
   *
   * @param mysqlColumnDefinitions
   * @returns
   */
  @Post('column/definition/mysql/polyfill')
  polyfillMysqlDefinition(
    @Body('mysqlColumnDefinitions') mysqlColumnDefinitions: COLUMN_DEFINITION[],
  ) {
    return this.dbSyncService.getMysqlDefinitions(mysqlColumnDefinitions)
  }

  /**
   * 获取meta的definition
   *
   * @param tableId
   * @returns
   */
  @Get('column/definition/meta')
  getMetaDefinitions(@Query('tableId') tableId: number) {
    return this.dbSyncService.getMetaDefinitions(+tableId)
  }

  /**
   * 获取最终的对比情况
   *
   * @param metaColumnDefinitions
   * @param mysqlColumnDefinitions
   * @returns
   */
  @Post('column/migrate')
  getMigrateSql(
    @Body('metaColumnDefinitions') metaColumnDefinitions: COLUMN_DEFINITION[],
    @Body('mysqlColumnDefinitions') mysqlColumnDefinitions: COLUMN_DEFINITION[],
  ) {
    return this.dbSyncService.getMigrateSql(
      metaColumnDefinitions,
      mysqlColumnDefinitions,
    )
  }

  @Post('column/executionsql')
  executionSql(@Body('tableId') tableId: number, @Body('sql') sql: string) {
    return this.dbSyncService.executionSql(tableId, sql)
  }

  @Get('enumReport/project/:projectId')
  getEnumReport(@Param('projectId') projectId: number) {
    return this.dbSyncService.getEnumReport(projectId)
  }
}
