import {
  CACHE_MANAGER,
  ConsoleLogger,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import {
  Code,
  CodeType,
  DirectoryType,
} from '../../../core/interfaces/CodeType'
import _ from 'lodash'
import { MetaTable, MetaColumn } from '../../base'
import {
  ImportSpecifierStructure,
  Project,
  Node,
  SyntaxKind,
  SourceFile,
} from 'ts-morph'
import { GitService } from '../../coding'
import { CodegenUtilService } from './codegen.util.service'
import { ImportsStruncture } from '../types'
import { TSMorphService } from './tsmorph.service'
import { CodegenServiceService } from './codegen.service.service'
import JSON5 from 'json5'

@Injectable()
export class CodegenEntityService {
  MetaTable: any
  constructor(
    private readonly gitService: GitService,
    private readonly codegenUtilService: CodegenUtilService,
    private readonly tSMorphService: TSMorphService,
    private readonly codegenServiceService: CodegenServiceService,
  ) {}

  private readonly logger = new Logger(CodegenEntityService.name)

  /**
   * 根据关系定义导入依赖的实体
   * 生成:
   *  import { Enum } from './../../enum'
   *  import { ArticleCategory } from './'
   *
   * @param table - 实体定义
   * @returns
   */
  public getimportsStrunctureForEntityClass(
    table: MetaTable,
  ): ImportsStruncture {
    const importsStruncture: ImportsStruncture = {
      'sequelize-typescript': {
        identifiers: ['DataType', 'Table', 'Column'],
      },
      './../../../core': {
        identifiers: ['codeGen'],
      },
    }
    for (const column of table.columns) {
      if (
        ['BelongsTo', 'HasMany', 'BelongsToMany', 'HasOne'].includes(
          column.relation,
        ) &&
        column.tableId !== table.id
      ) {
        const importSpecifier = this.codegenUtilService.getImportSpecifier(
          table.entityFilePath,
          column.refTable.entityFilePath,
        )

        if (importSpecifier in importsStruncture) {
          importsStruncture[importSpecifier].identifiers.push(
            column.refTable.className,
          )
        } else {
          importsStruncture[importSpecifier] = {
            identifiers: [column.refTable.className],
          }
        }

        importsStruncture['sequelize-typescript'].identifiers.push(
          column.relation,
        )
      }
      if (column.relation === 'BelongsTo') {
        importsStruncture['sequelize-typescript'].identifiers.push('ForeignKey')
      }
    }
    return this.codegenUtilService.compactImportsStruncture(importsStruncture)
  }

  /**
   * 根据column定义生成Sequelize实体中成员的的定义
   *
   * @param column - MetaColumn - 列定义
   * @returns
   */
  public getEntityMemberCode(column: Partial<MetaColumn>): {
    propertyName: string
    code: string
  } {
    let sequelizeType: string,
      typescriptType: string,
      defaultValueStatement = ''

    if (!column.name || column.dataTypeId === undefined) {
      throw new HttpException('非法column定义', HttpStatus.BAD_REQUEST)
    }

    /**
     * 生成默认值定义的代码
     */
    if (
      column.defaultValue !== '' &&
      column.defaultValue !== undefined &&
      column.defaultValue !== null
    ) {
      if (
        /^varchar/.test(column.dataType.dataType) ||
        column.dataType.dataType === 'text' ||
        column.dataType.dataType === 'enum'
      ) {
        defaultValueStatement = `\ndefaultValue: '${column.defaultValue}',`
      } else if (
        column.dataType.dataType === 'int' ||
        /^decimal/.test(column.dataType.dataType) ||
        column.dataType.dataType === 'boolean'
      ) {
        defaultValueStatement = `\ndefaultValue: ${column.defaultValue},`
      }
    }

    /**
     * 生成关系定义的代码
     */
    if (column.dataType.dataType === 'vrelation') {
      if (column.relation == 'BelongsTo') {
        return {
          propertyName: column.name,
          code: `\n
                  @${column.relation}(() => ${column.refTable.className}, '${column.name}Id')
                  @codeGen('${column.id}')
                  ${column.name}: ${column.refTable.className}
                `,
        }
      }

      if (column.relation == 'HasMany') {
        return {
          propertyName: column.name,
          code: `\n
                  @${column.relation}(() => ${column.refTable.className})
                  @codeGen('${column.id}')
                  ${column.name}: ${column.refTable.className}[]
                `,
        }
      }

      if (column.relation == 'HasOne') {
        return {
          propertyName: column.name,
          code: `\n
                  @${column.relation}(() => ${column.refTable.className})
                  @codeGen('${column.id}')
                  ${column.name}: ${column.refTable.className}
                `,
        }
      }

      if (column.relation == 'BelongsToMany') {
        return {
          propertyName: column.name,
          code: `\n
                  @${column.relation}(() => ${column.refTable.className})
                  @codeGen('${column.id}')
                  ${column.name}: ${column.refTable.className}[]
                `,
        }
      }
    }

    if (column.refTableId && column.dataType.dataType === 'int') {
      // BelongsTo 的代码
      const refModelName = column.refTable.className
      return {
        propertyName: column.name,
        code: `\n\n @ForeignKey(() => ${refModelName})
                    @Column({
                      type: DataType.INTEGER,
                      allowNull: ${column.allowNull},${defaultValueStatement}
                      onUpdate: 'NO ACTION',
                      onDelete: 'NO ACTION',
                      comment: '${column.comment}',
                    })
                    @codeGen('${column.id}')
                    ${column.name}${column.allowNull ? '?' : ''}: number`,
      }
    }

    if (column.dataType.dataType === 'enum') {
      if (!column.enumKeys) {
        throw new HttpException(
          '枚举型数据类型必须指定枚举值',
          HttpStatus.BAD_REQUEST,
        )
      }
      sequelizeType = `\n\nENUM(${column.enumKeys
        .split(',')
        .map((o: any) => `'${o}'`)
        .join(',')})`
      typescriptType = 'string'
    } else {
      sequelizeType = column.dataType.entityDataType
      typescriptType = column.dataType.mappingDataType
    }

    let code = `\n\n@Column({
                      allowNull: ${column.allowNull},
                      type: DataType.${sequelizeType},${defaultValueStatement}
                      comment: '${column.fullComment}',
                    })
                    @codeGen('${column.id}')\n`

    if (column.dataType.dataType === 'virtual') {
      code = `\n\n@Column({
                    type: DataType.VIRTUAL,
                    comment: '${column.fullComment}'
                  })
                  @codeGen('${column.id}')\n`
    }

    if (column?.getCode?.trim()) {
      // 如果有get方法就不用显示的定义属性
      code += `get ${column.name} ():${column.dataType.mappingDataType} {
        ${column.getCode}
      }\n`
    } else {
      // 否则显示的定义属性
      code += `${column.name}${
        column.allowNull ? '?' : ''
      }: ${typescriptType}\n`
    }

    if (column?.setCode?.trim()) {
      code += `set ${column.name} (val: ${column.dataType.mappingDataType}) {
        ${column.setCode}
      }`
    }

    return {
      propertyName: column.name,
      code,
    }
  }

  /**
   * 根据表定义生成Sequelize实体定义代码(第一次生成)
   *
   * @param table
   * @returns
   */
  async genEntityDefinitionCodeFromScratch(table: MetaTable): Promise<Code> {
    const className = table.className
    const isView = /^v_/.test(table.name)
    const baseModel = isView ? 'Model' : 'BaseModel'

    let props = []

    for (const column of table.columns) {
      props.push(this.getEntityMemberCode(column))
    }

    let code: string

    if (isView) {
      /* prettier-ignore */
      code = `import {
        Table,
        Column,
        DataType,
        Model,
        DefaultScope,
      } from 'sequelize-typescript'
      import { codeGen } from './../../../core'

      @Table({
        tableName: '${table.name}',
        comment: '${table.comment}',
        timestamps: false,
      })
      @DefaultScope(() => ({
      }))      
      export class ${className} extends ${baseModel}<${className}> {
        ${props.map((prop) => prop.code).join('\n')}
      }`
    } else {
      /* prettier-ignore */
      code = `import {
        Table,
        Column,
        DataType,
      } from 'sequelize-typescript'
      import { codeGen, BaseModel } from './../../../core'

      @Table({
        tableName: '${table.name}',
        comment: '${table.comment}',
      })
      export class ${className} extends ${baseModel}<${className}> {
        ${props.map((prop) => prop.code).join('\n')}
      }`
    }

    // 获取MetaTable之前已经生成过的relation
    // const relation = await this.codegenServiceService.getIncludeStatement(table)

    // 引入Model Class
    code = this.codegenUtilService.ensureImports(
      code,
      await this.codegenServiceService.getEntityImportsForService(
        table,
        table.entityFilePath,
      ),
    )

    // 生成findAll和findOne的@Scopes
    code = await this.ensureScope(
      code,
      'findAll',
      await this.codegenServiceService.getIncludeStatement(table, 'all'),
    )

    code = await this.ensureScope(
      code,
      'findOne',
      await this.codegenServiceService.getIncludeStatement(table, 'one'),
    )

    return {
      content: this.codegenUtilService.codeFormat(code),
      originContent: '',
      label: 'enty',
      isExist: false,
      path: table.entityFilePath,
    }
  }

  /**
   * 根据表字段定义*更新已有的*Sequelize实体定义代码
   *
   * @param table - 实体定义
   * @param branch - 对比分支
   * @returns
   */
  async getEntityDefinitionCode(
    table: MetaTable,
    branch: string,
  ): Promise<Code> {
    const contentResult = await this.gitService.getFileContent(
      table.project.repoId,
      branch,
      table.entityFilePath,
    )

    if (contentResult.err === 0) {
      const originalContent = contentResult.content
      // 修改已有实体定义
      const entityFilePath = table.entityFilePath

      const project = new Project({})

      // 获取MetaTable之前已经生成过的relation
      // const relation = await this.codegenServiceService.getIncludeStatement(
      //   table,
      // )

      // 引入Model Class
      contentResult.content = this.codegenUtilService.ensureImports(
        contentResult.content,
        await this.codegenServiceService.getEntityImportsForService(
          table,
          table.entityFilePath,
        ),
      )

      // 生成findAll和findOne的@Scopes
      contentResult.content = await this.ensureScope(
        contentResult.content,
        'findAll',
        await this.codegenServiceService.getIncludeStatement(table, 'all'),
      )

      contentResult.content = await this.ensureScope(
        contentResult.content,
        'findOne',
        await this.codegenServiceService.getIncludeStatement(table, 'one'),
      )

      const sourceFile = project.createSourceFile(
        '/dummy/' + table.entityFilePath,
        contentResult.content,
      )

      const entityClass = sourceFile.getClass(table.className)

      this.logger.debug(
        `getEntityDefinitionCode - tableClass: ${table.className}`,
      )

      if (!entityClass) {
        this.logger.error(
          `----------getEntityDefinitionCode - failed to get class: ${table.className}----------`,
        )
        this.logger.error(sourceFile.getFullText())
        this.logger.error(
          `----------getEntityDefinitionCode - failed to get class: '${table.className}'----------`,
        )
        throw new HttpException(
          `未找到实体类: ${table.className} 请检查类名是否有拼写错误(注意大小写)`,
          HttpStatus.BAD_GATEWAY,
        )
      }

      let props = []

      for (const column of table.columns) {
        props.push(this.getEntityMemberCode(column))
      }

      this.codegenUtilService.mergeClassMembers(
        sourceFile,
        table.className,
        props,
      )

      let sourceCode = sourceFile.getFullText()

      sourceCode = this.codegenUtilService.ensureImports(
        sourceCode,
        this.getimportsStrunctureForEntityClass(table),
      )

      if (table.indexes && table.indexes.length > 0) {
        sourceCode = this.ensureEntityIndex(sourceCode, table, table.indexes)
      }

      return {
        content: this.codegenUtilService.codeFormat(sourceCode),
        originContent: originalContent,
        label: 'enty',
        isExist: true,
        path: entityFilePath,
      }
    } else if (contentResult.err === 404) {
      const code = await this.genEntityDefinitionCodeFromScratch(table)

      code.content = this.codegenUtilService.ensureImports(
        code.content,
        this.getimportsStrunctureForEntityClass(table),
      )

      if (table.indexes && table.indexes.length > 0) {
        code.content = this.ensureEntityIndex(
          code.content,
          table,
          table.indexes,
        )
      }

      return code
    } else {
      throw new HttpException('系统错误', HttpStatus.BAD_REQUEST)
    }
  }

  /**
   *  根据relation定义生成实体scope
   *  @param entityContent 实体的内容
   *  @param scopeName 自定义scope的名称
   *  @param relation 字符串格式的relation(可选参数)
   */
  public async ensureScope(
    entityContent: string,
    scopeName: string,
    relation?: string,
  ): Promise<string> {
    const scopesArguments = relation
      ? `
    {
      include: ${relation}
    },
    `
      : `{}`

    // 引入 Scopes 装饰器
    entityContent = this.codegenUtilService.ensureImports(entityContent, {
      [`sequelize-typescript`]: {
        identifiers: [`Scopes`],
      },
    })

    // 获取实体里的class定义
    const sourceFile = this.tSMorphService.toSourceFile(entityContent)
    const classDeclaration = sourceFile.getClasses()[0]

    // 判断是否有scopes装饰器以及CodeGen装饰器
    const hasScopesDecorator = classDeclaration.getDecorator('Scopes')
    const hasCodeGenDecorator = classDeclaration.getDecorator('codeGen')

    if (
      !(
        hasCodeGenDecorator &&
        hasCodeGenDecorator.getArguments()?.length &&
        hasCodeGenDecorator.getArguments()[0].getText() === `'scopesGen'`
      ) &&
      hasScopesDecorator
    ) {
      /**
       * 如果有Scopes装饰器，但是没有CodeGen装饰器说明人为删除了CodeGen装饰，此时不进行后续代码生成，原样返回代码
       */
      return entityContent
    }

    if (!hasScopesDecorator) {
      // 首次添加 Scopes
      classDeclaration.addDecorator({
        name: 'codeGen',
        arguments: [`'scopesGen'`],
      })

      // 添加Scopes
      classDeclaration.addDecorator({
        name: 'Scopes',
        arguments: [
          `() => ({
          ${scopeName}:${scopesArguments}
        })`,
        ],
      })
    } else {
      // 根据scopeName修改(覆盖)原有 Scopes
      const firstArg = hasScopesDecorator?.getArguments()[0]
      if (
        Node.isArrowFunction(firstArg) &&
        Node.isParenthesizedExpression(firstArg.getBody())
      ) {
        const objLiteralExpression = firstArg
          .getBody()
          .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
        const propertyAssignment = objLiteralExpression[0]

        if (propertyAssignment.getProperty(scopeName)) {
          // 如果有scopeName，则删除
          propertyAssignment.getProperty(scopeName).remove()
        }

        // 添加新的scopeName
        propertyAssignment.addPropertyAssignment({
          name: scopeName,
          initializer: scopesArguments,
        })
      }
    }

    return this.codegenUtilService.codeFormat(sourceFile.getFullText())
  }

  /**
   * 确保实体定义里的索引
   *
   * @param sourceFile
   * @param table
   * @param indexDef
   */
  public ensureEntityIndex(
    sourceCode: string,
    table: MetaTable,
    indexDef: any[],
  ): string {
    const columnHash = _.keyBy(table.columns, 'id')
    for (const index of indexDef) {
      if (index.type === 'unique') {
        index.unique = true
      }
      index.fields = index.fields.map((field) => columnHash[field]['name'])
      delete index.type
    }

    const sourceFile = this.tSMorphService.toSourceFile(sourceCode)

    const classDeclaration = sourceFile.getClass(table.className)

    const decorator = classDeclaration.getDecorator('Table')

    const firstArg = decorator.getArguments()[0]

    const firstArgObj = JSON5.parse(firstArg.getFullText())

    firstArgObj.indexes = indexDef

    firstArg.replaceWithText(JSON.stringify(firstArgObj))

    return sourceFile.getFullText()
  }
}
