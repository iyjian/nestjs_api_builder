import { Injectable, Logger } from '@nestjs/common'
import ocr_api20210707, * as $ocr_api20210707 from '@alicloud/ocr-api20210707'
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
import * as $OpenApi from '@alicloud/openapi-client'
import * as $Util from '@alicloud/tea-util'
import { Readable } from 'stream'
import axios from 'axios'
import crypto from 'crypto'
import _ from 'lodash'
import camelCase from 'camelcase'
import { OpenAPIService } from './openai.service'
import { DataTypeReductionService } from '../codegen/services/datatype.reduction.service'
import { ConfigService } from '@nestjs/config'

type RECO = {
  word: string
  pos: [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ]
}

type RECOS = RECO[]

@Injectable()
export class AliyunApiService {
  private readonly logger = new Logger(AliyunApiService.name)
  private readonly config = new $OpenApi.Config({
    // 必填，您的 AccessKey ID
    accessKeyId: this.configService.get('aliyunAPI.accessKeyId'),
    // 必填，您的 AccessKey Secret
    accessKeySecret: this.configService.get('aliyunAPI.accessKeySecret'),
    endpoint: this.configService.get('aliyunAPI.endpoint'),
  })
  client = new ocr_api20210707(this.config)
  constructor(
    private readonly openAPIService: OpenAPIService,
    private readonly dataTypeReductionService: DataTypeReductionService,
    private readonly configService: ConfigService,
  ) {}

  async openAITranslate(
    tableName: string,
    columnCnNames: string,
  ): Promise<string> {
    const prompt = `tableName为:${tableName},字段有:${columnCnNames} 生成英文字段名,小驼峰风格`

    const result = await this.openAPIService.textCompletion(
      'text-davinci-003',
      prompt,
    )

    if (result.choices && result.choices.length > 0) {
      return result.choices[0]['text'].replace(/\n/g, '')
    }

    throw new Error(
      `openAITranslate error - tableName: ${tableName} columnCnNames: ${columnCnNames}`,
    )
  }

  /**
   * 一维数组转二维数组
   * 阿里云识别的表格图片数据是打平的一维数组，需要根据行高折叠维二维表格
   *
   * @param recos
   * @returns
   */
  public fold1DArrayTo2DArray(recos: RECOS): RECO[][] {
    // const ys = recos.map((o: any) => o.pos[0].y)
    // const shiftedYs = ys.slice(1).concat(ys[ys.length - 1])
    // const threshes = _.zip(ys, shiftedYs).map((o: any) => Math.abs(o[0] - o[1]))
    // const rowHeightThreshold = threshes.sort()[threshes.length - 1]
    const colHeight = recos[0].pos[3].y - recos[0].pos[0].y

    const result: any[] = []
    let row: any[] = []
    let preCol: any
    for (const reco of recos) {
      if (
        row.length === 0 ||
        reco.pos[0].y < preCol.pos[0].y + colHeight * 0.8
      ) {
        row.push(reco)
      } else {
        result.push(row)
        row = [reco]
      }
      preCol = reco
    }
    result.push(row)

    return result
  }

  /**
   * 阿里云表格图片识别
   *
   * @param base64Img
   * @returns
   */
  async recoTable(base64Img: string) {
    const recognizeTableOcrRequest =
      new $ocr_api20210707.RecognizeTableOcrRequest({
        body: Readable.from(Buffer.from(base64Img, 'base64')),
        needRotate: false,
        lineLess: false,
        skipDetection: false,
      })
    const runtime = new $Util.RuntimeOptions({})

    let result = await this.client.recognizeTableOcrWithOptions(
      recognizeTableOcrRequest,
      runtime,
    )

    // 图片识别的格式
    if (result.body.data) {
      const recos = JSON.parse(result.body.data).prism_wordsInfo.map(
        (reco: any) => ({
          pos: reco.pos,
          word: reco.word,
        }),
      ) as RECOS

      return recos
    }
  }

  /**
   * 计算两个线段的重合重复
   *
   * @param arr1
   * @param arr2
   * @returns
   */
  overlap(arr1: [number, number], arr2: [number, number]) {
    if (arr1[1] < arr2[0]) {
      return 0
    } else if (arr1[1] >= arr2[0] && arr1[1] <= arr2[1]) {
      return arr1[1] - Math.max(arr1[0], arr2[0])
    } else if (arr1[1] > arr2[1] && arr1[0] <= arr2[1]) {
      return arr2[1] - Math.max(arr1[0], arr2[0])
    } else {
      return 0
    }
  }

