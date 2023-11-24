import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { BaseService } from '../../../core'
import { Op, Transaction } from 'sequelize'
import {
  UpdateMetaColumnRequestDTO,
  CreateMetaColumnRequestDTO,
  FindAllMetaColumnRequestDTO,
} from '../dto'
import { MetaColumn } from '../entities/meta.column.entity'
import { MetaTable } from '../entities/meta.table.entity'
import { MetaProject } from '../entities/meta.project.entity'
import { Sequelize } from 'sequelize-typescript'
import { MetaDataType } from '../entities'

@Injectable()
export class MetaColumnService extends BaseService {
  private readonly include: any[]

  constructor(
    @InjectModel(MetaColumn)
    private readonly metaColumnModel: typeof MetaColumn,
    private readonly mysql: Sequelize,
  ) {
    super()

    this.include = []
  }

  /**
   * 新建column, 如果没有指定column的order,则默认用最大的order
   * @param metaColumnObj
   * @param transaction
   * @returns
   */
  async createMetaColumn(
    metaColumnObj: CreateMetaColumnRequestDTO,
    transaction?: Transaction,
  ) {
    if (!metaColumnObj.order) {
      const lastColumn = await this.metaColumnModel.findOne({
        where: {
          tableId: metaColumnObj.tableId,
        },
        order: [['order', 'desc']],
        transaction,
      })
      metaColumnObj.order = lastColumn ? lastColumn.order + 1 : 1
    }

    const metaColumn = await this.metaColumnModel.create(metaColumnObj, {
      transaction,
    })
    return this.findOneMetaColumnById(metaColumn.id, transaction)
  }

  async createMetaColumns(
    columns: CreateMetaColumnRequestDTO[],
    transaction: Transaction,
  ) {
    await this.metaColumnModel.bulkCreate(columns, { transaction })
    return true
  }

  /**
   * 找HasMany的关系，比如A BelongsTo B on columnId，则找有没有B HasMany A的关系
   *
   * @param refTableId
   * @param columnId
   * @param transaction
   * @returns
   */
  findOppositeRelation(
    refTableId: number,
    columnId: number,
    transaction?: Transaction,
  ) {
    return this.metaColumnModel.findOne({
      where: {
        tableId: refTableId,
        relationColumnId: columnId,
        relation: '2',
      },
      transaction,
    })
  }

  async findColumnsByTableId(tableId: number, transaction?: Transaction) {
    const metaColumns = await this.metaColumnModel.findAll({
      where: { tableId },
      order: [['order', 'asc']],
      include: [
        {
          model: MetaDataType,
          as: 'dataType',
        },
      ],
      transaction,
    })

    return metaColumns
  }

  async findRelationColumns(tableId: number) {
    return this.metaColumnModel.findAll({
      where: {
        tableId,
        dataTypeId: 0,
        isEnable: true,
      },
      include: [
        {
          model: MetaTable,
          required: true,
          as: 'refTable',
        },
      ],
    })
  }

  async findAllMetaColumnSimple(
    findAllQueryMetaColumn: FindAllMetaColumnRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      projectId,
      ...payload
    } = findAllQueryMetaColumn

    const condition = this.normalizeCondition(payload)

