import { FindRelationTableRequestDTO } from './../dto/meta.table.request.dto'
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
import { MetaTableService } from '../services/meta.table.service'
import {
  CreateMetaTableRequestDTO,
  FindAllMetaTableRequestDTO,
  UpdateMetaTableRequestDTO,
  MoveMetaTableRequestDTO,
} from '../dto'
import { RequestUser } from './../../../core'

@Controller('metaTable')
export class MetaTableController {
  constructor(private readonly metaTableService: MetaTableService) {}

  @Get('relationTable')
  findRelationTable(
    @Query() findRelationTableRequestDTO: FindRelationTableRequestDTO,
  ) {
    return this.metaTableService.findRelationTable(findRelationTableRequestDTO)
  }

  @Post('')
  create(@Body() createMetaTable: CreateMetaTableRequestDTO) {
    return this.metaTableService.createMetaTable(createMetaTable)
  }

  @Post('moveTable')
  move(@Body() moveMetaTableRequestDTO: MoveMetaTableRequestDTO) {
    return this.metaTableService.moveMetaTable(moveMetaTableRequestDTO)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetaTableDto: UpdateMetaTableRequestDTO,
  ) {
    return this.metaTableService.updateMetaTable(+id, updateMetaTableDto)
  }

  @Get('')
  findAll(
    @RequestUser() user: any,
    @Query() findAllQueryMetaTable: FindAllMetaTableRequestDTO,
  ) {
    return this.metaTableService.findAllMetaTable(findAllQueryMetaTable, user)
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('withDefaultColumns') withDefaultColumns: number,
  ) {
    return this.metaTableService.findOneMetaTable(+id, null, true)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metaTableService.removeMetaTable(+id)
  }
}