  /**
   * 给定表格的表头的某一列，以及整个数据行，匹配这一列对应的数据
   * TODO: 需要改成挑选上下两列重合度最高的
   * @param col_
   * @param cols
   */
  findClosedData(headerCol: RECO, dataRow: RECO[]): RECO | undefined {
    const wordWidth = Math.abs(headerCol.pos[1].x - headerCol.pos[0].x)
    // let minDist: number = 999
    let maxOverlap: number = -999
    let bestMatch: RECO | undefined = undefined
    for (const col of dataRow) {
      // this.logger.debug(
      //   `headerCol: ${headerCol.word} headerCol.x: ${headerCol.pos[0].x} dataCol.x: ${col.pos[0].x}`,
      // )

      const overlap = this.overlap(
        [headerCol.pos[0].x, headerCol.pos[1].x],
        [col.pos[0].x, col.pos[1].x],
      )
      // const dist = Math.abs(col.pos[0].x - headerCol.pos[0].x)
      // if (dist < wordWidth) {
      //   if (dist < minDist) {
      //     bestMatch = col
      //   }
      // }
      if (overlap > maxOverlap) {
        bestMatch = col
        maxOverlap = overlap
      }
    }
    return bestMatch
  }

  /**
   * 把表格图片转化为表格定义
   *
   * @param base64Img
   * @returns
   */
  async tableImg2tableDefinition(tableName: string, base64Img: string) {
    const recos = await this.recoTable(base64Img)

    if (!recos) throw new Error('empty recos')

    const recos2D = this.fold1DArrayTo2DArray(recos)

    // 表格第一行(表头)
    const columns = recos2D[0]
      .map((col) => col.word.replace(/[^A-Za-z0-9\(\)\u4e00-\u9fa5]/g, ''))
      .filter((col) => col.trim())

    // 表格第二行(示例数据)
    const data = recos2D[0]
      .filter((col) =>
        col.word.replace(/[^A-Za-z0-9\(\)\u4e00-\u9fa5]/g, '').trim(),
      )
      .map((column) => this.findClosedData(column, recos2D[1]))

    // 中文columns
    const columnNames = columns.join(',')
    this.logger.debug(`tableImg2tableDefinition - columnNames: ${columnNames}`)

    // 英文columns(百度翻译)
    // const columnNamesTranslated = (
    //   await this.translate(columnNames)
    // ).trans_result[0].dst
    //   .split(',')
    //   .map((col: any) => camelCase(col.replace(/\s+/g, '-')))

    // 英文columns(openAI翻译)
    const columnNamesTranslated = await this.openAITranslate(
      tableName,
      columnNames,
    )

    this.logger.debug(
      `tableImg2tableDefinition - columnNamesTranslated: ${columnNamesTranslated}`,
    )

    // 组合
    const columnDefs = _.zip(
      columns,
      columnNamesTranslated.split(','),
      data.map((row) => row?.word),
    )

    const convertedColumnDefs = []

    for (const columnDef of columnDefs) {
      const dataTypeReduction = await this.dataTypeReductionService.reduction(
        columnDef[0],
        columnDef[1].trim(),
        columnDef[0],
        [columnDef[2]],
      )
      convertedColumnDefs.push({
        name: columnDef[1].trim(),
        comment: columnDef[0],
        sampleData: columnDef[2],
        dataTypeId: dataTypeReduction.length
          ? dataTypeReduction[0].dataTypeId
          : 1,
      })
    }

    this.logger.debug(
      `tableImg2tableDefinition - columnDefs: ${JSON.stringify(
        convertedColumnDefs,
      )}`,
    )
    return convertedColumnDefs
  }

  async translate(q: string) {
    const appId = this.configService.get('baiduAPI.appId')
    const appSecret = this.configService.get('baiduAPI.appSecret')
    const salt = Math.round(Math.random() * 100000).toString()
    const domain = 'electronics'
    const sign = crypto
      .createHash('md5')
      .update(appId + q + salt + domain + appSecret)
      .digest('hex')
    // 将请求参数中的 APPID(appid)， 翻译 query(q，注意为UTF-8编码)，随机数(salt)，以及平台分配的密钥(可在管理控制台查看) 按照 appid+q+salt+密钥的顺序拼接得到字符串 1。

    const result = await axios.get(
      'https://fanyi-api.baidu.com/api/trans/vip/fieldtranslate',
      {
        params: {
          q,
          from: 'auto',
          to: 'en',
          appid: appId,
          salt,
          sign,
          domain,
        },
      },
    )
    return result.data
  }
}
