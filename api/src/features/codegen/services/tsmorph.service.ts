import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Code } from '../../../core'
import {
  Project,
  Node,
  Decorator,
  StructureKind,
  SourceFile,
  ClassDeclaration,
  ClassMemberTypes,
  OptionalKind,
  ParameterDeclarationStructure,
} from 'ts-morph'
import path from 'path'
import { ExportsStruncture } from '../types'

@Injectable()
export class TSMorphService {
  constructor() {}

  /**
   * 把代码文本转化为ts-morph的sourceFile对象
   *
   * @param sourceCode
   * @returns
   */
  public toSourceFile(sourceCode: string): SourceFile {
    const project = new Project({})
    return project.createSourceFile('/dummy', sourceCode)
  }

  public getExportedClasses(code: Code, basePath: string) {
    /**
     * export语句中的specifier是不带文件后缀的，而code.path是完整的路径且带文件后缀, 所以需要将后缀去掉
     * export { TestA } from './test.controller'
     */
    const specifier = `./${path
      .relative(basePath, code.path)
      .replace(/\.ts$/, '')}`
    const exportStructure: ExportsStruncture = {
      [specifier]: { isExisting: true, identifiers: [] },
    }

    const sourceFile = this.toSourceFile(code.content)
    for (const class_ of sourceFile.getClasses()) {
      const className = class_.getName()
      const isExportedClass = class_.isExported()
      if (isExportedClass) {
        exportStructure[specifier].identifiers.push(className)
      }
    }
    return exportStructure
  }

  public getExportedStructureFromIndexFile(code: Code, basePath: string) {
    const specifier = `./${path.dirname(path.relative(basePath, code.path))}`
    const exportStructure: ExportsStruncture = {
      [specifier]: { isExisting: true, identifiers: [] },
    }
    const sourceFile = this.toSourceFile(code.content)
    for (const exportDeclaration of sourceFile.getExportDeclarations()) {
      for (const namedExport of exportDeclaration.getNamedExports()) {
        exportStructure[specifier].identifiers.push(namedExport.getName())
      }
    }
    return exportStructure
  }
}
