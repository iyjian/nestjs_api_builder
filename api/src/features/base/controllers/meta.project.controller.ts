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
  RequestUser,
} from './../../../core'
import { GitlabProjectService } from './../../coding/gitlab.project.service'
import { ProjectPriviledgeService } from '../services/project.priviledge.service'

@Controller('metaProject')
export class MetaProjectController {
  private readonly logger = new Logger(MetaProjectController.name)
  constructor(
    private readonly metaProjectService: MetaProjectService,
    private readonly gitlabProjectService: GitlabProjectService,
    private readonly projectPriviledgeService: ProjectPriviledgeService,
  ) {}

  @Post('')
  async create(
    @RequestUser() user: any,
    @Body() createMetaProject: CreateMetaProjectRequestDTO,
  ) {
    createMetaProject.userId = user.userId

    const metaProject = await this.metaProjectService.createMetaProject(
      createMetaProject,
    )

    await this.projectPriviledgeService.create({
      projectId: metaProject.id,
      userId: user.id,
    })

    // 异步创建gitlab仓库代码
    this.gitlabProjectService
      .createProject(
        createMetaProject.repoName,
        undefined,
        undefined,
        user.namespaceId,
        createMetaProject.version === 1 ? 'main' : 'simplified',
        async (project) => {
          /**
           * 仓库创建成功后将仓库信息更新到数据库
           */
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
    return this.metaProjectService.findAllMetaProject(
      userId,
      findAllQueryMetaProject,
    )
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
