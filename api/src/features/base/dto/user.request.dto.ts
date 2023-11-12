import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateUserRequestDTO {
  @codeGen('9318')
  @ApiProperty({
    description: '名字',
    required: false,
  })
  name?: string

  @codeGen('9319')
  @ApiProperty({
    description: '账户id',
    required: false,
  })
  accountId?: string

  @codeGen('9320')
  @ApiProperty({
    description: '是否启用',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('9321')
  @ApiProperty({
    description: '是否超管',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isAdmin?: boolean
}

export class UpdateUserRequestDTO {
  @codeGen('9318')
  @ApiProperty({
    description: '名字',
    required: false,
  })
  name?: string

  @codeGen('9319')
  @ApiProperty({
    description: '账户id',
    required: false,
  })
  accountId?: string

  @codeGen('9320')
  @ApiProperty({
    description: '是否启用',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('9321')
  @ApiProperty({
    description: '是否超管',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isAdmin?: boolean
}

export class FindOneUserRequestDTO {
  @codeGen('9318')
  @ApiProperty({
    description: '名字',
    required: false,
  })
  name?: string

  @codeGen('9319')
  @ApiProperty({
    description: '账户id',
    required: false,
  })
  accountId?: string

  @codeGen('9320')
  @ApiProperty({
    description: '是否启用',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('9321')
  @ApiProperty({
    description: '是否超管',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isAdmin?: boolean
}

export class FindAllUserRequestDTO extends PagingRequestDTO {
  @codeGen('9318')
  @ApiProperty({
    description: '名字',
    required: false,
  })
  name?: string

  @codeGen('9319')
  @ApiProperty({
    description: '账户id',
    required: false,
  })
  accountId?: string

  @codeGen('9320')
  @ApiProperty({
    description: '是否启用',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('9321')
  @ApiProperty({
    description: '是否超管',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isAdmin?: boolean
}
