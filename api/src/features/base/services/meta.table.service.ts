import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { BaseService } from '../../../core'
import { Op, Sequelize, Transaction, QueryTypes } from 'sequelize'
import { Sequelize as Sequelize2 } from 'sequelize-typescript'
import {
  UpdateMetaTableRequestDTO,
  CreateMetaTableRequestDTO,
  FindAllMetaTableRequestDTO,
  MoveMetaTableRequestDTO,
  FindRelationTableRequestDTO,
} from '../dto'
import { MetaTable } from '../entities/meta.table.entity'
import { MetaColumn } from '../entities/meta.column.entity'
import { MetaProject } from '../entities/meta.project.entity'
import { MetaDataTypeService } from './meta.data.type.service'
import _ from 'lodash'
import { MetaProjectService } from './meta.project.service'
import { MetaDataType } from '../entities'
import { moveTable, findRelationTables } from '../../../scripts/moveTable'
import { MetaColumnService } from './meta.column.service'

@Injectable()
export class MetaTableService extends BaseService {
  private readonly include: any[]
  private readonly targetDBConnections: { [projectId: string]: Sequelize } = {}

  constructor(
    @InjectModel(MetaTable)
    private readonly metaTableModel: typeof MetaTable,
    private readonly metaColumnService: MetaColumnService,
    private readonly metaDataTypeService: MetaDataTypeService,
    private readonly projectService: MetaProjectService,
    private readonly mysql: Sequelize2,
  ) {
    super()
    this.include = []
  }

  async createMetaTable(
    metaTableObj: CreateMetaTableRequestDTO,
    transaction?: Transaction,
  ) {
    const metaTable = await this.metaTableModel.create(metaTableObj, {
      transaction,
    })
    return this.findOneMetaTable(metaTable.id, transaction)
  }

  async moveMetaTable(
    moveMetaTableRequestDTO: MoveMetaTableRequestDTO,
    transaction?: Transaction,
  ) {
    if (!transaction) {
      transaction = await this.mysql.transaction()
    }

    try {
      let newTables = []
      let auxiliaryTables = []

      for (const srcTableId of moveMetaTableRequestDTO.srcTableIds) {
        const srcTable = await this.findOneMetaTableSimple(srcTableId)

        if (srcTable) {
          const newRes = await moveTable(
            srcTable.id,
            moveMetaTableRequestDTO.targetProjectId,
            transaction,
          )

          await moveTable(
            srcTable.id,
            moveMetaTableRequestDTO.targetProjectId,
            transaction,
          )

          if (newRes) {
            newRes
              .filter((t) => t !== null && t !== undefined)
              .forEach((t) => {
                newTables.push(t)
              })
          }

          newTables = Array.from(new Set(newTables))

          // const findAllQueryMetaColumn = new FindAllMetaColumnRequestDTO()
          const column = await this.metaColumnService.findAll()

          let allTableIds = column.map((row) => row.tableId)

          allTableIds = Array.from(new Set(allTableIds))

          auxiliaryTables = newTables.filter(
            (value) => !allTableIds.includes(value),
          )

          // for (const auxiliaryTableId of auxiliaryTables) {
          //   await this.removeMetaTable(auxiliaryTableId)
          // }

          console.log(1111111, auxiliaryTables)
          return newTables
        } else {
          console.error(`Table ${srcTableId} not found`)
        }
      }
      transaction.commit()
    } catch (e) {
      console.log(e)
      transaction.rollback()
    }
  }

  async findRelationTable(
    findRelationTableRequestDTO: FindRelationTableRequestDTO,
    transaction?: Transaction,
  ) {
    try {
      // 将传入的 string 类，转为 string[]
      const target = findRelationTableRequestDTO.srcTableIds
      const srcTables = (target as unknown as string)
        .replace(/\[|\]|'|"/g, '')
        .split(',')

      if (!transaction) {
        transaction = await this.mysql.transaction()
      }

      const result: { [key: number]: number[] } = {}

      for (const srcTable of srcTables) {
        const srcTableId = srcTable as unknown as number
        const res = await findRelationTables(srcTableId, transaction)
        result[srcTableId] = res.uniqueRefTableIds
      }

      transaction.commit()

      return result
    } catch (e) {
      console.error(e)
      transaction.rollback()
    }
  }

  async findAllMetaTable(findAllQueryMetaTable: FindAllMetaTableRequestDTO) {
    const { page, pageSize, skipPaging, simplify, ...payload } =
      findAllQueryMetaTable

    const metaTables = await this.metaTableModel.findAndCountAll({
      distinct: true,
      where: { ...payload },
      attributes: simplify
        ? [
            'id',
            'module',
            'name',
            'comment',
            'selectDisplayColumns',
            'createdAt',
            'updatedAt',
          ]
        : undefined,
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      include: simplify
        ? undefined
        : [
            {
              model: MetaProject,
            },
            {
              model: MetaColumn,
              as: 'columns',
              separate: true,
            },
          ],
      order: [
        ['module', 'asc'],
        ['name', 'asc'],
      ],
    })

    return metaTables
  }

  async findByIdsMetaTable(ids: number[]) {
    const metaTables = await this.metaTableModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    })

