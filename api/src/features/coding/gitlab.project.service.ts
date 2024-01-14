import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { Gitlab, Types } from '@gitbeaker/node'
import { ConfigService } from '@nestjs/config'
import { GitlabService } from './gitlab.service'
import { CommitAction } from './dto/coding.dto'
@Injectable()
export class GitlabProjectService {
  private readonly logger = new Logger()

  private readonly gitlabClient: InstanceType<typeof Gitlab>
  private readonly namespaceId = this.configService.get('gitlab.namespaceId')
  private readonly templateProjectId = this.configService.get(
    'gitlab.templateProjectId',
  )

  constructor(
    private readonly configService: ConfigService,
    private readonly gitService: GitlabService,
  ) {
    this.gitlabClient = new Gitlab({
      host: this.configService.get('gitlab.host'),
      token: this.configService.get('gitlab.token'),
    })
  }

  /**
   * 创建项目
   * 接口详情: https://docs.gitlab.com/ee/api/projects.html#create-project

   * @param projectName 
   * @param templateProjectId 
   * @param visibility 
   * @param namespaceId - Namespace for the new project (defaults to the current user’s namespace).
   * @returns 
   */
  public async createProject(
    projectName: string,
    templateProjectId: number = this.templateProjectId,
    visibility: string = 'private',
    namespaceId: number = this.namespaceId,
    templateProjectBranch: string = 'main',
    cb?: (project: Types.ProjectExtendedSchema) => void,
  ): Promise<Types.ProjectExtendedSchema> {
    this.logger.debug(
      `createProject - projectName: ${projectName} templateProjectId: ${templateProjectId} visibility: ${visibility} namespaceId: ${namespaceId} templateProjectBranch: ${templateProjectBranch}`,
    )

    const project = await this.gitlabClient.Projects.create({
      name: projectName,
      visibility,
      namespace_id: namespaceId,
      initialize_with_readme: false,
    })

    if (templateProjectId) {
      try {
        // 从模板项目的main分支中提取代码
        const commitFiles = await this.gitService.getFilesContent(
          templateProjectId,
          templateProjectBranch,
          '',
          true,
        )

        /**
         * 从已创建项目的defaultBranch分支创建dev分支
         * defaultBranch在gitlab中配置，默认应该是main分支
         */
        await this.gitService.createBranch(
          project.id,
          'dev',
          this.configService.get('gitlab.defaultBranch'),
        )

        /**
         * 将模板项目的代码提交到已创建项目的dev分支
         */
        await this.gitService.commitFiles(
          project.id,
          'dev',
          commitFiles.map((commitFile) => ({
            filePath: commitFile.path,
            content: commitFile.content,
            action:
              commitFile.path === 'README.md'
                ? CommitAction.update
                : CommitAction.create,
          })),
          'init',
        )

        if (cb) {
          cb(project)
        }
      } catch (e) {
        await this.deleteProject(project.id)
        this.logger.debug(
          `createProject - projectId: ${project.id} rolled back`,
        )
        throw e
      }
    }

    return project
  }

  deleteProject(projectId: number) {
    const result = this.gitlabClient.Projects.remove(projectId)
    return result
  }
}
