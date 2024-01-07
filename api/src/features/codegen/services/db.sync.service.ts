import { Injectable, Logger } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { MetaTableService } from '../../base/services/meta.table.service'
import { MetaColumnService } from '../../base/services/meta.column.service'
import { MetaProjectService } from '../../base/services/meta.project.service'
import _ from 'lodash'
import { DbMigrateLogService } from './../../base/services/db.migrate.log.service'

export type SYNC_RESULT = {
  sql: string
  code: SYNC_REASON
  reason?: string
  columnModifiedItem: string
}

export enum CONSTRAINT_STATUS {
  // meta中定义了外键，mysql中没有
  MYSQL_ABSENT = 1,
  // meta中没有定义外键，mysql中却有
  MYSQL_REDUNDANCY = 2,
  // mysql中的外键定义和meta不一致
  CONFLICT = 3,
  // meta没有定义外键，mysql中也没有外键
  NOT_APPLICABLE = 0,
}

type COLUMN_DEFINITION = {
  tableName: string
  columnName: string
  allowNull: number
  dataType: string
  defaultValue: string
  columnComment: string
  refTableName: string
  refColumnName: string
  constraintName: string
  hasTouched?: number
  columnModifiedItem?: number
  syncReason?: SYNC_REASON
  constraintType?: CONSTRAINT_STATUS
  constraintDataConflict?: boolean
}

type COMPARED_DEFINITION = {
  metaColumnDefinition?: COLUMN_DEFINITION
  mysqlColumnDefinition?: COLUMN_DEFINITION
}

export enum SYNC_REASON {
  SYNC_CONSTRAINT_NEW = 0,
  SYNC_CONSTRAINT_MODIFY = 1,
  SYNC_ALLOWNULL_MODIFY = 2,
  SYNC_DEFAULTVALUE_MODIFY = 3,
  SYNC_COMMENT_MODIFY = 4,
  SYNC_DTATTYPE_MODIFY = 5,
  SYNC_FEILD_NEW = 6,
  SYNC_FEILD_DELETE = 7,
  SYNC_CONSTRAINT_DROP = 8,
  SYNC_MODIFY = 9,
}

export enum ERROR_REASON {
  ERROR_CONSTRAINT_NEW,
}

@Injectable()
export class DBSyncService {
  private readonly targetDBConnections: { [projectId: string]: Sequelize } = {}
  public readonly mysqlDefinitionSQL: string
  private readonly logger = new Logger(DBSyncService.name)
  constructor(
    private readonly metaTableService: MetaTableService,
    private readonly metaColumnService: MetaColumnService,
    private readonly metaProjectService: MetaProjectService,
    private readonly dbMigrateLogService: DbMigrateLogService,
    private readonly mysql: Sequelize,
  ) {
    this.mysqlDefinitionSQL = `with relationColumn as (
                                  SELECT  table_name                  as tableName,
                                          column_name                 as columnName,
                                          max(referenced_table_name)  as refTableName, 
                                          max(referenced_column_name) as refColumnName,
                                          max(constraint_name)        as constraintName
                                  FROM information_schema.KEY_COLUMN_USAGE 
                                  WHERE referenced_table_name is not null and table_schema = ? 
                                  GROUP BY table_name,
                                           column_name
                                )
                                SELECT  table_name        as tableName,
                                        column_name       as columnName, 
                                        case is_nullable 
                                        when 'YES' 
                                        then 1 
                                        else 0 
                                        end               as allowNull, 
                                        column_type       as dataType, 
                                        column_default    as defaultValue,
                                        column_comment    as columnComment,
                                        t.refTableName    as refTableName,
                                        t.refColumnName   as refColumnName,
                                        t.constraintName  as constraintName,
                                        0                 as hasTouched
                                FROM information_schema.columns s
                                LEFT JOIN relationColumn        t on s.table_name = t.tableName and 
                                                                     s.column_name = t.columnName
                                where s.table_name = ? and 
                                      s.table_schema = ?`
  }

