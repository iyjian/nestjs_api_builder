import { Injectable } from '@nestjs/common'
import path from 'path'
import fs from 'fs'
import csv from 'csv-parser'
import _ from 'lodash'

export type SYNC_RESULT = { dataTypeId: number; possibility: number }

type COLUMN_DEFINITION = {
  name: string
  comment: string
  dataTypeId: number
  isRule: boolean
}

@Injectable()
export class DataTypeReductionService {
  /**
   *  读取csv,将csv数据转换成对象
   */
  public async parseCSV(fileName: string): Promise<COLUMN_DEFINITION[]> {
    let resObj: COLUMN_DEFINITION[] = []
    const filePath = path.join(__dirname, `./${fileName}`)

    const stream = fs.createReadStream(filePath).pipe(csv({ separator: '|' }))
    for await (const row of stream) {
      resObj.push(row)
    }

    return resObj
  }

  /**
   *  判断表达式
   */
  private expression(source: string, compare: string, type: number): boolean {
    return type === 1
      ? source != '' && source === compare
      : source != '' && compare.includes(source)
  }

  /**
   *  字段类型推导方法(无controller)
   *  @param cnName 字段中文名
   *  @param enName 字段英文名
   *  @param comment 字段说明
   *  @param sample 样例数据
   */
  public async reduction(
    cnName: string,
    enName: string,
    comment: string,
    samples?: string[],
  ): Promise<SYNC_RESULT[]> {
    // 定义返回的json
    let resObjs: SYNC_RESULT[] = []

    if (!cnName || !comment || !enName) {
      return []
    }

    // 读取rule数据
    const definitions = await this.parseCSV('rule.csv')

    // 根据推导算法计算每个可能dataTypeId的权重值
    for (const definition of definitions) {
      let possibility: number = 0

      const flagArr = [
        this.expression(definition.name, enName, 1),
        this.expression(definition.comment, cnName, 1),
        this.expression(definition.comment, comment, 1),
        this.expression(definition.comment, cnName, 0),
        this.expression(definition.comment, comment, 0),
        this.expression(definition.name, enName, 0),
      ]
      // 为每种规则分配权重值
      if (!definition.isRule) {
        possibility += flagArr[0] ? 0.5 : 0
        possibility += flagArr[1] ? 0.3 : 0
        possibility += flagArr[2] ? 0.3 : 0
        possibility += flagArr[0] && flagArr[2] ? 100 : 0
      } else {
        possibility += flagArr[3] ? 10 : 0
        possibility += flagArr[4] ? 10 : 0
        possibility += flagArr[5] ? 10 : 0
      }
      // 如果权重值不为0，则添加到数组中
      if (possibility) {
        resObjs.push({
          dataTypeId: Number(definition.dataTypeId),
          possibility,
        })
      }
    }

    // 根据样例数据判断是字符串还是数值
    if (!resObjs[0]) {
      resObjs.push({
        dataTypeId: this.dataTypeJudgment(samples[0]),
        possibility: 1,
      })
    }

    // 对结果按照dataTypeId进行分组
    _.sumBy(resObjs, 'dataTypeId')

    // 对结果按possibility降序排列
    resObjs.sort((a, b) => {
      return b.possibility - a.possibility
    })

    return resObjs
  }

  /**
   *  根据字符串内容判断内容的数据类型
   */
  public dataTypeJudgment(str: string): number {
    // 默认为字符串类型
    let dataTypeId = 4
    if (!_.isNaN(+str)) {
      // 数值类型判断
      dataTypeId = 1
      if (str.includes('.')) {
        // 浮点型判断
        dataTypeId = 12
      }
    } else if (!isNaN(new Date(str).getTime())) {
      // 日期类型判断
      dataTypeId = 10
    }

    return dataTypeId
  }
}
