import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import {
  Project,
  Node,
  SourceFile,
  ClassDeclaration,
  OptionalKind,
  ParameterDeclarationStructure,
} from 'ts-morph'
import { MetaTable } from '../../base/entities/meta.table.entity'
import path from 'path'
import {
  Code,
  CodeType,
  DirectoryType,
} from '../../../core/interfaces/CodeType'
import { Sequelize } from 'sequelize-typescript'
import { CodegenUtilService } from './codegen.util.service'
import { GitService } from '../../coding'

@Injectable()
export class CodegenModuleService {
  private readonly logger = new Logger(CodegenModuleService.name)
  constructor(
    private readonly mysql: Sequelize,
    private readonly gitService: GitService,
    private readonly codegenUtilService: CodegenUtilService,
  ) {}

  /**
   * 初始化module文件
   *
   * @param table
   * @returns
   */
  private genModuleCodeFromScratch(table: MetaTable): string {
    const code = `
      import { Module } from '@nestjs/common'

      @Module({})
      export class ${table.moduleClassName} {}
    `
    return this.codegenUtilService.codeFormat(code)
  }

  public async updateAppModule(
    table: MetaTable,
    branch: string,
  ): Promise<Code> {
    const fileContent = await this.gitService.getFileContent(
      table.project.repoId,
      branch,
      table.appModuleFullPath,
    )

    if (fileContent.err === 404) {
      throw new HttpException(
        `未找到app.module: ${table.appModuleFullPath} 此项目可能为非法模板`,
        HttpStatus.BAD_REQUEST,
      )
    }

    let updatedAppModuleCode = this.updateModuleDecorator(
      fileContent.content,
      '',
      '',
      '',
      table.moduleClassName,
    )

    const specifier = `./${path
      .relative(path.dirname(table.appModuleFullPath), table.moduleFilePath)
      .replace(/\.ts$/, '')}`

    updatedAppModuleCode = this.codegenUtilService.ensureImports(
      updatedAppModuleCode,
      {
        [specifier]: {
          identifiers: [table.moduleClassName],
        },
      },
    )

    return {
      content: updatedAppModuleCode,
      originContent: fileContent.content,
      path: table.appModuleFullPath,
      isExist: true,
      label: 'appMdu',
    }
  }

  /**
   * 获取module.ts的文件内容
   *
   * @param table
   * @param branch
   * @returns
   */
  public async getModuleCode(table: MetaTable, branch: string): Promise<Code> {
    const fileContent = await this.gitService.getFileContent(
      table.project.repoId,
      branch,
      table.moduleFilePath,
    )

    if (fileContent.err === 404) {
      fileContent.content = this.genModuleCodeFromScratch(table)
    }

    let updatedContent = this.updateModuleDecorator(
      fileContent.content,
      `${table.className}Controller`,
      `${table.className}Service`,
      `${table.className}`,
    )

    if (table.project.version === 1) {
      updatedContent = this.codegenUtilService.ensureImports(updatedContent, {
        [`./${table.controllerFileName.replace(/\.ts$/, '')}`]: {
          identifiers: [`${table.className}Controller`],
        },
        [`./${table.serviceFileName.replace(/\.ts$/, '')}`]: {
          identifiers: [`${table.className}Service`],
        },
        [`./entities`]: {
          identifiers: [`${table.className}`],
        },
      })
    } else {
      updatedContent = this.codegenUtilService.ensureImports(updatedContent, {
        [`./controllers`]: {
          identifiers: [`${table.className}Controller`],
        },
        [`./services`]: {
          identifiers: [`${table.className}Service`],
        },
        [`./entities`]: {
          identifiers: [`${table.className}`],
        },
      })
    }

    updatedContent = this.codegenUtilService.ensureImports(updatedContent, {
      [`@nestjs/sequelize`]: {
        identifiers: [`SequelizeModule`],
      },
    })

    return {
      content: updatedContent,
      originContent: fileContent.err === 0 ? fileContent.content : '',
      path: table.moduleFilePath,
      isExist: fileContent.err === 0,
      label: 'mdu',
    }
  }