  private getSyncReasonByCode(code: SYNC_REASON): string {
    switch (code) {
      case SYNC_REASON.SYNC_CONSTRAINT_NEW:
        return '新约束'
      case SYNC_REASON.SYNC_CONSTRAINT_DROP:
        return 'error'
      case SYNC_REASON.SYNC_CONSTRAINT_MODIFY:
        return '改约束'
      case SYNC_REASON.SYNC_ALLOWNULL_MODIFY:
        return '改null'
      case SYNC_REASON.SYNC_DEFAULTVALUE_MODIFY:
        return '改默认值'
      case SYNC_REASON.SYNC_COMMENT_MODIFY:
        return '改注释'
      case SYNC_REASON.SYNC_DTATTYPE_MODIFY:
        return '改数据类型'
      case SYNC_REASON.SYNC_FEILD_NEW:
        return '加列'
      case SYNC_REASON.SYNC_FEILD_DELETE:
        return '删列'
      case SYNC_REASON.SYNC_MODIFY:
        return '改列'
      default:
        return code
    }
  }

  /**
   * 根据项目id初始化数据库连接
   *
   * @param projectId
   * @returns
   */
  private async getProjectConnection(projectId: number): Promise<Sequelize> {
    const project = await this.metaProjectService.findOneMetaProjectById(
      projectId,
    )
    const config = this.targetDBConnections[projectId]?.config

    if (
      !(projectId in this.targetDBConnections) ||
      config.database !== project.dbName ||
      config.username !== project.dbUser ||
      config.password !== project.dbPassword ||
      config.host !== project.dbHost ||
      config.port !== project.dbPort
    ) {
      console.log({
        host: project.dbHost,
        dialect: 'mysql',
        database: project.dbName,
        username: project.dbUser,
        password: project.dbPassword,
        port: parseInt(project.dbPort),
        logging: false,
      })

      // 如果没有初始化过数据库链接或者数据库链接的参数变了则初始化数据库链接
      this.targetDBConnections[projectId] = new Sequelize({
        host: project.dbHost,
        dialect: 'mysql',
        database: project.dbName,
        username: project.dbUser,
        password: project.dbPassword,
        port: parseInt(project.dbPort),
        logging: false,
      })

      // 数据库链接检测
      try {
        await this.targetDBConnections[projectId].authenticate()
      } catch (err) {
        if (err.toString().includes('SequelizeConnectionRefusedError')) {
          throw new Error('数据库服务器已关闭')
        } else {
          throw new Error(`数据库连接失败:${err}`)
        }
      }
    }

    return this.targetDBConnections[projectId]
  }

  /**
   * 获取数据类型同义词，如果没有同义词，则返回原数据
   */
  private getDataTypeSynonym(dataType: string): string {
    const dataTypeSynonym = {
      'int(11)': 'int',
      'tinyint(1)': 'tinyint',
      'bigint(20)': 'bigint',
    }
    return dataTypeSynonym[dataType] || dataType
  }

