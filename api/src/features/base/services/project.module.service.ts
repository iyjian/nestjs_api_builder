import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { BaseService } from '../../../core'
import { ProjectModule } from '../entities'
import {
  FindAllProjectModuleRequestDTO,
  FindOneProjectModuleRequestDTO,
  CreateProjectModuleRequestDTO,
  UpdateProjectModuleRequestDTO,
} from '../dto'

@Injectable()
export class ProjectModuleService extends BaseService {
  private readonly include: any[]

  constructor(
    @InjectModel(ProjectModule)
    private readonly projectModuleModel: typeof ProjectModule,
    private readonly mysql: Sequelize,
  ) {
    super()
    this.include = []
  }

  async create(
    createProjectModuleRequest: CreateProjectModuleRequestDTO,
    transaction?: Transaction,
  ) {
    const isOuterTransaction = !!transaction
    try {
      if (!isOuterTransaction) {
        transaction = await this.mysql.transaction()
      }

      const projectModule = await this.projectModuleModel.create(
        createProjectModuleRequest,
        { transaction },
      )

      if (!isOuterTransaction) {
        await transaction.commit()
      }

      return this.findOneById(projectModule.id)
    } catch (e) {
      if (!isOuterTransaction && transaction) {
        await transaction.rollback()
      }
      throw e
    }
  }

  async findAll(
    findAllProjectModuleRequest: FindAllProjectModuleRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      search,
      sort = [['id', 'desc']],
      ...payload
    } = findAllProjectModuleRequest

    const condition = this.normalizeCondition(payload)

    if (search) {
      condition[Op.or] = {
        code: { [Op.like]: `%${search}%` },
      }
    }

    const projectModules = await this.projectModuleModel.findAndCountAll({
      where: { ...condition },
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      include: this.include,
      order: sort,
      transaction,
    })

    return projectModules
  }

  async findByIds(ids: number[], transaction?: Transaction) {
    const projectModules = await this.projectModuleModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    })

    return projectModules
  }

  async findOneById(id: number, transaction?: Transaction) {
    const projectModule = await this.projectModuleModel.findByPk(id, {
      include: this.include,
      transaction,
    })

    if (!projectModule) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return projectModule
  }

  async findOne(
    findOneProjectModuleRequest: FindOneProjectModuleRequestDTO,
    transaction?: Transaction,
  ) {
    const projectModule = await this.projectModuleModel.findOne({
      where: { ...findOneProjectModuleRequest },
      include: this.include,
      transaction,
    })

    if (!projectModule) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return projectModule
  }

  async updateById(
    id: number,
    updateProjectModuleRequest: UpdateProjectModuleRequestDTO,
    transaction?: Transaction,
  ) {
    await this.projectModuleModel.update(updateProjectModuleRequest, {
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

      await this.projectModuleModel.update(
        { deleted: null },
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
