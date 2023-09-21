import { Sequelize } from 'sequelize-typescript'
import 'dotenv/config'
import {
  MetaColumn,
  MetaDataType,
  MetaProject,
  MetaTable,
} from './../features/base'
import { Transaction } from 'sequelize'

async function ensureTargetTable(
  srcTableId: number,
  targetProjectId: number,
  transaction: Transaction,
): Promise<{
  isOld: boolean
  table: MetaTable
}> {
  const srcTable = await MetaTable.findByPk(srcTableId, {
    transaction,
  })

  const existingTable = await MetaTable.findOne({
    where: {
      projectId: targetProjectId,
      name: srcTable.name,
    },
    include: [
      {
        model: MetaColumn,
        as: 'columns',
        required: false,
      },
    ],
    transaction,
  })

  if (existingTable) {
    console.log(
      `table ready(old) - table: ${srcTable.name} tableId: ${existingTable.id}`,
    )
    return {
      isOld: true,
      table: existingTable,
    }
  } else {
    /**
     * 复制目标表
     */

    const targetTable = await MetaTable.create(
      {
        name: srcTable.name,
        module: srcTable.module,
        comment: srcTable.comment,
        projectId: targetProjectId,
      },
      {
        transaction,
      },
    )
    console.log(
      `table ready(new) - table: ${srcTable.name} tableId: ${targetTable.id}`,
    )
    return {
      isOld: false,
      table: targetTable,
    }
  }
}

async function moveTable(
  srcTableId: number,
  targetProjectId: number,
  transaction: Transaction,
) {
  /**
   * 查询源表信息
   */
  const srcTable = await MetaTable.findByPk(srcTableId, {
    transaction,
  })

  console.log(srcTableId)

  const { isOld, table: targetTable } = await ensureTargetTable(
    srcTableId,
    targetProjectId,
    transaction,
  )

  console.log(
    `replicate table - srcTable: ${srcTable.name} - ${srcTable.id} ---> ${targetTable.id} (${isOld})`,
  )

  const posibleRefTables = {}

  if (!targetTable.columns || targetTable.columns.length === 0) {
    /**
     * 查询源字段信息
     */
    let srcColumns = await MetaColumn.findAll({
      where: {
        tableId: srcTableId,
        deleted: false,
      },
      include: [
        {
          model: MetaTable,
          as: 'refTable',
          required: false,
        },
        {
          model: MetaColumn,
          as: 'relationColumn',
          required: false,
        },
      ],
      // 排序以保证外键字段在其衍生关系字段的前面
      order: [['id', 'asc']],
      transaction,
    })

    srcColumns = JSON.parse(JSON.stringify(srcColumns))

    /**
     * 逐个将源字段复制到目标字段
     */
    const missingRelationColumns = []

    for (const column of srcColumns) {
      let targetRelationColumn

      if (column.relationColumnId && column.refTableId) {
        const { isOld, table: refTable } = await ensureTargetTable(
          column.refTableId,
          targetProjectId,
          transaction,
        )

        if (column.relationColumn.tableId !== column.tableId) {
          /**
           * 如果关联字段关联的是其他表上的字段，则需要递归的先复制整个关联表
           */
          await moveTable(
            column.relationColumn.tableId,
            targetProjectId,
            transaction,
          )
        }

        posibleRefTables[column.refTableId] = column.refTableId

        column.refTableId = refTable.id

        const srcRelationColumn = await MetaColumn.findByPk(
          column.relationColumnId,
          { transaction },
        )

        /**
         * 查找目标表的relationColumn
         */
        targetRelationColumn = await MetaColumn.findOne({
          where: {
            tableId: column.refTableId,
            name: srcRelationColumn.name,
          },
          transaction,
        })

        if (targetRelationColumn) {
          console.log(
            `table: ${srcTable.name} column: ${column.name} - relationColumn old: ${column.relationColumn.name} new: ${targetRelationColumn.id}`,
          )
        } else {
          console.log(
            `table: ${srcTable.name} column: ${column.name} - relationColumn old: ${column.relationColumn.name} new: not present`,
          )
        }
      }

      const newColumn = await MetaColumn.create(
        {
          name: column.name,
          allowNull: column.allowNull,
          comment: column.comment,
          dataTypeId: column.dataTypeId,
          enumKeys: column.enumKeys,
          remark: column.remark,
          tableId: targetTable.id,
          defaultValue: column.defaultValue,
          isAutoGen: column.isAutoGen,
          isEnable: column.isEnable,
          order: column.order,
          refTableId: column.refTableId,
          relationColumnId: targetRelationColumn?.id,
          relation: column.relation,
          searchable: column.searchable,
          findable: column.findable,
          createable: column.createable,
          updateable: column.updateable,
        },
        {
          transaction,
        },
      )
      console.log(
        `replicate column - table: ${srcTable.name} column: ${column.name} - ${column.id} ---> ${newColumn.id}`,
      )

      if (column.refTableId && !targetRelationColumn) {
        missingRelationColumns.push({
          column,
          newColumn,
        })
      }
    }

    /**
     * 更新缺失的relationColumnId
     */
    for (const column of missingRelationColumns) {
      const srcRelationColumn = await MetaColumn.findByPk(
        column.column.relationColumnId,
        { transaction },
      )

      /**
       * 查找relationColumn
       */
      const targetRelationColumn = await MetaColumn.findOne({
        where: {
          tableId: targetTable.id,
          name: srcRelationColumn.name,
        },
        transaction,
      })

      console.log(
        `srcTable: ${srcTable.name} targetTableId: ${targetTable.id} - update relation column - srcRelation column: ${srcRelationColumn.name}`,
      )

      await column.newColumn.update(
        { relationColumnId: targetRelationColumn.id },
        { transaction },
      )
    }
  }

  console.log(
    `table fully moved - table: ${srcTable.name} new TableId: ${targetTable.id}`,
  )

  // for (const table in posibleRefTables) {
  //   if (posibleRefTables[table].tableId) {
  //     await moveTable(
  //       posibleRefTables[table].tableId,
  //       targetProjectId,
  //       transaction,
  //     )
  //   }
  // }
}

;(async () => {
  const sequelize = new Sequelize({
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    database: process.env.MYSQL_DB,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWD,
    models: [MetaTable, MetaColumn, MetaProject, MetaDataType],
    logging: false,
  })

  const srcProjectName = 'nest_sequelize_template'
  const targetProjectName = process.argv[2]
  const srcTableName = process.argv[3] // 't_attachment'

  const srcProject = await MetaProject.findOne({
    where: {
      name: srcProjectName,
    },
  })

  const srcTable = await MetaTable.findOne({
    where: {
      projectId: srcProject.id,
      name: srcTableName,
    },
  })

  const targetProject = await MetaProject.findOne({
    where: {
      name: targetProjectName,
    },
  })

  const transaction = await sequelize.transaction()

  try {
    await moveTable(srcTable.id, targetProject.id, transaction)
    // transaction.rollback()
    transaction.commit()
  } catch (e) {
    console.log(e)
    transaction.rollback()
  }
})()

/*
    set FOREIGN_KEY_CHECKS=0;
    delete from t_meta_table where projectId = 7 and name in ('t_route', 't_log');
    delete from t_meta_column where tableId in (select id from t_meta_table where projectId = 7 and name in ('t_route', 't_log'));
    set FOREIGN_KEY_CHECKS=1;

    npx ts-node src/scripts/moveTable.ts 教学资源库api t_enum
*/
