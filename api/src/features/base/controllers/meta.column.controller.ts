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
import { MetaColumnService } from '../services/meta.column.service'
import {
  CreateMetaColumnRequestDTO,
  FindAllMetaColumnRequestDTO,
  UpdateMetaColumnRequestDTO,
} from '../dto'

@Controller('metaColumn')
export class MetaColumnController {
  constructor(private readonly metaColumnService: MetaColumnService) {}

  @Post('')
  create(@Body() createMetaColumn: CreateMetaColumnRequestDTO) {
    return this.metaColumnService.createMetaColumn(createMetaColumn)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetaColumnDto: UpdateMetaColumnRequestDTO,
  ) {
    return this.metaColumnService.updateMetaColumn(+id, updateMetaColumnDto)
  }

  @Get('simple')
  findAllSimple(@Query() findAllQueryMetaColumn: FindAllMetaColumnRequestDTO) {
    return this.metaColumnService.findAllMetaColumnSimple(
      findAllQueryMetaColumn,
    )
  }

  @Get('')
  findAll(@Query() findAllQueryMetaColumn: FindAllMetaColumnRequestDTO) {
    return this.metaColumnService.findAllMetaColumn(findAllQueryMetaColumn)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metaColumnService.findOneMetaColumnById(+id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metaColumnService.removeMetaColumnCascade(+id)
  }
}
