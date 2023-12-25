import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { BaseService } from './../../../core'
import { ProjectPriviledge } from './../entities/project.priviledge.entity'
import {
  FindAllProjectPriviledgeRequestDTO,
  FindOneProjectPriviledgeRequestDTO,
  CreateProjectPriviledgeRequestDTO,
  UpdateProjectPriviledgeRequestDTO,
} from './../dto/project.priviledge.request.dto'

@Injectable()
export class ProjectPriviledgeService extends BaseService {
  private readonly include: any[]
  private readonly includeForOne: any[]
  private readonly logger = new Logger(ProjectPriviledgeService.name)

  constructor(
    @InjectModel(ProjectPriviledge)
    private readonly projectPriviledgeModel: typeof ProjectPriviledge,
    private readonly mysql: Sequelize,
  ) {
    super()
    this.include = []
    this.includeForOne = []
  }

  async create(
    createProjectPriviledgeRequest: CreateProjectPriviledgeRequestDTO,
    transaction?: Transaction,
  ) {
    const isOuterTransaction = !!transaction
    try {
      if (!isOuterTransaction) {
        transaction = await this.mysql.transaction()
      }

      const projectPriviledge = await this.projectPriviledgeModel.create(
        createProjectPriviledgeRequest,
        { transaction },
      )

      if (!isOuterTransaction) {
        await transaction.commit()
        return this.findOneById(projectPriviledge.id)
      } else {
        return this.findOneById(projectPriviledge.id, transaction)
      }
    } catch (e) {
      if (!isOuterTransaction && transaction) {
        await transaction.rollback()
      }
      throw e
    }
  }

  async findAll(
    findAllProjectPriviledgeRequest: FindAllProjectPriviledgeRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      search,
      sort = [['id', 'desc']],
      ...payload
    } = findAllProjectPriviledgeRequest

    const condition = this.normalizeCondition(payload)

    if (search) {
      condition[Op.or] = {}
    }

    const projectPriviledges = await this.projectPriviledgeModel
      .scope(['defaultScope', 'findAll'])
      .findAndCountAll({
        where: { ...condition },
        offset: skipPaging ? undefined : (page - 1) * pageSize,
        limit: skipPaging ? undefined : pageSize,
        order: sort,
        transaction,
      })

    return projectPriviledges
  }

  async findOneById(id: number, transaction?: Transaction) {
    const projectPriviledge = await this.projectPriviledgeModel
      .scope(['defaultScope', 'findOne'])
      .findByPk(id, {
        transaction,
      })

    return projectPriviledge
  }

  async findByIds(ids: number[], transaction?: Transaction) {
    const projectPriviledges = await this.projectPriviledgeModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    })

    return projectPriviledges
  }

  async findOneByIdOrThrow(id: number, transaction?: Transaction) {
    const projectPriviledge = await this.projectPriviledgeModel
      .scope(['defaultScope', 'findOne'])
      .findByPk(id, {
        transaction,
      })

    if (!projectPriviledge) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return projectPriviledge
  }

  async findOneOrThrow(
    findOneProjectPriviledgeRequest: FindOneProjectPriviledgeRequestDTO,
    transaction?: Transaction,
  ) {
    const projectPriviledge = await this.projectPriviledgeModel
      .scope(['defaultScope', 'findOne'])
      .findOne({
        where: { ...findOneProjectPriviledgeRequest },
        transaction,
      })

    if (!projectPriviledge) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return projectPriviledge
  }

  async findOne(
    findOneProjectPriviledgeRequest: FindOneProjectPriviledgeRequestDTO,
    transaction?: Transaction,
  ) {
    const projectPriviledge = await this.projectPriviledgeModel
      .scope(['defaultScope', 'findOne'])
      .findOne({
        where: { ...findOneProjectPriviledgeRequest },
        transaction,
      })

    return projectPriviledge
  }

  async updateById(
    id: number,
    updateProjectPriviledgeRequest: UpdateProjectPriviledgeRequestDTO,
    transaction?: Transaction,
  ) {
    await this.projectPriviledgeModel.update(updateProjectPriviledgeRequest, {
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

      await this.projectPriviledgeModel.update(
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
