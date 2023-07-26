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
import { MetaDataTypeService } from '../services/meta.data.type.service'
import {
  CreateMetaDataTypeRequestDTO,
  FindAllMetaDataTypeRequestDTO,
  UpdateMetaDataTypeRequestDTO,
} from '../dto'

@Controller('metaDataType')
export class MetaDataTypeController {
  constructor(private readonly metaDataTypeService: MetaDataTypeService) {}

  @Post('')
  create(@Body() createMetaDataType: CreateMetaDataTypeRequestDTO) {
    return this.metaDataTypeService.createMetaDataType(createMetaDataType)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetaDataTypeDto: UpdateMetaDataTypeRequestDTO,
  ) {
    return this.metaDataTypeService.updateMetaDataType(
      +id,
      updateMetaDataTypeDto,
    )
  }

  @Get('')
  findAll(@Query() findAllQueryMetaDataType: FindAllMetaDataTypeRequestDTO) {
    return this.metaDataTypeService.findAllMetaDataType(
      findAllQueryMetaDataType,
    )
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metaDataTypeService.findOneMetaDataType(+id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metaDataTypeService.removeMetaDataType(+id)
  }
}
