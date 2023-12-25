import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateProjectPriviledgeRequestDTO {
  @codeGen('9586')
  @ApiProperty({
    description: '项目id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  projectId?: number

  @codeGen('9587')
  @ApiProperty({
    description: '用户id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  userId?: number
}

export class UpdateProjectPriviledgeRequestDTO {
  @codeGen('9586')
  @ApiProperty({
    description: '项目id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  projectId?: number

  @codeGen('9587')
  @ApiProperty({
    description: '用户id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  userId?: number
}

export class FindOneProjectPriviledgeRequestDTO {
  @codeGen('9586')
  @ApiProperty({
    description: '项目id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  projectId?: number

  @codeGen('9587')
  @ApiProperty({
    description: '用户id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  userId?: number
}

export class FindAllProjectPriviledgeRequestDTO extends PagingRequestDTO {
  @codeGen('9586')
  @ApiProperty({
    description: '项目id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  projectId?: number

  @codeGen('9587')
  @ApiProperty({
    description: '用户id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  userId?: number
}