  /**
   * 在nestjs的module中新加controller, provider, entity(forFeature)
   *
   * @param fileContent - string - 原始代码内容
   * @param controller - string - controller的类名
   * @param provider - string - service的类名
   * @param entity - string - entity的类名
   * @returns
   */
  public updateModuleDecorator(
    fileContent: string,
    controller?: string,
    service?: string,
    entity?: string,
    importServiceName?: string,
  ): string {
    const project = new Project({})
    const sourceFile = project.createSourceFile('/path/dummy', fileContent)
    const class_ = sourceFile.getClasses()[0]
    const moduleDecorator = class_.getDecorator('Module')

    const moduleArgument = moduleDecorator.getArguments()[0]
    if (Node.isObjectLiteralExpression(moduleArgument)) {
      let controllersProperty = moduleArgument.getProperty('controllers')
      let providersProperty = moduleArgument.getProperty('providers')
      let importsProperty = moduleArgument.getProperty('imports')
      let exportsProperty = moduleArgument.getProperty('exports')

      if (!controllersProperty) {
        moduleArgument.addProperty('controllers: []')
        controllersProperty = moduleArgument.getProperty('controllers')
      }

      if (!providersProperty) {
        moduleArgument.addProperty('providers: []')
        providersProperty = moduleArgument.getProperty('providers')
      }

      if (!importsProperty) {
        moduleArgument.addProperty('imports: []')
        importsProperty = moduleArgument.getProperty('imports')
      }

      if (!exportsProperty) {
        moduleArgument.addProperty('exports: []')
        exportsProperty = moduleArgument.getProperty('exports')
      }

      if (!/SequelizeModule\.forFeature/.test(importsProperty.getFullText())) {
        this.logger.debug(
          'total descendants: ',
          importsProperty.getDescendants().length,
        )
        for (let child of importsProperty.getChildren()) {
          if (child.wasForgotten()) {
            continue
          }
          if (Node.isArrayLiteralExpression(child)) {
            if (entity) {
              child.addElement(`SequelizeModule.forFeature([${entity}])`)
            } else {
              child.addElement('SequelizeModule.forFeature([])')
            }
          }
        }
      }

      if (service) {
        for (let descendant of providersProperty.getChildren()) {
          if (descendant.wasForgotten()) {
            continue
          }
          if (Node.isArrayLiteralExpression(descendant)) {
            const descendants = descendant
              .getElements()
              .map((element) => element.getFullText().trim())
            if (!descendants.includes(service)) {
              descendant.addElement(service)
            }
          }
        }

        for (let descendant of exportsProperty.getChildren()) {
          if (descendant.wasForgotten()) {
            continue
          }
          if (Node.isArrayLiteralExpression(descendant)) {
            const descendants = descendant
              .getElements()
              .map((element) => element.getFullText().trim())
            if (!descendants.includes(service)) {
              descendant.addElement(service)
            }
          }
        }
      }

      if (controller) {
        for (let descendant of controllersProperty.getChildren()) {
          if (descendant.wasForgotten()) {
            continue
          }
          if (Node.isArrayLiteralExpression(descendant)) {
            const descendants = descendant
              .getElements()
              .map((element) => element.getFullText().trim())
            if (!descendants.includes(controller)) {
              descendant.addElement(controller)
            }
          }
        }
      }

      if (importServiceName) {
        for (let descendant of importsProperty.getChildren()) {
          if (descendant.wasForgotten()) {
            continue
          }
          if (Node.isArrayLiteralExpression(descendant)) {
            const descendants = descendant
              .getElements()
              .map((element) => element.getFullText().trim())
            if (!descendants.includes(importServiceName)) {
              descendant.addElement(importServiceName)
            }
          }
        }
      }

      if (entity) {
        for (let descendant of importsProperty.getChildren()) {
          if (descendant.wasForgotten()) {
            continue
          }
          if (Node.isArrayLiteralExpression(descendant)) {
            for (const element of descendant.getElements()) {
              if (Node.isCallExpression(element)) {
                const firstArgument = element.getArguments()[0]
                if (Node.isArrayLiteralExpression(firstArgument)) {
                  const descendants = firstArgument
                    .getElements()
                    .map((element) => element.getFullText().trim())
                  if (!descendants.includes(entity)) {
                    firstArgument.addElement(entity)
                  }
                }
              }
            }
          }
        }
      }
    }
    return this.codegenUtilService.codeFormat(sourceFile.getFullText())
  }
}
