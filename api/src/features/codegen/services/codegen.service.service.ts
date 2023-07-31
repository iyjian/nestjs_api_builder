import { MetaColumnService } from '../../base/services/meta.column.service'
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import {
  Code,
  CodeType,
  DirectoryType,
} from '../../../core/interfaces/CodeType'
import { MetaTableService } from '../../base/services/meta.table.service'
import _ from 'lodash'
import { MetaTable } from '../../base/entities/meta.table.entity'
import { GitService } from '../../coding'
import { CodegenUtilService } from './codegen.util.service'
import pluralize from 'pluralize'
import { ImportsStruncture } from '../types'
import { TSMorphService } from './tsmorph.service'
import { Node, SyntaxKind, ts } from 'ts-morph'

@Injectable()
export class CodegenServiceService {
  constructor(
    private readonly metaTableService: MetaTableService,
    private readonly gitService: GitService,
    private readonly codegenUtilService: CodegenUtilService,
    private readonly tsmorphService: TSMorphService,
    private readonly columnService: MetaColumnService,
  ) {}

  private readonly logger = new Logger(CodegenServiceService.name)

  private keywords: string[] = [
    'abstract',
    'any',
    'as',
    'boolean',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'declare',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'from',
    'function',
    'get',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'interface',
    'is',
    'keyof',
    'let',
    'module',
    'namespace',
    'never',
    'new',
    'null',
    'number',
    'object',
    'package',
    'private',
    'protected',
    'public',
    'readonly',
    'require',
    'return',
    'set',
    'static',
    'string',
    'super',
    'switch',
    'symbol',
    'this',
    'throw',
    'true',
    'try',
    'type',
    'typeof',
    'undefined',
    'unique',
    'unknown',
    'var',
    'void',
    'while',
    'with',
    'yield',
  ]

  public ensureSearchConditions(sourceCode: string, table: MetaTable): string {
    this.logger.debug(`codegenServiceService - ensureSearchConditions - start`)
    const sourceFile = this.tsmorphService.toSourceFile(sourceCode)
    const classSource = sourceFile.getClass(`${table.className}Service`)
    const findAllMember = classSource.getMethod('findAll')

    if (!findAllMember) {
      return sourceFile.getFullText()
    }

    const ifSearchStatement = findAllMember.getStatement((node) => {
      return node.getText().includes('if (search)')
    })

    if (Node.isIfStatement(ifSearchStatement)) {
      const conditionStatement = ifSearchStatement
        .getThenStatement()
        .getDescendantStatements()[0]

      if (Node.isExpressionStatement(conditionStatement)) {
        const conditionExpression = conditionStatement.getExpression()
        if (Node.isBinaryExpression(conditionExpression)) {
          const conditionValue = conditionExpression.getRight()
          if (Node.isObjectLiteralExpression(conditionValue)) {
            for (const column of table.columns) {
              if (column.searchable) {
                this.logger.debug(
                  `codegenServiceService - ensureSearchConditions - searchable column: ${column.name}`,
                )
                if (!conditionValue.getProperty(column.name)) {
                  conditionValue.addPropertyAssignment({
                    name: column.name,
                    initializer: '{[Op.like]: `%${search}%`}',
                  })
                }
              } else {
                if (conditionValue.getProperty(column.name)) {
                  conditionValue.getProperty(column.name).remove()
                }
              }
            }
          }
        } else {
          this.logger.debug(
            `codegenServiceService - ensureSearchConditions - no condition expression`,
          )
        }
      } else {
        this.logger.debug(
          `codegenServiceService - ensureSearchConditions - no condition declare`,
        )
      }
    } else {
      this.logger.debug(
        `codegenService - ensureSearchConditions - no if search statement`,
      )
    }

    return this.codegenUtilService.codeFormat(sourceFile.getFullText())
  }

