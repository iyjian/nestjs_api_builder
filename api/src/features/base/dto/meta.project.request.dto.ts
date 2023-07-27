import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateMetaProjectRequestDTO {
  @codeGen('3159')
  @ApiProperty({
    description: '项目名',
    required: true,
  })
  @IsNotEmpty()
  name: string

  @codeGen('3160')
  @ApiProperty({
    description: '所在仓库地址',
    required: false,
  })
  repo?: string

  @codeGen('3172')
  @ApiProperty({
    description: '仓库id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  repoId?: number

  @codeGen('3177')
  @ApiProperty({
    description: '代码风格',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  version?: number

  @codeGen('3238')
  @ApiProperty({
    description: '代码路径',
    required: false,
  })
  baseDirectory?: string

  @codeGen('4913')
  @ApiProperty({
    description: '是否严格检查请求中的参数',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  strictRequest?: boolean

  @codeGen('6411')
  @ApiProperty({
    description: '数据库名',
    required: false,
  })
  dbName?: string

  @codeGen('6412')
  @ApiProperty({
    description: '数据库host',
    required: false,
  })
  dbHost?: string

  @codeGen('6413')
  @ApiProperty({
    description: '数据库端口',
    required: false,
  })
  dbPort?: string

  @codeGen('6414')
  @ApiProperty({
    description: '数据库用户',
    required: false,
  })
  dbUser?: string

  @codeGen('6415')
  @ApiProperty({
    description: '数据库密码',
    required: false,
  })
  dbPassword?: string

  @codeGen('7827')
  @ApiProperty({
    description: '仓库名称-只能填英文名',
    required: true,
  })
  @IsNotEmpty()
  repoName: string

  @codeGen('9144')
  @ApiProperty({
    description: 'gitlabToken',
    required: false,
  })
  gitlabToken?: string

  @codeGen('9145')
  @ApiProperty({
    description: 'gitlabHost',
    required: false,
  })
  gitlabHost?: string
}

export class UpdateMetaProjectRequestDTO {
  @codeGen('3159')
  @ApiProperty({
    description: '项目名',
    required: false,
  })
  name?: string

  @codeGen('3160')
  @ApiProperty({
    description: '所在仓库地址',
    required: false,
  })
  repo?: string

  @codeGen('3172')
  @ApiProperty({
    description: '仓库id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  repoId?: number

  @codeGen('3177')
  @ApiProperty({
    description: '代码风格',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  version?: number

  @codeGen('3238')
  @ApiProperty({
    description: '代码路径',
    required: false,
  })
  baseDirectory?: string

  @codeGen('4913')
  @ApiProperty({
    description: '是否严格检查请求中的参数',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  strictRequest?: boolean

  @codeGen('6411')
  @ApiProperty({
    description: '数据库名',
    required: false,
  })
  dbName?: string

  @codeGen('6412')
  @ApiProperty({
    description: '数据库host',
    required: false,
  })
  dbHost?: string

  @codeGen('6413')
  @ApiProperty({
    description: '数据库端口',
    required: false,
  })
  dbPort?: string

  @codeGen('6414')
  @ApiProperty({
    description: '数据库用户',
    required: false,
  })
  dbUser?: string

  @codeGen('6415')
  @ApiProperty({
    description: '数据库密码',
    required: false,
  })
  dbPassword?: string

  @codeGen('7827')
  @ApiProperty({
    description: '仓库名称-只能填英文名',
    required: false,
  })
  repoName?: string

  @codeGen('9144')
  @ApiProperty({
    description: 'gitlabToken',
    required: false,
  })
  gitlabToken?: string

  @codeGen('9145')
  @ApiProperty({
    description: 'gitlabHost',
    required: false,
  })
  gitlabHost?: string
}

export class FindOneMetaProjectRequestDTO {
  @codeGen('3159')
  @ApiProperty({
    description: '项目名',
    required: false,
  })
  name?: string

  @codeGen('3160')
  @ApiProperty({
    description: '所在仓库地址',
    required: false,
  })
  repo?: string

  @codeGen('3172')
  @ApiProperty({
    description: '仓库id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  repoId?: number

  @codeGen('3177')
  @ApiProperty({
    description: '代码风格',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  version?: number

  @codeGen('3238')
  @ApiProperty({
    description: '代码路径',
    required: false,
  })
  baseDirectory?: string

  @codeGen('4913')
  @ApiProperty({
    description: '是否严格检查请求中的参数',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  strictRequest?: boolean

  @codeGen('6411')
  @ApiProperty({
    description: '数据库名',
    required: false,
  })
  dbName?: string

  @codeGen('6412')
  @ApiProperty({
    description: '数据库host',
    required: false,
  })
  dbHost?: string

  @codeGen('6413')
  @ApiProperty({
    description: '数据库端口',
    required: false,
  })
  dbPort?: string

  @codeGen('6414')
  @ApiProperty({
    description: '数据库用户',
    required: false,
  })
  dbUser?: string

  @codeGen('6415')
  @ApiProperty({
    description: '数据库密码',
    required: false,
  })
  dbPassword?: string

  @codeGen('7827')
  @ApiProperty({
    description: '仓库名称-只能填英文名',
    required: false,
  })
  repoName?: string

  @codeGen('9144')
  @ApiProperty({
    description: 'gitlabToken',
    required: false,
  })
  gitlabToken?: string

  @codeGen('9145')
  @ApiProperty({
    description: 'gitlabHost',
    required: false,
  })
  gitlabHost?: string
}

export class FindAllMetaProjectRequestDTO extends PagingRequestDTO {
  @codeGen('3159')
  @ApiProperty({
    description: '项目名',
    required: false,
  })
  name?: string

  @codeGen('3160')
  @ApiProperty({
    description: '所在仓库地址',
    required: false,
  })
  repo?: string

  @codeGen('3172')
  @ApiProperty({
    description: '仓库id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  repoId?: number

  @codeGen('3177')
  @ApiProperty({
    description: '代码风格',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  version?: number

  @codeGen('3238')
  @ApiProperty({
    description: '代码路径',
    required: false,
  })
  baseDirectory?: string

  @codeGen('4913')
  @ApiProperty({
    description: '是否严格检查请求中的参数',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  strictRequest?: boolean

  @codeGen('6411')
  @ApiProperty({
    description: '数据库名',
    required: false,
  })
  dbName?: string

  @codeGen('6412')
  @ApiProperty({
    description: '数据库host',
    required: false,
  })
  dbHost?: string

  @codeGen('6413')
  @ApiProperty({
    description: '数据库端口',
    required: false,
  })
  dbPort?: string

  @codeGen('6414')
  @ApiProperty({
    description: '数据库用户',
    required: false,
  })
  dbUser?: string

  @codeGen('6415')
  @ApiProperty({
    description: '数据库密码',
    required: false,
  })
  dbPassword?: string

  @codeGen('7827')
  @ApiProperty({
    description: '仓库名称-只能填英文名',
    required: false,
  })
  repoName?: string

  @codeGen('9144')
  @ApiProperty({
    description: 'gitlabToken',
    required: false,
  })
  gitlabToken?: string

  @codeGen('9145')
  @ApiProperty({
    description: 'gitlabHost',
    required: false,
  })
  gitlabHost?: string
}
