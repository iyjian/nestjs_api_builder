import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { Code } from '../../core/interfaces/CodeType'
import { BranchSchema, Camelize, Gitlab } from '@gitbeaker/rest'
import { ConfigService } from '@nestjs/config'
import { CommitAction } from './dto/coding.dto'
import { GitlabRemoveDirectoryRequestDTO } from './dto/gitlab.dto'
import { MetaProjectService } from '../base/services/meta.project.service'

export type CommitFile = {
  filePath: string
  content: string
  action: CommitAction
}

type Commiter = {
  Email: string
  Name: string
}

type Commit = {
  ShortMessage: string
  Sha: string
  CommitDate: number
  Commiter: Commiter
}

type MergeInfo = {
  ProjectId: number
  DepotId: number
  MergeRequestId: number
}

type CreateMergeRequestResponse = {
  RequestId: string
  MergeInfo: MergeInfo
}

/**
 * https://docs.gitlab.com/ee/api/api_resources.html
 */
@Injectable()
export class GitlabService {
  private readonly logger = new Logger(GitlabService.name)
  private gitlabClient: InstanceType<typeof Gitlab>

  constructor(
    private readonly configService: ConfigService,
    private readonly metaProjectService: MetaProjectService,
  ) {
    // this.gitlabClient = new Gitlab({
    //   host: this.configService.get('gitlab.host'),
    //   token: this.configService.get('gitlab.token'),
    // })
  }

  async getGitlabClient (repoId: number): Promise<InstanceType<typeof Gitlab>> {
    const project = await this.metaProjectService.findOneMetaProject2({repoId})
    if (project && project.gitlabHost && project.gitlabToken) {
      // project设置过token
      return new Gitlab({
        host: project.gitlabHost,
        token: project.gitlabToken,
      })
    } else {
      // project没有设置过token
      return new Gitlab({
        host: this.configService.get('gitlab.host'),
        token: this.configService.get('gitlab.token'),
      })
    }
  }

  /**
   * 获取指定仓库、指定路径的文件内容
   *
   * 接口详情: https://docs.gitlab.com/ee/api/repository_files.html#get-file-from-repository
   *
   * @param repoId - number - coding仓库id
   * @param branch - string - 分支名
   * @param fullFilePath - string - 文件完整路径
   * @returns
   */
  async getFileContent(
    repoId: number,
    branch: string,
    fullFilePath: string,
  ): Promise<{
    err: 0 | 404 | 500
    errMsg?: string
    content?: string
    filePath?: string
  }> {
    try {
      this.logger.debug(
        `gitService - getFileContent - request: repoId: ${repoId} branch: ${branch} fullFilePath: ${fullFilePath}`,
      )
      const gitlabClient = await this.getGitlabClient(repoId)
      const result = await gitlabClient.RepositoryFiles.show(
        repoId,
        fullFilePath,
        branch,
      )
      return {
        err: 0,
        content: Buffer.from(result.content, 'base64').toString(),
        filePath: fullFilePath,
      }
    } catch (e: any) {
      if (
        e.description === '404 File Not Found' ||
        e.description === '404 Commit Not Found'
      ) {
        return {
          err: 404,
          errMsg: e.description,
        }
      } else {
        this.logger.error(`gitService - getFileContent - exception`)
        throw e
      }
    }
  }

  /**
   * 获取指定分支下指定路径下的所有文件内容(不含子目录中的文件以及目录)
   *
   * 接口说明: https://docs.gitlab.com/ee/api/repositories.html#list-repository-tree
   *
   *     {
   *       id: '413ce6ef31dc5798a986609b0cfd4abdec684b74',
   *       name: 'front',
   *       type: 'tree',
   *       path: 'front',
   *       mode: '040000'
   *     },
   *     {
   *       id: '1d74e21965c4f858f5f818a270e64e1bfad7d843',
   *       name: '.gitignore',
   *       type: 'blob',
   *       path: '.gitignore',
   *       mode: '100644'
   *     },
   *
   * @param repoId - number - 仓库id
   * @param branch - string - 分支
   * @param directory - string - 文件完整路径
   * @returns
   */
  async getFilesContent(
    repoId: number,
    branch: string,
    directory: string,
    recursive: boolean = false,
  ) {
    this.logger.debug(
      `gitService - getFilesContent - repoId: ${repoId} branch: ${branch} directory: ${directory}`,
    )
    const gitlabClient = await this.getGitlabClient(repoId)
    const codes: Code[] = []

    // const files = await gitlabClient.Repositories.tree(repoId, {
    //   ref: branch,
    //   path: directory,
    //   recursive,
    //   per_page: 10000,
    // })

    const files = await gitlabClient.Repositories.allRepositoryTrees(repoId, {
      ref: branch,
      path: directory,
      recursive,
      perPage: 10000,
    })

    // 改成promise.all
    for (const file of files) {
      if (file.type === 'blob') {
        const result = await this.getFileContent(repoId, branch, file.path)
        codes.push({
          path: file.path,
          content: result.content,
          originContent: result.content,
          isExist: true,
          name: file.name,
          label: 'enty',
        })
      }
    }

    return codes
  }