    return metaTables
  }

  async findOneMetaTableSimple(id: number, transaction?: Transaction) {
    const metaTable = await this.metaTableModel.findByPk(id, {
      include: [
        {
          model: MetaProject,
        },
      ],
    })
    return metaTable
  }

  async findOneByName(name: string, projectId: number) {
    const metaTables = await this.metaTableModel.findAll({
      where: {
        name: name,
        projectId: projectId,
      },
    })

    return metaTables
  }

  async findOneMetaTable(
    id: number,
    transaction?: Transaction,
    withDefaultColumns?: boolean,
  ) {
    let metaTable = await this.metaTableModel.findByPk(id, {
      include: [
        {
          model: MetaColumn,
          as: 'columns',
          required: false,
          order: [['order', 'asc']],
          separate: true,
          include: [
            {
              model: MetaTable,
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
              required: false,
              as: 'refTable',
            },
            {
              model: MetaDataType,
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
              required: false,
              as: 'dataType',
            },
          ],
        },
        {
          model: MetaProject,
        },
      ],
      transaction,
    })

    // if (withDefaultColumns) {
    //   metaTable = JSON.parse(JSON.stringify(metaTable)) as any
    //   metaTable.columns.push([
    //     { name: 'id', comment: 'id', order: 0 },
    //     { name: 'createdAt', comment: '创建时间', order: 998 },
    //     { name: 'updatedAt', comment: '更新时间', order: 999 },
    //   ])
    // }

    return metaTable
  }

  /**
   * 用来生成代码的entity定义(较全)(无controller)
   *
   * @param id
   * @param transaction
   * @returns
   */
  async findOneTableForCodeGen(id: number, transaction?: Transaction) {
    const metaTable = await this.metaTableModel.findByPk(id, {
      include: [
        {
          model: MetaColumn,
          as: 'columns',
          required: false,
          order: [['id', 'asc']],
          separate: true,
          where: {
            isEnable: true,
          },
          include: [
            {
              model: MetaDataType,
              required: false,
              as: 'dataType',
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
            {
              model: MetaTable,
              required: false,
              as: 'refTable',
              include: [
                {
                  model: MetaProject,
                  attributes: ['baseDirectory'],
                },
              ],
            },
            {
              model: MetaTable,
              required: true,
              as: 'table',
              include: [
                {
                  model: MetaProject,
                },
              ],
            },
          ],
        },
        {
          model: MetaProject,
          required: true,
        },
      ],
      transaction,
    })
    return metaTable
  }

  async updateMetaTable(
    id: number,
    updateMetaTableDto: UpdateMetaTableRequestDTO,
    transaction?: Transaction,
  ) {
    const metaTable = await this.metaTableModel.findByPk(id)

    if (!metaTable) {
      throw new HttpException('table not found', HttpStatus.NOT_FOUND)
    }

    await this.metaTableModel.update(updateMetaTableDto, {
      where: {
        id,
      },
      transaction,
    })

    return this.findOneMetaTable(id)
  }

  async removeMetaTable(id: number, transaction?: Transaction) {
    const isOuterTransaction = !!transaction
    try {
      if (!transaction) {
        transaction = await this.mysql.transaction()
      }

      await this.metaTableModel.update(
        { isActive: null },
        {
          where: {
            id,
          },
          transaction,
        },
      )

      if (!isOuterTransaction) {
        await transaction.commit()
      }
      return true
    } catch (e) {
      if (transaction && !isOuterTransaction) {
        await transaction.rollback()
        if (e.toString() === 'Error: SequelizeForeignKeyConstraintError') {
          throw new Error('有依赖数据，无法删除')
        }
      }
      throw e
    }
  }

  /**
   * 检查tableDefinition合法性
   *
   * 1. 必须指定表名、模块、表注释
   * 2. 枚举数据类型必须指定枚举值列表(枚举值列表不能是空的)
   *
   * @param table - MetaTable - 表定义(含字段定义)
   * @returns
   */
  public async validTableDefinition(table: MetaTable): Promise<string> {
    const dataTypes = await this.metaDataTypeService.findAllMetaDataType({
      skipPaging: true,
    })

    const hashedDataTypes = _.keyBy(dataTypes.rows, (row) => row.id)

    if (!table.name || !table.module || !table.comment) {
      return '必须指定表名、模块、表注释'
    } else if (!/^t_/.test(table.name) && !/^v_/.test(table.name)) {
      return '表名必须以t_ v_开头'
    } else if (table.columns) {
      for (const column of table.columns) {
        if (
          hashedDataTypes[column.dataTypeId]['dataType'] === 'enum' &&
          !column.enumKeys
        ) {
          return '枚举数据类型必须指定枚举值列表'
        }
      }
    }
    return ''
  }
}