  /**
   *  SQL Bulider
   */
  public syncSqlBuilder(
    comparedDefinition: COMPARED_DEFINITION, // : { //   sql: string //   error: number[] //   code: number[] //   errorReasonSql: string // }[]
  ): SYNC_RESULT[] {
    const result = []

    // this.logger.debug(
    //   `syncSqlBuilder -  comparedDefinition: ${JSON.stringify(
    //     comparedDefinition,
    //     null,
    //     2,
    //   )}`,
    // )

    const {
      tableName,
      columnName,
      dataType,
      allowNull,
      columnComment,
      refTableName,
      constraintType,
      columnModifiedItem,
      defaultValue,
    } = comparedDefinition.metaColumnDefinition || {}

    const actionType = comparedDefinition.metaColumnDefinition
      ? comparedDefinition.mysqlColumnDefinition
        ? ''
        : 'ADD COLUMN'
      : 'DROP COLUMN'

    // (meta无 mysql有)删除列
    if (actionType === 'DROP COLUMN') {
      if (
        comparedDefinition.mysqlColumnDefinition.constraintType ===
        CONSTRAINT_STATUS.MYSQL_REDUNDANCY
      ) {
        // 如果有约束，需要先删除约束
        result.push({
          sql: `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY ${comparedDefinition.mysqlColumnDefinition.constraintName}`,
          code: SYNC_REASON.SYNC_CONSTRAINT_DROP,
          reason: this.getSyncReasonByCode(SYNC_REASON.SYNC_CONSTRAINT_DROP),
        })
      }

      result.push({
        sql: `ALTER TABLE \`${comparedDefinition.mysqlColumnDefinition.tableName}\` DROP COLUMN ${comparedDefinition.mysqlColumnDefinition.columnName}`,
        code: SYNC_REASON.SYNC_FEILD_DELETE,
        reason: this.getSyncReasonByCode(SYNC_REASON.SYNC_FEILD_DELETE),
      })
    }

    // (meta有 mysql无)加列
    if (actionType === 'ADD COLUMN') {
      result.push({
        sql: `ALTER TABLE \`${tableName}\` ${actionType} \`${columnName}\` ${dataType} ${
          allowNull ? 'NULL' : 'NOT NULL'
        } COMMENT '${columnComment || ''}'`,
        code: SYNC_REASON.SYNC_FEILD_NEW,
        reason: this.getSyncReasonByCode(SYNC_REASON.SYNC_FEILD_NEW),
      })
    }

    // (meta有 mysql有)改列
    if (columnModifiedItem > 0) {
      let sql = `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${columnName}\` ${dataType} ${
        allowNull ? 'NULL' : 'NOT NULL'
      } COMMENT '${columnComment || ''}'`

      /**
       * 如果需要更改defaultValue，则要判断是否是字符类型，字符类型的defaultValue需要加引号，否则不需要。
       */
      if (defaultValue && (columnModifiedItem & 4) === 4) {
        if (/varchar|text/.test(dataType)) {
          sql += ` DEFAULT '${defaultValue}'`
        } else if (dataType === 'tinyint') {
          sql += ` DEFAULT ${defaultValue === 'true' ? 1 : 0}`
        } else {
          sql += ` DEFAULT ${defaultValue}`
        }
      }

      // console.log(`dataType: ${dataType} ${defaultValue}`)

      result.push({
        sql,
        code: SYNC_REASON.SYNC_MODIFY,
        reason: this.getSyncReasonByCode(SYNC_REASON.SYNC_MODIFY),
        columnModifiedItem: [
          (columnModifiedItem & 1) === 1 ? '数据类型' : '',
          (columnModifiedItem & 2) === 2 ? 'NULL' : '',
          (columnModifiedItem & 4) === 4 ? '默认值' : '',
          (columnModifiedItem & 8) === 8 ? '注释' : '',
        ]
          .filter((o) => o)
          .join(','),
      })
    }

    // (meta有 mysql无)新增约束
    if (constraintType === CONSTRAINT_STATUS.MYSQL_ABSENT) {
      result.push({
        sql: `ALTER TABLE \`${tableName}\` ADD CONSTRAINT FOREIGN KEY (${columnName}) REFERENCES ${refTableName}(id)`,
        code: SYNC_REASON.SYNC_CONSTRAINT_NEW,
        reason: this.getSyncReasonByCode(SYNC_REASON.SYNC_CONSTRAINT_NEW),
      })
    }

    // (meta无 mysql有)删除约束
    if (constraintType === CONSTRAINT_STATUS.MYSQL_REDUNDANCY) {
      const { constraintName } = comparedDefinition.mysqlColumnDefinition
      result.push({
        sql: `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY ${constraintName}`,
        code: SYNC_REASON.SYNC_CONSTRAINT_DROP,
        reason: this.getSyncReasonByCode(SYNC_REASON.SYNC_CONSTRAINT_DROP),
      })
    }

    // (meta有 mysql有)(冲突) 修改约束, 先删除再创建
    if (constraintType === CONSTRAINT_STATUS.CONFLICT) {
      if (comparedDefinition.mysqlColumnDefinition.constraintName) {
        result.push({
          sql: `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY ${comparedDefinition.mysqlColumnDefinition.constraintName}`,
          code: SYNC_REASON.SYNC_CONSTRAINT_MODIFY,
          reason: this.getSyncReasonByCode(SYNC_REASON.SYNC_CONSTRAINT_MODIFY),
        })
      }

      result.push({
        sql: `ALTER TABLE \`${tableName}\` ADD CONSTRAINT FOREIGN KEY (\`${columnName}\`) REFERENCES \`${refTableName}\`(id)`,
        code: SYNC_REASON.SYNC_CONSTRAINT_MODIFY,
        reason: this.getSyncReasonByCode(SYNC_REASON.SYNC_CONSTRAINT_MODIFY),
      })
    }

    return result
  }

