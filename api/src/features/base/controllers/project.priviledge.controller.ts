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
  FindAllProjectPriviledgeRequestDTO,
  CreateProjectPriviledgeRequestDTO,
  UpdateProjectPriviledgeRequestDTO,
} from './../dto/project.priviledge.request.dto'
import { ProjectPriviledgeService } from './../services/project.priviledge.service'
import {
  ApiPaginatedResponse,
  ApiFindOneResponse,
  ApiPatchResponse,
  ApiDeleteResponse,
  codeGen,
} from './../../../core'
import {
  FindOneResponseSchema,
  FindAllResponseSchema,
} from './../dto/project.priviledge.response.schema'

@Controller('projectPriviledge')
@ApiTags('项目权限')
export class ProjectPriviledgeController {
  constructor(
    private readonly projectPriviledgeService: ProjectPriviledgeService,
  ) {}

  @Post('')
  @ApiOperation({
    summary: 'POST projectPriviledge',
  })
  @ApiFindOneResponse('projectPriviledge', FindOneResponseSchema)
  @codeGen('726-create')
  create(@Body() createProjectPriviledge: CreateProjectPriviledgeRequestDTO) {
    return this.projectPriviledgeService.create(createProjectPriviledge)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH projectPriviledge',
  })
  @ApiPatchResponse('projectPriviledge')
  @codeGen('726-update')
  update(
    @Param('id') id: string,
    @Body()
    updateProjectPriviledgeRequestDTO: UpdateProjectPriviledgeRequestDTO,
  ) {
    return this.projectPriviledgeService.updateById(
      +id,
      updateProjectPriviledgeRequestDTO,
    )
  }

  @Get('')
  @ApiOperation({
    summary: 'GET projectPriviledge(list)',
  })
  @ApiPaginatedResponse('projectPriviledge', FindAllResponseSchema)
  @codeGen('726-findAll')
  findAll(
    @Query() findAllQueryProjectPriviledge: FindAllProjectPriviledgeRequestDTO,
  ) {
    return this.projectPriviledgeService.findAll(findAllQueryProjectPriviledge)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET projectPriviledge(single)',
  })
  @ApiFindOneResponse('projectPriviledge', FindOneResponseSchema)
  @codeGen('726-findOne')
  findOne(@Param('id') id: string) {
    return this.projectPriviledgeService.findOneByIdOrThrow(+id)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'DELETE projectPriviledge',
  })
  @ApiDeleteResponse('projectPriviledge')
  @codeGen('726-remove')
  remove(@Param('id') id: string) {
    return this.projectPriviledgeService.removeById(+id)
  }
}
