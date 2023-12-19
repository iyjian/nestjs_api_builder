import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import _ from 'lodash'
import {
  Code,
  CodeType,
  DirectoryType,
} from '../../../core/interfaces/CodeType'
import { MetaTableService } from '../../base/services/meta.table.service'
import { MetaColumnService } from '../../base/services/meta.column.service'
import { Transaction, UniqueConstraintError } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { MetaTable } from '../../base/entities/meta.table.entity'
import { Project } from 'ts-morph'
import { GitService } from '../../coding'
import { CodegenUtilService } from './codegen.util.service'
import { MetaColumn } from '../../base'
@Injectable()
export class CodegenService {
  constructor(
    private readonly mysql: Sequelize,
    private readonly metaTableService: MetaTableService,
    private readonly metaColumnService: MetaColumnService,
    private readonly gitService: GitService,
    private readonly codegenUtilService: CodegenUtilService,
  ) {}

  private readonly logger = new Logger(CodegenService.name)

  private hasDiff(obj1: any, obj2: any, ignoreKeys: string[]) {
    const diffs = []
    for (let key in obj1) {
      if (obj1[key] !== obj2[key] && !ignoreKeys.includes(key)) {
        diffs.push(`key: ${key} obj1 val: ${obj1[key]} obj2 val: ${obj2[key]}`)
      }
    }
    if (diffs.length) {
      this.logger.debug(diffs.join('\n'))
    }
    return !!diffs.length
  }
  /**
   * 保存实体
   * @param table
   * @returns
   */
  async saveEntity(table: MetaTable) {
    const validStatus = await this.metaTableService.validTableDefinition(table)

    if (validStatus) {
      throw new HttpException(validStatus, HttpStatus.BAD_REQUEST)
    }

    let transaction: Transaction
    try {
      transaction = await this.mysql.transaction()

      let tableObj: MetaTable

      if (!table.id) {
        /**
         * 新表: 创建表
         */
        tableObj = await this.metaTableService.createMetaTable(
          {
            name: table.name,
            module: table.module,
            projectId: table.projectId,
            comment: table.comment,
          },
          transaction,
        )
      } else {
        /**
         * 更新表信息: 更新表描述 先删除原有字段，再新增新的字段
         */
        tableObj = await this.metaTableService.updateMetaTable(
          table.id,
          {
            comment: table.comment,
          },
          transaction,
        )
      }

      /**
       * 更新、新增字段信息
       */
      for (const column of table.columns) {
        column.tableId = tableObj.id

        /**
         * 初始化`columnInstance`
         * 如果column中有id属性，则是已有字段，否则是新字段
         */
        let columnInstance: MetaColumn

        if (column.id) {
          columnInstance = await this.metaColumnService.findOneMetaColumnById(
            column.id,
            transaction,
          )
        } else {
          columnInstance = await this.metaColumnService.createMetaColumn(
            column,
            transaction,
          )
          this.logger.verbose(
            `saveEntity - create new column - column: ${column.name}`,
          )
        }

        /**
         * 由于删除外键会将外键所关联的relation字段会一并删除
         * 所以可能出现有column.id，但是`columnInstance`为空的情况。
         */
        if (!columnInstance) {
          this.logger.verbose(
            `saveEntity - column: ${column.name} has been deleted`,
          )
          continue
        }

        /**
         * 字段信息有更新
         *
         * 注意：
         * 1. 如果有字段由**外键**变为**非外键**则需要删除所有外键对应的衍生关系(belongsTo hasMany)
         */
        if (
          column.id &&
          this.hasDiff(column, columnInstance, [
            'createdAt',
            'updatedAt',
            'refTable',
            'dataType',
            'relationColumn',
          ])
        ) {
          this.logger.debug(
            `saveEntity - update column - new Data - id: ${column.id} name: ${column.name}`,
          )

          /**
           * 如果一个字段本来是外键字段，现在取消了外键属性，则需要清空(purge)此字段上和外键相关的属性。
           * 需要情况的字段如下有：
           * > refTableId
           * > relation
           * > relationColumnId
           */
          const purgeRelation =
            column.isFK === false &&
            columnInstance.refTableId &&
            columnInstance.relation === 'BelongsTo' &&
            columnInstance.dataType.dataType !== 'vrelation'

          this.logger.debug(
            `saveEntity - id: ${column.id} name: ${column.name} purgeRelation: ${purgeRelation}`,
          )

          /**
           * 更新字段信息
           */
          await columnInstance.update(
            {
              name: column.name,
              allowNull: column.allowNull,
              comment: column.comment,
              dataTypeId: column.dataTypeId,
              enumKeys: column.enumKeys,
              defaultValue: column.defaultValue,
              remark: column.remark,
              tableId: column.tableId,
              refTableId: purgeRelation ? null : column.refTableId,
              isAutoGen: column.isAutoGen,
              isEnable: column.isEnable,
              order: column.order,
              relation: purgeRelation ? '' : column.relation,
              findable: column.findable,
              searchable: column.searchable,
              createable: column.createable,
              updateable: column.updateable,
              relationColumnId: purgeRelation ? null : column.relationColumnId,
              setCode: column.setCode,
              getCode: column.getCode,
              enumTypeCode: column.enumTypeCode,
              sampleData: column.sampleData,
              forSelectDisplay: column.forSelectDisplay,
            },
            { transaction },
          )

          if (
            columnInstance.dataType.dataType !== 'vrelation' &&
            column.isFK === false &&
            column.refTableId
          ) {
            /**
             * 如果字段本来有外键, 现在没有外键了，则删除所有和外键有关的关系字段。
             * TODO: 我觉得这应该要复用purgeRelation这个判断标志，现在没有时间仔细看，先这样。
             */
            this.logger.debug(
              `saveEntity - remove related columns of column: ${column.id}`,
            )
            await this.metaColumnService.removeRelatedColumns(
              column.id,
              transaction,
            )
          }
        }

        /**
         * 如果该字段是外键，且没有根据此外键创建过关系字段
         * 则需要根据外键额外创建关系
         */
        if (
          column.isFK &&
          column.refTableId &&
          columnInstance.dataType.dataType === 'int' &&
          !columnInstance.relationColumnId
        ) {
          /**
           * 如果是外键，且没有创建过关系，则创建关系字段，并把关系字段的id更新至此字段的relationColumnId上
           */
          this.logger.debug(
            `saveEntity - create relation column - FK column: ${column.name} relation: BelongsTo refTableId: ${column.refTableId}`,
          )
          // step1: 创建BelongsTo关系字段
          const newFKRelation = await this.metaColumnService.createMetaColumn(
            {
              name: column.name.replace(/Id$/, ''),
              allowNull: true,
              comment: '',
              dataTypeId: 0,
              tableId: column.tableId,
              refTableId: column.refTableId,
              isAutoGen: true,
              isEnable: true,
              relation: 'BelongsTo',
              findable: false,
              searchable: false,
              createable: false,
              relationColumnId: columnInstance.id,
            },
            transaction,
          )

          this.logger.verbose(
            `saveEntity - create relation column - ${column.name.replace(
              /Id$/,
              '',
            )} done`,
          )

          // step2: 把新建的关系字段的id更新到原字段的relationColumn上
          await columnInstance.update(
            { relationColumnId: newFKRelation.id },
            { transaction },
          )
          this.logger.verbose(`saveEntity - step2`)

          // step3: 查找已有的HasMany关系的数量
          const existingHasManyRelations =
            await this.metaColumnService.findAllMetaColumn(
              {
                tableId: column.refTableId,
                refTableId: column.tableId,
                relation: '2',
                skipPaging: true,
              },
              transaction,
            )

          this.logger.verbose(`saveEntity - step3`)

          const hasManyColumnName =
            existingHasManyRelations.rows.length > 0
              ? tableObj.pluralName + columnInstance.id.toString()
              : tableObj.pluralName

          this.logger.verbose(
            `saveEntity - createMetaColumn - tableId: ${column.refTableId} column: ${hasManyColumnName}`,
          )

          // step4: 如果已有HasMany关系定义，则relation.name需要加序号
          await this.metaColumnService.createMetaColumn(
            {
              name:
                existingHasManyRelations.rows.length > 0
                  ? tableObj.pluralName + columnInstance.id.toString()
                  : tableObj.pluralName,
              tableId: column.refTableId,
              refTableId: tableObj.id,
              relation: 'HasMany',
              allowNull: true,
              dataTypeId: 0,
              isAutoGen: true,
              isEnable: false,
              searchable: column.searchable,
              findable: column.findable,
              createable: false,
              relationColumnId: columnInstance.id,
            },
            transaction,
          )
          this.logger.verbose(`saveEntity - step4`)
        }
      }

      await transaction.commit()
      return this.metaTableService.findOneMetaTable(tableObj.id)
    } catch (e) {
      if (transaction) {
        await transaction.rollback()
      }
      // TODO: 更清晰的异常处理
      if (e instanceof UniqueConstraintError) {
        throw new HttpException(
          `字段重复: ${e.errors[0].message}`,
          HttpStatus.CONFLICT,
        )
      } else {
        throw e
      }
    }
  }

