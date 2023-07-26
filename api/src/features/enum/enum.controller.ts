import { EnumService } from './enum.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CreateEnumDto, EnumsRequestDto } from './dto'

@Controller('enum')
export class EnumController {
  constructor(private readonly enumService: EnumService) {}

  @Post('')
  create(@Body() payload: CreateEnumDto) {
    return this.enumService.create(payload)
  }

  @Get('')
  findAll(@Query() query: EnumsRequestDto) {
    return this.enumService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enumService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() payload: CreateEnumDto) {
    return this.enumService.update(+id, payload)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enumService.remove(+id)
  }
}
