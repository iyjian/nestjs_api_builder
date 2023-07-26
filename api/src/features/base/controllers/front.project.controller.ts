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
  FindAllFrontProjectRequestDTO,
  CreateFrontProjectRequestDTO,
  UpdateFrontProjectRequestDTO,
} from '../dto'
import { FrontProjectService } from '../services/front.project.service'

@Controller('frontProject')
@ApiTags('前端项目表')
export class FrontProjectController {
  constructor(private readonly frontProjectService: FrontProjectService) {}

  @Post('')
  @ApiOperation({
    summary: 'POST frontProject',
  })
  create(@Body() createFrontProject: CreateFrontProjectRequestDTO) {
    return this.frontProjectService.create(createFrontProject)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH frontProject',
  })
  update(
    @Param('id') id: string,
    @Body() updateFrontProjectRequestDTO: UpdateFrontProjectRequestDTO,
  ) {
    return this.frontProjectService.updateById(
      +id,
      updateFrontProjectRequestDTO,
    )
  }

  @Get('')
  @ApiOperation({
    summary: 'GET frontProject(list)',
  })
  findAll(@Query() findAllQueryFrontProject: FindAllFrontProjectRequestDTO) {
    return this.frontProjectService.findAll(findAllQueryFrontProject)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET frontProject(single)',
  })
  findOne(@Param('id') id: string) {
    return this.frontProjectService.findOneById(+id)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'DELETE frontProject',
  })
  remove(@Param('id') id: string) {
    return this.frontProjectService.removeById(+id)
  }
}
