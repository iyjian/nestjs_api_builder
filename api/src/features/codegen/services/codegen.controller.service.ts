import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Code } from '../../../core/interfaces/CodeType'
import { Cache } from 'cache-manager'
import _ from 'lodash'
import { MetaTable } from '../../base/entities/meta.table.entity'
import { GitService } from '../../coding'
import { CodegenUtilService } from './codegen.util.service'
import { ResponseCodeGenService } from './codegen.response.service'
import { Project } from 'ts-morph'

@Injectable()
export class CodegenControllerService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly gitService: GitService,
    private readonly codegenUtilService: CodegenUtilService,
    private readonly responseCodeGenService: ResponseCodeGenService,
  ) {}

  private readonly logger = new Logger(CodegenControllerService.name)

  private getCreateMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      @Post('')
      @ApiOperation({
        summary:'POST ${table.instanceName}'
      })
      @ApiFindOneResponse( '${table.instanceName}', FindOneResponseSchema )
      @codeGen('${table.id}-create')
      create(@Body() create${table.className}: Create${table.className}RequestDTO) {
        return this.${table.instanceName}Service.create(create${table.className})
      }
    `
  }

  private getUpdateMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      @Patch(':id')
      @ApiOperation({
        summary:'PATCH ${table.instanceName}'
      })
      @ApiPatchResponse( '${table.instanceName}' )
      @codeGen('${table.id}-update')
      update(@Param('id') id: string, @Body() update${table.className}RequestDTO: Update${table.className}RequestDTO) {
        return this.${table.instanceName}Service.updateById(+id, update${table.className}RequestDTO)
      }
    `
  }

  private getFindAllMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      @Get('')
      @ApiOperation({
        summary:'GET ${table.instanceName}(list)'
      })
      @ApiPaginatedResponse( '${table.instanceName}', FindAllResponseSchema )
      @codeGen('${table.id}-findAll')
      findAll(@Query() findAllQuery${table.className}: FindAll${table.className}RequestDTO) {
        return this.${table.instanceName}Service.findAll(findAllQuery${table.className})
      }
    `
  }

  private getFindOneMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      @Get(':id')
      @ApiOperation({
        summary:'GET ${table.instanceName}(single)'
      })
      @ApiFindOneResponse( '${table.instanceName}', FindOneResponseSchema )
      @codeGen('${table.id}-findOne')
      findOne(@Param('id') id: string) {
        return this.${table.instanceName}Service.findOneByIdOrThrow(+id)
      }
    `
  }

  private getRemoveMethod(table: MetaTable): string {
    /* prettier-ignore */
    return `
      @Delete(':id')
      @ApiOperation({
        summary:'DELETE ${table.instanceName}'
      })
      @ApiDeleteResponse( '${table.instanceName}' )
      @codeGen('${table.id}-remove')
      remove(@Param('id') id: string) {
        return this.${table.instanceName}Service.removeById(+id)
      }
    `
  }

  public genControllerCodeFromScratch(
    table: MetaTable,
    methods = [
      'getCreateMethod',
      'getUpdateMethod',
      'getFindAllMethod',
      'getFindOneMethod',
      'getRemoveMethod',
    ],
  ): Code {
    let methodCode: string = ''
    for (const method of methods) {
      if (
        table.type === 'view' &&
        ['getCreateMethod', 'getUpdateMethod', 'getRemoveMethod'].includes(
          method,
        )
      ) {
        continue
      }
      console.log(method)
      methodCode += this[method](table)
    }
    /* prettier-ignore */
    let code = `import {
      Controller,
      Get,
      Post,
      Body,
      Patch,
      Param,
      Delete,
      Query,
    } from '@nestjs/common'
    import { ApiOperation, ApiTags } from '@nestjs/swagger'

    @Controller('${table.instanceName}')
    @ApiTags('${table.comment}')
    export class ${table.className}Controller {
      constructor(private readonly ${table.instanceName}Service: ${table.className}Service) {}
      ${methodCode}
    }
    `
    code = this.codegenUtilService.ensureImports(code, {
      [this.codegenUtilService.getImportSpecifier(
        table.controllerFilePath,
        table.dtoFilePath,
      )]: {
        identifiers: [
          `FindAll${table.className}RequestDTO`,
          `Create${table.className}RequestDTO`,
          `Update${table.className}RequestDTO`,
        ],
      },
    })

    code = this.codegenUtilService.ensureImports(code, {
      [this.codegenUtilService.getImportSpecifier(
        table.controllerFilePath,
        table.serviceFilePath,
      )]: {
        identifiers: [`${table.className}Service`],
      },
    })

    // 生成controller的Swagger响应结构和响应数据示例

    return {
      label: 'ctl',
      path: table.controllerFilePath,
      content: this.codegenUtilService.codeFormat(code),
      originContent: '',
      isExist: false,
    }
  }

  public async getControllerCode(
    table: MetaTable,
    branch: string,
  ): Promise<Code> {
    const contentResult = await this.gitService.getFileContent(
      table.project.repoId,
      branch,
      table.controllerFilePath,
    )

    if (contentResult.err === 0) {
      // 如果存在controller的代码，则不做修改，直接返回
      const content = await this.ensureControllerResponseSchema(
        table,
        contentResult.content,
      )
      return {
        content,
        originContent: content,
        path: table.controllerFilePath,
        isExist: true,
        label: 'ctl',
      }
    } else if (contentResult.err === 404) {
      const controllerCode = this.genControllerCodeFromScratch(table)
      controllerCode.content = await this.ensureControllerResponseSchema(
        table,
        controllerCode.content,
      )
      return controllerCode
    } else {
      throw new HttpException('系统错误', HttpStatus.BAD_GATEWAY)
    }
  }

  /**
   *  生成controller的Swagger响应结构和响应数据示例
   */
  public async ensureControllerResponseSchema(
    table: MetaTable,
    fileContent: string,
  ): Promise<string> {
    // 根据tableId生成schema
    // const schema: any = await this.responseCodeGenService.genResponseSchema(
    //   table.id,
    // )

    // 将装饰器的import插入到Controller的代码中
    fileContent = this.codegenUtilService.ensureImports(fileContent, {
      [`./../../../core`]: {
        identifiers: [
          `ApiPaginatedResponse`,
          `ApiFindOneResponse`,
          'ApiPatchResponse',
          'ApiDeleteResponse',
          `codeGen`,
        ],
      },
    })

    const controllerResponseSchemaMapping = {
      create: 'FindOneResponseSchema',
      findAll: 'FindAllResponseSchema',
      findOne: 'FindOneResponseSchema',
    }

    const project = new Project({})
    const sourceFile = project.createSourceFile('/dummy', fileContent)
    const classDeclaration = sourceFile.getClass(`${table.className}Controller`)

    for (const method of classDeclaration.getMethods()) {
      const codeGenDecorator = method.getDecorator('codeGen')
      if (codeGenDecorator && codeGenDecorator.getArguments()?.length) {
        const controllerType = codeGenDecorator
          .getArguments()[0]
          .getText()
          .split('-')[1]
          .replace("'", '')
        this.logger.verbose(
          `ensureControllerResponseSchema - detected controllerType: ${controllerType}`,
        )
        if (controllerType in controllerResponseSchemaMapping) {
          fileContent = this.codegenUtilService.ensureImports(fileContent, {
            [`./../dto/${table.dotName}.response.schema`]: {
              identifiers: [controllerResponseSchemaMapping[controllerType]],
            },
          })
        }
      }
    }

    // 返回生成好装饰器的Controller代码
    return fileContent
  }

  /**
   * 根据schema生成 ${table.dotName}.response.schema.ts
   * TODO: BUG 当table中有has many关系，且在findOne中定义了关系时并没有生成正确的responseSchema
   */
  public async genSchemaCodeFromScratch(table: MetaTable): Promise<Code> {
    // 根据tableId生成schema
    const findOneResponseSchema: any = await this.responseCodeGenService.genResponseSchema(
      table.id,
      'findOne'
    )

    const findAllResponseSchema: any = await this.responseCodeGenService.genResponseSchema(
      table.id,
      'findAll'
    )

    const code = `export const FindOneResponseSchema = ${JSON.stringify(findOneResponseSchema)}
  
                  export const FindAllResponseSchema = ${JSON.stringify(findAllResponseSchema)}
                 `

    return {
      label: 'schema',
      path: table.schemaFilePath,
      content: this.codegenUtilService.codeFormat(code),
      originContent: '',
      isExist: false,
    }
  }

  public async getSchemaCode(table: MetaTable, branch: string): Promise<Code> {
    const contentResult = await this.gitService.getFileContent(
      table.project.repoId,
      branch,
      table.schemaFilePath,
    )

    if (contentResult.err === 500) {
      throw new HttpException(contentResult.errMsg, HttpStatus.BAD_GATEWAY)
    } else if (contentResult.err === 0) {
      // 如果存在schema的代码
      const schemaCode = await this.genSchemaCodeFromScratch(table)
      schemaCode.isExist = true
      schemaCode.originContent = contentResult.content
      return schemaCode
    } else if (contentResult.err === 404) {
      const schemaCode = await this.genSchemaCodeFromScratch(table)
      return schemaCode
    } else {
      throw new HttpException('系统错误', HttpStatus.BAD_GATEWAY)
    }
  }
}
