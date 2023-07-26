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
  CreateMetaTableRequestDto,
  FindAllMetaTableDto,
  UpdateMetaTableRequestDto,
} from '../dto'

@Controller('metaTable')
export class MetaTableController {
  constructor(private readonly metaTableService: MetaTableService) {}

  @Post('')
  create(@Body() createMetaTable: CreateMetaTableRequestDto) {
    return this.metaTableService.createMetaTable(createMetaTable)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetaTableDto: UpdateMetaTableRequestDto,
  ) {
    return this.metaTableService.updateMetaTable(+id, updateMetaTableDto)
  }

  @Get('')
  findAll(@Query() findAllQueryMetaTable: FindAllMetaTableDto) {
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