  async getFiles(
    repoId: number,
    branch: string,
    directory: string,
    recursive: boolean = false,
  ): Promise<any> {
    this.logger.debug(
      `gitService - getFilesContent - repoId: ${repoId} branch: ${branch} directory: ${directory}`,
    )
    const codes: Code[] = []
    const gitlabClient = await this.getGitlabClient(repoId)
    // const files = await gitlabClient.Repositories.tree(repoId, {
    //   ref: branch,
    //   path: directory,
    //   recursive,
    //   per_page: 10000,
    // })
    const files = await gitlabClient.Repositories.allRepositoryTrees(repoId, {
      ref: branch,
      path: directory,
      recursive,
      perPage: 10000,
    })

    return files
  }

  async removeDirectory(
    gitlabRemoveDirectoryRequest: GitlabRemoveDirectoryRequestDTO,
  ) {
    const {
      repoId,
      branch,
      directory,
      comment = `delete directory: ${directory}`,
    } = gitlabRemoveDirectoryRequest
    
    const files = await this.getFiles(+repoId, branch, directory, true)

    const commitFiles = files
      .filter((file) => file.type === 'blob')
      .map((file) => ({
        filePath: file.path,
        content: '',
        action: CommitAction.delete,
      }))

    await this.commitFiles(+repoId, branch, commitFiles, comment)
  }

  /**
   * 创建merge request
   * 接口详情: https://docs.gitlab.com/ee/api/merge_requests.html#create-mr
   *
   * @param repoId - number - coding仓库的id
   * @param title - string - merge request的标题
   * @param content - string - merge request的详细备注
   * @param srcBranch - string - merge request的源分支
   * @param targetBranch - string - merge request的目标分支
   * @returns
   */
  async createMergeRequest(
    repoId: number,
    title: string,
    content: string,
    srcBranch: string,
    targetBranch: string,
  ) {
    const result = await this.gitlabClient.MergeRequests.create(
      repoId,
      srcBranch,
      targetBranch,
      title,
      {
        description: content,
      },
    )

    return {
      MergeInfo: { MergeRequestUrl: result.web_url },
    }
  }

  /**
   * 提交新的文件列表(无需指定提交点)
   * 接口文档: https://docs.gitlab.com/ee/api/commits.html#create-a-commit-with-multiple-files-and-actions
   *
   * @param repoId - number - coding仓库id
   * @param branch - string - 提交目标分支名
   * @param gitFiles - GitFile[] - 提交的文件列表
   * @param comment - string - commit message
   * @returns
   */
  async commitFiles(
    repoId: number,
    branch: string,
    commitFiles: CommitFile[],
    comment?: string,
  ) {
    this.logger.debug(
      `gitService - commitFiles - repoId: ${repoId}, branch: ${branch}, comment: ${comment}`,
    )
    this.logger.debug(JSON.stringify(commitFiles, null, 2))
    const gitlabClient = await this.getGitlabClient(repoId)
    await gitlabClient.Commits.create(repoId, branch, comment, commitFiles)
  }

  /**
   * 创建分支,需要指定源分支(以哪个分支作为基准来创建新的分支)
   *
   * @param repoId - number - coding仓库id
   * @param newBranch - string - 源分支
   * @param sourceBranch - string - 目标分支
   * @returns
   */
  async createBranch(
    repoId: number,
    newBranch: string,
    sourceBranch: string,
  ): Promise<BranchSchema | Camelize<BranchSchema>> {
    const gitlabClient = await this.getGitlabClient(repoId)
    return gitlabClient.Branches.create(repoId, newBranch, sourceBranch)
  }
}
