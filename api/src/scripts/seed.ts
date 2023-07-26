import { Sequelize } from 'sequelize-typescript'
import { MetaDataType } from './../features/base/entities'
import 'dotenv/config'

const seeds = [
  {
    id: 0,
    dataType: 'vrelation',
    desc: '',
    mappingDataType: null,
    entityDataType: '',
    category: 'system',
    transformer: null,
  },
  {
    id: 1,
    dataType: 'int',
    desc: '',
    mappingDataType: 'number',
    entityDataType: 'INTEGER',
    category: 'number',
    transformer: 'numberTransformer',
  },
  {
    id: 2,
    dataType: 'enum',
    desc: '',
    mappingDataType: 'string',
    entityDataType: 'ENUM',
    category: 'other',
    transformer: null,
  },
  {
    id: 4,
    dataType: 'varchar(40)',
    desc: '',
    mappingDataType: 'string',
    entityDataType: 'STRING(40)',
    category: 'string',
    transformer: null,
  },
  {
    id: 5,
    dataType: 'boolean',
    desc: '',
    mappingDataType: 'boolean',
    entityDataType: 'BOOLEAN',
    category: 'other',
    transformer: 'booleanTransformer',
  },
  {
    id: 6,
    dataType: 'datetime',
    desc: '',
    mappingDataType: 'Date',
    entityDataType: 'DATE',
    category: 'date',
    transformer: 'dateTimeTransformer',
  },
  {
    id: 7,
    dataType: 'json(object)',
    desc: '',
    mappingDataType: 'any',
    entityDataType: 'JSON',
    category: 'other',
    transformer: null,
  },
  {
    id: 8,
    dataType: 'varchar(255)',
    desc: '',
    mappingDataType: 'string',
    entityDataType: 'STRING(255)',
    category: 'string',
    transformer: null,
  },
  {
    id: 10,
    dataType: 'date',
    desc: '',
    mappingDataType: 'Date',
    entityDataType: 'DATE',
    category: 'date',
    transformer: 'dateTransformer',
  },
  {
    id: 12,
    dataType: 'decimal(10,2)',
    desc: '',
    mappingDataType: 'number',
    entityDataType: 'DECIMAL(10,2)',
    category: 'number',
    transformer: 'numberTransformer',
  },
  {
    id: 13,
    dataType: 'double',
    desc: '',
    mappingDataType: 'number',
    entityDataType: 'DOUBLE',
    category: 'number',
    transformer: 'numberTransformer',
  },
  {
    id: 14,
    dataType: 'json(array)',
    desc: '',
    mappingDataType: 'any[]',
    entityDataType: 'JSON',
    category: 'other',
    transformer: null,
  },
  {
    id: 15,
    dataType: 'decimal(10,1)',
    desc: null,
    mappingDataType: 'number',
    entityDataType: 'DECIMAL(10,1)',
    category: 'number',
    transformer: 'numberTransformer',
  },
  {
    id: 16,
    dataType: 'text',
    desc: '',
    mappingDataType: 'string',
    entityDataType: 'TEXT',
    category: 'string',
    transformer: null,
  },
  {
    id: 17,
    dataType: 'bigint',
    desc: null,
    mappingDataType: 'number',
    entityDataType: 'BIGINT',
    category: 'number',
    transformer: 'numberTransformer',
  },
  {
    id: 18,
    dataType: 'virtual',
    desc: null,
    mappingDataType: 'any',
    entityDataType: 'VIRTUAL',
    category: 'system',
    transformer: null,
  },
  {
    id: 19,
    dataType: 'varchar(4000)',
    desc: null,
    mappingDataType: 'string',
    entityDataType: 'STRING(4000)',
    category: 'string',
    transformer: null,
  },
  {
    id: 20,
    dataType: 'decimal(19,4)',
    desc: null,
    mappingDataType: 'number',
    entityDataType: 'DECIMAL(19,4)',
    category: 'number',
    transformer: 'numberTransformer',
  },
]

export const run = async () => {
  const mysql = new Sequelize({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    dialect: 'mysql',
    database: process.env.MYSQL_DB,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWD,
    models: [MetaDataType],
  })

  await MetaDataType.bulkCreate(seeds)

  // const sql = `
  //   INSERT INTO t_meta_data_type (id, deleted, dataType, mappingDataType, entityDataType, \`desc\`, createdAt, updatedAt, category, transformer)
  //   VALUES
  //     (0, 0, 'vrelation', NULL, '', '', '2022-10-20 00:00:00', '2022-10-20 00:00:00', 'system', NULL),
  //     (1, 0, 'int', 'number', 'INTEGER', '', '2022-08-31 09:06:29', '2022-08-31 09:06:29', 'number', 'numberTransformer'),
  //     (2, 0, 'enum', 'string', 'ENUM', '', '2022-09-05 00:00:00', '2022-09-05 00:00:00', 'other', NULL),
  //     (4, 0, 'varchar(40)', 'string', 'STRING(40)', '', '2022-08-31 09:06:29', '2022-08-31 09:06:29', 'string', NULL),
  //     (5, 0, 'boolean', 'boolean', 'BOOLEAN', '', '2022-08-31 09:06:29', '2022-08-31 09:06:29', 'other', 'booleanTransformer'),
  //     (6, 0, 'datetime', 'Date', 'DATE', '', '2022-08-31 09:06:29', '2022-08-31 09:06:29', 'date', 'dateTimeTransformer'),
  //     (7, 0, 'json(object)', 'any', 'JSON', '', '2022-08-31 09:06:29', '2022-08-31 09:06:29', 'other', NULL),
  //     (8, 0, 'varchar(255)', 'string', 'STRING(255)', '', '2022-08-31 09:06:29', '2022-08-31 09:06:29', 'string', NULL),
  //     (10, 0, 'date', 'Date', 'DATE', '', '2022-09-06 00:00:00', '2022-09-06 00:00:00', 'date', 'dateTransformer'),
  //     (12, 0, 'decimal(10,2)', 'number', 'DECIMAL(10,2)', '', '2022-11-10 00:00:00', '2022-11-10 00:00:00', 'number', 'numberTransformer'),
  //     (13, 0, 'double', 'number', 'DOUBLE', '', '2022-11-10 00:00:00', '2022-11-10 00:00:00', 'number', 'numberTransformer'),
  //     (14, 0, 'json(array)', 'any[]', 'JSON', '', '2022-11-24 00:00:00', '2022-11-24 00:00:00', 'other', NULL),
  //     (15, 0, 'decimal(10,1)', 'number', 'DECIMAL(10,1)', NULL, '2023-01-13 00:00:00', '2023-01-13 00:00:00', 'number', 'numberTransformer'),
  //     (16, 0, 'text', 'string', 'TEXT', '', '2022-08-31 09:06:29', '2022-08-31 09:06:29', 'string', NULL),
  //     (17, 0, 'bigint', 'number', 'BIGINT', NULL, '2023-03-01 00:00:00', '2023-03-01 00:00:00', 'number', 'numberTransformer'),
  //     (18, 0, 'virtual', 'any', 'VIRTUAL', NULL, '2023-03-03 00:00:00', '2023-03-03 00:00:00', 'system', NULL);
  // `

  // try {
  //   await mysql.query(sql)
  //   console.log('seed done')
  //   process.exit(0)
  // } catch (e) {
  //   console.log(e)
  // }
}

run()
