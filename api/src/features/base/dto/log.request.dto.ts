import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateLogRequestDTO {
  @codeGen('6456')
  @ApiProperty({
    description: '访问ip地址',
    required: false,
  })
  ip?: string

  @codeGen('6457')
  @ApiProperty({
    description: '方法',
    required: false,
  })
  method?: string

  @codeGen('6458')
  @ApiProperty({
    description: '路径',
    required: false,
  })
  path?: string

  @codeGen('6459')
  @ApiProperty({
    description: '负载',
    required: false,
  })
  payload?: string

  @codeGen('6460')
  @ApiProperty({
    description: '请求日期',
    required: false,
  })
  @Transform(getTransformer('dateTimeTransformer'))
  requestDate?: Date

  @codeGen('6461')
  @ApiProperty({
    description: '访问路由id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  routeId?: number

  @codeGen('6462')
  @ApiProperty({
    description: '完整url',
    required: false,
  })
  url?: string

  @codeGen('6463')
  @ApiProperty({
    description: '访问用户id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  userId?: number

  @codeGen('6466')
  @ApiProperty({
    description: '请求id',
    required: false,
  })
  requestId?: string

  @codeGen('6467')
  @ApiProperty({
    description: '状态码',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  statusCode?: number

  @codeGen('6468')
  @ApiProperty({
    description: '响应时间 - 毫秒数',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  duration?: number
}

export class UpdateLogRequestDTO {
  @codeGen('6456')
  @ApiProperty({
    description: '访问ip地址',
    required: false,
  })
  ip?: string

  @codeGen('6457')
  @ApiProperty({
    description: '方法',
    required: false,
  })
  method?: string

  @codeGen('6458')
  @ApiProperty({
    description: '路径',
    required: false,
  })
  path?: string

  @codeGen('6459')
  @ApiProperty({
    description: '负载',
    required: false,
  })
  payload?: string

  @codeGen('6460')
  @ApiProperty({
    description: '请求日期',
    required: false,
  })
  @Transform(getTransformer('dateTimeTransformer'))
  requestDate?: Date

  @codeGen('6461')
  @ApiProperty({
    description: '访问路由id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  routeId?: number

  @codeGen('6462')
  @ApiProperty({
    description: '完整url',
    required: false,
  })
  url?: string

  @codeGen('6463')
  @ApiProperty({
    description: '访问用户id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  userId?: number

  @codeGen('6466')
  @ApiProperty({
    description: '请求id',
    required: false,
  })
  requestId?: string

  @codeGen('6467')
  @ApiProperty({
    description: '状态码',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  statusCode?: number

  @codeGen('6468')
  @ApiProperty({
    description: '响应时间 - 毫秒数',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  duration?: number
}

export class FindOneLogRequestDTO {
  @codeGen('6456')
  @ApiProperty({
    description: '访问ip地址',
    required: false,
  })
  ip?: string

  @codeGen('6457')
  @ApiProperty({
    description: '方法',
    required: false,
  })
  method?: string

  @codeGen('6458')
  @ApiProperty({
    description: '路径',
    required: false,
  })
  path?: string

  @codeGen('6459')
  @ApiProperty({
    description: '负载',
    required: false,
  })
  payload?: string

  @codeGen('6460')
  @ApiProperty({
    description: '请求日期',
    required: false,
  })
  @Transform(getTransformer('dateTimeTransformer'))
  requestDate?: Date

  @codeGen('6461')
  @ApiProperty({
    description: '访问路由id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  routeId?: number

  @codeGen('6462')
  @ApiProperty({
    description: '完整url',
    required: false,
  })
  url?: string

  @codeGen('6463')
  @ApiProperty({
    description: '访问用户id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  userId?: number

  @codeGen('6466')
  @ApiProperty({
    description: '请求id',
    required: false,
  })
  requestId?: string

  @codeGen('6467')
  @ApiProperty({
    description: '状态码',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  statusCode?: number

  @codeGen('6468')
  @ApiProperty({
    description: '响应时间 - 毫秒数',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  duration?: number
}

export class FindAllLogRequestDTO extends PagingRequestDTO {
  @codeGen('6456')
  @ApiProperty({
    description: '访问ip地址',
    required: false,
  })
  ip?: string

  @codeGen('6457')
  @ApiProperty({
    description: '方法',
    required: false,
  })
  method?: string

  @codeGen('6458')
  @ApiProperty({
    description: '路径',
    required: false,
  })
  path?: string

  @codeGen('6459')
  @ApiProperty({
    description: '负载',
    required: false,
  })
  payload?: string

  @codeGen('6460')
  @ApiProperty({
    description: '请求日期',
    required: false,
  })
  @Transform(getTransformer('dateTimeTransformer'))
  requestDate?: Date

  @codeGen('6461')
  @ApiProperty({
    description: '访问路由id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  routeId?: number

  @codeGen('6462')
  @ApiProperty({
    description: '完整url',
    required: false,
  })
  url?: string

  @codeGen('6463')
  @ApiProperty({
    description: '访问用户id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  userId?: number

  @codeGen('6466')
  @ApiProperty({
    description: '请求id',
    required: false,
  })
  requestId?: string

  @codeGen('6467')
  @ApiProperty({
    description: '状态码',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  statusCode?: number

  @codeGen('6468')
  @ApiProperty({
    description: '响应时间 - 毫秒数',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  duration?: number
}