  public getMigrateSql(
    metaColumnDefinitions?: COLUMN_DEFINITION[],
    mysqlColumnDefinitions?: COLUMN_DEFINITION[],
    ignoreColumns: string = 'syncKey,deleted,createdAt,updatedAt,id,isActive',
  ): SYNC_RESULT[] {
    let resObj: SYNC_RESULT[] = []

    // 将数据库中的字段定义按照 tableName-columnName 为key, 组成hash, 方便比较
    const keyedMysqlColumnDefinitions = _.keyBy(
      mysqlColumnDefinitions,
      (definition: any) => `${definition.tableName}-${definition.columnName}`,
    ) as { [key: string]: COLUMN_DEFINITION }

    for (const metaColumnDefinition of metaColumnDefinitions) {
      metaColumnDefinition.columnModifiedItem = 0

      const compareKey = `${metaColumnDefinition.tableName}-${metaColumnDefinition.columnName}`

      if (compareKey in keyedMysqlColumnDefinitions) {
        keyedMysqlColumnDefinitions[compareKey].hasTouched = 1
      } else {
        // mysql里没有这个字段则需要加字段以及加约束
        if (metaColumnDefinition.refTableName) {
          metaColumnDefinition.constraintType = CONSTRAINT_STATUS.MYSQL_ABSENT
        }
        const migrateSql = this.syncSqlBuilder({
          metaColumnDefinition,
          mysqlColumnDefinition: keyedMysqlColumnDefinitions[compareKey],
        })

        resObj = resObj.concat(migrateSql)
        continue
      }

      /**
       * # meta和mysql里都存在这个字段
       */
      /**
       * ## 字段处理
       */
      if (
        metaColumnDefinition.dataType !==
        keyedMysqlColumnDefinitions[compareKey].dataType
      ) {
        metaColumnDefinition.columnModifiedItem += 1
      }

      if (
        metaColumnDefinition.allowNull !==
        keyedMysqlColumnDefinitions[compareKey].allowNull
      ) {
        metaColumnDefinition.columnModifiedItem += 2
      }

      if (
        metaColumnDefinition.defaultValue !==
          keyedMysqlColumnDefinitions[compareKey].defaultValue ||
        ''
      ) {
        metaColumnDefinition.columnModifiedItem += 4
      }

      if (
        metaColumnDefinition.columnComment !==
        keyedMysqlColumnDefinitions[compareKey].columnComment
      ) {
        metaColumnDefinition.columnModifiedItem += 8
      }
      // console.log(
      //   `compareKey: ${compareKey} columnModifiedItem: ${metaColumnDefinition.columnModifiedItem} ${metaColumnDefinition.defaultValue} '${keyedMysqlColumnDefinitions[compareKey].defaultValue}'`,
      // )

      /**
       * ## 约束处理
       */
      /**
       * (meta无约束 mysql有约束)
       * 需要drop contraint
       */
      if (
        !metaColumnDefinition.refTableName &&
        keyedMysqlColumnDefinitions[compareKey].constraintName
      ) {
        metaColumnDefinition.constraintType = CONSTRAINT_STATUS.MYSQL_REDUNDANCY
      }

      /**
       * (meta有约束 mysql有约束)(冲突!)
       * meta定义的约束和数据库里的约束有冲突，需要删除数据库里的约束并重建约束
       */
      if (
        metaColumnDefinition.refTableName &&
        metaColumnDefinition.refTableName !==
          keyedMysqlColumnDefinitions[compareKey].refTableName
      ) {
        // 数据库的定义和meta的定义有冲突
        metaColumnDefinition.constraintType = CONSTRAINT_STATUS.CONFLICT

        /**
         * 判断外键约束是否会产生冲突 TODO: 在组织definition的时候做
         */
        /*
        if (!columnDefinition) {
          const projectConnection = await this.getProjectConnection(
            table.projectId,
          )
          const count: any = await projectConnection.query(
            `select count(id) as count 
               from \`${metaColumnDefinition.tableName}\` 
               where \`${metaColumnDefinition.columnName}\` not in (
                          select id from \`${metaColumnDefinition.refTableName}\`
                      ) and \`${metaColumnDefinition.columnName}\` is not null;`,
            { type: QueryTypes.SELECT },
          )

          if (count[0].count > 0) {
            metaColumnDefinition.constraintDataConflict = true
          }
        }
        */
      }

      const migrateSql = this.syncSqlBuilder({
        metaColumnDefinition,
        mysqlColumnDefinition: keyedMysqlColumnDefinitions[compareKey],
      })

      resObj = resObj.concat(migrateSql)
    }

    /**
     * # meta里没有 mysql里有
     *
     * 如果mysql字段上有约束是否可以直接删除约束
     */
    for (const [_, mysqlDef] of Object.entries(keyedMysqlColumnDefinitions)) {
      if (
        !mysqlDef.hasTouched &&
        ignoreColumns.indexOf(mysqlDef.columnName) === -1 // 去掉不需要比对的系统保留字段 TODO: 上线gloria的记录所有字段的版本后不需要这个条件
      ) {
        if (mysqlDef.constraintName) {
          mysqlDef.constraintType = CONSTRAINT_STATUS.MYSQL_REDUNDANCY
        }

        const migrateSql = this.syncSqlBuilder({
          mysqlColumnDefinition: mysqlDef,
        })

        resObj = resObj.concat(migrateSql)
      }
    }

    return resObj
  }

