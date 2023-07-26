import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Scopes,
} from 'sequelize-typescript'
import { BaseModel } from '../../../core'
import { MetaTable, MetaDataType } from './'
import { codeGen } from './../../../core'

@Table({
  tableName: 't_meta_column',
  timestamps: true,
  indexes: [{ fields: ['tableId', 'name', 'deleted'], unique: true }],
})
@codeGen('scopesGen')
@Scopes(() => ({
  findAll: {
    include: [],
  },
  findOne: {
    include: [],
  },
}))
export class MetaColumn extends BaseModel<MetaColumn> {
  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '字段名',
  })
  name: string

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    comment: '是否为空',
  })
  allowNull: boolean

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '字段描述',
  })
  comment: string

  @Column({
    type: DataType.VIRTUAL,
    comment: '完整的字段描述',
  })
  get fullComment(): string | undefined {
    const comment = this.getDataValue('comment')
    const dataType = this.dataType
    const enumTypeCode = this.getDataValue('enumTypeCode')
    const remark = this.getDataValue('remark')
    if (comment && dataType) {
      return `${comment}${enumTypeCode ? ' - ' + enumTypeCode : ''}${
        remark ? '-' + remark.replace(/\n/g, ' ') : ''
      }`
    } else {
      return ''
    }
  }

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: '枚举值列表(逗号分隔)',
  })
  enumKeys?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '字段默认值',
  })
  defaultValue?: string

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: '其他备注',
  })
  remark?: string

  @ForeignKey(() => MetaTable)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '所属表',
  })
  tableId: number

  @BelongsTo(() => MetaTable, 'tableId')
  table?: MetaTable

  @ForeignKey(() => MetaTable)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '',
  })
  refTableId?: number

  @BelongsTo(() => MetaTable, 'refTableId')
  refTable?: MetaTable

  @Column({
    allowNull: true,
    type: DataType.ENUM('1', '2', '3', '4'),
    comment: '1 BelongsTo 2 HasMany 3 HasOne 4 BelongsToMany',
  })
  get relation(): string | undefined {
    switch (this.getDataValue('relation')) {
      case '1':
        return 'BelongsTo'
      case '2':
        return 'HasMany'
      case '3':
        return 'HasOne'
      case '4':
        return 'BelongsToMany'
      default:
        return
    }
  }
  set relation(val) {
    switch (val) {
      case 'BelongsTo':
        this.setDataValue('relation', '1')
        return
      case 'HasMany':
        this.setDataValue('relation', '2')
        return
      case 'HasOne':
        this.setDataValue('relation', '3')
        return
      case 'BelongsToMany':
        this.setDataValue('relation', '4')
        return
      default:
        this.setDataValue('relation', null)
        return
    }
  }

  @Column({
    type: DataType.VIRTUAL,
  })
  get isFK() {
    return (
      this.getDataValue('refTableId') && this.getDataValue('dataTypeId') === 1
    )
  }

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: '是否自动生成',
  })
  isAutoGen: boolean

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否启用',
  })
  isEnable: boolean

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    defaultValue: 1,
    comment: '字段排序',
  })
  order: number

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: '是否可搜索',
  })
  searchable: boolean

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否可查找',
  })
  findable: boolean

  @ForeignKey(() => MetaColumn)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '外键对应的关系建id',
  })
  relationColumnId?: number

  @BelongsTo(() => MetaColumn, 'relationColumnId')
  relationColumn?: MetaColumn

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否可创建',
  })
  createable: boolean

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: '是否可更新',
  })
  updateable: boolean

  // @Column({
  //   type: DataType.VIRTUAL,
  // })
  // dataTypeExtend: any

  @ForeignKey(() => MetaDataType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '数据类型id',
  })
  @codeGen('6436')
  dataTypeId: number

  @BelongsTo(() => MetaDataType)
  dataType: MetaDataType

  @Column({
    type: DataType.VIRTUAL,
  })
  get mysqlDataType(): string | undefined {
    if (this.dataType) {
      switch (this.dataType.dataType) {
        case 'enum':
          const enumKeys = this.getDataValue('enumKeys')
          if (enumKeys) {
            return `enum('${enumKeys.split(',').join("','")}')`
          }
        case 'int':
          return 'int(11)'
        case 'boolean':
          return 'tinyint(1)'
        case 'json(array)':
          return 'json'
        case 'json(object)':
          return 'json'
        default:
          return this.dataType.dataType
      }
    }
  }

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: 'get方法的代码',
  })
  @codeGen('6479')
  getCode?: string

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: 'set方法的代码',
  })
  @codeGen('6480')
  setCode?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '枚举类型的Code',
  })
  @codeGen('6822')
  enumTypeCode?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '示例数据',
  })
  @codeGen('6860')
  sampleData?: string

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: '下拉选项的显示列',
  })
  @codeGen('8708')
  forSelectDisplay: boolean
}
