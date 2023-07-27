import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Scopes,
} from 'sequelize-typescript'
import { BaseModel, codeGen } from './../../../core'
import camelCase from 'camelcase'
import pluralize from 'pluralize'
import { MetaProject, MetaColumn } from './'

@Table({
  tableName: 't_meta_table',
  indexes: [{ fields: ['projectId'] }, { fields: ['module', 'name'] }],
})
@codeGen('scopesGen')
@Scopes(() => ({
  findAll: {
    include: [
      {
        model: MetaColumn,
        as: 'columns',
        include: [],
        required: false,
      },
      {
        model: MetaProject,
        as: 'project',
        required: false,
      },
    ],
  },
  findOne: {
    include: [
      {
        model: MetaColumn,
        as: 'columns',
        include: [],
        required: false,
      },
      {
        model: MetaProject,
        as: 'project',
        required: false,
      },
    ],
  },
}))
export class MetaTable extends BaseModel<MetaTable> {
  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '表名',
  })
  name: string

  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '所属模块',
  })
  module: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '表描述',
  })
  comment?: string

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: '生成的实体定义',
  })
  entityCode?: string

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    comment: '生成的前端代码',
  })
  frontCode?: string

  @ForeignKey(() => MetaProject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '所属项目',
  })
  projectId: number

  @BelongsTo(() => MetaProject, 'projectId')
  project: MetaProject

  // @Column({
  //   allowNull: true,
  //   type: DataType.JSON,
  //   comment: '关联表的include语句',
  // })
  // includeStatement?: any

  @Column({
    allowNull: true,
    type: DataType.JSON,
    comment: '关联表的relation keys',
  })
  relationNodes?: any

  @HasMany(() => MetaColumn)
  columns: MetaColumn[]

  /**
   * 以下是计算字段
   */

  @Column({
    type: DataType.VIRTUAL,
    comment: '实体类型',
  })
  get type(): 'table' | 'view' {
    return /^t_/.test(this.getDataValue('name')) ? 'table' : 'view'
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'app.module.ts所在目录',
  })
  get appModuleFullPath(): string {
    if (this.getDataValue('module') && this.project) {
      return `${this.project.baseDirectory || ''}src/app.module.ts`
    }
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: '模块所在目录',
  })
  get moduleDirectory(): string {
    if (this.getDataValue('module') && this.project) {
      return `${
        this.project.baseDirectory || ''
      }src/features/${this.getDataValue('module')}`
    } else {
      return ''
    }
  }

  @Column({
    type: DataType.VIRTUAL,
  })
  get moduleClassName() {
    const module = this.getDataValue('module')
    if (module) {
      return camelCase(module, { pascalCase: true }) + 'Module'
    }
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: '模块文件完整路径',
  })
  get moduleFilePath(): string {
    if (this.getDataValue('module')) {
      return `${this.moduleDirectory}/${this.getDataValue('module')}.module.ts`
    } else {
      return ''
    }
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: '实体定义所在目录',
  })
  get entityDirectory(): string {
    return `${this.moduleDirectory}/entities`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'DTO定义所在目录',
  })
  get DTODirectory(): string {
    if (this.getDataValue('module')) {
      return `${this.moduleDirectory}/dto`
    } else {
      return ''
    }
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'service所在目录',
  })
  get serviceDirectory(): string {
    if (this.getDataValue('module') && this.project) {
      return `${this.moduleDirectory}/services`
    } else {
      return ''
    }
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'controller所在目录',
  })
  get controllerDirectory(): string {
    if (this.getDataValue('module') && this.project) {
      return `${this.moduleDirectory}/controllers`
    } else {
      return ''
    }
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: '实体基准名字 - 去掉开头的 t_, v_ 前缀',
  })
  get baseName(): string {
    const tableName = this.getDataValue('name')
    if (!tableName) {
      return ''
    }
    if (/^t_/.test(tableName)) {
      return tableName.replace(/^t_/, '')
    }
    if (/^v_/.test(tableName)) {
      return tableName.replace(/^v_/, '')
    }
    return ''
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: '实体定义的类名 - CrewPassport',
  })
  get className(): string {
    return camelCase(this.baseName, { pascalCase: true })
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'instance名称的单数形式 - crewPassport',
  })
  get instanceName() {
    return camelCase(this.className, {
      preserveConsecutiveUppercase: true,
    })
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'instance名称的复数形式 - crewPassports',
  })
  get pluralName() {
    return pluralize(this.instanceName)
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'dot name - t_crew_passport -> crew.passport',
  })
  get dotName(): string {
    if (this.getDataValue('name')) {
      return this.baseName.split('_').join('.')
    } else {
      return ''
    }
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'service file name',
  })
  get serviceFileName(): string {
    return `${this.dotName}.service.ts`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'service file path',
  })
  get serviceFilePath(): string {
    return `${this.serviceDirectory}/${this.dotName}.service.ts`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'controller file name',
  })
  get controllerFileName(): string {
    return `${this.dotName}.controller.ts`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'controller file path',
  })
  get controllerFilePath(): string {
    return `${this.controllerDirectory}/${this.dotName}.controller.ts`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: '实体定义所在的完整目录',
  })
  get entityFilePath(): string {
    return `${this.entityDirectory}/${this.dotName}.entity.ts`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'DTO定义所在的完整目录',
  })
  get dtoFilePath(): string {
    return `${this.DTODirectory}/${this.dotName}.request.dto.ts`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'SCHEMA定义所在的完整目录',
  })
  get schemaFilePath(): string {
    return `${this.DTODirectory}/${this.dotName}.response.schema.ts`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'create dto class name',
  })
  get createDTOClass(): string {
    return `Create${this.className}RequestDTO`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'update dto class name',
  })
  get updateDTOClass(): string {
    return `Update${this.className}RequestDTO`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'findAll dto class name',
  })
  get findAllDTOClass(): string {
    return `FindAll${this.className}RequestDTO`
  }

  @Column({
    type: DataType.VIRTUAL,
    comment: 'findOne dto class name',
  })
  get findOneDTOClass(): string {
    return `FindOne${this.className}RequestDTO`
  }

  @Column({
    allowNull: true,
    type: DataType.JSON,
    comment: '索引',
  })
  @codeGen('7888')
  indexes?: any

  @Column({
    allowNull: true,
    type: DataType.JSON,
    comment: 'findOne的relation',
  })
  @codeGen('8707')
  relationNodesForOne?: any

  @Column({
    type: DataType.VIRTUAL,
  })
  get selectDisplayColumns(): string {
    if (this.getDataValue('columns')) {
      return this.getDataValue('columns')
        .filter((column) => column.forSelectDisplay)
        .map((column) => column.name)
        .join(',')
    } else {
      return ''
    }
  }
}
