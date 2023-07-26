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
  FindAllProjectModuleRequestDTO,
  CreateProjectModuleRequestDTO,
  UpdateProjectModuleRequestDTO,
} from '../dto'
import { ProjectModuleService } from '../services/project.module.service'

@Controller('projectModule')
@ApiTags('项目模块')
export class ProjectModuleController {
  constructor(private readonly projectModuleService: ProjectModuleService) {}

  @Post('')
  @ApiOperation({
    summary: 'POST projectModule',
  })
  create(@Body() createProjectModule: CreateProjectModuleRequestDTO) {
    return this.projectModuleService.create(createProjectModule)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH projectModule',
  })
  update(
    @Param('id') id: string,
    @Body() updateProjectModuleRequestDTO: UpdateProjectModuleRequestDTO,
  ) {
    return this.projectModuleService.updateById(
      +id,
      updateProjectModuleRequestDTO,
    )
  }

  @Get('')
  @ApiOperation({
    summary: 'GET projectModule(list)',
  })
  findAll(@Query() findAllQueryProjectModule: FindAllProjectModuleRequestDTO) {
    return this.projectModuleService.findAll(findAllQueryProjectModule)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET projectModule(single)',
  })
  findOne(@Param('id') id: string) {
    return this.projectModuleService.findOneById(+id)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'DELETE projectModule',
  })
  remove(@Param('id') id: string) {
    return this.projectModuleService.removeById(+id)
  }
}
