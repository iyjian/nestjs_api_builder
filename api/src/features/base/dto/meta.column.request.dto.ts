import { PagingRequestDTO } from './../../../core/interfaces/requestDto'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { codeGen, getTransformer } from './../../../core'
import { IsNotEmpty } from 'class-validator'

export class CreateMetaColumnRequestDTO {
  @codeGen('3151')
  @ApiProperty({
    description: '字段名',
    required: true,
  })
  @IsNotEmpty()
  name: string

  @codeGen('3170')
  @ApiProperty({
    description: '是否为空',
    required: true,
  })
  @IsNotEmpty()
  @Transform(getTransformer('booleanTransformer'))
  allowNull: boolean

  @codeGen('3153')
  @ApiProperty({
    description: '字段描述',
    required: false,
  })
  comment?: string

  @codeGen('3181')
  @ApiProperty({
    description: '其他备注',
    required: false,
  })
  remark?: string

  @codeGen('3175')
  @ApiProperty({
    description: '所属表',
    required: true,
  })
  @IsNotEmpty()
  @Transform(getTransformer('numberTransformer'))
  tableId: number

  @codeGen('3194')
  @ApiProperty({
    description: '外键关联的表id-关联表id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  refTableId?: number

  @ApiProperty({
    description: '1 BelongsTo 2 HasMany 3 HasOne 4 BelongsToMany',
    required: false,
  })
  relation?: string

  @codeGen('3535')
  @ApiProperty({
    description: '是否自动生成',
    required: true,
  })
  @Transform(getTransformer('booleanTransformer'))
  isAutoGen?: boolean

  @codeGen('3536')
  @ApiProperty({
    description: '是否启用',
    required: true,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('3882')
  @ApiProperty({
    description: '字段排序',
    required: true,
  })
  @Transform(getTransformer('numberTransformer'))
  order?: number

  @codeGen('3154')
  @ApiProperty({
    description: '字段默认值',
    required: false,
  })
  defaultValue?: string

  @codeGen('4794')
  @ApiProperty({
    description: '枚举值列表(逗号分隔)',
    required: false,
  })
  enumKeys?: string

  @codeGen('4951')
  @ApiProperty({
    description: '是否可搜索',
    required: true,
  })
  @Transform(getTransformer('booleanTransformer'))
  searchable?: boolean

  @codeGen('4952')
  @ApiProperty({
    description: '是否可查找',
    required: true,
  })
  @Transform(getTransformer('booleanTransformer'))
  findable?: boolean

  @codeGen('4953')
  @ApiProperty({
    description: '外键对应的关系键id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  relationColumnId?: number

  @codeGen('5512')
  @ApiProperty({
    description: '是否可创建',
    required: true,
  })
  @Transform(getTransformer('booleanTransformer'))
  createable?: boolean

  @codeGen('5739')
  @ApiProperty({
    description: '是否可更新',
    required: true,
  })
  @Transform(getTransformer('booleanTransformer'))
  updateable?: boolean

  @codeGen('6436')
  @ApiProperty({
    description: '数据类型id',
    required: true,
  })
  @IsNotEmpty()
  @Transform(getTransformer('numberTransformer'))
  dataTypeId: number

  @codeGen('6479')
  @ApiProperty({
    description: 'get方法的代码',
    required: false,
  })
  getCode?: string

  @codeGen('6480')
  @ApiProperty({
    description: 'set方法的代码',
    required: false,
  })
  setCode?: string

  @codeGen('6822')
  @ApiProperty({
    description: '枚举类型的Code',
    required: false,
  })
  enumTypeCode?: string

  @codeGen('6860')
  @ApiProperty({
    description: '示例数据',
    required: false,
  })
  sampleData?: string

  @codeGen('8708')
  @ApiProperty({
    description: '下拉选项的显示列',
    required: true,
  })
  @Transform(getTransformer('booleanTransformer'))
  forSelectDisplay?: boolean
}

export class UpdateMetaColumnRequestDTO {
  @codeGen('3151')
  @ApiProperty({
    description: '字段名',
    required: false,
  })
  name?: string

  @codeGen('3170')
  @ApiProperty({
    description: '是否为空',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  allowNull?: boolean

  @codeGen('3153')
  @ApiProperty({
    description: '字段描述',
    required: false,
  })
  comment?: string

  @codeGen('4794')
  @ApiProperty({
    description: '枚举值列表(逗号分隔)',
    required: false,
  })
  enumKeys?: string

  @codeGen('3181')
  @ApiProperty({
    description: '其他备注',
    required: false,
  })
  remark?: string

  @codeGen('3175')
  @ApiProperty({
    description: '所属表',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  tableId?: number

  @codeGen('3194')
  @ApiProperty({
    description: '外键关联的表id-关联表id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  refTableId?: number

  @ApiProperty({
    description: '1 BelongsTo 2 HasMany 3 HasOne 4 BelongsToMany',
    required: false,
  })
  relation?: string

  @codeGen('3535')
  @ApiProperty({
    description: '是否自动生成',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isAutoGen?: boolean

  @codeGen('3536')
  @ApiProperty({
    description: '是否启用',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('3154')
  @ApiProperty({
    description: '字段默认值',
    required: false,
  })
  defaultValue?: string

  @codeGen('3882')
  @ApiProperty({
    description: '字段排序',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  order?: number

  @codeGen('4951')
  @ApiProperty({
    description: '是否可搜索',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  searchable?: boolean

  @codeGen('4952')
  @ApiProperty({
    description: '是否可查找',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  findable?: boolean

  @codeGen('4953')
  @ApiProperty({
    description: '外键对应的关系键id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  relationColumnId?: number

  @codeGen('5512')
  @ApiProperty({
    description: '是否可创建',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  createable?: boolean

  @codeGen('5739')
  @ApiProperty({
    description: '是否可更新',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  updateable?: boolean

  @codeGen('6436')
  @ApiProperty({
    description: '数据类型id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  dataTypeId?: number

  @codeGen('6479')
  @ApiProperty({
    description: 'get方法的代码',
    required: false,
  })
  getCode?: string

  @codeGen('6480')
  @ApiProperty({
    description: 'set方法的代码',
    required: false,
  })
  setCode?: string

  @codeGen('6822')
  @ApiProperty({
    description: '枚举类型的Code',
    required: false,
  })
  enumTypeCode?: string

  @codeGen('6860')
  @ApiProperty({
    description: '示例数据',
    required: false,
  })
  sampleData?: string

  @codeGen('8708')
  @ApiProperty({
    description: '下拉选项的显示列',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  forSelectDisplay?: boolean
}

export class FindAllMetaColumnRequestDTO extends PagingRequestDTO {
  @ApiProperty({
    description: '项目id',
    required: false,
  })
  'table.projectId'?: number

  @codeGen('3151')
  @ApiProperty({
    description: '字段名',
    required: false,
  })
  name?: string

  @codeGen('3170')
  @ApiProperty({
    description: '是否为空',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  allowNull?: boolean

  @codeGen('3181')
  @ApiProperty({
    description: '其他备注',
    required: false,
  })
  remark?: string

  @codeGen('3175')
  @ApiProperty({
    description: '所属表',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  tableId?: number

  @Type(() => Number)
  projectId?: number

  @codeGen('3194')
  @ApiProperty({
    description: '外键关联的表id-关联表id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  refTableId?: number

  @codeGen('3536')
  @ApiProperty({
    description: '是否启用',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isEnable?: boolean

  @codeGen('3153')
  @ApiProperty({
    description: '字段描述',
    required: false,
  })
  comment?: string

  @codeGen('3154')
  @ApiProperty({
    description: '字段默认值',
    required: false,
  })
  defaultValue?: string

  @ApiProperty({
    description: '1 BelongsTo 2 HasMany 3 HasOne 4 BelongsToMany',
    required: false,
  })
  relation?: string

  @codeGen('3535')
  @ApiProperty({
    description: '是否自动生成',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  isAutoGen?: boolean

  @codeGen('3882')
  @ApiProperty({
    description: '字段排序',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  order?: number

  @codeGen('4794')
  @ApiProperty({
    description: '枚举值列表(逗号分隔)',
    required: false,
  })
  enumKeys?: string

  @codeGen('4951')
  @ApiProperty({
    description: '是否可搜索',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  searchable?: boolean

  @codeGen('4952')
  @ApiProperty({
    description: '是否可查找',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  findable?: boolean

  @codeGen('4953')
  @ApiProperty({
    description: '外键对应的关系键id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  relationColumnId?: number

  @codeGen('5512')
  @ApiProperty({
    description: '是否可创建',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  createable?: boolean

  @codeGen('5739')
  @ApiProperty({
    description: '是否可更新',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  updateable?: boolean

  @codeGen('6436')
  @ApiProperty({
    description: '数据类型id',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  dataTypeId?: number

  @codeGen('6479')
  @ApiProperty({
    description: 'get方法的代码',
    required: false,
  })
  getCode?: string

  @codeGen('6480')
  @ApiProperty({
    description: 'set方法的代码',
    required: false,
  })
  setCode?: string

  @codeGen('6822')
  @ApiProperty({
    description: '枚举类型的Code',
    required: false,
  })
  enumTypeCode?: string

  @codeGen('8708')
  @ApiProperty({
    description: '下拉选项的显示列',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  forSelectDisplay?: boolean
}
