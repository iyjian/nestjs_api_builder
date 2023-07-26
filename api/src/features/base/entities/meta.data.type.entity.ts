import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { BaseModel, codeGen } from './../../../core'

@Table({
  tableName: 't_meta_data_type',
  timestamps: true,
})
export class MetaDataType extends BaseModel<MetaDataType> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: false,
  })
  id: number

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '数据类型',
  })
  dataType: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '数据类型描述',
  })
  desc?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '实体数据类型',
  })
  mappingDataType: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: 'typescript数据类型',
  })
  entityDataType: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '数据类型分类',
  })
  @codeGen('6403')
  category: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '转化器',
  })
  @codeGen('6444')
  transformer?: string
}
