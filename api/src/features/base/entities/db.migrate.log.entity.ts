import {
  Table,
  Column,
  DataType,
  Scopes,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript'
import { codeGen, BaseModel } from './../../../core'
import { MetaTable } from './meta.table.entity'

@Table({
  tableName: 't_db_migrate_log',
  comment: '数据库建表日志',
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
export class DbMigrateLog extends BaseModel<DbMigrateLog> {
  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: 'sql语句',
  })
  @codeGen('9322')
  sql?: string

  @ForeignKey(() => MetaTable)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '对应表',
  })
  @codeGen('9323')
  tableId?: number

  @BelongsTo(() => MetaTable, 'tableId')
  @codeGen('9324')
  table: MetaTable

  @Column({
    allowNull: true,
    type: DataType.BOOLEAN,
    comment: '是否在生产环境执行过',
  })
  @codeGen('9326')
  isExecutedInProd?: boolean
}
