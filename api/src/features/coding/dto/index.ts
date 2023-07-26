import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class GetCodingFileRequestDto {
  @ApiProperty({
    description: '仓库id',
    required: true,
  })
  @Type(() => Number)
  repoId: number

  @ApiProperty({
    description: '分支',
    required: true,
  })
  branch: string

  @ApiProperty({
    description: '完整文件路径',
    required: true,
  })
  fullFilePath: string
}

export class GetCodingFilesRequestDto {
  @ApiProperty({
    description: '仓库id',
    required: true,
  })
  @Type(() => Number)
  repoId: number

  @ApiProperty({
    description: '分支',
    required: true,
  })
  branch: string

  @ApiProperty({
    description: '文件目录路径',
    required: true,
  })
  directory: string
}

export { DescribeGitFilesResponse, GitTreeItem } from './coding.dto'
