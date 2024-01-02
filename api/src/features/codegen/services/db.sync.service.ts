import { Injectable, Logger } from '@nestjs/common'
import { QueryTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { MetaTableService } from '../../base/services/meta.table.service'
import { MetaColumnService } from '../../base/services/meta.column.service'
import { MetaProjectService } from '../../base/services/meta.project.service'
import _ from 'lodash'
import { DbMigrateLogService } from './../../base/services/db.migrate.log.service'

export type SYNC_RESULT = {
  id?: number
  sql: string
  error?: number[]
  code: SYNC_REASON[]
  errorReasonSql?: string
}

enum CONSTRAINT_COMPARE_TYPE {
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
  hasTouched: number
  syncReason?: SYNC_REASON
  constraintType?: number
  hasConstraintData?: boolean
}

type COMPARED_DEFINITION = {
  metaColumnDefinition?: COLUMN_DEFINITION
  mysqlColumnDefinition?: COLUMN_DEFINITION
}

export enum SYNC_REASON {
  SYNC_CONSTRAINT_NEW,
  SYNC_CONSTRAINT_MODIFY,
  SYNC_ALLOWNULL_MODIFY,
  SYNC_DEFAULTVALUE_MODIFY,
  SYNC_COMMENT_MODIFY,
  SYNC_DTATTYPE_MODIFY,
  SYNC_FEILD_NEW,
  SYNC_FEILD_DELETE,
  SYNC_CONSTRAINT_DROP,
}

export enum ERROR_REASON {
  ERROR_CONSTRAINT_NEW,
}

@Injectable()
export class DBSyncService {
  private readonly targetDBConnections: { [projectId: string]: Sequelize } = {}
  private readonly mysqlDefinitionSQL: string
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
  public getDataTypeSynonym(dataType: string): string {
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
  public syncSqlBuilder(comparedDefinition: COMPARED_DEFINITION) {
    const syncSqls: string[] = []
    let syncReasonCodes: number[] = []
    let error: number[] = []
    let errorReasonSql = []

    const actionType = comparedDefinition.metaColumnDefinition
      ? comparedDefinition.mysqlColumnDefinition
        ? ''
        : 'ADD COLUMN'
      : 'DROP COLUMN'

    if (actionType === 'DROP COLUMN') {
      let dropColumnSql: string = ''
      if (comparedDefinition.mysqlColumnDefinition.constraintName) {
        dropColumnSql += `ALTER TABLE \`${comparedDefinition.mysqlColumnDefinition.tableName}\` DROP FOREIGN KEY ${comparedDefinition.mysqlColumnDefinition.constraintName};`
      }
      syncReasonCodes.push(SYNC_REASON.SYNC_FEILD_DELETE)

      dropColumnSql += `ALTER TABLE \`${comparedDefinition.mysqlColumnDefinition.tableName}\` DROP COLUMN ${comparedDefinition.mysqlColumnDefinition.columnName};`
      syncSqls.push(dropColumnSql)
    } else {
      const {
        tableName,
        columnName,
        dataType,
        allowNull,
        columnComment,
        refTableName,
      } = comparedDefinition.metaColumnDefinition
      // 判断依赖关系
      if (
        comparedDefinition.metaColumnDefinition?.constraintType ===
        CONSTRAINT_COMPARE_TYPE.MYSQL_ABSENT
      ) {
        // 添加依赖
        syncReasonCodes.push(SYNC_REASON.SYNC_CONSTRAINT_NEW)
        syncSqls.push(
          `ALTER TABLE \`${tableName}\` ADD CONSTRAINT FOREIGN KEY (${columnName}) REFERENCES ${refTableName}(id);`,
        )
      } else if (
        comparedDefinition.metaColumnDefinition?.constraintType ===
        CONSTRAINT_COMPARE_TYPE.MYSQL_REDUNDANCY
      ) {
        // 删除依赖
        const { constraintName } = comparedDefinition.mysqlColumnDefinition
        syncReasonCodes.push(SYNC_REASON.SYNC_CONSTRAINT_DROP)
        syncSqls.push(
          `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY ${constraintName};`,
        )
      } else if (
        comparedDefinition.metaColumnDefinition?.constraintType ===
        CONSTRAINT_COMPARE_TYPE.CONFLICT
      ) {
        // 修改依赖
        const { constraintName } = comparedDefinition.mysqlColumnDefinition

        syncReasonCodes.push(SYNC_REASON.SYNC_CONSTRAINT_MODIFY)

        if (constraintName) {
          syncSqls.push(
            `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY ${constraintName};`,
          )
        }

        if (comparedDefinition.metaColumnDefinition.hasConstraintData) {
          errorReasonSql.push(
            `select count(id) as count 
             from \`${tableName}\` 
             where \`${columnName}\` not in (select id from \`${refTableName})\` and \`${columnName}\` is not null;`,
          )
          error.push(ERROR_REASON.ERROR_CONSTRAINT_NEW)
        }

        syncSqls.push(
          `ALTER TABLE \`${tableName}\` ADD CONSTRAINT FOREIGN KEY (\`${columnName}\`) REFERENCES \`${refTableName}\`(id);`,
        )
      } else {
        if (actionType === 'ADD COLUMN') {
          syncReasonCodes.push(SYNC_REASON.SYNC_FEILD_NEW)
          syncSqls.push(
            `ALTER TABLE \`${tableName}\` ${actionType} \`${columnName}\` ${dataType} ${
              allowNull ? 'NULL' : 'NOT NULL'
            } COMMENT '${columnComment || ''}';`,
          )
        } else {
          if (!comparedDefinition.metaColumnDefinition.defaultValue) {
            comparedDefinition.metaColumnDefinition.defaultValue = ''
          }
          if (!comparedDefinition.mysqlColumnDefinition.defaultValue) {
            comparedDefinition.mysqlColumnDefinition.defaultValue = ''
          }

          if (
            this.getDataTypeSynonym(
              comparedDefinition.metaColumnDefinition.dataType,
            ) !==
            this.getDataTypeSynonym(
              comparedDefinition.mysqlColumnDefinition.dataType,
            )
          ) {
            syncSqls.push(
              `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${columnName}\` ${dataType} ${
                allowNull ? 'NULL' : 'NOT NULL'
              } COMMENT '${columnComment || ''}';`,
            )
          } else if (
            comparedDefinition.metaColumnDefinition.columnComment !==
            comparedDefinition.mysqlColumnDefinition.columnComment
          ) {
            syncSqls.push(
              `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${columnName}\` ${dataType} ${
                allowNull ? 'NULL' : 'NOT NULL'
              } COMMENT '${columnComment || ''}';`,
            )
          } else if (
            comparedDefinition.metaColumnDefinition.allowNull !==
            comparedDefinition.mysqlColumnDefinition.allowNull
          ) {
            syncSqls.push(
              `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${columnName}\` ${dataType} ${
                allowNull ? 'NULL' : 'NOT NULL'
              } COMMENT '${columnComment || ''}';`,
            )
          }
          // 如果有多个syncReasonCodes，则都显示
          if (
            this.getDataTypeSynonym(
              comparedDefinition.metaColumnDefinition.dataType,
            ) !==
            this.getDataTypeSynonym(
              comparedDefinition.mysqlColumnDefinition.dataType,
            )
          ) {
            syncReasonCodes.push(SYNC_REASON.SYNC_DTATTYPE_MODIFY)
          }

          if (
            comparedDefinition.metaColumnDefinition.columnComment !==
            comparedDefinition.mysqlColumnDefinition.columnComment
          ) {
            syncReasonCodes.push(SYNC_REASON.SYNC_COMMENT_MODIFY)
          }

          if (
            comparedDefinition.metaColumnDefinition.allowNull !==
            comparedDefinition.mysqlColumnDefinition.allowNull
          ) {
            syncReasonCodes.push(SYNC_REASON.SYNC_ALLOWNULL_MODIFY)
          }

          // TODO: defaultValue 的判断需要转化
          // else if (
          //   comparedDefinition.metaColumnDefinition.defaultValue !==
          //   comparedDefinition.mysqlColumnDefinition.defaultValue
          // ) {
          //   syncReasonCodes = SYNC_REASON.SYNC_DEFAULTVALUE_MODIFY
          //   syncSqls.push(
          //     `ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${dataType} ${
          //       allowNull ? 'NULL' : 'NOT NULL'
          //     } COMMENT '${columnComment || ''}'`,
          //   )
          // }
        }
      }
    }

    // return {
    //   syncSqls,
    //   error,
    //   syncReasonCodes,
    //   errorReasonSql,
    // }
    return syncSqls.map((syncSql) => ({
      sql: syncSql,
      error,
      code: syncReasonCodes,
      errorReasonSql: errorReasonSql.join(','),
    }))
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
  async getColumnDiffs(
    tableId: number,
    columnDefinition?: COLUMN_DEFINITION[],
    ignoreColumns: string = 'syncKey,deleted,createdAt,updatedAt,id,isActive',
  ): Promise<SYNC_RESULT[]> {
    let resObj: SYNC_RESULT[] = []

    // 根据 tableId 查询 t_meta_table 表查询出 projectId
    const table = await this.metaTableService.findOneMetaTable(tableId)

    if (!table) {
      throw new Error('empty table')
    }

    // 获取MetaColumn中的字段定义
    const metaColumnDefinitions: COLUMN_DEFINITION[] = (
      await this.metaColumnService.findAllMetaColumn({
        skipPaging: true,
        tableId,
      })
    ).rows
      .filter((row) => row.dataType.category != 'system')
      .map((column) => ({
        tableName: column.table.name,
        columnName: column.name,
        allowNull: column.allowNull ? 1 : 0,
        dataType: column.mysqlDataType,
        defaultValue: column.defaultValue,
        columnComment: column.comment,
        refTableName: column.refTable?.name,
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
        constraintType: CONSTRAINT_COMPARE_TYPE.NOT_APPLICABLE,
        hasConstraintData: false,
      }))

    // 获取数据库中的字段定义
    let mysqlColumnDefinitions: COLUMN_DEFINITION[]

    if (columnDefinition) {
      mysqlColumnDefinitions = columnDefinition
    } else {
      const projectConnection = await this.getProjectConnection(table.projectId)

      // 获取数据库中的字段定义
      mysqlColumnDefinitions = await projectConnection.query<COLUMN_DEFINITION>(
        this.mysqlDefinitionSQL,
        {
          replacements: [
            table.project.dbName,
            table.name,
            table.project.dbName,
          ],
          type: QueryTypes.SELECT,
        },
      )
    }

    // 将数据库中的字段定义按照 tableName+columnName 为key, 组成hash, 方便比较
    const keyedMysqlColumnDefinitions = _.keyBy(
      mysqlColumnDefinitions,
      (definition: any) => `${definition.tableName}-${definition.columnName}`,
    )

    for (const metaColumnDefinition of metaColumnDefinitions) {
      const compareKey = `${metaColumnDefinition.tableName}-${metaColumnDefinition.columnName}`

      if (compareKey in keyedMysqlColumnDefinitions) {
        /**
         * 比较metaColumnDefinition和mysqlColumnDefinition中的字段
         * 如果 数据类型/空/默认值/字段注释 有不同则生成migrate语句
         */
        if (
          metaColumnDefinition.dataType !==
            keyedMysqlColumnDefinitions[compareKey].dataType ||
          metaColumnDefinition.allowNull !==
            keyedMysqlColumnDefinitions[compareKey].allowNull ||
          metaColumnDefinition.defaultValue !==
            keyedMysqlColumnDefinitions[compareKey].defaultValue ||
          metaColumnDefinition.columnComment !==
            keyedMysqlColumnDefinitions[compareKey].columnComment
        ) {
          const migrateSql = this.syncSqlBuilder({
            metaColumnDefinition,
            mysqlColumnDefinition: keyedMysqlColumnDefinitions[compareKey],
          })

          resObj = resObj.concat(migrateSql)
        }

        keyedMysqlColumnDefinitions[compareKey].hasTouched = true

        // 查找是否有依赖关系不匹配的
        if (
          keyedMysqlColumnDefinitions[compareKey].constraintName &&
          !metaColumnDefinition.refTableName
        ) {
          // 如果数据库有meta没有，则删除多余的依赖关系
          metaColumnDefinition.constraintType =
            CONSTRAINT_COMPARE_TYPE.MYSQL_REDUNDANCY

          const migrateSql = this.syncSqlBuilder({
            metaColumnDefinition,
            mysqlColumnDefinition: keyedMysqlColumnDefinitions[compareKey],
          })

          resObj = resObj.concat(migrateSql)
        } else if (
          metaColumnDefinition.refTableName &&
          metaColumnDefinition.refTableName !==
            keyedMysqlColumnDefinitions[compareKey].refTableName
        ) {
          // 数据库的定义和meta的定义有冲突
          metaColumnDefinition.constraintType = CONSTRAINT_COMPARE_TYPE.CONFLICT

          // 判断是否字段有值不在外键表里 TODO: 如果比较生产上的字段定义无法直接查询生产数据库，这里需要做适配
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
              metaColumnDefinition.hasConstraintData = true
            }
          }

          const migrateSql = this.syncSqlBuilder({
            metaColumnDefinition,
            mysqlColumnDefinition: keyedMysqlColumnDefinitions[compareKey],
          })

          resObj = resObj.concat(migrateSql)
        }
      } else {
        const migrateSql = this.syncSqlBuilder({
          metaColumnDefinition,
          mysqlColumnDefinition: keyedMysqlColumnDefinitions[compareKey],
        })

        resObj = resObj.concat(migrateSql)

        // 查找是否有依赖关系，如果有，则添加依赖关系
        if (metaColumnDefinition.refTableName) {
          metaColumnDefinition.constraintType =
            CONSTRAINT_COMPARE_TYPE.MYSQL_ABSENT
          const migrateSql = this.syncSqlBuilder({
            metaColumnDefinition,
            mysqlColumnDefinition: keyedMysqlColumnDefinitions[compareKey],
          })
          resObj = resObj.concat(migrateSql)
        }
      }
    }

    // 删除上一步循环中没有touch的定义(metaColumn中不存在但是数据库中有的定义)
    for (const i in keyedMysqlColumnDefinitions) {
      if (
        !keyedMysqlColumnDefinitions[i].hasTouched &&
        ignoreColumns.indexOf(keyedMysqlColumnDefinitions[i].columnName) === -1 //去掉不需要比对的系统保留字段
      ) {
        const migrateSql = this.syncSqlBuilder({
          mysqlColumnDefinition: keyedMysqlColumnDefinitions[i],
        })
        resObj = resObj.concat(migrateSql)
      }
    }

    // 在resObj上增加id
    let num = 1
    for (const resobj of resObj) {
      resobj.id = num
      num += 1
    }
    return resObj
  }

  async getColumnDiffsbyJson(json: any): Promise<any> {
    const projectId = json.projectId
    const columnDefinitions = json.columnDefinitions
    let result = {}
    for (let key in columnDefinitions) {
      if (columnDefinitions.hasOwnProperty(key)) {
        const tableName = key
        // 根据tableName获取tableId
        const table = await this.metaTableService.findOneByName(
          tableName,
          projectId,
        )

        // 如果找到table里，则比对字段的区别
        if (table[0]) {
          result[key] = await this.getColumnDiffs(
            table[0].id,
            columnDefinitions[key],
          )
        }
      }
    }
    return result
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

    this.logger.debug(`executionSql - result: ${result}`)

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
