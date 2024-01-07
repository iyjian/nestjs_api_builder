import fetch from 'node-fetch'
import 'openai/shims/node'
import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './../../../app.module'
import { DBSyncService } from './db.sync.service'

describe('DBSyncService Test', () => {
  let app: INestApplicationContext
  let dbSyncService: DBSyncService

  beforeAll(async () => {
    app = await NestFactory.createApplicationContext(AppModule)
    dbSyncService = app.get(DBSyncService)
  })

  // afterAll(() => {
  //   process.exit(0)
  // })

  it('it should generate alter table add column', () => {
    const metaColumnDefinition = {
      tableName: 't_certificate',
      columnName: 'certId',
      allowNull: 1,
      dataType: 'int(11)',
      defaultValue: '',
      columnComment: '2222',
      refTableName: undefined,
      refColumnName: 'id',
      constraintName: '',
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql([metaColumnDefinition], [])

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: "ALTER TABLE `t_certificate` ADD COLUMN `certId` int(11) NULL COMMENT '2222';",
        code: 6,
        errorReasonSql: '',
      },
    ])
  })

  it('it should generate alter table drop column', () => {
    const mysqlColumnDefinition = {
      tableName: 't_certificate',
      columnName: 'test',
      allowNull: 1,
      dataType: 'varchar(255)',
      defaultValue: null,
      columnComment: '',
      refTableName: null,
      refColumnName: null,
      constraintName: null,
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql([], [mysqlColumnDefinition])

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: 'ALTER TABLE `t_certificate` DROP COLUMN test;',
        code: 7,
        errorReasonSql: '',
      },
    ])
  })

  it('it should generate alter table drop column with constraint', () => {
    const mysqlColumnDefinition = {
      tableName: 't_certificate',
      columnName: 'enmuId',
      allowNull: 1,
      dataType: 'int(11)',
      defaultValue: null,
      columnComment: '',
      refTableName: 't_enum',
      refColumnName: 'id',
      constraintName: 't_certificate_ibfk_3',
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql([], [mysqlColumnDefinition])

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: 'ALTER TABLE `undefined` DROP FOREIGN KEY t_certificate_ibfk_3;',
        code: 8,
        errorReasonSql: '',
      },
      {
        sql: 'ALTER TABLE `t_certificate` DROP COLUMN enmuId;',
        code: 7,
        errorReasonSql: '',
      },
    ])
  })

  it('it should generate alter table modify comment', () => {
    const metaColumnDefinition = {
      tableName: 't_info_issue',
      columnName: 'issueTime',
      allowNull: 1,
      dataType: 'datetime',
      defaultValue: '',
      columnComment: '发布时间',
      refTableName: undefined,
      refColumnName: 'id',
      constraintName: '',
      // hasTouched: 0,
    }
    const mysqlColumnDefinition = {
      tableName: 't_info_issue',
      columnName: 'issueTime',
      allowNull: 1,
      dataType: 'datetime',
      defaultValue: null,
      columnComment: '发不时间',
      refTableName: null,
      refColumnName: null,
      constraintName: null,
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql(
      [metaColumnDefinition],
      [mysqlColumnDefinition],
    )

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: "ALTER TABLE `t_info_issue` MODIFY COLUMN `issueTime` datetime NULL COMMENT '发布时间';",
        code: 0,
        errorReasonSql: '',
      },
    ])
  })

  it('it should generate alter table modify dataType', () => {
    const metaColumnDefinition = {
      tableName: 't_info_issue',
      columnName: 'issueTime',
      allowNull: 1,
      dataType: 'date',
      defaultValue: '',
      columnComment: '发布时间',
      refTableName: undefined,
      refColumnName: 'id',
      constraintName: '',
      // hasTouched: 0,
    }
    const mysqlColumnDefinition = {
      tableName: 't_info_issue',
      columnName: 'issueTime',
      allowNull: 1,
      dataType: 'datetime',
      defaultValue: null,
      columnComment: '发布时间',
      refTableName: null,
      refColumnName: null,
      constraintName: null,
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql(
      [metaColumnDefinition],
      [mysqlColumnDefinition],
    )

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: "ALTER TABLE `t_info_issue` MODIFY COLUMN `issueTime` date NULL COMMENT '发布时间';",
        code: 0,
        errorReasonSql: '',
      },
    ])
  })

  it('it should generate alter table modify isnull', () => {
    const metaColumnDefinition = {
      tableName: 't_info_issue',
      columnName: 'issueTime',
      allowNull: 1,
      dataType: 'datetime',
      defaultValue: '',
      columnComment: '发布时间',
      refTableName: undefined,
      refColumnName: 'id',
      constraintName: '',
      // hasTouched: 0,
    }
    const mysqlColumnDefinition = {
      tableName: 't_info_issue',
      columnName: 'issueTime',
      allowNull: 0,
      dataType: 'datetime',
      defaultValue: null,
      columnComment: '发布时间',
      refTableName: null,
      refColumnName: null,
      constraintName: null,
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql(
      [metaColumnDefinition],
      [mysqlColumnDefinition],
    )

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: "ALTER TABLE `t_info_issue` MODIFY COLUMN `issueTime` datetime NULL COMMENT '发布时间';",
        code: 0,
        errorReasonSql: '',
      },
    ])
  })

  it('it should generate alter table add column and constraint', () => {
    const metaColumnDefinition = {
      tableName: 't_certificate',
      columnName: 'certId',
      allowNull: 1,
      dataType: 'int(11)',
      defaultValue: '',
      columnComment: '2222',
      refTableName: 't_employee',
      refColumnName: 'id',
      constraintName: '',
      // hasTouched: 0,
      // constraintDataConflict: true,
    }

    const result = dbSyncService.getMigrateSql([metaColumnDefinition], [])

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: "ALTER TABLE `t_certificate` ADD COLUMN `certId` int(11) NULL COMMENT '2222';",
        code: 6,
        errorReasonSql: '',
      },
      {
        sql: 'ALTER TABLE `t_certificate` ADD CONSTRAINT FOREIGN KEY (certId) REFERENCES t_employee(id);',
        code: 0,
        errorReasonSql: '',
      },
    ])
  })

  it('it should generate alter table recreate constraint(drop then create)', () => {
    const metaColumnDefinition = {
      tableName: 't_certificate',
      columnName: 'employeeId',
      allowNull: 1,
      dataType: 'int(11)',
      defaultValue: '',
      columnComment: '2222',
      refTableName: 't_employee',
      refColumnName: 'id',
      constraintName: '',
      // hasTouched: 0,
      // constraintDataConflict: false,
    }

    const mysqlColumnDefinition = {
      tableName: 't_certificate',
      columnName: 'employeeId',
      allowNull: 1,
      dataType: 'int(11)',
      defaultValue: '',
      columnComment: '2222',
      refTableName: 't_user',
      refColumnName: 'id',
      constraintName: 't_certificate_ibfk_2',
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql(
      [metaColumnDefinition],
      [mysqlColumnDefinition],
    )

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: 'ALTER TABLE `t_certificate` DROP FOREIGN KEY t_certificate_ibfk_2;',
        code: 1,
        errorReasonSql: '',
      },
      {
        sql: 'ALTER TABLE `t_certificate` ADD CONSTRAINT FOREIGN KEY (`employeeId`) REFERENCES `t_employee`(id);',
        code: 1,
        errorReasonSql: '',
      },
    ])
  })

  // it('it should generate alter table modify default value', () => {
  //   const metaColumnDefinition = {
  //     tableName: 't_certificate',
  //     columnName: 'employeeId',
  //     allowNull: 1,
  //     dataType: 'int(11)',
  //     defaultValue: '1',
  //     columnComment: 'id',
  //     refTableName: '',
  //     refColumnName: '',
  //     constraintName: '',
  //     // constraintDataConflict: 3,
  //   }
  //   const mysqlColumnDefinition = {
  //     tableName: 't_certificate',
  //     columnName: 'employeeId',
  //     allowNull: 1,
  //     dataType: 'int(11)',
  //     defaultValue: null,
  //     columnComment: 'id',
  //     refTableName: '',
  //     refColumnName: null,
  //     constraintName: '',
  //   }

  //   const result = dbSyncService.getMigrateSql(
  //     [metaColumnDefinition],
  //     [mysqlColumnDefinition],
  //   )

  //   console.log(result)

  //   expect(result).toStrictEqual([
  //     'ALTER TABLE `t_certificate` DROP FOREIGN KEY t_certificate_ibfk_2;',
  //     'ALTER TABLE `t_certificate` ADD CONSTRAINT FOREIGN KEY (employeeId) REFERENCES t_certificate(id);',
  //   ])
  // })

  it('it should generate alter table add constraint', () => {
    const metaColumnDefinition = {
      tableName: 't_certificate',
      columnName: 'employeeId',
      allowNull: 1,
      dataType: 'int(11)',
      defaultValue: null,
      columnComment: '2222',
      refTableName: 't_certificate',
      refColumnName: 'id',
      constraintName: '',
      // hasTouched: 0,
      // constraintDataConflict: 3,
    }
    const mysqlColumnDefinition = {
      tableName: 't_certificate',
      columnName: 'employeeId',
      allowNull: 1,
      dataType: 'int(11)',
      defaultValue: null,
      columnComment: '2222',
      refTableName: '',
      refColumnName: null,
      constraintName: null,
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql(
      [metaColumnDefinition],
      [mysqlColumnDefinition],
    )

    // console.log(result)

    expect(result).toStrictEqual([
      {
        sql: 'ALTER TABLE `t_certificate` ADD CONSTRAINT FOREIGN KEY (`employeeId`) REFERENCES `t_certificate`(id);',
        code: 1,
        errorReasonSql: '',
      },
    ])
  })

  it('it should not generate migrate sql', () => {
    const metaColumnDefinition = {
      tableName: 't_info_issue',
      columnName: 'issueTime',
      allowNull: 0,
      dataType: 'datetime',
      defaultValue: null,
      columnComment: '发布时间',
      refTableName: undefined,
      refColumnName: 'id',
      constraintName: '',
      // hasTouched: 0,
    }
    const mysqlColumnDefinition = {
      tableName: 't_info_issue',
      columnName: 'issueTime',
      allowNull: 0,
      dataType: 'datetime',
      defaultValue: null,
      columnComment: '发布时间',
      refTableName: null,
      refColumnName: null,
      constraintName: null,
      // hasTouched: 0,
    }

    const result = dbSyncService.getMigrateSql(
      [metaColumnDefinition],
      [mysqlColumnDefinition],
    )

    console.log(result)

    expect(result).toStrictEqual([])
  })

  // it('test getColumnDiffsbyJson',  () => {
  //   const json = {
  //     projectId: 1,
  //     columnDefinitions: {
  //       t_attachment: [
  //         {
  //           tableName: 't_attachment',
  //           columnName: 'bucket',
  //           allowNull: 1,
  //           dataType: 'varchar(40)',
  //           columnComment: '桶',
  //           // hasTouched: 0,
  //         },
  //         {
  //           tableName: 't_attachment',
  //           columnName: 'createdAt',
  //           allowNull: 0,
  //           dataType: 'datetime',
  //           columnComment: '',
  //           // hasTouched: 0,
  //         },
  //       ],
  //     },
  //   }

  //   const result = await dbSyncService.getColumnDiffsbyJson(json)

  //   const expectResult = [
  //     {
  //       t_attachment: [
  //         {
  //           sql: "ALTER TABLE `t_attachment` ADD COLUMN `objectId` varchar(255) NULL COMMENT '文件对象id';",
  //           error: [],
  //           code: [Array],
  //           errorReasonSql: '',
  //           id: 1,
  //         },
  //         {
  //           sql: "ALTER TABLE `t_attachment` ADD COLUMN `objectName` varchar(255) NULL COMMENT '文件名';",
  //           error: [],
  //           code: [Array],
  //           errorReasonSql: '',
  //           id: 2,
  //         },
  //         {
  //           sql: "ALTER TABLE `t_attachment` ADD COLUMN `mimeType` varchar(255) NULL COMMENT '文件类型';",
  //           error: [],
  //           code: [Array],
  //           errorReasonSql: '',
  //           id: 3,
  //         },
  //         {
  //           sql: "ALTER TABLE `t_attachment` ADD COLUMN `remark` varchar(255) NULL COMMENT '备注';",
  //           error: [],
  //           code: [Array],
  //           errorReasonSql: '',
  //           id: 4,
  //         },
  //         {
  //           sql: "ALTER TABLE `t_attachment` ADD COLUMN `sourceSystem` varchar(255) NULL COMMENT '来源系统';",
  //           error: [],
  //           code: [Array],
  //           errorReasonSql: '',
  //           id: 5,
  //         },
  //         {
  //           sql: "ALTER TABLE `t_attachment` ADD COLUMN `path` varchar(255) NULL COMMENT '文件路径';",
  //           error: [],
  //           code: [Array],
  //           errorReasonSql: '',
  //           id: 6,
  //         },
  //         {
  //           sql: "ALTER TABLE `t_attachment` ADD COLUMN `isFolder` tinyint(1) NULL COMMENT '是否是文件夹';",
  //           error: [],
  //           code: [Array],
  //           errorReasonSql: '',
  //           id: 7,
  //         },
  //         {
  //           sql: "ALTER TABLE `t_attachment` ADD COLUMN `size` int(11) NULL COMMENT '文件大小';",
  //           error: [],
  //           code: [Array],
  //           errorReasonSql: '',
  //           id: 8,
  //         },
  //       ],
  //     },
  //   ]
  //   expect(result).toStrictEqual(expectResult)
  // })
})
