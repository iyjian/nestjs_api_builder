import { Table, Column, DataType } from 'sequelize-typescript'
import { BaseModel, codeGen } from './../../../core'

@Table({
  tableName: 't_front_project',
  comment: '前端项目表',
})
export class FrontProject extends BaseModel<FrontProject> {
  @Column({
    allowNull: true,
    type: DataType.JSON,
    comment: '项目配置',
  })
  @codeGen('6760')
  routeConfig: any

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '项目名字',
  })
  @codeGen('6761')
  name: string

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment: 'gitlab仓库id',
  })
  @codeGen('6762')
  repoId: number
}
