import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './../../../app.module'
import { DBSyncService } from './db.sync.service'

describe('DBSyncService Test', () => {
  let app: INestApplicationContext
  let dbSyncService: DBSyncService

  beforeEach(async () => {
    app = await NestFactory.createApplicationContext(AppModule)
    dbSyncService = app.get(DBSyncService)
  })

  it('syncSqlBuilder should generate alter table add column', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'certId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: '',
        columnComment: '2222',
        refTableName: undefined,
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      "ALTER TABLE `t_certificate` ADD COLUMN `certId` int(11) NULL COMMENT '2222';",
    ])
  })

  it('syncSqlBuilder should generate alter table drop column', async () => {
    const comparedDefinition = {
      mysqlColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'test',
        allowNull: 1,
        dataType: 'varchar(255)',
        defaultValue: null,
        columnComment: '',
        refTableName: null,
        refColumnName: null,
        constraintName: null,
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      'ALTER TABLE `t_certificate` DROP COLUMN test;',
    ])
  })

  it('syncSqlBuilder should generate alter table drop column with constraint', async () => {
    const comparedDefinition = {
      mysqlColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'enmuId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: null,
        columnComment: '',
        refTableName: 't_enum',
        refColumnName: 'id',
        constraintName: 't_certificate_ibfk_3',
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      'ALTER TABLE `t_certificate` DROP FOREIGN KEY t_certificate_ibfk_3;ALTER TABLE `t_certificate` DROP COLUMN enmuId;',
    ])
  })

  it('syncSqlBuilder should generate alter table modify comment', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_info_issue',
        columnName: 'issueTime',
        allowNull: 1,
        dataType: 'datetime',
        defaultValue: '',
        columnComment: '发布时间',
        refTableName: undefined,
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
      },
      mysqlColumnDefinition: {
        tableName: 't_info_issue',
        columnName: 'issueTime',
        allowNull: 1,
        dataType: 'datetime',
        defaultValue: null,
        columnComment: '发不时间',
        refTableName: null,
        refColumnName: null,
        constraintName: null,
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      "ALTER TABLE `t_info_issue` MODIFY COLUMN `issueTime` datetime NULL COMMENT '发布时间';",
    ])
  })

  it('syncSqlBuilder should generate alter table modify dataType', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_info_issue',
        columnName: 'issueTime',
        allowNull: 1,
        dataType: 'date',
        defaultValue: '',
        columnComment: '发布时间',
        refTableName: undefined,
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
      },
      mysqlColumnDefinition: {
        tableName: 't_info_issue',
        columnName: 'issueTime',
        allowNull: 1,
        dataType: 'datetime',
        defaultValue: null,
        columnComment: '发布时间',
        refTableName: null,
        refColumnName: null,
        constraintName: null,
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      "ALTER TABLE `t_info_issue` MODIFY COLUMN `issueTime` date NULL COMMENT '发布时间';",
    ])
  })

  it('syncSqlBuilder should generate alter table modify isnull', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_info_issue',
        columnName: 'issueTime',
        allowNull: 1,
        dataType: 'datetime',
        defaultValue: '',
        columnComment: '发布时间',
        refTableName: undefined,
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
      },
      mysqlColumnDefinition: {
        tableName: 't_info_issue',
        columnName: 'issueTime',
        allowNull: 0,
        dataType: 'datetime',
        defaultValue: null,
        columnComment: '发布时间',
        refTableName: null,
        refColumnName: null,
        constraintName: null,
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      "ALTER TABLE `t_info_issue` MODIFY COLUMN `issueTime` datetime NULL COMMENT '发布时间';",
    ])
  })

  it('syncSqlBuilder should generate alter table add constraint', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'certId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: '',
        columnComment: '2222',
        refTableName: 't_employee',
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
        hasConstraint: 1,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      'ALTER TABLE `t_certificate` ADD CONSTRAINT FOREIGN KEY (certId) REFERENCES t_employee(id);',
    ])
  })

  it('syncSqlBuilder should generate alter table drop constraint', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'employeeId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: '',
        columnComment: '2222',
        refTableName: 't_employee',
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
        hasConstraint: 2,
      },
      mysqlColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'employeeId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: null,
        columnComment: '2222',
        refTableName: null,
        refColumnName: null,
        constraintName: 't_certificate_ibfk_2',
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      'ALTER TABLE `t_certificate` DROP FOREIGN KEY t_certificate_ibfk_2;',
    ])
  })

  it('syncSqlBuilder should generate alter table modify constraint', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'employeeId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: '',
        columnComment: '2222',
        refTableName: 't_certificate',
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
        hasConstraint: 3,
      },
      mysqlColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'employeeId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: null,
        columnComment: '2222',
        refTableName: 't_employee',
        refColumnName: null,
        constraintName: 't_certificate_ibfk_2',
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      'ALTER TABLE `t_certificate` DROP FOREIGN KEY t_certificate_ibfk_2;',
      'ALTER TABLE `t_certificate` ADD CONSTRAINT FOREIGN KEY (employeeId) REFERENCES t_certificate(id);',
    ])
  })

  it('syncSqlBuilder should generate alter table modify constraint with constraintname is null', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'employeeId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: '',
        columnComment: '2222',
        refTableName: 't_certificate',
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
        hasConstraint: 3,
      },
      mysqlColumnDefinition: {
        tableName: 't_certificate',
        columnName: 'employeeId',
        allowNull: 1,
        dataType: 'int(11)',
        defaultValue: null,
        columnComment: '2222',
        refTableName: 't_employee',
        refColumnName: null,
        constraintName: null,
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([
      'ALTER TABLE `t_certificate` ADD CONSTRAINT FOREIGN KEY (employeeId) REFERENCES t_certificate(id);',
    ])
  })

  it('syncSqlBuilder should be same', async () => {
    const comparedDefinition = {
      metaColumnDefinition: {
        tableName: 't_info_issue',
        columnName: 'issueTime',
        allowNull: 0,
        dataType: 'datetime',
        defaultValue: '',
        columnComment: '发布时间',
        refTableName: undefined,
        refColumnName: 'id',
        constraintName: '',
        hasTouched: 0,
      },
      mysqlColumnDefinition: {
        tableName: 't_info_issue',
        columnName: 'issueTime',
        allowNull: 0,
        dataType: 'datetime',
        defaultValue: null,
        columnComment: '发布时间',
        refTableName: null,
        refColumnName: null,
        constraintName: null,
        hasTouched: 0,
      },
    }

    const { sql: syncSqls, code: syncReasonCodes } =
      dbSyncService.syncSqlBuilder(comparedDefinition)[0]

    expect(syncSqls).toStrictEqual([])
  })

  it('test getColumnDiffsbyJson', async () => {
    const json = {
      projectId: 1,
      columnDefinitions: {
        t_attachment: [
          {
            tableName: 't_attachment',
            columnName: 'bucket',
            allowNull: 1,
            dataType: 'varchar(40)',
            columnComment: '桶',
            hasTouched: 0,
          },
          {
            tableName: 't_attachment',
            columnName: 'createdAt',
            allowNull: 0,
            dataType: 'datetime',
            columnComment: '',
            hasTouched: 0,
          },
        ],
      },
    }

    const result = await dbSyncService.getColumnDiffsbyJson(json)

    const expectResult = [
      {
        t_attachment: [
          {
            sql: "ALTER TABLE `t_attachment` ADD COLUMN `objectId` varchar(255) NULL COMMENT '文件对象id';",
            error: [],
            code: [Array],
            errorReasonSql: '',
            id: 1,
          },
          {
            sql: "ALTER TABLE `t_attachment` ADD COLUMN `objectName` varchar(255) NULL COMMENT '文件名';",
            error: [],
            code: [Array],
            errorReasonSql: '',
            id: 2,
          },
          {
            sql: "ALTER TABLE `t_attachment` ADD COLUMN `mimeType` varchar(255) NULL COMMENT '文件类型';",
            error: [],
            code: [Array],
            errorReasonSql: '',
            id: 3,
          },
          {
            sql: "ALTER TABLE `t_attachment` ADD COLUMN `remark` varchar(255) NULL COMMENT '备注';",
            error: [],
            code: [Array],
            errorReasonSql: '',
            id: 4,
          },
          {
            sql: "ALTER TABLE `t_attachment` ADD COLUMN `sourceSystem` varchar(255) NULL COMMENT '来源系统';",
            error: [],
            code: [Array],
            errorReasonSql: '',
            id: 5,
          },
          {
            sql: "ALTER TABLE `t_attachment` ADD COLUMN `path` varchar(255) NULL COMMENT '文件路径';",
            error: [],
            code: [Array],
            errorReasonSql: '',
            id: 6,
          },
          {
            sql: "ALTER TABLE `t_attachment` ADD COLUMN `isFolder` tinyint(1) NULL COMMENT '是否是文件夹';",
            error: [],
            code: [Array],
            errorReasonSql: '',
            id: 7,
          },
          {
            sql: "ALTER TABLE `t_attachment` ADD COLUMN `size` int(11) NULL COMMENT '文件大小';",
            error: [],
            code: [Array],
            errorReasonSql: '',
            id: 8,
          },
        ],
      },
    ]
    expect(result).toStrictEqual(expectResult)
  })

  // it('test by tableId with database', async () => {
  //   const result = await dbSyncService.getColumnDiffs(
  //     390, //273,390
  //     'syncKey,deleted,createdAt,updatedAt,id,isActive',
  //   )
  //   console.log(result)
  // })

  // it('execution sql', async () => {
  //   const result = await dbSyncService.executionSql(
  //     273,
  //     `ALTER TABLE \`t_certificate\` MODIFY COLUMN \`name\` varchar(255) NOT NULL COMMENT "证书''名称12";`,
  //   )
  //   console.log(result)
  // })

  // it('test getDataTypeSynonym', () => {
  //   const dataType = dbSyncService.getDataTypeSynonym('int(11)')

  //   expect(dataType).toStrictEqual('int')
  // })
})
