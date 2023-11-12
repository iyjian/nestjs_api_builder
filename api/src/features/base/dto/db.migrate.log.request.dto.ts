import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateDbMigrateLogRequestDTO {
  @codeGen('9322')
  @ApiProperty({
    description: 'sql语句',
    required: false,
  })
  sql?: string

  @codeGen('9323')
  @ApiProperty({
    description: '对应表',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  tableId?: number

  @codeGen('9326')
  @ApiProperty({
    description: '是否在生产环境执行过',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isExecutedInProd?: boolean
}

export class UpdateDbMigrateLogRequestDTO {
  @codeGen('9322')
  @ApiProperty({
    description: 'sql语句',
    required: false,
  })
  sql?: string

  @codeGen('9323')
  @ApiProperty({
    description: '对应表',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  tableId?: number

  @codeGen('9326')
  @ApiProperty({
    description: '是否在生产环境执行过',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isExecutedInProd?: boolean
}

export class FindOneDbMigrateLogRequestDTO {
  @codeGen('9322')
  @ApiProperty({
    description: 'sql语句',
    required: false,
  })
  sql?: string

  @codeGen('9323')
  @ApiProperty({
    description: '对应表',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  tableId?: number

  @codeGen('9326')
  @ApiProperty({
    description: '是否在生产环境执行过',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isExecutedInProd?: boolean
}

export class FindAllDbMigrateLogRequestDTO extends PagingRequestDTO {
  @codeGen('9322')
  @ApiProperty({
    description: 'sql语句',
    required: false,
  })
  sql?: string

  @codeGen('9323')
  @ApiProperty({
    description: '对应表',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  tableId?: number

  @codeGen('9326')
  @ApiProperty({
    description: '是否在生产环境执行过',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isExecutedInProd?: boolean
}
