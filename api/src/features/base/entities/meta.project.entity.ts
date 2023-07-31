import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Scopes,
} from 'sequelize-typescript'
import { BaseModel, codeGen } from './../../../core'

@Table({
  tableName: 't_meta_project',
  timestamps: true,
  indexes: [
    {
      fields: ['name'],
      unique: true,
    },
  ],
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
export class MetaProject extends BaseModel<MetaProject> {
  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '项目名',
  })
  name: string

  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '所在仓库地址',
  })
  repo: string

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    comment: '仓库id',
  })
  repoId: number

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    defaultValue: 1,
    comment: '代码风格',
  })
  version: number

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '代码路径',
  })
  baseDirectory?: string

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: '是否严格过滤请求中的参数',
  })
  strictRequest: boolean

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '数据库名',
  })
  @codeGen('6411')
  dbName?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '数据库host',
  })
  @codeGen('6412')
  dbHost?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '数据库端口',
  })
  @codeGen('6413')
  dbPort?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '数据库用户',
  })
  @codeGen('6414')
  dbUser?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '数据库密码',
  })
  @codeGen('6415')
  dbPassword?: string

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
    comment: '仓库名称-只能填英文名',
  })
  @codeGen('7827')
  repoName: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: 'gitlabToken',
  })
  @codeGen('9144')
  gitlabToken?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: 'gitlabHost',
  })
  @codeGen('9145')
  gitlabHost?: string

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment: '用户id',
  })
  @codeGen('9146')
  userId?: number

  @Column({
    allowNull: true,
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否公开',
  })
  @codeGen('9147')
  isPublic?: boolean
}
