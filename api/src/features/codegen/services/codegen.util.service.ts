import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { Code, CodeDiff } from '../../../core/interfaces/CodeType'
import * as Diff from 'diff'
import prettier from 'prettier'
import _ from 'lodash'
import {
  Project,
  Node,
  SourceFile,
  ClassDeclaration,
  OptionalKind,
  ParameterDeclarationStructure,
} from 'ts-morph'
import { MetaColumn } from '../../base/entities/meta.column.entity'
import path from 'path'
import { TSMorphService } from './tsmorph.service'
import { ExportsStruncture, ImportsStruncture } from '../types'

@Injectable()
export class CodegenUtilService {
  constructor(private readonly tsMorphService: TSMorphService) {}

  private readonly logger = new Logger(CodegenUtilService.name)

  /**
   * 使用prettier格式化代码
   *
   * @param code - 原始代码
   * @returns
   */
  public codeFormat(code: string): string {
    try {
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        trailingComma: 'all',
        semi: false,
        endOfLine: 'auto',
        parser: 'typescript',
        filepath: '/dummy/file.ts',
      })
      return formattedCode
    } catch (e) {
      const { message, loc } = e
      if (loc) {
        console.error(`Error in line ${loc.start.line}: ${message}`)
      } else {
        console.error(`Error formatting code: ${message}`)
      }
      this.logger.error('原始代码: ', code)
      throw new HttpException(
        '代码格式化出错',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  public getImportPath(from: string, to: string) {
    this.logger.debug(`getImportPath - from: ${from} to: ${to}`)
    return './' + path.relative(path.dirname(from), to)
  }

  /**
   * 假定给定的代码块 code 中不应该含有连续两个换行，则用 removeEmptyLines 方法将两个连续的换行替换为一个换行
   *
   * @param code
   * @returns
   */
  public removeEmptyLines(code: string): string {
    return (
      '\n\n\n' +
      code
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .replace(/\n+/, '\n') +
      '\n\n\n'
    )
  }

  /**
   * 获取两段文本(代码)之间的差异
   *
   * @param oldCode - string - 原始文本(代码)
   * @param newCode - string - 新文本(代码)
   * @returns
   */
  public getDiff(oldCode: string, newCode: string): CodeDiff {
    const diff = Diff.createTwoFilesPatch('old', 'new', oldCode, newCode)
    const changes = diff
      .split('\n')
      .filter(
        (line) =>
          ['+', '-'].includes(line.substring(0, 1)) &&
          !['+++', '---'].includes(line.substring(0, 3)),
      ).length
    return {
      diff,
      changes,
    }
  }

  /**
   * 生成DTO prop的定义
   * @param column - MetaColumn - 字段定义
   * @param forceOptional - boolean - 在DTO定义中，是否强制为可空的属性, 在createDTO中属性的是否为空会和实体定义的保持一致，但是在updateDTO以及findAllDTO中, 属性是强制为可空的。
   * @returns
   */
  public getDTOPropCode(
    column: MetaColumn,
    forceOptional: boolean = false,
    type: 'create' | 'update' | 'find',
    showInAPI: boolean = true,
  ) {
    let isOptional = '?'
    let code = ''
    if (!forceOptional) {
      /**
       * 如果字段允许为空或者字段有默认值则该值为可选
       */
      isOptional =
        column.allowNull ||
        (column.defaultValue !== null && column.defaultValue !== '')
          ? '?'
          : ''

      this.logger.debug(
        `getDTOPropCode - column: ${column.name} defaultValue: ${column.defaultValue}`,
      )
    }

    let swaggerProperty = `
      @codeGen('${column.id}')
      @ApiProperty({
        description: '${column.fullComment.replace(/'/g, '"')}',
        required: ${forceOptional || column.allowNull ? 'false' : 'true'}
      })`

    if (!showInAPI) {
      swaggerProperty = `\n@codeGen('${column.id}')`
    }

    // TODO: 项目模板里需要做相应配置(可参照行李的后台项目)
    const exposeDecorator = column.table.project.strictRequest
      ? `@Expose()\n`
      : ``

    const enumType =
      column.enumKeys && column.dataType.dataType === 'enum'
        ? column.enumKeys
            .split(',')
            .map((o) => `'${o}'`)
            .join('|')
        : ''

    /* prettier-ignore */
    if (( type === 'create' && !column.createable ) || ( type === 'update' && !column.updateable )) {
      code = `${swaggerProperty}
              ${column.name}?: ${enumType || column.dataType.mappingDataType}`
    } else {
      code = `${swaggerProperty}
            ${exposeDecorator}
            ${isOptional === '?' ? '' : '@IsNotEmpty()'}
            ${column.dataType.transformer ? '@Transform(getTransformer("' + column.dataType.transformer + '"))': ''}
            ${column.name}${isOptional}: ${enumType || column.dataType.mappingDataType}`
    }

    return this.removeEmptyLines(code)
  }

  /**
   * 给出代码指定行号，获取指定行号结尾行的下一行开头的位置
   *
   * 使用场景：需要从这个计算出的位置插入新的代码
   *
   * 比如以下代码, 给定行号3，返回22
   * 1 classA {
   * 2
   * 3   a: number
   * 4
   * 5 }
   *
   * @param sourceFile - string - 代码内容
   * @param lineNum - number - 给定行号
   * @returns
   */
  public getInsertPosByLineNum(
    sourceFile: SourceFile,
    lineNum: number,
  ): number {
    const sourceCode = sourceFile.getFullText()

    return (
      sourceCode
        .split(/\n/)
        .slice(0, lineNum)
        .map((line) => line.length)
        .reduce((a: number, b: number) => a + b + 1, 0) - 1
    )
  }

  /**
   * 确保类里有这个方法(没有就添加有就覆盖)
   *
   * @param code       - string                 - 源代码
   * @param className  - string                 - 类名
   * @param methodName - string                 - 方法名
   * @param parameters - {name: '', type: ''}[] - 方法的参数列表
   * @param statements - string                 - 方法内容(实现方法的代码)
   * @param returnType - string                 - 方法的返回类型
   * @returns
   */
  public ensureClassMethod(
    code: string,
    className: string,
    methodName: string,
    isAsync: boolean,
    parameters: OptionalKind<ParameterDeclarationStructure>[],
    statements: string,
    returnType?: string,
  ): string {
    const project = new Project({})

    const sourceFile = project.createSourceFile('/dummy', code)

    const classDeclaration = sourceFile.getClass(className)

    if (classDeclaration.getMethod(methodName)) {
      // 如果类方法里有这个方法则删除
      classDeclaration.getMethod(methodName).remove()
    }
    // 然后重新添加
    classDeclaration.addMethod({
      isAsync,
      name: methodName,
      parameters,
      statements,
      returnType,
    })

    return sourceFile.getFullText()
  }

  /**
   * 解析并结构化实体定义的成员
   * TODO: 需要进一步细化出成员的类型(是getAccessor还是setAccessor还是属性成员)
   *
   * @param originClass - ClassDeclaration - ts-morph解析出的class对象
   * @returns
   */
  public parseEntityMembers(
    originClass: ClassDeclaration,
  ): { name: string; decorators: { name: string; code: string }[] }[] {
    const className = originClass.getName()
    this.logger.debug(`mergeClassProperty - className: ${className}`)
    const members = []

    for (const member of originClass.getMembers()) {
      if (member.wasForgotten()) {
        continue
      }

      const isSetAccessorDeclaration = Node.isSetAccessorDeclaration(member)
      const isGetAccessorDeclaration = Node.isGetAccessorDeclaration(member)
      const isPropertyDeclaration = Node.isPropertyDeclaration(member)

      if (
        isSetAccessorDeclaration ||
        isGetAccessorDeclaration ||
        isPropertyDeclaration
      ) {
        const memberName = member.getName()
        let decorators = []
        if (member.getDecorators() && member.getDecorators().length > 0) {
          decorators = member.getDecorators().map((decorator) => ({
            name: decorator.getName(),
            code: decorator.getFullText(),
          }))
        }
        members.push({
          name: memberName,
          decorators,
        })
      } else {
        throw new HttpException('未识别的类成员', HttpStatus.NOT_ACCEPTABLE)
      }
    }

    return members
  }

  /**
   * 合并两个class里的成员(把members里的成员合并到sourceFile里)
   *
   * 合并的原则是如果成员名字相同，且sourceFile的成员上有@Codegen()装饰器则用members里的成员替换，否则保留
   *
   * TODO: 需要提供一个force参数，指定后不保留sourceFile中其他的成员
   *
   * @param sourceFile
   * @param targetClassName
   * @param members
   */
  public mergeClassMembers(
    sourceFile: SourceFile,
    targetClassName: string,
    members: { propertyName: string; code: string; isOld?: boolean }[],
  ): void {
    const targetClass = sourceFile.getClass(targetClassName)
    const toBeDeletedMemberNames: string[] = []

    if (!targetClass) {
      /**
       * 如果不存在目标class，则一定是手动删除了，则不处理
       */
      this.logger.debug(
        `mergeClassMembers - 类: ${targetClassName} 不存在, 忽略。`,
      )
      return
    }

    this.logger.debug(`mergeClassMembers - className: ${targetClassName}`)

    // 记录最后一个成员的名字，后续会获取这个成员的代码定义块的结尾位置，并通过这个位置在这个位置后添加新的代码
    let lastVistLineNum: number

    const newMemberKeyedByName = _.keyBy(
      members,
      (member) => member.propertyName,
    )
    // this.logger.debug(`mergeClassMembers - members: ${JSON.stringify(members)}`)
    // this.logger.verbose(
    //   `mergeClassProperty - propertyHashByName: ${JSON.stringify(
    //     propertyHashByName,
    //     null,
    //     2,
    //   )}`,
    // )

    for (const member of targetClass.getMembers()) {
      if (member.wasForgotten()) {
        continue
      }

      const isSetAccessorDeclaration = Node.isSetAccessorDeclaration(member)
      const isGetAccessorDeclaration = Node.isGetAccessorDeclaration(member)
      const isPropertyDeclaration = Node.isPropertyDeclaration(member)

      if (
        isSetAccessorDeclaration ||
        isGetAccessorDeclaration ||
        isPropertyDeclaration
      ) {
        const memberName = member.getName()
        const isCodeGen = !!member.getDecorator('codeGen')
        lastVistLineNum = member.getEndLineNumber()
        if (memberName in newMemberKeyedByName) {
          /**
           * 如果目标代码里的类属性和新生成的代码里的类属性名字重合则覆盖
           */
          newMemberKeyedByName[memberName].isOld = true

          if (isCodeGen) {
            /**
             * members里有，且是sourceFile也标记为自动生成的代码则用新代码覆盖
             */
            this.logger.verbose(
              `mergeClassMembers - replace prop - targetClassName: ${targetClassName} prop: ${memberName}`,
            )
            member.replaceWithText(newMemberKeyedByName[memberName].code)

            lastVistLineNum = sourceFile
              .getClass(targetClassName)
              .getMember(memberName)
              .getEndLineNumber()
          } else {
            /**
             * members里有，但是sourceFile里没有@CodeGen装饰器，则说明已手动托管这部分代码，不需要处理
             */
            this.logger.verbose(
              `mergeClassMembers - ignore prop - targetClassName: ${targetClassName} prop: ${memberName}`,
            )
            continue
          }
        } else if (isCodeGen) {
          /**
           * 如果members里没有这个成员，且在sourceFile的成员上有@CodeGen装饰器，则标记为待删除，记录在 toBeDeletedMemberNames 数组里。
           */
          toBeDeletedMemberNames.push(memberName)
          continue
        } else {
          /**
           * 如果members里没有这个成员，但是sourceFile的成员上没有@CodeGen装饰器，则说明是手动添加的代码，不做处理。
           */
          continue
        }
      } else {
        // this.logger.debug(member.getFullText())
        // throw new HttpException('未识别的类成员类型', HttpStatus.NOT_ACCEPTABLE)
        continue
      }
    }

    /**
     * 插入新增的成员(members里有，sourceFile里没有)代码
     *
     * 在上一步visit newMemberKeyedByName时，在源代码里有的成员会标记为isOld=false
     */
    for (const propName in newMemberKeyedByName) {
      if (!newMemberKeyedByName[propName].isOld) {
        // const pos = this.getInsertPosByLineNum(sourceFile, lastVistLineNum)

        this.logger.verbose(
          `mergeClassProperty - insert prop - targetClassName: ${targetClassName} propName: ${propName}`,
        )

        targetClass.addMember(newMemberKeyedByName[propName].code)
      }
    }

    /**
     * 删除无效的成员(members里没有，且sourceFile里有@CodeGen装饰器)
     *
     * 待删除的成员在toBeDeletedMemberNames数组中
     */
    for (const member of sourceFile.getClass(targetClassName).getMembers()) {
      const isSetAccessorDeclaration = Node.isSetAccessorDeclaration(member)
      const isGetAccessorDeclaration = Node.isGetAccessorDeclaration(member)
      const isPropertyDeclaration = Node.isPropertyDeclaration(member)
      if (
        isSetAccessorDeclaration ||
        isGetAccessorDeclaration ||
        isPropertyDeclaration
      ) {
        const memberName = member.getName()
        if (toBeDeletedMemberNames.includes(memberName)) {
          this.logger.verbose(
            `mergeClassProperty - remove prop - targetClassName: ${targetClassName}  prop: ${memberName}`,
          )
          member.remove()
        }
      }
    }
  }

  /**
   * 从代码中获取已有export的结构体
   *
   * @param fileContent - string - 代码内容
   * @returns
   */
  public getExportStructure(fileContent: string): ExportsStruncture {
    const project = new Project({})

    const sourceFile = project.createSourceFile('/path/dummy', fileContent)

    const exportStructure: ExportsStruncture = {}

    const exportDeclarations = sourceFile.getExportDeclarations()

    for (const exportDeclaration of exportDeclarations) {
      const moduleSpecifierValue = exportDeclaration
        .getModuleSpecifierValue()
        .trim()
      exportStructure[moduleSpecifierValue] = {
        isExisting: true,
        identifiers: [],
      }

      const namedExports = exportDeclaration.getNamedExports()
      for (let namedExport of namedExports) {
        const exportIdentifier = namedExport.getNameNode().getFullText().trim()
        exportStructure[moduleSpecifierValue].identifiers.push(exportIdentifier)
        this.logger.debug(
          `getExportStruncture - find a new exportIdentifier: ${exportIdentifier}`,
        )
      }
    }
    return exportStructure
  }

  /**
   * 确保import(没有则添加，有则保留)
   *
   * 现在只支持添加named import - import {classA, classB} from 'service/controller/entity'
   *                                        |                             |
   *                                    identifier                    specifier
   *
   * @param fileContent     - string - 需要更新imports的文件内容
   * @param importStructure - ImportsStruncture - 需要增加的import structure
   * @returns
   */
  public ensureImports(
    fileContent: string,
    importStructure: ImportsStruncture,
  ): string {
    const project = new Project({})
    const sourceFile = project.createSourceFile('/path/dummy', fileContent)

    for (const specifiler in importStructure) {
      // 将 importStructure 中的 import语句 以 specifier 为key增量添加到文件中
      const importDeclaration = sourceFile.getImportDeclaration(
        (importDeclaration) =>
          importDeclaration.getModuleSpecifierValue().trim() === specifiler,
      )

      if (importDeclaration) {
        /**
         * 1. 先删除已有的import
         * 2. 再将新的import与已有的import合并后重新声明
         */
        importDeclaration.removeNamespaceImport()

        importDeclaration.addNamedImports(
          _.difference(
            importStructure[specifiler].identifiers,
            importDeclaration.getNamedImports().map((namedImport) =>
              /**
               * 这里需要用 getText() 否则对于
               * import { // a, \n b } from './'
               * 这样的语句获取的nameNode会是 '// a, \n b'
               */
              namedImport.getNameNode().getText().trim(),
            ),
          ),
        )
      } else {
        // 如果是全新的则直接添加
        sourceFile.addImportDeclaration({
          namedImports: importStructure[specifiler].identifiers,
          moduleSpecifier: specifiler,
        })
      }
    }
    return this.codeFormat(sourceFile.getFullText())
  }

  /**
   * 确保import(没有则添加，有则保留)
   *
   * 现在只支持添加named import - import {classA, classB} from 'service/controller/entity'
   *                                        |                             |
   *                                    identifier                    specifier
   *
   * @param sourceFile     - SourceFile - 需要更新imports的文件
   * @param importStructure - ImportsStruncture - 需要增加的import structure
   * @returns
   */
  public ensureImportsV2(
    sourceFile: SourceFile,
    importStructure: ImportsStruncture,
  ): SourceFile {
    for (const specifiler in importStructure) {
      // 将 importStructure 中的 import语句 以 specifier 为key增量添加到文件中
      const importDeclaration = sourceFile.getImportDeclaration(
        (importDeclaration) =>
          importDeclaration.getModuleSpecifierValue().trim() === specifiler,
      )
      if (importDeclaration) {
        /**
         * 1. 先删除已有的import
         * 2. 再将新的import与已有的import合并后重新声明
         */
        importDeclaration.removeNamespaceImport()
        importDeclaration.addNamedImports(
          _.difference(
            importStructure[specifiler].identifiers,
            importDeclaration.getNamedImports().map((namedImport) =>
              /**
               * 这里需要用 getText() 否则对于
               * import { // a, \n b } from './'
               * 这样的语句获取的nameNode会是 '// a, \n b'
               */
              namedImport.getNameNode().getText().trim(),
            ),
          ),
        )
      } else {
        // 如果是全新的则直接添加
        sourceFile.addImportDeclaration({
          namedImports: importStructure[specifiler].identifiers,
          moduleSpecifier: specifiler,
        })
      }
    }
    return sourceFile
  }

  /**
   * 对importsStructure中的identifier去重，防止importsStructure中有重复的identifier
   *
   * @param importsStruncture - ImportsStruncture
   * @returns
   */
  public compactImportsStruncture(
    importsStruncture: ImportsStruncture,
  ): ImportsStruncture {
    const clonedImportsStruncture = _.cloneDeep(importsStruncture)
    for (const specifier in clonedImportsStruncture) {
      clonedImportsStruncture[specifier].identifiers = _.uniq(
        clonedImportsStruncture[specifier].identifiers,
      )
    }
    return clonedImportsStruncture
  }

  public mergeExportStructure(
    existingStructure: ExportsStruncture,
    newStructure: ExportsStruncture,
  ): ExportsStruncture {
    const existingStructureCloned = _.cloneDeep(existingStructure)
    for (const specifier in newStructure) {
      for (const identifier of newStructure[specifier].identifiers) {
        if (specifier in existingStructureCloned) {
          if (
            !existingStructureCloned[specifier].identifiers.includes(identifier)
          ) {
            existingStructureCloned[specifier].identifiers.push(identifier)
          }
        } else {
          existingStructureCloned[specifier] = {
            isExisting: false,
            identifiers: [identifier],
          }
        }
      }
    }
    return existingStructureCloned
  }

  /**
   * 给定一组文件以及已有的index.ts文件(可以是空),生成export所有已有文件中可export的class的index.ts文件
   * 现在仅能整理同目录下的
   *
   * @param basePath
   * @param codes
   * @param existingIndexFileContent
   * @returns
   */
  public updateIndexFile(
    basePath: string,
    codes: Code[],
    existingIndexFileContent: string,
  ): string {
    const project = new Project({})

    // 已有index.ts中的export结构
    let indexedExportStructure = this.getExportStructure(
      existingIndexFileContent,
    )

    /**
     * 轮询同级目录下的各个源文件，把每个源文件里export出来的class添加到exportStructure中
     * TODO: 如果不是同级目录, 则必定是子目录下的index.ts文件(否则抛异常)
     */
    for (const code of codes) {
      this.logger.debug(`updateIndexFile - parsing source file: ${code.path}`)

      const exportStruct1 = this.tsMorphService.getExportedClasses(
        code,
        basePath,
      )
      indexedExportStructure = this.mergeExportStructure(
        indexedExportStructure,
        exportStruct1,
      )

      const exportStruct2 =
        this.tsMorphService.getExportedStructureFromIndexFile(code, basePath)
      indexedExportStructure = this.mergeExportStructure(
        indexedExportStructure,
        exportStruct2,
      )
    }

    this.logger.verbose(
      `updateIndexFile - ${JSON.stringify(indexedExportStructure, null, 2)}`,
    )

    const parsedIndexSourceFile = project.createSourceFile(
      '/dummy/path',
      existingIndexFileContent,
    )

    // 持久化export structure到index.ts文件中
    for (const specifier in indexedExportStructure) {
      if (indexedExportStructure[specifier].isExisting) {
        // 先删掉
        parsedIndexSourceFile.getExportDeclaration(specifier).remove()
      }
      parsedIndexSourceFile.addExportDeclaration({
        namedExports: indexedExportStructure[specifier].identifiers,
        moduleSpecifier: specifier,
      })
    }

    return this.codeFormat(parsedIndexSourceFile.getFullText())
  }
}
