import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  Scopes,
} from 'sequelize-typescript'
import { BaseModel, codeGen } from './../../../core'
import { MetaProject } from './'
import { MetaProject } from './meta.project.entity'

@Table({
  tableName: 't_project_module',
  comment: '项目模块',
  indexes: [{ fields: ['code', 'projectId', 'isActive'], unique: true }],
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
export class ProjectModule extends BaseModel<ProjectModule> {
  @Column({
    allowNull: false,
    type: DataType.STRING(40),
    comment: '模块代码',
  })
  @codeGen('6852')
  code: string

  @ForeignKey(() => MetaProject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '所属项目',
  })
  @codeGen('6853')
  projectId: number

  @BelongsTo(() => MetaProject, 'projectId')
  @codeGen('6854')
  project: MetaProject

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '模块名称',
  })
  @codeGen('6856')
  name?: string

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: '模块说明',
  })
  @codeGen('6857')
  remark?: string
}
