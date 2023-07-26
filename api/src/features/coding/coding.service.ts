import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import { Code } from '../../core/interfaces/CodeType'
import { DescribeGitFilesResponse } from './dto'

// type GitFile = {
//   path: string
//   content: string
// }

// type Commiter = {
//   Email: string
//   Name: string
// }

// type Commit = {
//   ShortMessage: string
//   Sha: string
//   CommitDate: number
//   Commiter: Commiter
// }

// type MergeInfo = {
//   ProjectId: number
//   DepotId: number
//   MergeRequestId: number
// }

// type CreateMergeRequestResponse = {
//   RequestId: string
//   MergeInfo: MergeInfo
// }

@Injectable()
export class CodingService {
  private readonly logger = new Logger(CodingService.name)
  private codingClient: AxiosInstance

  constructor(private readonly configService: ConfigService) {
    this.codingClient = axios.create({
      method: 'POST',
      baseURL: this.configService.get<string>('coding.apiEndpoint'),
      timeout: 20000,
      headers: {
        Authorization: `token ${this.configService.get<string>(
          'coding.apiToken',
        )}`,
      },
    })
  }

  async getImages(projectId: number, repo: string) {
    const response = await this.codingClient({
      params: {
        Action: 'DescribeArtifactPackageList',
      },
      data: {
        Action: 'DescribeArtifactPackageList',
        ProjectId: projectId,
        Repository: repo,
        PageSize: 100,
      },
    })
    return response.data
  }

  async getProjects() {
    const response = await this.codingClient({
      params: {
        Action: 'DescribeCodingProjects',
      },
      data: {
        Action: 'DescribeCodingProjects',
        PageSize: 100,
      },
    })
    return response.data
  }

  async getImageVersions(projectId: number, repo: string, image: string) {
    const response = await this.codingClient({
      params: {
        Action: 'DescribeArtifactVersionList',
      },
      data: {
        Action: 'DescribeArtifactVersionList',
        ProjectId: projectId,
        Repository: repo,
        Package: image,
        PageSize: 100,
      },
    })
    return response.data
  }

  // /**
  //  * 获取指定仓库、指定路径的文件内容
  //  *
  //  * coding接口详情: https://help.coding.net/openapi#4ec8e6c65397c49362e93c2fa5475429
  //  *
  //  * @param repoId - number - coding仓库id
  //  * @param branch - string - 分支名
  //  * @param fullFileNameWithPath - string - 文件完整路径(含文件名)
  //  * @returns
  //  */
  // async getFileContent(
  //   repoId: number,
  //   branch: string,
  //   fullFileNameWithPath: string,
  // ): Promise<{ err: 0 | 404 | 500; errMsg?: string; content?: string }> {
  //   const response = await this.codingClient({
  //     params: {
  //       Action: 'DescribeGitFile',
  //     },
  //     data: {
  //       DepotId: repoId,
  //       Ref: branch,
  //       Path: fullFileNameWithPath,
  //       Action: 'DescribeGitFile',
  //     },
  //   })
  //   if (response.data.Response.Error) {
  //     this.logger.debug(
  //       `getFileContent - request&response: ${JSON.stringify(
  //         {
  //           DepotId: repoId,
  //           Ref: branch,
  //           Path: fullFileNameWithPath,
  //           Action: 'DescribeGitFile',
  //           response: response.data,
  //         },
  //         null,
  //         2,
  //       )}`,
  //     )
  //     if (
  //       response.data.Response.Error.Message === 'Ref or Path invalid' ||
  //       response.data.Response.Error.Message === 'Path not found' ||
  //       response.data.Response.Error.Message === '路径未找到'
  //     ) {
  //       return {
  //         err: 404,
  //         errMsg: response.data.Response.Error.Message,
  //       }
  //     } else {
  //       // TODO: coding实在是太垃圾了，文件找不到也报internal error，暂时没有解决方案，暂且认为报错都认为是没有文件
  //       // return {
  //       //   err: 404,
  //       //   errMsg: response.data.Response.Error.Message,
  //       // }
  //       return {
  //         err: 500,
  //         errMsg:
  //           response.data.Response.Error.Code +
  //           response.data.Response.Error.Message,
  //       }
  //     }
  //   } else if (
  //     response.data.Response.GitFile &&
  //     response.data.Response.GitFile.ContentSha256
  //   ) {
  //     return {
  //       err: 0,
  //       content: Buffer.from(
  //         response.data.Response.GitFile.Content,
  //         'base64',
  //       ).toString(),
  //     }
  //   } else {
  //     this.logger.error(
  //       `getFileContent - request&response: ${JSON.stringify(
  //         {
  //           DepotId: repoId,
  //           Ref: branch,
  //           Path: fullFileNameWithPath,
  //           Action: 'DescribeGitFile',
  //           response: response.data,
  //         },
  //         null,
  //         2,
  //       )}`,
  //     )
  //     return {
  //       err: 500,
  //       errMsg: '系统错误',
  //     }
  //   }
  // }