  /**
   * 根据一个table，获取和这个table有关联的table以及和他们的关联关系
   * 用于在前端的关系树拉取下级关系
   *
   * @param tableId
   * @param level
   * @returns
   */
  async getRelations(tableId: number, level: number = 1, nodeId: string) {
    level = level + 1

    const relationColumns = await this.metaColumnService.findRelationColumns(
      tableId,
    )

    const children = relationColumns.length > 0 ? [] : undefined

    for (const column of relationColumns) {
      /**
       * as属性后用了 `--name--` 这个trick的写法
       * 因为在去掉JSON.stringify childrens)中双引号的时候希望把as这个节点保留成{as: "columnName"}
       * 所以在对字符串整体去除双引号后会将--替换为双引号
       */
      const refTables = await this.metaColumnService.findRelationColumns(
        column.refTableId,
      )
      children.push({
        nodeId: `${nodeId}-${column.id}`,
        tableId: column.refTableId,
        level,
        label: `${column.name.replace(/Id$/, '')}: ${
          column.refTable.className
        }${column.relation === 'HasMany' ? '[]' : ''}  (${column.relation})`,
        model: column.refTable.className,
        module: column.refTable.module,
        required: !column.allowNull,
        children: [],
        leaf: !refTables.length,
        as: `--${column.name.replace(/Id$/, '')}--`,
      })
    }

    return children
  }

