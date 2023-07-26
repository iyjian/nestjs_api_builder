import { Test, TestingModule } from '@nestjs/testing'
import { AliyunApiService } from './aliyun.api.service'
import { tableReco, tableReco2 } from './testData/tableReco'
import { DataTypeReductionService } from '../codegen/services/datatype.reduction.service'
import { OpenAPIService } from './openai.service'
import { ConfigModule } from '@nestjs/config'
import configuration from './../../config/configuration'
import { CacheModule } from '@nestjs/common'

describe('AliyunController', () => {
  let aliyunApiService: AliyunApiService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
        CacheModule.register(),
        // CacheModule.registerAsync({
        //   useFactory: (configService: ConfigService) => {
        //     return {
        //       store: redisStore,
        //       host: configService.get('redis.host'),
        //       port: +configService.get<number>('redis.port'),
        //       db: +configService.get<number>('redis.db'),
        //       ttl: 0,
        //     }
        //   },
        //   inject: [ConfigService],
        //   isGlobal: true,
        // }),
      ],
      providers: [AliyunApiService, DataTypeReductionService, OpenAPIService],
    }).compile()

    aliyunApiService = module.get<AliyunApiService>(AliyunApiService)
  })

  // it('should convert 1d array to 2d array by row', () => {
  //   const result = aliyunApiService.fold1DArrayTo2DArray(
  //     tableReco.data.prism_wordsInfo.map((reco: any) => ({
  //       pos: reco.pos,
  //       word: reco.word,
  //     })),
  //   )
  //   const expectResult = [
  //     [
  //       '编号',
  //       '航次编号',
  //       '邮轮名称',
  //       '邮轮公司',
  //       '开航日期',
  //       '月',
  //       '返航日期',
  //       '天数',
  //       '行程',
  //     ],
  //     [
  //       '6',
  //       'A TO 5230101',
  //       '大西洋号',
  //       '中船嘉年华邮轮',
  //       '2023-01-01',
  //       '2023-01-05',
  //       '5天4晚',
  //       '青岛-海上巡游-青岛',
  //     ],
  //     [
  //       '5',
  //       'AT06230105',
  //       '大西洋号',
  //       '中船嘉年华邮轮',
  //       '2023-01-05',
  //       '2023-01-10',
  //       '6天5晚',
  //       '青岛-海上巡游-青岛',
  //     ],
  //   ]
  //   const resultWord = result.map((row) => row.map((col) => col.word))
  //   expect(resultWord).toStrictEqual(expectResult)
  // })

  // it('should reco tableImage correctly', async () => {
  //   const base64Str = fs
  //     .readFileSync(path.join(__dirname, './testData/tableImg2.base64'))
  //     .toString()
  //   const result = await aliyunApiService.recoTable(base64Str)
  //   expect(result).toStrictEqual(tableReco2)
  // })

  it('should convert 1d array to 2d array by row', () => {
    const result = aliyunApiService.fold1DArrayTo2DArray(tableReco2 as any)
    // const expectResult
    const resultWord = result.map((row) => row.map((col) => col.word))
    console.log(resultWord)
    // expect(resultWord).toStrictEqual(expectResult)
  })

  // it('should convert table image to table definition', async () => {
  //   const tableImgBase64 = fs
  //     .readFileSync(path.join(__dirname, './testData/tableImg.base64'))
  //     .toString()

  //   const result = await aliyunApiService.tableImg2tableDefinition(
  //     tableImgBase64,
  //   )

  //   const expectResult = [
  //     { name: 'number', comment: '编号' },
  //     { name: 'voyageNumber', comment: '航次编号' },
  //     { name: 'cruiseName', comment: '邮轮名称' },
  //     { name: 'cruiseCompany', comment: '邮轮公司' },
  //     { name: 'departureDate', comment: '开航日期' },
  //     { name: 'returnDate', comment: '返航日期' },
  //     { name: 'days', comment: '天数' },
  //     { name: 'trip', comment: '行程' },
  //   ]

  //   expect(result).toStrictEqual(expectResult)
  // })
})
