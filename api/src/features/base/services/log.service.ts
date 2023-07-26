import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { BaseService } from './../../../core'
import { Log } from './../entities'
import {
  FindAllLogRequestDTO,
  FindOneLogRequestDTO,
  CreateLogRequestDTO,
  UpdateLogRequestDTO,
} from './../dto'

@Injectable()
export class LogService extends BaseService {
  private readonly include: any[]

  constructor(
    @InjectModel(Log)
    private readonly logModel: typeof Log,
    private readonly mysql: Sequelize,
    private readonly configService: ConfigService,
  ) {
    super()
    this.include = []
  }

  async create(
    createLogRequest: CreateLogRequestDTO,
    transaction?: Transaction,
  ) {
    const isOuterTransaction = !!transaction
    try {
      if (!isOuterTransaction) {
        transaction = await this.mysql.transaction()
      }

      const log = await this.logModel.create(createLogRequest, { transaction })

      if (!isOuterTransaction) {
        await transaction.commit()
      }

      return this.findOneById(log.id)
    } catch (e) {
      if (!isOuterTransaction && transaction) {
        await transaction.rollback()
      }
      throw e
    }
  }

  async findAll(
    findAllLogRequest: FindAllLogRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      search = '',
      sort = [['requestDate', 'desc']],
      ...payload
    } = findAllLogRequest

    const filter = []

    for (const key in payload) {
      const condition = `${key}='${payload[key]}'`
      filter.push(condition)
    }

    // const result = await this.client.index('log').search(search, {
    //   page,
    //   hitsPerPage: pageSize,
    //   filter,
    //   sort: sort ? sort.map((o) => o.join(':')) : undefined,
    // })

    // return {
    //   rows: result.hits,
    //   count: result.totalHits,
    // }
  }

  async findByIds(ids: number[], transaction?: Transaction) {
    const logs = await this.logModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    })

    return logs
  }

  async findOneById(id: string, transaction?: Transaction) {
    return this.logModel.findByPk(id)
  }

  async findOne(
    findOneLogRequest: FindOneLogRequestDTO,
    transaction?: Transaction,
  ) {
    const log = await this.logModel.findOne({
      where: { ...findOneLogRequest },
      include: this.include,
      transaction,
    })
    return log
  }

  async updateById(
    id: number,
    updateLogRequest: UpdateLogRequestDTO,
    transaction?: Transaction,
  ) {
    await this.logModel.update(updateLogRequest, {
      where: {
        id,
      },
      transaction,
    })
    return true
  }

  async updateByRequestId(
    requestId: string,
    updateLogRequest: UpdateLogRequestDTO,
    transaction?: Transaction,
  ) {
    await this.logModel.update(updateLogRequest, {
      where: {
        requestId,
      },
      transaction,
    })
    return true
  }
}
