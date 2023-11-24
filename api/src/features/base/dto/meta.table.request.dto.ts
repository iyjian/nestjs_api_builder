import { PagingRequestDTO } from './../../../core/interfaces/requestDto'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { codeGen } from './../../../core'

export class CreateMetaTableRequestDTO {
  name: string

  module: string

  comment?: string

  entityCode?: string

  frontCode?: string

  @Type(() => Number)
  projectId: number

  relationKeys?: object

  // includeStatement?: object

  relationNodes?: object

  @codeGen('7888')
  @ApiProperty({
    description: '索引',
    required: false,
  })
  indexes?: any

  @codeGen('8707')
  @ApiProperty({
    description: 'findOne的relation',
    required: false,
  })
  relationNodesForOne?: any
}

export class MoveMetaTableRequestDTO {
  srcTableIds: number[]

  targetProjectId: number
}

export class FindRelationTableRequestDTO {
  srcTableIds: number[]
}

export class UpdateMetaTableRequestDTO {
  name?: string

  module?: string

  comment?: string

  entityCode?: string

  frontCode?: string

  @Type(() => Number)
  projectId?: number

  relationKeys?: object

  // includeStatement?: object

  relationNodes?: object

  @codeGen('7888')
  @ApiProperty({
    description: '索引',
    required: false,
  })
  indexes?: any

  @codeGen('8707')
  @ApiProperty({
    description: 'findOne的relation',
    required: false,
  })
  relationNodesForOne?: any
}

export class FindAllMetaTableRequestDTO extends PagingRequestDTO {
  name?: string

  module?: string

  comment?: string

  entityCode?: string

  frontCode?: string

  @Type(() => Number)
  projectId?: number

  relationKeys?: object

  // includeStatement?: object

  relationNodes?: object

  @codeGen('7888')
  @ApiProperty({
    description: '索引',
    required: false,
  })
  indexes?: any

  @codeGen('8707')
  @ApiProperty({
    description: 'findOne的relation',
    required: false,
  })
  relationNodesForOne?: any

  @ApiProperty({
    description: '是否精简模式',
    required: false,
  })
  simplify?: boolean
}
