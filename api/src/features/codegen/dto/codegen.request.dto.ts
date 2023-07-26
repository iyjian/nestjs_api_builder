import { ApiProperty } from '@nestjs/swagger'
import { CodeType, CodeTypeEnum } from './../../../core'

export class CodePreviewRequestDTO {
  @ApiProperty({
    description: '实体id',
    required: true,
  })
  tableId: number

  @ApiProperty({
    description: '分支 - 基于哪个分支生成代码',
    required: true,
  })
  branch: string

  @ApiProperty({
    description: '代码类型',
    required: true,
    enum: CodeTypeEnum,
    isArray: true,
  })
  codeTypes: CodeType[]
}