  // /**
  //  * 获取提交记录列表，用于用接口提交代码时指定最后一个提交点
  //  *
  //  * @param repoId - number - coding仓库的id
  //  * @param branch - string - 分支名
  //  * @returns
  //  */
  // async getCommits(repoId: number, branch: string): Promise<Commit[]> {
  //   this.logger.verbose(
  //     `getCommits - param: ${JSON.stringify(
  //       {
  //         DepotId: repoId,
  //         Ref: branch,
  //         Action: 'DescribeGitCommits',
  //       },
  //       null,
  //       2,
  //     )}`,
  //   )
  //   const response = await this.codingClient({
  //     params: {
  //       Action: 'DescribeGitCommits',
  //     },
  //     data: {
  //       DepotId: repoId,
  //       Ref: branch,
  //       Action: 'DescribeGitCommits',
  //     },
  //   })
  //   if (response.data.Response.Error) {
  //     this.logger.verbose(
  //       `getCommits - ${JSON.stringify(response.data, null, 2)}`,
  //     )
  //     throw new HttpException(
  //       response.data.Response.Error.Code +
  //         response.data.Response.Error.Message,
  //       HttpStatus.BAD_GATEWAY,
  //     )
  //   } else {
  //     return response.data.Response.Commits as Commit[]
  //   }
  // }

  // /**
  //  * 创建merge request
  //  *
  //  * @param repoId - number - coding仓库的id
  //  * @param title - string - merge request的标题
  //  * @param content - string - merge request的详细备注
  //  * @param srcBranch - string - merge request的源分支
  //  * @param targetBranch - string - merge request的目标分支
  //  * @returns
  //  */
  // async createMergeRequest(
  //   repoId: number,
  //   title: string,
  //   content: string,
  //   srcBranch: string,
  //   targetBranch: string,
  // ): Promise<CreateMergeRequestResponse> {
  //   this.logger.verbose(
  //     `createMergeRequest - param: ${JSON.stringify(
  //       {
  //         Action: 'CreateGitMergeReq',
  //         DepotId: repoId,
  //         Title: title,
  //         Content: content,
  //         SrcBranch: srcBranch,
  //         DestBranch: targetBranch,
  //       },
  //       null,
  //       2,
  //     )}`,
  //   )
  //   const response = await this.codingClient({
  //     params: {
  //       Action: 'CreateGitMergeReq',
  //     },
  //     data: {
  //       Action: 'CreateGitMergeReq',
  //       DepotId: repoId,
  //       Title: title,
  //       Content: content,
  //       SrcBranch: srcBranch,
  //       DestBranch: targetBranch,
  //     },
  //   })

  //   if (response.data.Response.Error) {
  //     this.logger.verbose(
  //       `createMergeRequest - ${JSON.stringify(response.data, null, 2)}`,
  //     )
  //     throw new HttpException(
  //       response.data.Response.Error.Code +
  //         response.data.Response.Error.Message,
  //       HttpStatus.BAD_GATEWAY,
  //     )
  //   }
  //   return response.data.Response
  // }

  // /**
  //  * 提交新的文件列表(无需指定提交点)
  //  *
  //  * @param repoId - number - coding仓库id
  //  * @param branch - string - 提交目标分支名
  //  * @param gitFiles - GitFile[] - 提交的文件列表
  //  * @param comment - string - commit message
  //  * @returns
  //  */
  // async commitNewFiles(
  //   repoId: number,
  //   branch: string,
  //   gitFiles: GitFile[],
  //   comment?: string,
  // ) {
  //   const commits = await this.getCommits(repoId, branch)

  //   this.logger.verbose(
  //     `commitNewFiles - recent commits: ${JSON.stringify(commits)}`,
  //   )

  //   const response = await this.codingClient({
  //     params: {
  //       Action: 'CreateGitFiles',
  //     },
  //     data: {
  //       DepotId: repoId,
  //       Ref: branch,
  //       LastCommitSha: commits[0].Sha,
  //       Message:
  //         comment ||
  //         `commitNewFiles:\n${gitFiles
  //           .map((gitFile) => gitFile.path)
  //           .join('\n')}`,
  //       Action: 'CreateGitFiles',
  //       GitFiles: gitFiles,
  //     },
  //   })

  //   return response
  // }

  // /**
  //  * 提交有修改的文件(方法内部默认使用指定分支上的最后一个提交点)
  //  *
  //  * @param repoId - number - coding仓库id
  //  * @param branch - string - 提交目标分支名
  //  * @param gitFiles - GitFile[] - 提交的文件列表
  //  * @param comment - string - commit message
  //  * @returns
  //  */
  // async commitModifiedFiles(
  //   repoId: number,
  //   branch: string,
  //   gitFiles: GitFile[],
  //   comment?: string,
  // ) {
  //   const commits = await this.getCommits(repoId, branch)

  //   this.logger.verbose(
  //     `commitModifiedFiles - recent commits: ${JSON.stringify(commits)}`,
  //   )

