import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { BaseService } from './../../../core'
import { DbMigrateLog } from './../entities/db.migrate.log.entity'
import {
  FindAllDbMigrateLogRequestDTO,
  FindOneDbMigrateLogRequestDTO,
  CreateDbMigrateLogRequestDTO,
  UpdateDbMigrateLogRequestDTO,
} from './../dto/db.migrate.log.request.dto'

@Injectable()
export class DbMigrateLogService extends BaseService {
  private readonly include: any[]
  private readonly includeForOne: any[]

  constructor(
    @InjectModel(DbMigrateLog)
    private readonly dbMigrateLogModel: typeof DbMigrateLog,
    private readonly mysql: Sequelize,
  ) {
    super()
    this.include = []
    this.includeForOne = []
  }

  async create(
    createDbMigrateLogRequest: CreateDbMigrateLogRequestDTO,
    transaction?: Transaction,
  ) {
    const isOuterTransaction = !!transaction
    try {
      if (!isOuterTransaction) {
        transaction = await this.mysql.transaction()
      }

      const dbMigrateLog = await this.dbMigrateLogModel.create(
        createDbMigrateLogRequest,
        { transaction },
      )

      if (!isOuterTransaction) {
        await transaction.commit()
        return this.findOneById(dbMigrateLog.id)
      } else {
        return this.findOneById(dbMigrateLog.id, transaction)
      }
    } catch (e) {
      if (!isOuterTransaction && transaction) {
        await transaction.rollback()
      }
      throw e
    }
  }

  async findAll(
    findAllDbMigrateLogRequest: FindAllDbMigrateLogRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      search,
      sort = [['id', 'desc']],
      ...payload
    } = findAllDbMigrateLogRequest

    const condition = this.normalizeCondition(payload)

    if (search) {
      condition[Op.or] = {}
    }

    const dbMigrateLogs = await this.dbMigrateLogModel
      .scope(['defaultScope', 'findAll'])
      .findAndCountAll({
        where: { ...condition },
        offset: skipPaging ? undefined : (page - 1) * pageSize,
        limit: skipPaging ? undefined : pageSize,
        order: sort,
        transaction,
      })

    return dbMigrateLogs
  }

  async findOneById(id: number, transaction?: Transaction) {
    const dbMigrateLog = await this.dbMigrateLogModel
      .scope(['defaultScope', 'findOne'])
      .findByPk(id, {
        transaction,
      })

    return dbMigrateLog
  }

  async findByIds(ids: number[], transaction?: Transaction) {
    const dbMigrateLogs = await this.dbMigrateLogModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    })

    return dbMigrateLogs
  }

  async findOneByIdOrThrow(id: number, transaction?: Transaction) {
    const dbMigrateLog = await this.dbMigrateLogModel
      .scope(['defaultScope', 'findOne'])
      .findByPk(id, {
        transaction,
      })

    if (!dbMigrateLog) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return dbMigrateLog
  }

  async findOneOrThrow(
    findOneDbMigrateLogRequest: FindOneDbMigrateLogRequestDTO,
    transaction?: Transaction,
  ) {
    const dbMigrateLog = await this.dbMigrateLogModel
      .scope(['defaultScope', 'findOne'])
      .findOne({
        where: { ...findOneDbMigrateLogRequest },
        transaction,
      })

    if (!dbMigrateLog) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return dbMigrateLog
  }

  async findOne(
    findOneDbMigrateLogRequest: FindOneDbMigrateLogRequestDTO,
    transaction?: Transaction,
  ) {
    const dbMigrateLog = await this.dbMigrateLogModel
      .scope(['defaultScope', 'findOne'])
      .findOne({
        where: { ...findOneDbMigrateLogRequest },
        transaction,
      })

    return dbMigrateLog
  }

  async updateById(
    id: number,
    updateDbMigrateLogRequest: UpdateDbMigrateLogRequestDTO,
    transaction?: Transaction,
  ) {
    await this.dbMigrateLogModel.update(updateDbMigrateLogRequest, {
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

      await this.dbMigrateLogModel.update(
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