  public async getMetaDefinitions(
    tableId: number,
  ): Promise<COLUMN_DEFINITION[]> {
    const table = await this.metaTableService.findOneMetaTable(tableId)

    if (!table) {
      throw new Error('empty table')
    }

    const metaColumns = await this.metaColumnService.findAllMetaColumn({
      skipPaging: true,
      tableId,
    })

    // 获取MetaColumn中的字段定义
    const metaColumnDefinitions: COLUMN_DEFINITION[] = metaColumns.rows
      .filter((row) => row.dataType.category !== 'system')
      .map((column) => ({
        tableName: column.table.name,
        columnName: column.name,
        allowNull: column.allowNull ? 1 : 0,
        dataType: this.getDataTypeSynonym(column.mysqlDataType),
        defaultValue:
          column.defaultValue === 'false'
            ? '0'
            : column.defaultValue === 'true'
            ? '1'
            : column.defaultValue,
        columnComment: column.comment,
        refTableName: column.refTable?.name,
        refColumnName: column.refTable ? 'id' : '',
        constraintName: '',
        hasTouched: 0,
        columnModifiedItem: 0,
        constraintType: CONSTRAINT_STATUS.NOT_APPLICABLE,
        constraintDataConflict: false,
      }))

    return metaColumnDefinitions
  }