  //   const response = await this.codingClient({
  //     params: {
  //       Action: 'ModifyGitFiles',
  //     },
  //     data: {
  //       DepotId: repoId,
  //       Ref: branch,
  //       LastCommitSha: commits[0].Sha,
  //       Message:
  //         comment ||
  //         `ModifyGitFiles:\n${gitFiles
  //           .map((gitFile) => gitFile.path)
  //           .join('\n')}`,
  //       Action: 'ModifyGitFiles',
  //       GitFiles: gitFiles,
  //     },
  //   })

  //   return response
  // }

  // /**
  //  * 创建分支,需要指定源分支(以哪个分支作为基准来创建新的分支)
  //  *
  //  * @param repoId - number - coding仓库id
  //  * @param newBranch - string - 源分支
  //  * @param sourceBranch - string - 目标分支
  //  * @returns
  //  */
  // async createBranch(repoId: number, newBranch: string, sourceBranch: string) {
  //   this.logger.verbose(
  //     `createBranch - param: ${JSON.stringify(
  //       {
  //         DepotId: repoId,
  //         BranchName: newBranch,
  //         StartPoint: sourceBranch,
  //         Action: 'CreateGitBranch',
  //       },
  //       null,
  //       2,
  //     )}`,
  //   )
  //   const response = await this.codingClient({
  //     params: {
  //       Action: 'CreateGitBranch',
  //     },
  //     data: {
  //       DepotId: repoId,
  //       BranchName: newBranch,
  //       StartPoint: sourceBranch,
  //       Action: 'CreateGitBranch',
  //     },
  //   })
  //   if (response.data.Response.Error) {
  //     this.logger.verbose(
  //       `createBranch - ${JSON.stringify(response.data, null, 2)}`,
  //     )
  //     throw new HttpException(
  //       response.data.Response.Error.Code +
  //         response.data.Response.Error.Message,
  //       HttpStatus.BAD_GATEWAY,
  //     )
  //   }
  //   return response.data.Response
  // }

  // /**
  //  * 获取指定分支下指定路径下的所有文件内容(不含子目录中的文件以及目录)
  //  *
  //  * 接口说明:
  //  * https://coding.net/help/openapi#531275c981a3ae91c1aa6a889a114f5c
  //  *
  //  * TODO: 使用coding接口获取一个不存在的文件路径, coding的接口会抛异常，但是这个异常并没有区分路径不存在和其他异常,所以此方法返回空数组并不一定代表此目录下没有文件,待coding修复以上接口。
  //  *
  //  * 已经给coding提了工单(2022-10-05开的单)
  //  * https://chenawy.coding.net/workorder/9653175  (coding自动关闭工单)
  //  * https://chenawy.coding.net/workorder/9753107  (承诺不会自动关闭, 直至解决)
  //  *
  //  * @param repoId - number - 仓库id
  //  * @param branch - string - 分支
  //  * @param directory - string - 文件完整路径
  //  * @returns
  //  */
  // async getFilesContent(
  //   repoId: number,
  //   branch: string,
  //   directory: string,
  // ): Promise<Code[]> {
  //   const codes: Code[] = []

  //   this.logger.verbose(
  //     `getFilesContent - request param: ${JSON.stringify(
  //       {
  //         Action: 'DescribeGitFiles',
  //         DepotId: repoId,
  //         Ref: branch,
  //         Path: directory,
  //       },
  //       null,
  //       2,
  //     )}`,
  //   )
  //   const response = await this.codingClient({
  //     params: {
  //       Action: 'DescribeGitFiles',
  //     },
  //     data: {
  //       Action: 'DescribeGitFiles',
  //       DepotId: repoId,
  //       Ref: branch,
  //       Path: directory,
  //     },
  //   })

  //   if (response.data.Response.Error) {
  //     // 2022-10-24 - 这里需要区分目录404或者接口其它报错，现在coding不支持，已经提了工单，coding还没有解决
  //     // 2022-11-18 - 已经解决
  //     // https://chenawy.coding.net/workorder/9753107
  //     if (response.data.Response.Error.Message === '路径未找到') {
  //       return []
  //     } else {
  //       throw new HttpException(
  //         response.data.Response.Error.Code +
  //           response.data.Response.Error.Message,
  //         HttpStatus.BAD_GATEWAY,
  //       )
  //     }
  //   }

  //   const result = response.data.Response as DescribeGitFilesResponse
  //   this.logger.verbose(
  //     `getFilesContent - result: ${JSON.stringify(result, null, 2)}`,
  //   )
  //   for (const item of result.Items) {
  //     if (item.Mode === 'file') {
  //       this.logger.debug(`getFilesContent - fetch: ${item.Path}`)
  //       const result = await this.getFileContent(repoId, branch, item.Path)
  //       if (result.err === 500) {
  //         throw new Error(result.errMsg)
  //       } else {
  //         codes.push({
  //           path: item.Path,
  //           content: result.content,
  //           originContent: result.content,
  //           isExist: true,
  //           name: item.Name,
  //           label: 'enty',
  //         })
  //       }
  //     }
  //   }
  //   return codes
  // }
}
