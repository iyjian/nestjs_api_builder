import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  FindAllDbMigrateLogRequestDTO,
  CreateDbMigrateLogRequestDTO,
  UpdateDbMigrateLogRequestDTO,
} from './../dto/db.migrate.log.request.dto'
import { DbMigrateLogService } from './../services/db.migrate.log.service'
import {
  ApiPaginatedResponse,
  ApiFindOneResponse,
  ApiPatchResponse,
  ApiDeleteResponse,
  codeGen,
} from './../../../core'
import {
  FindOneResponseSchema,
  FindAllResponseSchema,
} from './../dto/db.migrate.log.response.schema'

@Controller('dbMigrateLog')
@ApiTags('数据库建表日志')
export class DbMigrateLogController {
  constructor(private readonly dbMigrateLogService: DbMigrateLogService) {}

  @Post('')
  @ApiOperation({
    summary: 'POST dbMigrateLog',
  })
  @ApiFindOneResponse('dbMigrateLog', FindOneResponseSchema)
  @codeGen('691-create')
  create(@Body() createDbMigrateLog: CreateDbMigrateLogRequestDTO) {
    return this.dbMigrateLogService.create(createDbMigrateLog)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH dbMigrateLog',
  })
  @ApiPatchResponse('dbMigrateLog')
  @codeGen('691-update')
  update(
    @Param('id') id: string,
    @Body() updateDbMigrateLogRequestDTO: UpdateDbMigrateLogRequestDTO,
  ) {
    return this.dbMigrateLogService.updateById(
      +id,
      updateDbMigrateLogRequestDTO,
    )
  }

  @Get('')
  @ApiOperation({
    summary: 'GET dbMigrateLog(list)',
  })
  @ApiPaginatedResponse('dbMigrateLog', FindAllResponseSchema)
  @codeGen('691-findAll')
  findAll(@Query() findAllQueryDbMigrateLog: FindAllDbMigrateLogRequestDTO) {
    return this.dbMigrateLogService.findAll(findAllQueryDbMigrateLog)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET dbMigrateLog(single)',
  })
  @ApiFindOneResponse('dbMigrateLog', FindOneResponseSchema)
  @codeGen('691-findOne')
  findOne(@Param('id') id: string) {
    return this.dbMigrateLogService.findOneByIdOrThrow(+id)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'DELETE dbMigrateLog',
  })
  @ApiDeleteResponse('dbMigrateLog')
  @codeGen('691-remove')
  remove(@Param('id') id: string) {
    return this.dbMigrateLogService.removeById(+id)
  }
}
