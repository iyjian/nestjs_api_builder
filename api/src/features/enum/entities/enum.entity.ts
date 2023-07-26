import { BaseModel } from './../../../core/entities/index'
import {
  Table,
  Column,
  DataType,
  Index,
  Sequelize,
  ForeignKey,
} from 'sequelize-typescript'
import { EnumType } from './../enum.constants'

@Table({
  tableName: 't_enum',
  timestamps: true,
})
export class Enum extends BaseModel<Enum> {
  @Column({
    allowNull: false,
    comment: '枚举值类型',
    type: DataType.ENUM(...Object.values(EnumType)),
  })
  type: string

  @Column({
    allowNull: true,
    comment: '枚举值类型的描述',
    type: DataType.STRING(255),
  })
  typeDesc?: string

  @Column({
    comment: '枚举值类型下的具体枚举值的编号',
    type: DataType.INTEGER,
  })
  num!: number

  @Column({
    allowNull: true,
    comment: '中文名字',
    type: DataType.STRING(255),
  })
  cnName?: string

  @Column({
    allowNull: true,
    comment: '英文名字',
    type: DataType.STRING(255),
  })
  enName?: string

  @Column({
    allowNull: true,
    comment: '代码',
    type: DataType.STRING(255),
  })
  code?: string

  @Column({
    allowNull: true,
    comment: '枚举值备注',
    type: DataType.STRING(255),
  })
  remark?: string
}