  public async getMysqlDefinitions(
    projectId: number,
    dbName: string,
    tableName: string,
  ) {
    const projectConnection = await this.getProjectConnection(projectId)

    // 获取数据库中的字段定义
    const mysqlColumnDefinitions =
      await projectConnection.query<COLUMN_DEFINITION>(
        this.mysqlDefinitionSQL,
        {
          replacements: [dbName, tableName, dbName],
          type: QueryTypes.SELECT,
        },
      )

    for (const mysqlColumnDefinition of mysqlColumnDefinitions) {
      mysqlColumnDefinition.dataType = this.getDataTypeSynonym(
        mysqlColumnDefinition.dataType,
      )
      if (mysqlColumnDefinition.defaultValue === null) {
        mysqlColumnDefinition.defaultValue = ''
      }
    }

    return mysqlColumnDefinitions
  }

  /**
   *  比对metacolumnName与数据库字段
   *
   *  @param {number} tableId - 比对表的id
   *  @param {COLUMN_DEFINITION[]} columnDefinition - 字段信息(数据库中实际的字段信息)。由于有可能在生产环境中无法直连数据，则可以
   *  通过接口将字段信息传入，然后生成相应的migrate语句。如果没有传入，则直连数据库获取。
   *  @prarm {string} ignoreColumns - 不需要比对的系统保留字段 TODO: 现在是写死的，以后需要判断这个表是从哪个表继承的
   *  @return
   */
  async getColumnDiffs(tableId: number): Promise<SYNC_RESULT[]> {
    const table = await this.metaTableService.findOneMetaTable(tableId)

    if (!table) {
      throw new Error('empty table')
    }

    const metaColumnDefinitions = await this.getMetaDefinitions(tableId)
    const mysqlColumnDefinitions = await this.getMysqlDefinitions(
      table.project.id,
      table.project.dbName,
      table.name,
    )

    return this.getMigrateSql(metaColumnDefinitions, mysqlColumnDefinitions)
  }

  /**
   *  执行SQL语句
   *
   *  @param tableId 要修改的表的Id
   *  @param sql 要执行的sql语句
   */
  public async executionSql(tableId: number, sql: string): Promise<boolean> {
    // 根据 tableId 查询 t_meta_table 表查询出 projectId
    const table = await this.metaTableService.findOneMetaTable(tableId)

    if (!table) {
      throw new Error('empty table')
    }

    const projectConnection = await this.getProjectConnection(table.projectId)

    const result = await projectConnection.query(sql, {
      type: QueryTypes.RAW,
    })

    this.logger.debug(
      `executionSql - result: ${JSON.stringify(result, null, 2)}`,
    )

    await this.dbMigrateLogService.create({ sql, tableId })

    return true
  }

  public async getEnumReport(projectId: number) {
    const sql = `
      select t.name as tableName, 
             s.name as columnName, 
             s.id as columnId, 
             s.enumTypeCode, 
             s.comment, 
             s.isEnable 
      from t_meta_column s
      join t_meta_table  t on s.tableId = t.id
      where refTableId = ( select id 
                           from t_meta_table 
                           where projectId = ${projectId} and 
                                 name = 't_enum') and 
                                 dataTypeId <> 0    
    `
    const enumColumns = await this.mysql.query(sql, { type: QueryTypes.SELECT })

    const enumColumnsByTypeCode = _.groupBy(enumColumns, 'enumTypeCode')

    const projectConnection = await this.getProjectConnection(projectId)

    const enumReportSql = `
      select u.cnName   as enumCategoryName,
             t.cnName   as enumTypeName,
             t.type     as enumTypeCode,
             s.cnName   as enumCnName, 
             s.enName   as enumEnName, 
             s.code     as enumCode, 
             s.isSystem as isSystem, 
             s.status   as status
      from t_enum          s 
      join t_enum_type     t on s.enumTypeId = t.id
      join t_enum_category u on t.categoryId = u.id
      order by 1, 2, 3;
    `

    const enumReport = await projectConnection.query(enumReportSql, {
      type: QueryTypes.SELECT,
    })

    const missingEnumType = []
    for (const enumTypeCode of Object.keys(
      _.keyBy(enumReport, 'enumTypeCode'),
    )) {
      if (!(enumTypeCode in enumColumnsByTypeCode)) {
        missingEnumType.push(enumTypeCode)
      }
    }

    return {
      enumReport,
      enumColumnsByTypeCode,
      missingEnumType,
    }
  }
}

