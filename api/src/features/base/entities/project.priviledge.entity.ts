import { Table, Column, DataType, Scopes } from 'sequelize-typescript'
import { codeGen, BaseModel } from './../../../core'

@Table({
  tableName: 't_project_priviledge',
  comment: '项目权限',
  indexes: [{ fields: ['projectId', 'userId', 'isActive'], unique: true }],
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
export class ProjectPriviledge extends BaseModel<ProjectPriviledge> {
  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment: '项目id',
  })
  @codeGen('9586')
  projectId?: number

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment: '用户id',
  })
  @codeGen('9587')
  userId?: number
}
