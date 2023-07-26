import { Inject, Injectable } from '@nestjs/common'
import { Enum, EnumService } from '../../features/enum'
import { isArray, find, map, keyBy } from 'lodash'
import _ from 'lodash'
import { Op } from 'sequelize'

@Injectable()
export class BaseService {
  @Inject(EnumService)
  private readonly enumService: EnumService

  protected merge(
    collections1: any[],
    collections2: any[],
    leftKey: string,
    rightKey: string,
    targetKey: string,
  ) {
    const collections2Hash = keyBy(collections2, rightKey)
    return map(collections1, (collection) => {
      collection = JSON.parse(JSON.stringify(collection))
      collection[targetKey] = collections2Hash[collection[leftKey]]
      return collection
    })
  }

  /**
   * 忽略对象里的空值
   * 比如将
   * {
   *    shipIp: undefined,
   *    departmentId: null
   *    employeeId: 1
   * }
   * 转化为：
   * {
   *    employeeId: 1
   * }
   */
  protected omitEmptyProperty(obj: object): any {
    return _(obj).omitBy(_.isUndefined).omitBy(_.isNull).value()
  }

  /**
   * 递归的深度的遍历include配置，过滤掉所有的undefined：
   * include: [
   *   {
   *      model: 'testModel1',
   *      include: [undefined]
   *    },
   *    {
   *      model: 'testModel2',
   *      include: [
   *        {
   *          model: 'testModel3',
   *        }
   *      ]
   *    },
   *    undefined
   *  ]
   * 经过处理后变成：
   * include: [
   *   {
   *      model: testModel1,
   *    },
   *    {
   *      model: testModel2,
   *      include: [
   *        {
   *          model: testModel3,
   *        }
   *      ]
   *    },
   *  ]
   *
   *  应用场景：如果需要根据参数动态的决定是否要include某个model则有可能在include的地方产生一个undefined，
   *  此时sequelize无法识别这个undefined，需要过滤一下，比如以下写法：
   * include: [
   *   {
   *      model: 'testModel1',
   *      include: [needInclude ? {model: model1} : undefined]
   *    },
   *    {
   *      model: 'testModel2',
   *      include: [
   *        {
   *          model: 'testModel3',
   *        }
   *      ]
   *    },
   *    needInclude ? {model: model2} : undefined
   *  ]
   */
  protected cleanInclude(include: any[]) {
    return include
      .filter((o) => o !== undefined)
      .map((config) => {
        const item = {}
        for (const key in config) {
          if (key === 'include') {
            item[key] = this.cleanInclude(config[key])
          } else {
            item[key] = config[key]
          }
        }
        return item
      })
  }

  /**
   * 给定数组A [1, 2]  数组B [2, 3, 4]
   * 计算数组B中不存在的集合(toBeAdded) [1]
   * 计算数组B中存在A中不存在的数据(toBeDeleted) [3, 4]
   *
   * 应用场景:
   * 比如有张表trainings用来记录每个培训课程有哪些员工参加, trainings表的字段如下：
   *
   * courseId employeeId
   *    1         2
   *    1         3
   *    1         4
   *
   * 如果通过调用接口，以重新安排参加培训的员工
   * Patch /trainings payload: {courseId: 1, employeeIds: [1, 2]}
   *
   * 则需要先查询出trainings表中已有的employeeIds和新的employeeIds进行对比，
   *
   * >> 找出新增加的employeeIds以在trainings表中新增
   * >> 找出原本参加课程，现在不需要参加的employeeIds以在trainings表中删除
   */
  protected getDiffBaseOnExistingRecord(newArray: any[], existingArr: any[]) {
    const toBeAdded = _.intersection(
      _.xor(existingArr, newArray || []),
      newArray,
    )

    const toBeDeleted = _.intersection(
      _.xor(existingArr, newArray || []),
      existingArr,
    )
    return { toBeAdded, toBeDeleted }
  }

  protected normalizeCondition(payload: any) {
    const condition = _.cloneDeep(payload)

    for (const key in condition) {
      if (key.indexOf('.') !== -1) {
        condition[`\$${key}\$`] = payload[key]
        delete condition[key]
      }
    }

    for (const key in condition) {
      if (_.isPlainObject(condition[key])) {
        for (const key2 in condition[key]) {
          if (key2 === 'gte') {
            condition[key][Op.gte] = condition[key][key2]
            delete condition[key][key2]
          } else if (key2 === 'lt') {
            condition[key][Op.lt] = condition[key][key2]
            delete condition[key][key2]
          } else if (key2 === 'in') {
            condition[key][Op.in] = condition[key][key2]
            delete condition[key][key2]
          } else if (key2 === 'gt') {
            condition[key][Op.gt] = condition[key][key2]
            delete condition[key][key2]
          } else if (key2 === 'lte') {
            condition[key][Op.lte] = condition[key][key2]
            delete condition[key][key2]
          } else if (key2 === 'ne') {
            condition[key][Op.ne] = condition[key][key2]
            delete condition[key][key2]
          } else if (key2 === 'isnull') {
            if (condition[key][key2] === 'true') {
              condition[key][Op.eq] = null
            } else {
              condition[key][Op.ne] = null
            }
            delete condition[key][key2]
          }
        }
      }
    }
    return condition
  }
}
