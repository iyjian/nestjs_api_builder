import { CodegenUtilService } from './codegen.util.service'
import { Project } from 'ts-morph'
import { Code } from '../../../core/interfaces/CodeType'
import { INestApplicationContext } from '@nestjs/common'
import { AppModule } from '../../../app.module'
import { NestFactory } from '@nestjs/core'
import { MetaTable } from '../../base'

describe('CodeGenUtilService', () => {
  let app: INestApplicationContext
  let codegenUtilService: CodegenUtilService

  beforeEach(async () => {
    app = await NestFactory.createApplicationContext(AppModule)
    codegenUtilService = app.get<CodegenUtilService>(CodegenUtilService)
  })

  describe('code gen utils test', () => {
    it('format typescript chaining operator', async () => {
      const code = `
        class test {
          a?: int
        }
      `
      codegenUtilService.codeFormat(code)
    })

    it('get class property position by property name', async () => {
      const project = new Project({})

      const code = `class test {
  a?: int

  b: string
}
`
      const sourceFile = project.createSourceFile('/dummy', code)
      const pos = codegenUtilService.getInsertPosByLineNum(sourceFile, 4)
      expect(pos).toBe(35)
    })

    it('generate index.ts from scratch', async () => {
      const codes = [
        {
          content: `export class testA{}
                    export class testB{}
                    class testC{}`,
          originContent: '',
          path: `src/test1.ts`,
          label: `enty`,
          isExist: true,
        },
        {
          content: `export class testD{}
                    export class testE{}
                    class testF{}`,
          originContent: '',
          path: `src/test2.ts`,
          label: `enty`,
          isExist: true,
        },
      ] as Code[]
      const indexFileContent = codegenUtilService.updateIndexFile(
        'src/',
        codes,
        '',
      )
      expect(indexFileContent).toEqual(
        `export { testA, testB } from './test1'\nexport { testD, testE } from './test2'\n`,
      )
    })

    it('update index.ts', async () => {
      const codes = [
        {
          content: `export class testA{}
                    export class testB{}
                    class testC{}`,
          originContent: '',
          path: `src/test1.ts`,
          label: `enty`,
          isExist: true,
        },
        {
          content: `export class testD{}
                    export class testE{}
                    class testF{}`,
          originContent: '',
          path: `src/test2.ts`,
          label: `enty`,
          isExist: true,
        },
      ] as Code[]
      const indexFileContent = codegenUtilService.updateIndexFile(
        'src/',
        codes,
        `export { testA } from './test1`,
      )
      expect(indexFileContent).toEqual(
        `export { testA, testB } from './test1'\nexport { testD, testE } from './test2'\n`,
      )
    })

    it('tidy up imports correctly', () => {
      const content = codegenUtilService.ensureImports(
        `import {a} from './test1';
         import {c, d} from './test2';
         import * as e from './test3'`,
        {
          './test4': {
            identifiers: ['e', 'f'],
          },
          './test1': {
            identifiers: ['a', 'b'],
          },
        },
      )
      expect(content).toEqual(
        `import { a, b } from './test1'\nimport { c, d } from './test2'\nimport * as e from './test3'\nimport { e, f } from './test4'\n`,
      )
    })

    it('should correct even if ensure import twice', () => {
      let content = codegenUtilService.ensureImports(
        `import {a} from './test1';
         import {c, d} from './test2';
         import * as e from './test3'`,
        {
          './test4': {
            identifiers: ['e', 'f'],
          },
        },
      )
      content = codegenUtilService.ensureImports(content, {
        './test1': {
          identifiers: ['a', 'b'],
        },
      })

      expect(content).toEqual(
        `import { a, b } from './test1'\nimport { c, d } from './test2'\nimport * as e from './test3'\nimport { e, f } from './test4'\n`,
      )
    })

    it('should add missing controllers property to module decorator', () => {
      const sourceFile = `@Module({
            imports: [
              SequelizeModule.forFeature([
                Attachment,
              ]),
            ],
            providers: [ I18nService ],
          })
          export class BaseModule {}`
      const expectSource = `@Module({
                            imports: [
                              SequelizeModule.forFeature([
                                Attachment,
                              ]),
                            ],
                            providers: [ I18nService ],
                            controllers: [],
                            exports: [],
                            })
                          export class BaseModule {}`

      const result = codegenUtilService.updateModuleDecorator(sourceFile)
      expect(result).toBe(codegenUtilService.codeFormat(expectSource))
    })

    it('should add missing providers property to module decorator', () => {
      const sourceFile = `
          @Module({
            imports: [
              SequelizeModule.forFeature([
                Attachment,
              ]),
            ],
            controllers: [ testController ]
          })
          export class BaseModule {}`

      const expectSource = `@Module({
                            imports: [
                              SequelizeModule.forFeature([
                                Attachment,
                              ]),
                            ],
                            controllers: [ testController ],
                            providers: [],
                            exports: [],
                            })
                          export class BaseModule {}`

      const result = codegenUtilService.updateModuleDecorator(sourceFile)
      expect(result).toBe(codegenUtilService.codeFormat(expectSource))
    })

    it('should add missing SequelizeModule.forFeature to module imports', () => {
      const sourceFile = `
          @Module({
            imports: [ testModule ],
            controllers: [ testController ]
          })
          export class BaseModule {}`

      const expectSource = `@Module({
                            imports: [
                              testModule, SequelizeModule.forFeature([]),
                            ],
                            controllers: [ testController ],
                            providers: [],
                            exports: []
                            })
                          export class BaseModule {}`
      const result = codegenUtilService.updateModuleDecorator(sourceFile)
      expect(result).toBe(codegenUtilService.codeFormat(expectSource))
    })

    it('should add missing entity to module imports', () => {
      const sourceFile = `
          @Module({
            imports: [ testModule, SequelizeModule.forFeature([ Other ]) ],
            controllers: [ testController ]
          })
          export class BaseModule {}`

      const expectSource = `@Module({
                            imports: [
                              testModule, SequelizeModule.forFeature([ Other, User ]),
                            ],
                            controllers: [ testController, testController2 ],
                            providers: [ testProvider ],
                            exports: [testProvider],
                            })
                          export class BaseModule {}`
      const result = codegenUtilService.updateModuleDecorator(
        sourceFile,
        'testController2',
        'testProvider',
        'User',
      )
      expect(result).toBe(codegenUtilService.codeFormat(expectSource))
    })

    it('should get diffs between two files', () => {
      const oldCode = `line1\nline2\n+line3\nline4`
      const newCode = `line1\nline22\n+line3\nline44`
      const result = codegenUtilService.getDiff(oldCode, newCode)
      expect(result).toEqual({
        diff:
          '===================================================================\n' +
          '--- old\n' +
          '+++ new\n' +
          '@@ -1,4 +1,4 @@\n' +
          ' line1\n' +
          '-line2\n' +
          '+line22\n' +
          ' +line3\n' +
          '\\ No newline at end of file\n' +
          '-line4\n' +
          '+line44\n' +
          '\\ No newline at end of file\n',
        changes: 4,
      })
    })

    // TODO: 需要移动到codegen.service.service.spec 里
    // it('should generate include Statement', async () => {
    //   const tableDef = {
    //     relationNodes: [
    //       {
    //         leaf: false,
    //         label: 'include',
    //         level: 0,
    //         nodeId: '0-0',
    //         include: [
    //           {
    //             as: '--employee--',
    //             leaf: false,
    //             label: 'employee: Employee  (BelongsTo)',
    //             level: 1,
    //             model: 'Employee',
    //             module: 'admin',
    //             nodeId: '0-0-6445',
    //             include: [
    //               {
    //                 as: '--department--',
    //                 leaf: true,
    //                 label: 'department: Department  (BelongsTo)',
    //                 level: 2,
    //                 model: 'Department',
    //                 module: 'admin',
    //                 nodeId: '0-0-6445-6830',
    //                 tableId: 278,
    //                 children: [],
    //                 required: false,
    //                 isChecked: true,
    //               },
    //             ],
    //             tableId: 270,
    //             required: false,
    //             isChecked: true,
    //           },
    //         ],
    //         tableId: 273,
    //         isChecked: true,
    //         parentNodeId: '',
    //       },
    //       {
    //         as: '--employee--',
    //         leaf: false,
    //         label: 'employee: Employee  (BelongsTo)',
    //         level: 1,
    //         model: 'Employee',
    //         module: 'admin',
    //         nodeId: '0-0-6445',
    //         include: [
    //           {
    //             as: '--department--',
    //             leaf: true,
    //             label: 'department: Department  (BelongsTo)',
    //             level: 2,
    //             model: 'Department',
    //             module: 'admin',
    //             nodeId: '0-0-6445-6830',
    //             tableId: 278,
    //             children: [],
    //             required: false,
    //             isChecked: true,
    //           },
    //         ],
    //         tableId: 270,
    //         required: false,
    //         isChecked: true,
    //       },
    //       {
    //         as: '--department--',
    //         leaf: true,
    //         label: 'department: Department  (BelongsTo)',
    //         level: 2,
    //         model: 'Department',
    //         module: 'admin',
    //         nodeId: '0-0-6445-6830',
    //         tableId: 278,
    //         children: [],
    //         required: false,
    //         isChecked: true,
    //       },
    //     ],
    //   } as MetaTable
    //   const result = await codegenUtilService.getIncludeStatement(tableDef)
    //   console.log(result)
    // })
  })
})