  /**
   * 生成DTO定义(新生成)
   *
   * @param table - MetaTable - table的完整定义
   */
  public async genRequestDTOCodeFromScratch(table: MetaTable): Promise<Code> {
    const createDtoProps = []
    const updateDtoProps = []
    const findAllDtoProps = []

    for (const column of table.columns) {
      if (
        column.dataType.dataType === 'vrelation' ||
        column.dataType.dataType === 'virtual'
      ) {
        continue
      }

      createDtoProps.push(
        this.codegenUtilService.getDTOPropCode(
          column,
          false,
          'create',
          column.createable,
        ),
      )

      if (column.findable) {
        findAllDtoProps.push(
          this.codegenUtilService.getDTOPropCode(
            column,
            true,
            'find',
            column.findable,
          ),
        )
      }

      updateDtoProps.push(
        this.codegenUtilService.getDTOPropCode(
          column,
          true,
          'update',
          column.updateable,
        ),
      )
    }
    /* prettier-ignore */
    let code = `import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
                  import { Transform, Type } from 'class-transformer'
                  import { ApiProperty } from '@nestjs/swagger'
                  import { IsNotEmpty } from 'class-validator'

                  export class Create${table.className}RequestDTO {
                    ${createDtoProps.join('\n')}
                  }

                  export class Update${table.className}RequestDTO {
                    ${updateDtoProps.join('\n')}
                  }

                  export class FindOne${table.className}RequestDTO {
                    ${findAllDtoProps.join('\n')}
                  }

                  export class FindAll${table.className}RequestDTO extends PagingRequestDTO {
                    ${findAllDtoProps.join('\n')}
                  }`

    return {
      content: this.codegenUtilService.codeFormat(code),
      originContent: '',
      label: 'dto/req',
      isExist: false,
      path: table.dtoFilePath,
    }
  }

  /**
   * 重新生成DTO定义(指定分支上已经生成过)
   *
   * @param table
   * @param branch - string - 目标分支
   * @returns
   */
  async getRequestDTOCode(table: MetaTable, branch: string): Promise<Code> {
    const contentResult = await this.gitService.getFileContent(
      table.project.repoId,
      branch,
      table.dtoFilePath,
    )

    if (contentResult.err === 404) {
      const code = await this.genRequestDTOCodeFromScratch(table)
      return code
    } else if (contentResult.err === 0) {
      const project = new Project({})

      const sourceFile = project.createSourceFile(
        '/dummy/' + table.dtoFilePath,
        contentResult.content,
      )

      const createDtoProps = []
      const updateDtoProps = []
      const findAllDtoProps = []

      for (const column of table.columns) {
        if (
          column.dataType.dataType === 'vrelation' ||
          column.dataType.dataType === 'virtual'
        ) {
          continue
        }

        createDtoProps.push({
          propertyName: column.name,
          code: this.codegenUtilService.getDTOPropCode(
            column,
            false,
            'create',
            column.createable,
          ),
        })

        updateDtoProps.push({
          propertyName: column.name,
          code: this.codegenUtilService.getDTOPropCode(
            column,
            true,
            'update',
            column.updateable,
          ),
        })

        findAllDtoProps.push({
          propertyName: column.name,
          code: this.codegenUtilService.getDTOPropCode(
            column,
            true,
            'find',
            column.findable,
          ),
        })
      }

      // const createDTOClass = sourceFile.getClass(table.createDTOClass)
      this.codegenUtilService.mergeClassMembers(
        sourceFile,
        table.createDTOClass,
        createDtoProps,
      )

      // const updateDTOClass = sourceFile.getClass(table.updateDTOClass)
      this.codegenUtilService.mergeClassMembers(
        sourceFile,
        table.updateDTOClass,
        updateDtoProps,
      )

      // const findAllDTOClass = sourceFile.getClass(table.findAllDTOClass)
      this.codegenUtilService.mergeClassMembers(
        sourceFile,
        table.findAllDTOClass,
        findAllDtoProps,
      )

      this.codegenUtilService.mergeClassMembers(
        sourceFile,
        table.findOneDTOClass,
        findAllDtoProps,
      )

      const sourceCode = this.codegenUtilService.ensureImports(
        sourceFile.getFullText(),
        {
          '@nestjs/swagger': { identifiers: ['ApiProperty'] },
          'class-validator': { identifiers: ['IsNotEmpty'] },
          './../../../core': {
            identifiers: ['codeGen'],
          },
        },
      )

      return {
        content: this.codegenUtilService.codeFormat(sourceCode),
        originContent: contentResult.content,
        label: 'dto/req',
        isExist: true,
        path: table.dtoFilePath,
      }
    } else {
      throw new HttpException('系统错误', HttpStatus.BAD_REQUEST)
    }
  }

