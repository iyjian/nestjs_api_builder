import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { BaseService } from '../../../core'
import { FrontProject } from '../entities'
import {
  FindAllFrontProjectRequestDTO,
  FindOneFrontProjectRequestDTO,
  CreateFrontProjectRequestDTO,
  UpdateFrontProjectRequestDTO,
} from '../dto'

@Injectable()
export class FrontProjectService extends BaseService {
  private readonly include: any[]

  constructor(
    @InjectModel(FrontProject)
    private readonly frontProjectModel: typeof FrontProject,
    private readonly mysql: Sequelize,
  ) {
    super()
    this.include = []
  }

  async create(
    createFrontProjectRequest: CreateFrontProjectRequestDTO,
    transaction?: Transaction,
  ) {
    const isOuterTransaction = !!transaction
    try {
      if (!isOuterTransaction) {
        transaction = await this.mysql.transaction()
      }

      const frontProject = await this.frontProjectModel.create(
        createFrontProjectRequest,
        { transaction },
      )

      if (!isOuterTransaction) {
        await transaction.commit()
      }

      return this.findOneById(frontProject.id)
    } catch (e) {
      if (!isOuterTransaction && transaction) {
        await transaction.rollback()
      }
      throw e
    }
  }

  async findAll(
    findAllFrontProjectRequest: FindAllFrontProjectRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      search,
      sort = [['id', 'desc']],
      ...payload
    } = findAllFrontProjectRequest

    const condition = this.normalizeCondition(payload)

    if (search) {
      condition[Op.or] = {}
    }

    const frontProjects = await this.frontProjectModel.findAndCountAll({
      where: { ...condition },
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      include: this.include,
      order: sort,
      transaction,
    })

    return frontProjects
  }

  async findByIds(ids: number[], transaction?: Transaction) {
    const frontProjects = await this.frontProjectModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    })

    return frontProjects
  }

  async findOneById(id: number, transaction?: Transaction) {
    const frontProject = await this.frontProjectModel.findByPk(id, {
      include: this.include,
      transaction,
    })
    return frontProject
  }

  async findOne(
    findOneFrontProjectRequest: FindOneFrontProjectRequestDTO,
    transaction?: Transaction,
  ) {
    const frontProject = await this.frontProjectModel.findOne({
      where: { ...findOneFrontProjectRequest },
      include: this.include,
      transaction,
    })
    return frontProject
  }

  async updateById(
    id: number,
    updateFrontProjectRequest: UpdateFrontProjectRequestDTO,
    transaction?: Transaction,
  ) {
    await this.frontProjectModel.update(updateFrontProjectRequest, {
      where: {
        id,
      },
      transaction,
    })
    return true
  }

  async removeById(id: number, transaction?: Transaction) {
    const isOuterTransaction = !!transaction
    try {
      if (!transaction) {
        transaction = await this.mysql.transaction()
      }

      await this.frontProjectModel.update(
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
}
