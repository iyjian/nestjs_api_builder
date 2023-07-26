import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common'
import { CommitFile, GitlabService } from '../gitlab.service'
import { GetCodingFileRequestDto, GetCodingFilesRequestDto } from '../dto'
import { GitlabProjectService } from '../gitlab.project.service'
import { Types } from '@gitbeaker/node'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  CreateBranchRequestDTO,
  CreateMergeRequestDTO,
  CreateProjectRequestDTO,
  GitlabCommitRequestDTO,
  GitlabRemoveDirectoryRequestDTO,
} from '../dto/gitlab.dto'

@Controller('gitlab')
@ApiTags('gitlab接口')
export class GitlabController {
  constructor(
    private readonly gitlabService: GitlabService,
    private readonly gitlabProjectService: GitlabProjectService,
  ) {}
  @Get('file')
  @Get('filenames')
  @ApiOperation({
    summary: '获取文件内容',
  })
  getCode(@Query() GetCodingFileRequest: GetCodingFileRequestDto) {
    return this.gitlabService.getFileContent(
      GetCodingFileRequest.repoId,
      GetCodingFileRequest.branch,
      GetCodingFileRequest.fullFilePath,
    )
  }

  @Get('files')
  @Get('filenames')
  @ApiOperation({
    summary: '获取目录下文件列表(含文件内容)',
  })
  getCodes(@Query() GetCodingFileRequest: GetCodingFilesRequestDto) {
    return this.gitlabService.getFilesContent(
      GetCodingFileRequest.repoId,
      GetCodingFileRequest.branch,
      GetCodingFileRequest.directory,
    )
  }

  @Get('filenames')
  @ApiOperation({
    summary: '获取目录下文件列表',
  })
  getFileNames(@Query() GetCodingFileRequest: GetCodingFilesRequestDto) {
    return this.gitlabService.getFiles(
      GetCodingFileRequest.repoId,
      GetCodingFileRequest.branch,
      GetCodingFileRequest.directory,
    )
  }

  @Post('commit')
  @ApiOperation({
    summary: 'gitlab提交',
  })
  freshCommit(@Body() commitRequest: GitlabCommitRequestDTO) {
    return this.gitlabService.commitFiles(
      +commitRequest.repoId,
      commitRequest.branch,
      commitRequest.gitFiles,
      commitRequest.comment,
    )
  }

  @Delete('directory')
  @ApiOperation({
    summary: 'gitlab删除目录',
  })
  removeDirectory(
    @Body() gitlabRemoveDirectoryRequest: GitlabRemoveDirectoryRequestDTO,
  ) {
    return this.gitlabService.removeDirectory(gitlabRemoveDirectoryRequest)
  }

  @Post('branch')
  @ApiOperation({
    summary: 'gitlab创建分支',
  })
  createBranch(@Body() createBranchRequest: CreateBranchRequestDTO) {
    return this.gitlabService.createBranch(
      +createBranchRequest.repoId,
      createBranchRequest.targetBranch,
      createBranchRequest.srcBranch,
    )
  }

  @Post('mergeRequest')
  @ApiOperation({
    summary: '创建MR',
  })
  createMergeRequest(@Body() createMergeRequestDTO: CreateMergeRequestDTO) {
    return this.gitlabService.createMergeRequest(
      +createMergeRequestDTO.repoId,
      createMergeRequestDTO.title,
      createMergeRequestDTO.content,
      createMergeRequestDTO.srcBranch,
      createMergeRequestDTO.targetBranch,
    )
  }

  @Post('project')
  @ApiOperation({
    summary: '通过模板项目创建项目',
  })
  createProject(
    @Body('') createProjectRequest: CreateProjectRequestDTO,
  ): Promise<Types.ProjectExtendedSchema> {
    return this.gitlabProjectService.createProject(
      createProjectRequest.projectName,
    )
  }
}
