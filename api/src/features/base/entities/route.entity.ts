import { Table, Column, DataType } from 'sequelize-typescript'
import { BaseModel, codeGen } from './../../../core'

@Table({
  tableName: 't_route',
  comment: '路由表',
  indexes: [
    {
      fields: ['obj', 'method'],
      unique: true,
    },
  ],
})
export class Route extends BaseModel<Route> {
  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '资源英文名称',
  })
  @codeGen('6449')
  enName: string

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    comment: '是否有效',
  })
  @codeGen('6450')
  isEnable: boolean

  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '方法',
  })
  @codeGen('6451')
  method: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '资源名称',
  })
  @codeGen('6452')
  name: string

  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '资源对象',
  })
  @codeGen('6453')
  obj: string

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    comment: '排序',
  })
  @codeGen('6454')
  order: number

  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '路由正则',
  })
  @codeGen('6455')
  regexp: string
}
