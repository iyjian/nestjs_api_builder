import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import configuration from '../../../config/configuration'
import { MetaDataType } from '../../base'
import { GitService } from '../../coding'
import { CodegenEntityService } from './codegen.entity.service'
import { CodegenUtilService } from './codegen.util.service'
import { TSMorphService } from './tsmorph.service'
import { AppModule } from '../../../app.module'
import { NestFactory } from '@nestjs/core'
import { INestApplicationContext } from '@nestjs/common'

describe('CatsController', () => {
  let codegenEntityService: CodegenEntityService
  let codegenUtilService: CodegenUtilService
  let app: INestApplicationContext

  function format(str: string) {
    return codegenUtilService.codeFormat(`class Test {${str}}`)
  }

  const dataType = {
    dataType: 'int',
    mappingDataType: 'int',
    entityDataType: 'int',
    category: 'test',
  } as MetaDataType

  const column = {
    id: 1,
    name: 'test',
    allowNull: false,
    comment: 'test comment',
    // 计算字段 合并了comment 和 enum key
    fullComment: 'test comment',
    defaultValue: '',
    tableId: 1,
    isAutoGen: false,
    isEnable: true,
    order: 1,
    searchable: true,
    findable: true,
    createable: true,
    updateable: true,
    dataTypeId: 1,
    dataType,
  }

  beforeEach(async () => {
    // const moduleRef = await Test.createTestingModule({
    //   imports: [
    //     ConfigModule.forRoot({
    //       load: [configuration],
    //       isGlobal: true,
    //     }),
    //   ],
    //   providers: [
    //     CodegenEntityService,
    //     GitService,
    //     CodegenUtilService,
    //     TSMorphService,
    //   ],
    // }).compile()

    // codegenEntityService =
    //   moduleRef.get<CodegenEntityService>(CodegenEntityService)
    // codegenUtilService = moduleRef.get<CodegenUtilService>(CodegenUtilService)
    app = await NestFactory.createApplicationContext(AppModule)
    codegenEntityService = app.get(CodegenEntityService)
    codegenUtilService = app.get(CodegenUtilService)
  })

  describe('gen entity member code', () => {
    it('int type', async () => {
      dataType.dataType = 'int'
      dataType.entityDataType = 'INTEGER'
      dataType.mappingDataType = 'number'

      const code = codegenEntityService.getEntityMemberCode(column)

      const expectCode = `@Column({
                          allowNull: false,
                          type: DataType.INTEGER,
                          comment: 'test comment',
                          })
                          @codeGen('1')
                          test: number`

      expect(format(code.code)).toBe(format(expectCode))
    })

    it('string type', async () => {
      dataType.dataType = 'varchar(40)'
      dataType.entityDataType = 'STRING(40)'
      dataType.mappingDataType = 'string'

      const code = codegenEntityService.getEntityMemberCode(column)

      const expectCode = `@Column({
                          allowNull: false,
                          type: DataType.STRING(40),
                          comment: 'test comment',
                          })
                          @codeGen('1')
                          test: string`

      expect(format(code.code)).toBe(format(expectCode))
    })

    it('TEXT type', async () => {
      dataType.dataType = 'text'
      dataType.entityDataType = 'TEXT'
      dataType.mappingDataType = 'string'

      const code = codegenEntityService.getEntityMemberCode(column)

      const expectCode = `@Column({
                          allowNull: false,
                          type: DataType.TEXT,
                          comment: 'test comment',
                          })
                          @codeGen('1')
                          test: string`

      expect(format(code.code)).toBe(format(expectCode))
    })

    it('test ensureScope', async () => {
      const entityContent = `
      import {
        Table,
        Column,
        DataType,
        BelongsTo,
        ForeignKey,
        Scopes,
      } from 'sequelize-typescript'
      import { BaseModel, codeGen } from './../../../core'
      import { ExcursionPort } from './'
      
      @Table({
        tableName: 't_excursion_products',
        comment: '景点产品',
      })
      @Scopes(() => ({
        findAll: {
          include: [
            {
              model: ExcursionPort,
              as: 'sightseeingPort',
              required: false,
            },
          ],
        },
      }))
      export class ExcursionProducts extends BaseModel<ExcursionProducts> {
        @Column({
          allowNull: false,
          type: DataType.INTEGER,
          comment: '景点产品编号',
        })
        @codeGen('6917')
        excursionProductNo: number
        @Column({
          allowNull: true,
          type: DataType.TEXT,
          comment: '景点介绍',
        })
        @codeGen('6924')
        scenicIntroduction?: string
      }`
      const result = await codegenEntityService.ensureScope(
        entityContent,
        'findAll',
        `{
          model: ExcursionPort2,
          as: \"sightseeingPort2\",
          required: false
        }`,
      )

      const strictResult = `
      import {
        Table,
        Column,
        DataType,
        BelongsTo,
        ForeignKey,
        Scopes,
      } from 'sequelize-typescript'
      import { BaseModel, codeGen } from './../../../core'
      import { ExcursionPort } from './'

      @Table({
        tableName: 't_excursion_products',
        comment: '景点产品',
      })
      @Scopes(() => ({
        findAll: {
          include: [
            {
              model: ExcursionPort,
              as: 'sightseeingPort',
              required: false,
            },
          ],
        },
      }))
      export class ExcursionProducts extends BaseModel<ExcursionProducts> {
        @Column({
          allowNull: false,
          type: DataType.INTEGER,
          comment: '景点产品编号',
        })
        @codeGen('6917')
        excursionProductNo: number
        @Column({
          allowNull: true,
          type: DataType.TEXT,
          comment: '景点介绍',
        })
        @codeGen('6924')
        scenicIntroduction?: string
      }
      `
      expect(codegenUtilService.codeFormat(result)).toStrictEqual(
        codegenUtilService.codeFormat(strictResult),
      )
    })
  })
})
