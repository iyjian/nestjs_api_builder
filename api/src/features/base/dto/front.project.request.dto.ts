import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateFrontProjectRequestDTO {
  @codeGen('6760')
  @ApiProperty({
    description: '项目配置',
    required: false,
  })
  routeConfig?: any

  @codeGen('6761')
  @ApiProperty({
    description: '项目名字',
    required: false,
  })
  name?: string

  @codeGen('6762')
  @ApiProperty({
    description: 'gitlab仓库id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  repoId?: number
}

export class UpdateFrontProjectRequestDTO {
  @codeGen('6760')
  @ApiProperty({
    description: '项目配置',
    required: false,
  })
  routeConfig?: any

  @codeGen('6761')
  @ApiProperty({
    description: '项目名字',
    required: false,
  })
  name?: string

  @codeGen('6762')
  @ApiProperty({
    description: 'gitlab仓库id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  repoId?: number
}

export class FindOneFrontProjectRequestDTO {
  @codeGen('6760')
  @ApiProperty({
    description: '项目配置',
    required: false,
  })
  routeConfig?: any

  @codeGen('6761')
  @ApiProperty({
    description: '项目名字',
    required: false,
  })
  name?: string

  @codeGen('6762')
  @ApiProperty({
    description: 'gitlab仓库id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  repoId?: number
}

export class FindAllFrontProjectRequestDTO extends PagingRequestDTO {
  @codeGen('6760')
  @ApiProperty({
    description: '项目配置',
    required: false,
  })
  routeConfig?: any

  @codeGen('6761')
  @ApiProperty({
    description: '项目名字',
    required: false,
  })
  name?: string

  @codeGen('6762')
  @ApiProperty({
    description: 'gitlab仓库id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  repoId?: number
}
