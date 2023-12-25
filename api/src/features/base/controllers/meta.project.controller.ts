import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
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
  RequestUserId,
} from './../../../core'
import { GitlabProjectService } from './../../coding/gitlab.project.service'

@Controller('metaProject')
export class MetaProjectController {
  private readonly logger = new Logger(MetaProjectController.name)
  constructor(
    private readonly metaProjectService: MetaProjectService,
    private readonly gitlabProjectService: GitlabProjectService,
  ) {}

  @Post('')
  async create(@Body() createMetaProject: CreateMetaProjectRequestDTO) {
    const metaProject = await this.metaProjectService.createMetaProject(
      createMetaProject,
    )

    this.gitlabProjectService
      .createProject(
        createMetaProject.name,
        undefined,
        undefined,
        undefined,
        async (project) => {
          this.logger.debug(
            `create - updateMetaProject - projectId: ${metaProject.id} repoId: ${project.id} repo: ${project.ssh_url_to_repo}`,
          )
          await this.metaProjectService.updateMetaProject(metaProject.id, {
            status: 1,
            repo: project.ssh_url_to_repo,
            repoId: project.id,
          })
        },
      )
      .catch((error) => {
        this.logger.error(error)
        console.log(error)
      })

    return metaProject
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetaProjectDTO: UpdateMetaProjectRequestDTO,
  ) {
    return this.metaProjectService.updateMetaProject(+id, updateMetaProjectDTO)
  }

  @Get('')
  findAll(
    @RequestUserId() userId: number,
    @Query() findAllQueryMetaProject: FindAllMetaProjectRequestDTO,
  ) {
    return this.metaProjectService.findAllMetaProject(userId, findAllQueryMetaProject)
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