// async getColumnDiffs(
//   tableId: number,
//   columnDefinition?: COLUMN_DEFINITION[],
//   ignoreColumns: string = 'syncKey,deleted,createdAt,updatedAt,id,isActive',
// ): Promise<SYNC_RESULT[]> {
//   let resObj: SYNC_RESULT[] = []

//   const table = await this.metaTableService.findOneMetaTable(tableId)

//   if (!table) {
//     throw new Error('empty table')
//   }

//   // 获取MetaColumn中的字段定义
//   const metaColumnDefinitions: COLUMN_DEFINITION[] = (
//     await this.metaColumnService.findAllMetaColumn({
//       skipPaging: true,
//       tableId,
//     })
//   ).rows
//     .filter((row) => row.dataType.category !== 'system')
//     .map((column) => ({
//       tableName: column.table.name,
//       columnName: column.name,
//       allowNull: column.allowNull ? 1 : 0,
//       dataType: column.mysqlDataType,
//       defaultValue: column.defaultValue,
//       columnComment: column.comment,
//       refTableName: column.refTable?.name,
//       refColumnName: 'id',
//       constraintName: '',
//       hasTouched: 0,
//       columnModifiedItem: 0,
//       constraintType: CONSTRAINT_STATUS.NOT_APPLICABLE,
//       constraintDataConflict: false,
//     }))

//   // 数据库中的字段定义
//   let mysqlColumnDefinitions: COLUMN_DEFINITION[]

//   /**
//    * 初始化从数据库中获取的真实的字段定义，如果没有从外部传入则直接查询(开发模式下可以直接查询)
//    */
//   if (columnDefinition) {
//     mysqlColumnDefinitions = columnDefinition
//   } else {
//     const projectConnection = await this.getProjectConnection(table.projectId)

//     // 获取数据库中的字段定义
//     mysqlColumnDefinitions = await projectConnection.query<COLUMN_DEFINITION>(
//       this.mysqlDefinitionSQL,
//       {
//         replacements: [
//           table.project.dbName,
//           table.name,
//           table.project.dbName,
//         ],
//         type: QueryTypes.SELECT,
//       },
//     )
//   }

//   // 将数据库中的字段定义按照 tableName-columnName 为key, 组成hash, 方便比较
//   const keyedMysqlColumnDefinitions = _.keyBy(
//     mysqlColumnDefinitions,
//     (definition: any) => `${definition.tableName}-${definition.columnName}`,
//   ) as { [key: string]: COLUMN_DEFINITION }

//   for (const metaColumnDefinition of metaColumnDefinitions) {
//     const compareKey = `${metaColumnDefinition.tableName}-${metaColumnDefinition.columnName}`

//     keyedMysqlColumnDefinitions[compareKey].hasTouched = 1

//     if (!(compareKey in keyedMysqlColumnDefinitions)) {
//       // mysql里没有这个字段则需要加字段以及加约束
//       if (metaColumnDefinition.refTableName) {
//         metaColumnDefinition.constraintType = CONSTRAINT_STATUS.MYSQL_ABSENT
//       }
//       continue
//     }

//     /**
//      * # meta和mysql里都存在这个字段
//      */
//     /**
//      * ## 字段处理
//      */
//     if (
//       metaColumnDefinition.dataType !==
//       keyedMysqlColumnDefinitions[compareKey].dataType
//     ) {
//       metaColumnDefinition.columnModifiedItem += 1
//     }

//     if (
//       metaColumnDefinition.allowNull !==
//       keyedMysqlColumnDefinitions[compareKey].allowNull
//     ) {
//       metaColumnDefinition.columnModifiedItem += 2
//     }

//     if (
//       metaColumnDefinition.defaultValue !==
//       keyedMysqlColumnDefinitions[compareKey].defaultValue
//     ) {
//       metaColumnDefinition.columnModifiedItem += 4
//     }

