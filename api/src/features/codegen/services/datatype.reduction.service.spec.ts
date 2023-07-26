import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../../app.module'
import { DataTypeReductionService } from './datatype.reduction.service'
import path from 'path'
import fs from 'fs'
import csv from 'csv-parser'

describe('DataTypeReductionService Test', () => {
  let app: INestApplicationContext
  let dataTypeReductionService: DataTypeReductionService

  beforeEach(async () => {
    app = await NestFactory.createApplicationContext(AppModule)
    dataTypeReductionService = app.get(DataTypeReductionService)
  })

  it('correct rate should greater than 57%', async () => {
    let correct = 0
    let total = 0
    let coverage = 0

    const filePath = path.join(__dirname, `./test.csv`)

    const stream = fs.createReadStream(filePath).pipe(csv({ separator: '|' }))
    for await (const row of stream) {
      const result = await dataTypeReductionService.reduction(
        row.comment,
        row.name,
        row.comment,
        [],
      )
      if (result[0]) {
        if (result[0].dataTypeId === Number(row.dataTypeId)) {
          correct++
        } else {
          // console.log(
          //   row.comment,
          //   row.name,
          //   result[0].dataTypeId,
          //   row.dataTypeId,
          //   result[0].dataTypeId
          // )
        }
        coverage++
      }
      total++
    }
    expect(correct / total).toBeGreaterThan(0.57)
  })

  it('coverage rate should greater than 85%', async () => {
    let correct = 0
    let total = 0
    let coverage = 0

    const filePath = path.join(__dirname, `./test.csv`)

    const stream = fs.createReadStream(filePath).pipe(csv({ separator: '|' }))
    for await (const row of stream) {
      const result = await dataTypeReductionService.reduction(
        row.comment,
        row.name,
        row.comment,
        [],
      )
      if (result[0]) {
        if (result[0].dataTypeId === row.dataTypeId) {
          correct++
        }
        coverage++
      }
      total++
    }

    expect(coverage / total).toBeGreaterThan(0.85)
  })

  it('change csv to obj', async () => {
    const result = await dataTypeReductionService.parseCSV('train.csv')
    expect(result).toStrictEqual([
      {
        comment: '调拨来源',
        dataTypeId: '2',
        isRule: 'false',
        name: 'transferWay',
      },
    ])
  })

  it('test reduction datatype = string', async () => {
    const result = await dataTypeReductionService.reduction(
      '总经理',
      'account',
      '总经理',
      ['青岛'],
    )
    expect(result).toStrictEqual([{ dataTypeId: 4, possibility: 1 }])
  })

  it('test reduction datatype = int', async () => {
    const result = await dataTypeReductionService.reduction(
      '总经理',
      'account',
      '总经理',
      ['12'],
    )
    expect(result).toStrictEqual([{ dataTypeId: 1, possibility: 1 }])
  })

  it('test reduction datatype = double', async () => {
    const result = await dataTypeReductionService.reduction(
      '总经理',
      'account',
      '总经理',
      ['1.23'],
    )
    expect(result).toStrictEqual([{ dataTypeId: 12, possibility: 1 }])
  })

  it('test reduction datatype = date', async () => {
    const result = await dataTypeReductionService.reduction(
      '总经理',
      'account',
      '总经理',
      ['2023-3-8'],
    )
    expect(result).toStrictEqual([{ dataTypeId: 10, possibility: 1 }])
  })

  // it('test dataTypeId', async () => {
  //   const result = await dataTypeReductionService.reduction(
  //     '房间号',
  //     'roomNumber',
  //     '房间号',
  //     [],
  //   )
  //   console.log(result)
  // })
})