  /**
   * 根据实体的依赖关系在service里import对应的实体类
   *
   * @param table - 实体定义
   * @param from - 从哪里引入
   * @returns
   */
  public async getEntityImportsForService(
    table: MetaTable,
    from: string,
  ): Promise<ImportsStruncture> {
    const importsStruncture: ImportsStruncture = {}
    if (table.relationNodes && table.relationNodes.length > 1) {
      for (const relationNode of table.relationNodes) {
        const tableId = relationNode.tableId

        const refTable = await this.metaTableService.findOneMetaTableSimple(
          tableId,
        )

        // console.log(JSON.stringify(refTable, null, 2))

        // 过滤掉root节点
        if (refTable.className === table.className) {
          continue
        }

        const importSpecifier = this.codegenUtilService.getImportSpecifier(
          from,
          refTable.entityFilePath,
        )

        // if (refTable.module === table.module && isFromEntity) {
        //   /**
        //    * 在entity里引用同模块的实体
        //    */
        //   importSpecifier = `.${refTable.entityFilePath}`
        // } else if (refTable.module === table.module && !isFromEntity) {
        //   /**
        //    * 在service里引用同模块的实体
        //    */
        //   importSpecifier = `./..${refTable.entityFilePath}`
        // } else {
        //   /**
        //    * 引用其他模块的实体
        //    */
        //   importSpecifier = `./../../${refTable.module}${refTable.entityFilePath}`
        // }

        if (importSpecifier in importsStruncture) {
          importsStruncture[importSpecifier].identifiers.push(
            refTable.className,
          )
        } else {
          importsStruncture[importSpecifier] = {
            identifiers: [refTable.className],
          }
        }
      }
    }
    this.logger.debug(
      `----------------getModelImport ${table.name} from: ${from} ----------------`,
    )
    this.logger.debug(JSON.stringify(importsStruncture, null, 2))
    this.logger.debug(
      `----------------getModelImport ${table.name} from: ${from} ----------------`,
    )
    return this.codegenUtilService.compactImportsStruncture(importsStruncture)
  }

