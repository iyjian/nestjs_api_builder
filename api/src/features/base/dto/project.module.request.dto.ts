import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateProjectModuleRequestDTO {
  @codeGen('6852')
  @ApiProperty({
    description: '模块代码',
    required: true,
  })
  @IsNotEmpty()
  code: string

  @codeGen('6853')
  @ApiProperty({
    description: '所属项目',
    required: true,
  })
  @IsNotEmpty()
  @Transform(getTransformer('numberTransformer'))
  projectId: number

  @codeGen('6856')
  @ApiProperty({
    description: '模块名称',
    required: false,
  })
  name?: string

  @codeGen('6857')
  @ApiProperty({
    description: '模块说明',
    required: false,
  })
  remark?: string
}

export class UpdateProjectModuleRequestDTO {
  @codeGen('6852')
  @ApiProperty({
    description: '模块代码',
    required: false,
  })
  code?: string

  @codeGen('6856')
  @ApiProperty({
    description: '模块名称',
    required: false,
  })
  name?: string

  @codeGen('6857')
  @ApiProperty({
    description: '模块说明',
    required: false,
  })
  remark?: string
}

export class FindOneProjectModuleRequestDTO {
  @codeGen('6852')
  @ApiProperty({
    description: '模块代码',
    required: false,
  })
  code?: string

  @codeGen('6853')
  @ApiProperty({
    description: '所属项目',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  projectId?: number

  @codeGen('6856')
  @ApiProperty({
    description: '模块名称',
    required: false,
  })
  name?: string

  @codeGen('6857')
  @ApiProperty({
    description: '模块说明',
    required: false,
  })
  remark?: string
}

export class FindAllProjectModuleRequestDTO extends PagingRequestDTO {
  @codeGen('6852')
  @ApiProperty({
    description: '模块代码',
    required: false,
  })
  code?: string

  @codeGen('6853')
  @ApiProperty({
    description: '所属项目',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  projectId?: number

  @codeGen('6856')
  @ApiProperty({
    description: '模块名称',
    required: false,
  })
  name?: string

  @codeGen('6857')
  @ApiProperty({
    description: '模块说明',
    required: false,
  })
  remark?: string
}
