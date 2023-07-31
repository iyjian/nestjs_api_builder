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
} from '../dto'

@Controller('metaTable')
export class MetaTableController {
  constructor(private readonly metaTableService: MetaTableService) {}

  @Post('')
  create(@Body() createMetaTable: CreateMetaTableRequestDTO) {
    return this.metaTableService.createMetaTable(createMetaTable)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetaTableDto: UpdateMetaTableRequestDTO,
  ) {
    return this.metaTableService.updateMetaTable(+id, updateMetaTableDto)
  }

  @Get('')
  findAll(@Query() findAllQueryMetaTable: FindAllMetaTableRequestDTO) {
    return this.metaTableService.findAllMetaTable(findAllQueryMetaTable)
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