  /**
   * 获取index.ts的文件内容
   *
   * @param table - MetaTable - 表定义
   * @param branch - string - 扫描的目标分支
   * @param directoryType - DirectoryType - 生成index.ts的目录类型，不同的目录类型对应不同的label，label用于前端展示。
   * @param toBeAddedCodes - Code[] - 除扫描指定目录下的文件中的可export的对象外，也会扫描新提交代码中的可export对象。
   * @returns
   */
  public async getIndexFileCode(
    table: MetaTable,
    branch: string,
    directoryType: DirectoryType,
    toBeAddedCodes?: Code[],
  ): Promise<Code> {
    const labelMapping: { [directory in DirectoryType]: CodeType } = {
      DTODirectory: 'dto/idx',
      serviceDirectory: 'serv/idx',
      controllerDirectory: 'ctl/idx',
      entityDirectory: 'enty/idx',
      moduleDirectory: 'mdu/idx',
    }
    let isIndexFileExsiting: boolean
    /**
     * 获取已有index.ts文件
     */
    const indexFilePath = `${table[directoryType]}/index.ts`
    const indexFilecontentResult = await this.gitService.getFileContent(
      table.project.repoId,
      branch,
      indexFilePath,
    )

    if (indexFilecontentResult.err === 500) {
      throw new Error(indexFilecontentResult.errMsg)
    } else if (indexFilecontentResult.err === 404) {
      isIndexFileExsiting = false
    } else {
      isIndexFileExsiting = true
    }

    const originContent = indexFilecontentResult.content || ''

    /**
     * 获取同级目录下的其他文件用于生成index.ts文件
     * 1. 排除index.ts文件
     * 2. 如果生成index.ts的目录类型是moduleDirectory则排除*.controller.ts文件
     */
    const codes = await this.gitService.getFilesContent(
      table.project.repoId,
      branch,
      table[directoryType],
    )

    this.logger.debug(
      `getIndexFileCode - all existing code paths: ${codes
        .map((code) => code.path)
        .join('\n')}`,
    )

    /**
     * TODO: 逻辑有些混乱
     * 1. 不是index.ts且文件以.ts结尾的
     * 3. 或者是controller.ts结尾的且不在moduleDirectory
     */
    const allCodesExceptIndexTS = codes.filter(
      (code) =>
        (code.name !== 'index.ts' &&
          code.name.split('.')[code.name.split('.').length - 1] === 'ts') ||
        (directoryType !== 'moduleDirectory' &&
          /controller\.ts$/.test(code.name)),
    )
    this.logger.debug(allCodesExceptIndexTS.map((code) => code.path).join('\n'))

    let indexFileContent = ''

    if (codes.filter((code) => code.name === 'index.ts').length === 1) {
      indexFileContent = codes.filter((code) => code.name === 'index.ts')[0]
        .content
      isIndexFileExsiting = true
    }

    // 如果有生成出的代码要参与生成index.ts文件，则需要和在代码库中查询到的文件进行合并
    for (const code of allCodesExceptIndexTS) {
      if (
        toBeAddedCodes.filter((toBeAddedCode) => {
          this.logger.debug(
            `getIndexFileCode - ${toBeAddedCode.path === code.path}`,
          )
          return toBeAddedCode.path === code.path
        }).length === 0
      ) {
        this.logger.debug(
          `getIndexFileCode - add ${code.path} to toBeAddedCodes`,
        )
        toBeAddedCodes.push(code)
      }
    }

    this.logger.debug(
      `getIndexFileCode - toBeAddedCodes: ${toBeAddedCodes.map(
        (code) => code.path,
      )}`,
    )

    indexFileContent = this.codegenUtilService.updateIndexFile(
      table[directoryType],
      toBeAddedCodes,
      indexFileContent,
    )

    return {
      label: labelMapping[directoryType],
      isExist: isIndexFileExsiting,
      path: indexFilePath,
      content: indexFileContent,
      originContent,
    }
  }
}
