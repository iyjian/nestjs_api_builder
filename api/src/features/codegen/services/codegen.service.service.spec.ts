import { CodegenServiceService } from './codegen.service.service'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../../app.module'
import {
  MetaColumn,
  MetaProject,
  MetaTable,
  MetaTableService,
} from '../../base'
import { Sequelize } from 'sequelize-typescript'
import { CACHE_MANAGER, INestApplicationContext } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CodegenUtilService } from './codegen.util.service'

describe('CodeGenServiceService Test', () => {
  let codegenServiceService: CodegenServiceService
  let codegenUtilService: CodegenUtilService
  let metaTableService: MetaTableService
  let mysql: Sequelize
  let cache: Cache
  let app: INestApplicationContext

  beforeEach(async () => {
    app = await NestFactory.createApplicationContext(AppModule)

    codegenServiceService = app.get<CodegenServiceService>(
      CodegenServiceService,
    )

    codegenUtilService = app.get<CodegenUtilService>(CodegenUtilService)

    metaTableService = app.get<MetaTableService>(MetaTableService)

    mysql = app.get<Sequelize>(Sequelize)

    cache = app.get<Cache>(CACHE_MANAGER)
  })

  describe('ensure search condition', () => {
    it('should refresh', () => {
      const sourceCode = `
        class TestService {
          findAll (search: string) {
            const condition = {}
            if (search) {
              condition[Op.or] = {
                customKey: {
                  [Op.like]: \`%\${search}%\`
                },
                test2: {
                  [Op.like]: \`%\${search}%\`
                }
              }
            }
          }
        }`

      const project = {
        name: 'test',
        repo: 'test',
        repoId: 1,
        version: 2,
        strictRequest: false,
      } as MetaProject

      const columns = [
        {
          name: 'test1',
          searchable: true,
        },
        {
          name: 'test2',
          searchable: false,
        },
      ] as MetaColumn[]

      const table = {
        id: 1,
        name: 'test',
        module: 'test',
        comment: '',
        projectId: 1,
        project,
        className: 'Test',
        moduleDirectory: '',
        moduleFilePath: '',
        entityDirectory: '',
        DTODirectory: '',
        serviceDirectory: '',
        controllerDirectory: '',
        instanceName: '',
        pluralName: '',
        dotName: '',
        serviceFileName: '',
        controllerFileName: '',
        serviceFilePath: '',
        controllerFilePath: '',
        entityFilePath: '',
        dtoFilePath: '',
        createDTOClass: '',
        updateDTOClass: '',
        findAllDTOClass: '',
        findOneDTOClass: '',
        columns,
      } as MetaTable

      const result = codegenServiceService.ensureSearchConditions(
        sourceCode,
        table,
      )
      // console.log('-----------111111111-------------')
      // console.log(result)
      // console.log('-----------111111111-------------')

      const expectResult = `class TestService {
                              findAll(search: string) {
                                const condition = {}
                                if (search) {
                                  condition[Op.or] = {
                                    customKey: {
                                      [Op.like]: \`%\${search}%\`,
                                    },
                                    test1: { [Op.like]: \`%\${search}%\` },
                                  }
                                }
                              }
                            }`
      // console.log(expectResult)
      expect(result).toBe(codegenUtilService.codeFormat(expectResult))
    })

    it('test getEntityImportsForEntity', async () => {
      // TODO 本测试用例需根据数据库具体情况实时更新 By xiaoC
      // 获取MetaTable
      const table: MetaTable = await metaTableService.findOneMetaTable(305)
      const result = await codegenServiceService.getEntityImportsForService(
        table,
        true,
      )
      const expectResult = {
        './': {
          identifiers: [
            'Device',
            'DeviceTemplate',
            'LocationConfig',
            'Location',
          ],
        },
        './../../enum': {
          identifiers: ['Enum'],
        },
      }
      expect(JSON.stringify(result, null, 2)).toBe(
        JSON.stringify(expectResult, null, 2),
      )
    })
  })

  afterAll(async () => {
    await mysql.close()
    ;(cache.store as any).getClient().disconnect()
    await app.close()
  })
})
