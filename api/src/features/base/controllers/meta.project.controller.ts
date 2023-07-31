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
import { MetaProjectService } from '../services/meta.project.service'
import {
  CreateMetaProjectRequestDTO,
  FindAllMetaProjectRequestDTO,
  UpdateMetaProjectRequestDTO,
} from '../dto'
import {
  ApiPaginatedResponse,
  ApiFindOneResponse,
  ApiPatchResponse,
  ApiDeleteResponse,
  codeGen,
} from './../../../core'

@Controller('metaProject')
export class MetaProjectController {
  constructor(private readonly metaProjectService: MetaProjectService) {}

  @Post('')
  create(@Body() createMetaProject: CreateMetaProjectRequestDTO) {
    return this.metaProjectService.createMetaProject(createMetaProject)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetaProjectDTO: UpdateMetaProjectRequestDTO,
  ) {
    return this.metaProjectService.updateMetaProject(+id, updateMetaProjectDTO)
  }

  @Get('')
  findAll(@Query() findAllQueryMetaProject: FindAllMetaProjectRequestDTO) {
    return this.metaProjectService.findAllMetaProject(findAllQueryMetaProject)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metaProjectService.findOneMetaProjectById(+id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metaProjectService.removeMetaProject(+id)
  }
}
