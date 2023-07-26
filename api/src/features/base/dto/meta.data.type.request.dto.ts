import { PagingRequestDTO } from './../../../core/interfaces/requestDto'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { codeGen } from './../../../core'

export class CreateMetaDataTypeRequestDTO {
  @codeGen('3165')
  @ApiProperty({
    description: '数据类型',
    required: false,
  })
  dataType?: string

  @codeGen('3166')
  @ApiProperty({
    description: '数据类型描述',
    required: false,
  })
  desc?: string

  @codeGen('5646')
  @ApiProperty({
    description: '实体数据类型',
    required: false,
  })
  mappingDataType?: string

  @codeGen('5647')
  @ApiProperty({
    description: 'typescript数据类型',
    required: false,
  })
  entityDataType?: string

  @codeGen('6403')
  @ApiProperty({
    description: '数据类型分类',
    required: false,
  })
  category?: string

  @codeGen('6444')
  @ApiProperty({
    description: '转化器',
    required: false,
  })
  transformer?: string
}

export class UpdateMetaDataTypeRequestDTO {
  @codeGen('3165')
  @ApiProperty({
    description: '数据类型',
    required: false,
  })
  dataType?: string

  @codeGen('3166')
  @ApiProperty({
    description: '数据类型描述',
    required: false,
  })
  desc?: string

  @codeGen('5646')
  @ApiProperty({
    description: '实体数据类型',
    required: false,
  })
  mappingDataType?: string

  @codeGen('5647')
  @ApiProperty({
    description: 'typescript数据类型',
    required: false,
  })
  entityDataType?: string

  @codeGen('6403')
  @ApiProperty({
    description: '数据类型分类',
    required: false,
  })
  category?: string

  @codeGen('6444')
  @ApiProperty({
    description: '转化器',
    required: false,
  })
  transformer?: string
}

export class FindAllMetaDataTypeRequestDTO extends PagingRequestDTO {
  @codeGen('3165')
  @ApiProperty({
    description: '数据类型',
    required: false,
  })
  dataType?: string

  @codeGen('3166')
  @ApiProperty({
    description: '数据类型描述',
    required: false,
  })
  desc?: string

  @codeGen('5646')
  @ApiProperty({
    description: '实体数据类型',
    required: false,
  })
  mappingDataType?: string

  @codeGen('5647')
  @ApiProperty({
    description: 'typescript数据类型',
    required: false,
  })
  entityDataType?: string

  @codeGen('6403')
  @ApiProperty({
    description: '数据类型分类',
    required: false,
  })
  category?: string

  @codeGen('6444')
  @ApiProperty({
    description: '转化器',
    required: false,
  })
  transformer?: string
}
