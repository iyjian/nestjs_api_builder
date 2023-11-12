import { Table, Column, DataType, Scopes } from 'sequelize-typescript'
import { codeGen, BaseModel } from './../../../core'

@Table({
  tableName: 't_user',
  comment: '用户表',
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
export class User extends BaseModel<User> {
  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '名字',
  })
  @codeGen('9318')
  name?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '账户id',
  })
  @codeGen('9319')
  accountId?: string

  @Column({
    allowNull: true,
    type: DataType.BOOLEAN,
    comment: '是否启用',
  })
  @codeGen('9320')
  isEnable?: boolean

  @Column({
    allowNull: true,
    type: DataType.BOOLEAN,
    comment: '是否超管',
  })
  @codeGen('9321')
  isAdmin?: boolean
}