//     if (
//       metaColumnDefinition.columnComment !==
//       keyedMysqlColumnDefinitions[compareKey].columnComment
//     ) {
//       metaColumnDefinition.columnModifiedItem += 8
//     }

//     /**
//      * ## 约束处理
//      */
//     /**
//      * (meta无约束 mysql有约束)
//      * 需要drop contraint
//      */
//     if (
//       !metaColumnDefinition.refTableName &&
//       keyedMysqlColumnDefinitions[compareKey].constraintName
//     ) {
//       metaColumnDefinition.constraintType = CONSTRAINT_STATUS.MYSQL_REDUNDANCY
//     }

//     /**
//      * (meta有约束 mysql有约束)(冲突!)
//      * meta定义的约束和数据库里的约束有冲突，需要删除数据库里的约束并重建约束
//      */
//     if (
//       metaColumnDefinition.refTableName &&
//       metaColumnDefinition.refTableName !==
//         keyedMysqlColumnDefinitions[compareKey].refTableName
//     ) {
//       // 数据库的定义和meta的定义有冲突
//       metaColumnDefinition.constraintType = CONSTRAINT_STATUS.CONFLICT

//       /**
//        * 判断外键约束是否会产生冲突
//        */
//       /*
//       if (!columnDefinition) {
//         const projectConnection = await this.getProjectConnection(
//           table.projectId,
//         )
//         const count: any = await projectConnection.query(
//           `select count(id) as count
//              from \`${metaColumnDefinition.tableName}\`
//              where \`${metaColumnDefinition.columnName}\` not in (
//                         select id from \`${metaColumnDefinition.refTableName}\`
//                     ) and \`${metaColumnDefinition.columnName}\` is not null;`,
//           { type: QueryTypes.SELECT },
//         )

//         if (count[0].count > 0) {
//           metaColumnDefinition.constraintDataConflict = true
//         }
//       }
//       */
//     }

//     const migrateSql = this.syncSqlBuilder({
//       metaColumnDefinition,
//       mysqlColumnDefinition: keyedMysqlColumnDefinitions[compareKey],
//     })

//     resObj = resObj.concat(migrateSql)
//   }

//   /**
//    * # meta里没有 mysql里有
//    *
//    * 如果mysql字段上有约束是否可以直接删除约束
//    */
//   for (const [_, mysqlDef] of Object.entries(keyedMysqlColumnDefinitions)) {
//     if (
//       !mysqlDef.hasTouched &&
//       ignoreColumns.indexOf(mysqlDef.columnName) === -1 // 去掉不需要比对的系统保留字段 TODO: 上线gloria的记录所有字段的版本后不需要这个条件
//     ) {
//       if (mysqlDef.constraintName) {
//         mysqlDef.constraintType = CONSTRAINT_STATUS.MYSQL_REDUNDANCY
//       }

//       const migrateSql = this.syncSqlBuilder({
//         mysqlColumnDefinition: mysqlDef,
//       })

//       resObj = resObj.concat(migrateSql)
//     }
//   }

//   // 在resObj上增加id
//   let num = 1

//   for (const resobj of resObj) {
//     resobj.id = num
//     num += 1
//   }

//   return resObj
// }

// async getColumnDiffsbyJson(json: any): Promise<any> {
//   const projectId = json.projectId
//   const columnDefinitions = json.columnDefinitions
//   let result = {}
//   for (let key in columnDefinitions) {
//     if (columnDefinitions.hasOwnProperty(key)) {
//       const tableName = key
//       // 根据tableName获取tableId
//       const table = await this.metaTableService.findOneByName(
//         tableName,
//         projectId,
//       )

//       // 如果找到table里，则比对字段的区别
//       if (table[0]) {
//         result[key] = await this.getColumnDiffs(
//           table[0].id,
//           columnDefinitions[key],
//         )
//       }
//     }
//   }
//   return result
// }
