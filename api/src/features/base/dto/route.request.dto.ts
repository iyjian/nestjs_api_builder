import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateRouteRequestDTO {
  @codeGen('6449')
  @ApiProperty({
    description: '资源英文名称',
    required: false,
  })
  enName?: string

  @codeGen('6450')
  @ApiProperty({
    description: '是否有效',
    required: true,
  })
  @IsNotEmpty()
  @Transform(getTransformer('booleanTransformer'))
  isEnable: boolean

  @codeGen('6451')
  @ApiProperty({
    description: '方法',
    required: true,
  })
  @IsNotEmpty()
  method: string

  @codeGen('6452')
  @ApiProperty({
    description: '资源名称',
    required: false,
  })
  name?: string

  @codeGen('6453')
  @ApiProperty({
    description: '资源对象',
    required: true,
  })
  @IsNotEmpty()
  obj: string

  @codeGen('6454')
  @ApiProperty({
    description: '排序',
    required: true,
  })
  @IsNotEmpty()
  @Transform(getTransformer('numberTransformer'))
  order: number

  @codeGen('6455')
  @ApiProperty({
    description: '路由正则',
    required: true,
  })
  @IsNotEmpty()
  regexp: string
}

export class UpdateRouteRequestDTO {
  @codeGen('6449')
  @ApiProperty({
    description: '资源英文名称',
    required: false,
  })
  enName?: string

  @codeGen('6450')
  @ApiProperty({
    description: '是否有效',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('6451')
  @ApiProperty({
    description: '方法',
    required: false,
  })
  method?: string

  @codeGen('6452')
  @ApiProperty({
    description: '资源名称',
    required: false,
  })
  name?: string

  @codeGen('6453')
  @ApiProperty({
    description: '资源对象',
    required: false,
  })
  obj?: string

  @codeGen('6454')
  @ApiProperty({
    description: '排序',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  order?: number

  @codeGen('6455')
  @ApiProperty({
    description: '路由正则',
    required: false,
  })
  regexp?: string
}

export class FindOneRouteRequestDTO {
  @codeGen('6449')
  @ApiProperty({
    description: '资源英文名称',
    required: false,
  })
  enName?: string

  @codeGen('6450')
  @ApiProperty({
    description: '是否有效',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('6451')
  @ApiProperty({
    description: '方法',
    required: false,
  })
  method?: string

  @codeGen('6452')
  @ApiProperty({
    description: '资源名称',
    required: false,
  })
  name?: string

  @codeGen('6453')
  @ApiProperty({
    description: '资源对象',
    required: false,
  })
  obj?: string

  @codeGen('6454')
  @ApiProperty({
    description: '排序',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  order?: number

  @codeGen('6455')
  @ApiProperty({
    description: '路由正则',
    required: false,
  })
  regexp?: string
}

export class FindAllRouteRequestDTO extends PagingRequestDTO {
  @codeGen('6449')
  @ApiProperty({
    description: '资源英文名称',
    required: false,
  })
  enName?: string

  @codeGen('6450')
  @ApiProperty({
    description: '是否有效',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('6451')
  @ApiProperty({
    description: '方法',
    required: false,
  })
  method?: string

  @codeGen('6452')
  @ApiProperty({
    description: '资源名称',
    required: false,
  })
  name?: string

  @codeGen('6453')
  @ApiProperty({
    description: '资源对象',
    required: false,
  })
  obj?: string

  @codeGen('6454')
  @ApiProperty({
    description: '排序',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  order?: number

  @codeGen('6455')
  @ApiProperty({
    description: '路由正则',
    required: false,
  })
  regexp?: string
}
