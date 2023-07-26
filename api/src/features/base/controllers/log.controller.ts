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
  FindAllLogRequestDTO,
  CreateLogRequestDTO,
  UpdateLogRequestDTO,
} from './../dto'
import { LogService } from './../services'

@Controller('log')
@ApiTags('日志表')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post('')
  @ApiOperation({
    summary: 'POST log',
  })
  create(@Body() createLog: CreateLogRequestDTO) {
    return this.logService.create(createLog)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH log',
  })
  update(
    @Param('id') id: string,
    @Body() updateLogRequestDTO: UpdateLogRequestDTO,
  ) {
    return this.logService.updateById(+id, updateLogRequestDTO)
  }

  @Get('')
  @ApiOperation({
    summary: 'GET log(list)',
  })
  findAll(@Query() findAllQueryLog: FindAllLogRequestDTO) {
    return this.logService.findAll(findAllQueryLog)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET log(single)',
  })
  findOne(@Param('id') id: string) {
    return this.logService.findOneById(id)
  }
}
