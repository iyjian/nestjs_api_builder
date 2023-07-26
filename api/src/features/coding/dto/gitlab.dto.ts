import { ApiProperty } from '@nestjs/swagger'
import { CommitAction } from './coding.dto'

export class CommitFile {
  @ApiProperty({
    description: '文件路径',
    required: true,
  })
  filePath: string

  @ApiProperty({
    description: '文件内容(文本字符)',
    required: true,
  })
  content: string

  @ApiProperty({
    description: '提交类型 - create,update,delete,chmod,move',
    required: true,
  })
  action: CommitAction
}

export class GitlabCommitRequestDTO {
  @ApiProperty({
    description: '仓库id',
    required: true,
  })
  repoId: string

  @ApiProperty({
    description: '提交分支',
    required: true,
  })
  branch: string

  @ApiProperty({
    description: '提交文件',
    required: true,
    type: () => [CommitFile],
  })
  gitFiles: CommitFile[]

  @ApiProperty({
    description: '提交信息',
    required: true,
  })
  comment: string
}

export class GitlabRemoveDirectoryRequestDTO {
  @ApiProperty({
    description: '仓库id',
    required: true,
  })
  repoId: string

  @ApiProperty({
    description: '提交分支',
    required: true,
  })
  branch: string

  @ApiProperty({
    description: '删除路径',
    required: true,
  })
  directory: string

  @ApiProperty({
    description: '提交信息',
    required: true,
  })
  comment: string
}

export class CreateBranchRequestDTO {
  @ApiProperty({
    description: '仓库id',
    required: true,
  })
  repoId: string

  @ApiProperty({
    description: '源分支(以哪个分支为基准分支)',
    required: true,
  })
  srcBranch: string

  @ApiProperty({
    description: '目标分支(创建哪个分支)',
    required: true,
  })
  targetBranch: string
}

export class CreateProjectRequestDTO {
  @ApiProperty({
    description: '仓库名称(合法仓库名称)',
    required: true,
  })
  projectName: string

  // @ApiProperty({
  //   description: '模板项目repoId',
  //   required: true,
  // })
  // templateProjectId: string
}

export class CreateMergeRequestDTO {
  @ApiProperty({
    description: '仓库id',
    required: true,
  })
  repoId: string

  @ApiProperty({
    description: '源分支(以哪个分支为基准分支)',
    required: true,
  })
  srcBranch: string

  @ApiProperty({
    description: '目标分支(创建哪个分支)',
    required: true,
  })
  targetBranch: string

  @ApiProperty({
    description: 'MR标题',
    required: true,
  })
  title: string

  @ApiProperty({
    description: 'MR详细描述',
    required: true,
  })
  content: string
}
