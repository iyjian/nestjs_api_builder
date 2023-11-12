import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { BaseService } from './../../../core'
import { User } from './../entities/user.entity'
import {
  FindAllUserRequestDTO,
  FindOneUserRequestDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from './../dto/user.request.dto'

@Injectable()
export class UserService extends BaseService {
  private readonly include: any[]
  private readonly includeForOne: any[]

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly mysql: Sequelize,
  ) {
    super()
    this.include = []
    this.includeForOne = []
  }

  async create(
    createUserRequest: CreateUserRequestDTO,
    transaction?: Transaction,
  ) {
    const isOuterTransaction = !!transaction
    try {
      if (!isOuterTransaction) {
        transaction = await this.mysql.transaction()
      }

      const user = await this.userModel.create(createUserRequest, {
        transaction,
      })

      if (!isOuterTransaction) {
        await transaction.commit()
        return this.findOneById(user.id)
      } else {
        return this.findOneById(user.id, transaction)
      }
    } catch (e) {
      if (!isOuterTransaction && transaction) {
        await transaction.rollback()
      }
      throw e
    }
  }

  async findAll(
    findAllUserRequest: FindAllUserRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      search,
      sort = [['id', 'desc']],
      ...payload
    } = findAllUserRequest

    const condition = this.normalizeCondition(payload)

    if (search) {
      condition[Op.or] = {}
    }

    const users = await this.userModel
      .scope(['defaultScope', 'findAll'])
      .findAndCountAll({
        where: { ...condition },
        offset: skipPaging ? undefined : (page - 1) * pageSize,
        limit: skipPaging ? undefined : pageSize,
        order: sort,
        transaction,
      })

    return users
  }

  async findOneById(id: number, transaction?: Transaction) {
    const user = await this.userModel
      .scope(['defaultScope', 'findOne'])
      .findByPk(id, {
        transaction,
      })

    return user
  }

  async findByIds(ids: number[], transaction?: Transaction) {
    const users = await this.userModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    })

    return users
  }

  async findOneByIdOrThrow(id: number, transaction?: Transaction) {
    const user = await this.userModel
      .scope(['defaultScope', 'findOne'])
      .findByPk(id, {
        transaction,
      })

    if (!user) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return user
  }

  async findOneOrThrow(
    findOneUserRequest: FindOneUserRequestDTO,
    transaction?: Transaction,
  ) {
    const user = await this.userModel
      .scope(['defaultScope', 'findOne'])
      .findOne({
        where: { ...findOneUserRequest },
        transaction,
      })

    if (!user) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return user
  }

  async findOne(
    findOneUserRequest: FindOneUserRequestDTO,
    transaction?: Transaction,
  ) {
    const user = await this.userModel
      .scope(['defaultScope', 'findOne'])
      .findOne({
        where: { ...findOneUserRequest },
        transaction,
      })

    return user
  }

  async updateById(
    id: number,
    updateUserRequest: UpdateUserRequestDTO,
    transaction?: Transaction,
  ) {
    await this.userModel.update(updateUserRequest, {
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

      await this.userModel.update(
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