    return this.metaColumnModel.findAll({
      where: { ...condition },
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      transaction,
      include: [
        {
          model: MetaDataType,
          required: true,
          as: 'dataType',
        },
        {
          model: MetaTable,
          required: true,
          as: 'table',
        },
      ],
    })
  }

  async findAll() {
    const metaColumns = await this.metaColumnModel.findAll({
      where: { isActive: true },
    })

    return metaColumns
  }

  async findAllMetaColumn(
    findAllQueryMetaColumn: FindAllMetaColumnRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      projectId,
      ...payload
    } = findAllQueryMetaColumn

    const condition = this.normalizeCondition(payload)

    const metaColumns = await this.metaColumnModel.findAndCountAll({
      where: { ...condition },
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      include: [
        {
          model: MetaTable,
          as: 'table',
          where: projectId ? { projectId } : {},
          include: [
            {
              model: MetaProject,
            },
            {
              model: MetaColumn,
              as: 'columns',
            },
          ],
        },
        {
          model: MetaTable,
          required: false,
          as: 'refTable',
          include: [
            {
              model: MetaColumn,
              as: 'columns',
            },
          ],
        },
        {
          model: MetaDataType,
          required: false,
        },
      ],
      order: [['order', 'asc']],
      transaction,
    })

    return metaColumns
  }

  /**
   * 查询所有的字段(不包含禁用的关系)
   *
   * @param findAllQueryMetaColumn - FindAllMetaColumnDto
   * @returns
   */
  async findEnabledMetaColumns(
    findAllQueryMetaColumn: FindAllMetaColumnRequestDTO,
  ): Promise<MetaColumn[]> {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      projectId,
      ...payload
    } = findAllQueryMetaColumn

    const condition = {
      isEnable: true,
      ...payload,
    }

    const metaColumns = await this.metaColumnModel.findAll({
      attributes: [
        'id',
        'tableId',
        'refTableId',
        'allowNull',
        'relation',
        'dataTypeId',
      ],
      where: { ...condition },
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      include: [
        {
          model: MetaTable,
          as: 'table',
          attributes: {
            include: ['id', 'name'],
          },
          where: projectId ? { projectId } : {},
        },
        {
          model: MetaTable,
          required: false,
          as: 'refTable',
          attributes: {
            include: ['id', 'name'],
          },
        },
      ],
      order: [['order', 'asc']],
    })

    return metaColumns
  }

  async findByIdsMetaColumn(ids: number[]) {
    const metaColumns = await this.metaColumnModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    })

    return metaColumns
  }

  async findOneMetaColumnById(id: number, transaction?: Transaction) {
    const metaColumn = await this.metaColumnModel.findByPk(id, {
      include: [
        {
          model: MetaTable,
          as: 'table',
        },
        {
          model: MetaTable,
          as: 'refTable',
          required: false,
        },
        {
          model: MetaDataType,
          as: 'dataType',
          required: true,
        },
      ],
      transaction,
    })
    return metaColumn
  }

  async findOneMetaColumn(
    findAllQueryMetaColumn: FindAllMetaColumnRequestDTO,
    transaction?: Transaction,
  ) {
    const metaColumn = await this.metaColumnModel.findOne({
      where: { ...findAllQueryMetaColumn },
      transaction,
    })
    return metaColumn
  }

  async updateMetaColumn(
    id: number,
    updateMetaColumnDto: UpdateMetaColumnRequestDTO,
    transaction?: Transaction,
  ) {
    return this.metaColumnModel.update(updateMetaColumnDto, {
      where: {
        id,
      },
      transaction,
    })
  }

  /**
   * 根据tableId, 软删除表上的所有字段
   *
   * @param tableId
   * @param transaction
   * @returns
   */
  async removeMetaColumns(tableId: number, transaction?: Transaction) {
    await this.metaColumnModel.destroy({
      where: {
        tableId,
      },
      transaction,
    })
    return true
  }

  /**
   * 删除与columnId相关的columns, 被删除的column不能依赖其他column(或者是已经被解除依赖了)。
   *
   * @param columnId
   * @param transaction
   */
  async removeRelatedColumns(columnId: number, transaction?: Transaction) {
    const isOuterTransaction = !!transaction
    try {
      if (!transaction) {
        transaction = await this.mysql.transaction()
      }

      await this.metaColumnModel.destroy({
        where: {
          relationColumnId: columnId,
        },
        transaction,
      })

      if (!isOuterTransaction) {
        await transaction.commit()
      }

      return true
    } catch (e: any) {
      if (transaction && !isOuterTransaction) {
        await transaction.rollback()
        if (e.name === 'SequelizeForeignKeyConstraintError') {
          throw new Error('有依赖数据，无法删除')
        }
      }
      throw e
    }
  }

  /**
   * 硬删除字段 如果该字段有其他字段引用则强行删除
   *
   * @param id
   * @param transaction
   * @returns
   */
  async removeMetaColumnCascade(columnId: number, transaction?: Transaction) {
    const isOuterTransaction = !!transaction
    try {
      if (!transaction) {
        transaction = await this.mysql.transaction()
      }

      const relatedColumns = await this.metaColumnModel.findAll({
        where: {
          relationColumnId: columnId,
        },
      })

      if (relatedColumns && relatedColumns.length > 0) {
        for (const relatedColumn of relatedColumns) {
          await relatedColumn.update(
            { relationColumnId: null },
            { transaction },
          )
        }
      }

      await this.metaColumnModel.destroy({
        where: {
          id: columnId,
        },
        transaction,
      })

      for (const relatedColumn of relatedColumns) {
        await relatedColumn.destroy({ transaction })
      }

      if (!isOuterTransaction) {
        await transaction.commit()
      }

      return true
    } catch (e: any) {
      if (transaction && !isOuterTransaction) {
        await transaction.rollback()
        if (e.name === 'SequelizeForeignKeyConstraintError') {
          throw new Error('有依赖数据，无法删除')
        }
      }
      throw e
    }
  }
}