  public getCreateMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      async create(create${table.className}Request: Create${
        table.className
      }RequestDTO, transaction?: Transaction) {
        const isOuterTransaction = !!transaction
        try {
          if (!isOuterTransaction) {
            transaction = await this.mysql.transaction()
          }

          const ${table.instanceName}${this.keywords.includes(table.instanceName) ? '_' : ''} = await this.${table.instanceName}Model.create(create${table.className}Request, { transaction })
          
          if (!isOuterTransaction) {
            await transaction.commit()
            return this.findOneById(${table.instanceName}.id)
          } else {
            return this.findOneById(${table.instanceName}.id, transaction)
          }
        } catch (e) {
          if (!isOuterTransaction && transaction) {
            await transaction.rollback()
          }
          throw e
        }
      }    
    `
  }

  public getFindAllMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      async findAll(findAll${table.className}Request: FindAll${table.className}RequestDTO, transaction?: Transaction) {
        const {
          page = 1, 
          pageSize = 20, 
          skipPaging, 
          search, 
          sort = [['id', 'desc']], 
          ...payload
        } = findAll${table.className}Request
        
        const condition = this.normalizeCondition(payload)

        if (search) {
          condition[Op.or] = {

          }
        }

        const ${pluralize(table.instanceName)} = await this.${table.instanceName}Model.scope(['defaultScope', 'findAll']).findAndCountAll({
          where: { ...condition },
          offset: skipPaging ? undefined : (page - 1) * pageSize,
          limit: skipPaging ? undefined : pageSize,
          order: sort,
          transaction,
        })
    
        return ${pluralize(table.instanceName)}
      }
    `
  }

  public getFindOneByIdMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      async findOneById(id: number, transaction?: Transaction) {
        const ${table.instanceName} = await this.${table.instanceName}Model.scope(['defaultScope', 'findOne']).findByPk(id, {
          transaction,
        })

        return ${table.instanceName}
      }
    `
  }

  public getFindByIdsMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      async findByIds(ids: number[], transaction?: Transaction) {
        const ${pluralize(table.instanceName)} = await this.${table.instanceName}Model.findAll({
          where: {
            id: {
              [Op.in]: ids,
            },
          },
          transaction,
        })
    
        return ${pluralize(table.instanceName)}
      }
    `
  }

  public getFindOneByIdOrThrowMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      async findOneByIdOrThrow(id: number, transaction?: Transaction) {
        const ${table.instanceName} = await this.${table.instanceName}Model.scope(['defaultScope', 'findOne']).findByPk(id, {
          transaction,
        })

        if (!${table.instanceName}) {
          throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
        }

        return ${table.instanceName}
      }
    `
  }

  public getFindOneOrThrowMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      async findOneOrThrow(findOne${table.className}Request: FindOne${table.className}RequestDTO, transaction?: Transaction) {
        const ${table.instanceName} = await this.${table.instanceName}Model.scope(['defaultScope', 'findOne']).findOne({
          where: { ...findOne${table.className}Request },
          transaction,
        })

        if (!${table.instanceName}) {
          throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
        }
        
        return ${table.instanceName}
      }
    `
  }

  public getFindOneMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      async findOne(findOne${table.className}Request: FindOne${table.className}RequestDTO, transaction?: Transaction) {
        const ${table.instanceName} = await this.${table.instanceName}Model.scope(['defaultScope', 'findOne']).findOne({
          where: { ...findOne${table.className}Request },
          transaction,
        })
        
        return ${table.instanceName}
      }
    `
  }

  public getUpdateByIdMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      async updateById(id: number, update${table.className}Request: Update${table.className}RequestDTO, transaction?: Transaction) {
        await this.${table.instanceName}Model.update(update${table.className}Request, {
          where: {
            id
          },
          transaction,
        })
        return true
      }
    `
  }

  public getRemoveByIdMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
    async removeById(id: number, transaction?: Transaction) {
        
      const isOuterTransaction = !!transaction
      try {
        if (!transaction) {
          transaction = await this.mysql.transaction()
        }
  
        await this.${table.instanceName}Model.update(
          { isActive: null },
          {
            where: {
              id,
            },
            transaction,
          },
        )
  
        if (!isOuterTransaction) {
          await transaction.commit()
        }
        return true
      } catch (e) {
        if (transaction && !isOuterTransaction) {
          await transaction.rollback()
          if (e.toString() === 'Error: SequelizeForeignKeyConstraintError') {
            throw new Error('有依赖数据，无法删除')
          }
        }
        throw e
      }
    }
    `
  }
  /**
   * 生成service的代码(首次生成)
   *
   * @param table - MetaTable - table的完整定义
   * @returns
   */
  public async genServiceCodeFromScratch(
    table: MetaTable,
    methods = [
      'getCreateMethod',
      'getFindAllMethod',
      'getFindOneByIdMethod',
      'getFindByIdsMethod',
      'getFindOneByIdOrThrowMethod',
      'getFindOneOrThrowMethod',
      'getFindOneMethod',
      'getUpdateByIdMethod',
      'getRemoveByIdMethod',
    ],
  ): Promise<Code> {
    let methodCode: string = ''

    for (const method of methods) {
      if (
        table.type === 'view' &&
        [
          'getCreateMethod',
          'getUpdateByIdMethod',
          'getRemoveByIdMethod',
        ].includes(method)
      ) {
        // 视图类型的实体跳过这些方法
        continue
      }
      methodCode += this[method](table)
    }

    /* prettier-ignore */
    let code = `
    import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
    import { InjectModel } from '@nestjs/sequelize'
    import { Op, Transaction } from 'sequelize'
    import { Sequelize } from 'sequelize-typescript'
    
    @Injectable()
    export class ${table.className}Service extends BaseService {
      private readonly include: any[]
      private readonly includeForOne: any[]
    
      constructor(
        @InjectModel(${table.className})
        private readonly ${table.instanceName}Model: typeof ${table.className},
        private readonly mysql: Sequelize,
      ) {
        super()
        this.include = ${await this.getIncludeStatement(table, 'all')}
        this.includeForOne = ${await this.getIncludeStatement(table, 'one')}
      }

      ${methodCode}
    }`

    code = this.codegenUtilService.ensureImports(code, {
      './../../../core': {
        identifiers: ['BaseService'],
      },
    })

    code = this.codegenUtilService.ensureImports(code, {
      [this.codegenUtilService.getImportSpecifier(
        table.serviceFilePath,
        table.entityFilePath,
      )]: {
        identifiers: [table.className],
      },
    })

    code = this.codegenUtilService.ensureImports(code, {
      [this.codegenUtilService.getImportSpecifier(
        table.serviceFilePath,
        table.dtoFilePath,
      )]: {
        identifiers: [
          `FindAll${table.className}RequestDTO`,
          `FindOne${table.className}RequestDTO`,
          `Create${table.className}RequestDTO`,
          `Update${table.className}RequestDTO`,
        ],
      },
    })

    return {
      label: 'serv',
      path: table.serviceFilePath,
      content: this.codegenUtilService.codeFormat(code),
      originContent: '',
      isExist: false,
    }
  }

  /**
   * 更新service代码
   *
   * 1. 根据最新的关系定义刷新实体导入(include中使用)
   * 2. 刷新search
   *
   * @param table - 实体定义
   * @param branch - 代码所在分支(用于service代码的修改)
   * @returns
   */
  public async getServiceCode(table: MetaTable, branch: string): Promise<Code> {
    // console.time('getServiceCode-getFileContent')
    const contentResult = await this.gitService.getFileContent(
      table.project.repoId,
      branch,
      table.serviceFilePath,
    )
    console.log(`getServiceCode - getFileContent - repoId: ${table.project.repoId} branch:${branch} serviceFilePath: ${table.serviceFilePath}`)

    if (contentResult.err === 0) {
      // 如果service代码已经存在
      let content = contentResult.content

      content = await this.ensureServiceConstructorInclude(content, table)

      /**
       * import service中include的实体(根据entity的include)
       */
      content = this.codegenUtilService.ensureImports(
        content,
        await this.getEntityImportsForService(table, table.serviceFilePath),
      )

      content = this.ensureSearchConditions(content, table)

      return {
        content,
        originContent: contentResult.content,
        path: table.serviceFilePath,
        isExist: true,
        label: 'serv',
      }
    } else if (contentResult.err === 404) {
      let serviceCode = await this.genServiceCodeFromScratch(table)
      /**
       * import service中include的实体(根据entity的include)
       */
      serviceCode.content = this.codegenUtilService.ensureImports(
        serviceCode.content,
        await this.getEntityImportsForService(table, table.serviceFilePath),
      )

      serviceCode.content = this.ensureSearchConditions(
        serviceCode.content,
        table,
      )

      return serviceCode
    } else {
      throw new HttpException('系统错误', HttpStatus.BAD_GATEWAY)
    }
  }

  /**
   * 更新service代码中用到的include(后续版本改成了默认用scope)
   * 但是include还是有不可替代的作用比如不同的参数需要有不同的include
   *
   * @param code
   * @param table
   * @returns
   */
  public async ensureServiceConstructorInclude(
    code: string,
    table: MetaTable,
  ): Promise<string> {
    const sourceFile = this.tsmorphService.toSourceFile(code)
    const classDeclaration = sourceFile.getClass(`${table.className}Service`)
    const constructor = classDeclaration.getConstructors()[0]
    const expressStatements = constructor.getDescendantsOfKind(
      SyntaxKind.ExpressionStatement,
    )
    for (const expressionStatement of expressStatements) {
      if (/^this\.include = /.test(expressionStatement.getFullText().trim())) {
        const includeStatement = await this.getIncludeStatement(table, 'all')
        expressionStatement.replaceWithText(
          `this.include = ${includeStatement}`,
        )
      }

      if (
        /^this\.includeForOne = /.test(expressionStatement.getFullText().trim())
      ) {
        const includeStatement = await this.getIncludeStatement(table, 'one')
        expressionStatement.replaceWithText(
          `this.includeForOne = ${includeStatement}`,
        )
      }
    }
    return this.codegenUtilService.codeFormat(sourceFile.getFullText())
  }

  private async convertToInclude(nodes: any) {
    for (const node of nodes) {
      const columnId = node.nodeId.split('-')[node.nodeId.split('-').length - 1]
      const column = await this.columnService.findOneMetaColumnById(columnId)
      if (!column) {
        throw new HttpException(
          `非法nodeId: ${node.nodeId}, 请重新定义relation`,
          HttpStatus.NOT_ACCEPTABLE,
        )
      }
      node['as'] = `--${column.name}--`
      node['model'] = `${column.refTable.className}`
      node['required'] = 'false'
      if (node.include && node.include.length > 0) {
        node.include = node.include.filter((o) => o.isChecked)
        await this.convertToInclude(node.include.filter((o) => o.isChecked))
      } else {
        node.include = undefined
      }
    }
    return nodes
  }

  /**
   * 根据定义的relation获取include语句
   *
   * @param table - MetaTable - table定义
   * @returns
   */
  public async getIncludeStatement(
    table: MetaTable,
    type: 'all' | 'one' = 'all',
  ): Promise<string> {
    const relationNodesMapping = {
      all: table.relationNodes ? table.relationNodes[0] : undefined,
      one: table.relationNodesForOne ? table.relationNodesForOne[0] : undefined,
    }

    if (
      (type === 'all' &&
        table.relationNodes &&
        table.relationNodes.length > 0) ||
      (type === 'one' &&
        table.relationNodesForOne &&
        table.relationNodesForOne.length > 0)
    ) {
      const relation = relationNodesMapping[type]
      const includeObj = await this.convertToInclude(
        relation.include.filter((o) => o.isChecked),
      )
      return JSON.stringify(
        includeObj,
        ['model', 'as', 'include', 'required'],
        2,
      )
        .replace(/"/g, '')
        .replace(/--/g, '"')
    } else {
      return '[]'
    }
  }

  /**
   * 确保service类中有buildCache方法(没有就添加，有就覆盖)
   *
   * @param code - string - 代码内容
   * @param table - MetaTable - 表定义(经过前端配置过relations并生成了relations的表定义)
   * @returns
   */
  // public ensureCacheBuildService(code: string, table: MetaTable) {
  //   let includeStatement = '[]'
  //   if (
  //     table.includeStatement &&
  //     table.includeStatement.length > 0 &&
  //     table.includeStatement[0].include &&
  //     table.includeStatement[0].include.length > 0
  //   ) {
  //     includeStatement = JSON.stringify(table.includeStatement[0].include)
  //       .replace(/"/g, '')
  //       .replace(/--/g, '"')
  //   }
  //   const statements = `
  //     const ${table.instanceName}Obj = await this.${table.instanceName}Model.findByPk(id, {
  //       include: ${includeStatement},
  //     })
  //     return ${table.instanceName}Obj
  //   `
  //   const returnCode = this.codegenUtilService.ensureClassMethod(
  //     code,
  //     `${table.className}Service`,
  //     `build${table.className}Cache`,
  //     true,
  //     [{ name: 'id', type: 'number' }],
  //     statements,
  //   )
  //   return this.codegenUtilService.codeFormat(returnCode)
  // }
}
