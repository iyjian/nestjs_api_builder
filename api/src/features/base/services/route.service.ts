import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { BaseService } from './../../../core'
import { Route } from './../entities'
import {
  FindAllRouteRequestDTO,
  FindOneRouteRequestDTO,
  CreateRouteRequestDTO,
  UpdateRouteRequestDTO,
} from './../dto'
import _ from 'lodash'

@Injectable()
export class RouteService extends BaseService {
  private readonly include: any[]
  private readonly logger = new Logger(RouteService.name)

  constructor(
    @InjectModel(Route)
    private readonly routeModel: typeof Route,
    private readonly mysql: Sequelize,
  ) {
    super()
    this.include = []
  }

  async create(
    createRouteRequest: CreateRouteRequestDTO,
    transaction?: Transaction,
  ) {
    const isOuterTransaction = !!transaction
    try {
      if (!isOuterTransaction) {
        transaction = await this.mysql.transaction()
      }

      const route = await this.routeModel.create(createRouteRequest, {
        transaction,
      })

      if (!isOuterTransaction) {
        await transaction.commit()
      }

      return this.findOneById(route.id)
    } catch (e) {
      if (!isOuterTransaction && transaction) {
        await transaction.rollback()
      }
      throw e
    }
  }

  async findAll(
    findAllRouteRequest: FindAllRouteRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      search,
      sort = [['id', 'desc']],
      ...payload
    } = findAllRouteRequest

    const condition = this.normalizeCondition(payload)

    if (search) {
      condition[Op.or] = {}
    }

    const routes = await this.routeModel.findAndCountAll({
      where: { ...condition },
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      include: this.include,
      order: sort,
      transaction,
    })

    return routes
  }

  async findByIds(ids: number[], transaction?: Transaction) {
    const routes = await this.routeModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    })

    return routes
  }

  async findOneById(id: number, transaction?: Transaction) {
    const route = await this.routeModel.findByPk(id, {
      include: this.include,
      transaction,
    })
    if (!route) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }
    return route
  }

  async findOne(
    findOneRouteRequest: FindOneRouteRequestDTO,
    transaction?: Transaction,
  ) {
    const route = await this.routeModel.findOne({
      where: { ...findOneRouteRequest },
      include: this.include,
      transaction,
    })
    return route
  }

  async updateById(
    id: number,
    updateRouteRequest: UpdateRouteRequestDTO,
    transaction?: Transaction,
  ) {
    await this.routeModel.update(updateRouteRequest, {
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

      await this.routeModel.update(
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

  async loadRoute(
    routes: { key?: string; method: string; obj: string; regexp: string }[],
  ) {
    for (const [idx, route] of Object.entries(routes)) {
      const existingRoute = await this.routeModel.findOne({
        where: {
          obj: route.obj,
          method: route.method,
        },
      })
      if (!existingRoute) {
        try {
          await this.routeModel.create({
            obj: route.obj,
            method: route.method,
            isEnable: true,
            order: parseInt(idx),
            regexp: route.regexp,
          })
        } catch (e) {
          this.logger.error(`loadRoute - save error: ${e}`)
        }
      } else {
        await existingRoute.update({
          regexp: route.regexp,
          order: parseInt(idx),
          isEnable: true,
        })
      }
    }

    const existingRoutes = await this.routeModel.findAll()
    for (const existingRoute of existingRoutes) {
      if (
        _.findIndex(
          routes,
          (route) =>
            route.method.toUpperCase() === existingRoute.method.toUpperCase() &&
            route.obj === existingRoute.obj,
        ) === -1
      ) {
        await existingRoute.update({ isEnable: false })
      }
    }
  }
}
