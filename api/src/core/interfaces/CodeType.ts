import { Type } from 'class-transformer'

export type DataType =
  | 'varchar(40)'
  | 'varchar(255)'
  | 'varchar(100)'
  | 'text'
  | 'int'
  | 'boolean'
  | 'datetime'
  | 'json'
  | 'decimal(19,2)'
  | 'decimal(19,4)'
  | 'enumtable'
  | 'enum'
  | 'date'
  | 'tinyint(1)'

export type ProjectType = {
  id: string
  repo: string
  repoId: string
}

export type ColumnDefinition = {
  id?: number
  name: string
  defaultValue?: string
  enumKeys?: string
  comment: string
  dataType: DataType
  allowNull: boolean
  refTableId?: number
  relation: string
}

export type TableDefinition = {
  id: number
  projectId: string
  name: string
  module: string
  comment: string
  project: ProjectType
  entityFilePath: string
  codeGen: boolean
  columns: ColumnDefinition[]
}

export type CodeType =
  | 'enty'
  | 'dto/req'
  | 'ctl'
  | 'serv'
  | 'mdu'
  | 'dto/idx'
  | 'enty/idx'
  | 'ctl/idx'
  | 'serv/idx'
  | 'mdu/idx'
  | 'schema'
  | 'appMdu'

export enum CodeTypeEnum {
  Enty = 'enty',
  DtoReq = 'dto/req',
  Ctl = 'ctl',
  Serv = 'serv',
  Mdu = 'mdu',
  DtoIdx = 'dto/idx',
  EntyIdx = 'enty/idx',
  CtlIdx = 'ctl/idx',
  ServIdx = 'serv/idx',
  MduIdx = 'mdu/idx',
  Schema = 'schema',
  AppMdu = 'appMdu',
}

export type DirectoryType =
  | 'DTODirectory'
  | 'serviceDirectory'
  | 'controllerDirectory'
  | 'entityDirectory'
  | 'moduleDirectory'

export type Code = {
  content: string
  originContent: string
  /**
   * label不是必须的，只有生成出的代码是有label的
   * 从代码库中查询到的code没有label
   */
  label: CodeType
  isExist: boolean
  path: string
  name?: string
  codeMirrorOptions?: object | undefined
  showContent?: string
  type?: string
}

export type RelationConfig = {
  type: string
  label: 'includeStructure'
  includeStructure: any
}

export type CodeDiff = {
  diff: string
  changes: number
}
