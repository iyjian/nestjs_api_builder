import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript'
import { BaseModel, codeGen } from './../../../core'
import { Route } from './'

@Table({
  tableName: 't_log',
  comment: '日志表',
  indexes: [
    {
      fields: ['requestDate'],
    },
    {
      fields: ['method'],
    },
  ],
})
export class Log extends BaseModel<Log> {
  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment: '访问用户id',
  })
  userId: number

  @ForeignKey(() => Route)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '访问路由id',
  })
  routeId: number

  @BelongsTo(() => Route, 'routeId')
  route: Route

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '方法',
  })
  method: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '路径',
  })
  path: string

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: '完整url',
  })
  url: string

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: '负载',
  })
  payload: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '访问ip地址',
  })
  ip: string

  @Column({
    type: DataType.VIRTUAL,
  })
  user: any

  @Column({
    allowNull: true,
    type: DataType.DATE,
    comment: '请求日期',
  })
  requestDate: Date

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '请求id',
  })
  @codeGen('6466')
  requestId: string

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment: '状态码',
  })
  @codeGen('6467')
  statusCode: number

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment: '响应时间 - 毫秒数',
  })
  @codeGen('6468')
  duration: number
}
