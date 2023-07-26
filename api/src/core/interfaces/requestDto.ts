import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { Request } from 'express'

class SortCommand {
  @ApiProperty({
    description: '排序键',
    required: false,
  })
  key: string

  @ApiProperty({
    description: '排序方向',
    required: false,
  })
  order: 'desc' | 'asc'
}

export class PagingRequestDTO {
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true
    if (value === 'false' || value === '0') return false
    return value
  })
  @ApiProperty({
    description: '是否忽略分页',
    required: false,
  })
  skipPaging?: boolean

  @Type(() => Number)
  @ApiProperty({
    description: '页数(从1开始)',
    default: 1,
    required: false,
  })
  page?: number = 1

  @Type(() => Number)
  @ApiProperty({
    description: '每页数据条数',
    default: 20,
    required: false,
  })
  pageSize?: number = 20

  @ApiProperty({
    description: '搜索条件',
    required: false,
  })
  search?: string

  @ApiProperty({
    description: '排序条件',
    required: false,
    isArray: true,
  })
  @Transform(({ value }) => {
    if (value) {
      return value.map((o: SortCommand) => [o.key, o.order])
    }
  })
  sort?: [string, string][]
}

interface Locals extends Record<string, any> {
  user: {
    id: number
  }
  token?: string
}

export interface AuthingRequest extends Request {
  locals: Locals
  query: { token?: string }
}
