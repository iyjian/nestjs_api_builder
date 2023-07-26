import { CodegenUtilService } from './codegen.util.service'
import { MetaTableService } from '../../base/services/meta.table.service'
import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../../app.module'
import { MetaTable } from '../../base/entities/meta.table.entity'
import { CodegenControllerService } from './codegen.controller.service'

describe('CodegenControllerService Test', () => {
  let app: INestApplicationContext
  let codegenControllerService: CodegenControllerService
  let codegenUtilService: CodegenUtilService
  let metaTableService: MetaTableService

  beforeEach(async () => {
    app = await NestFactory.createApplicationContext(AppModule)
    codegenControllerService = app.get(CodegenControllerService)
    metaTableService = app.get(MetaTableService)
    codegenUtilService = app.get(CodegenUtilService)
  })

  it('should has test case', () => {
    // TODO: 补测试用例
    expect(true).toBe(true)
  })

  it('test ensureControllerResponseSchema', async () => {
    const table: MetaTable = await metaTableService.findOneMetaTable(273)
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

      @Post('')
      @ApiOperation({
        summary:'POST ${table.instanceName}'
      })
      @ApiFindOneResponse({
        modelName: '${table.instanceName}',
        schema: postResponseSchema
      })
      @codeGen('${table.id}-create')
      create(@Body() create${table.className}: Create${table.className}RequestDTO) {
        return this.${table.instanceName}Service.create(create${table.className})
      }

      @Patch(':id')
      @ApiOperation({
        summary:'PATCH ${table.instanceName}'
      })
      @ApiPatchResponse({
        modelName: '${table.instanceName}'
      })
      @codeGen('${table.id}-update')
      update(@Param('id') id: string, @Body() update${table.className}RequestDTO: Update${table.className}RequestDTO) {
        return this.${table.instanceName}Service.updateById(+id, update${table.className}RequestDTO)
      }

      @Get('')
      @ApiOperation({
        summary:'GET ${table.instanceName}(list)'
      })
      @ApiPaginatedResponse({
        modelName: '${table.instanceName}',
        schema: findAllResponseSchema
      })
      @codeGen('${table.id}-findAll')
      findAll(@Query() findAllQuery${table.className}: FindAll${table.className}RequestDTO) {
        return this.${table.instanceName}Service.findAll(findAllQuery${table.className})
      }

      @Get(':id')
      @ApiOperation({
        summary:'GET ${table.instanceName}(single)'
      })
      @ApiFindOneResponse({
        modelName: '${table.instanceName}',
        schema: findOneResponseSchema
      })
      @codeGen('${table.id}-findOne')
      findOne(@Param('id') id: string) {
        return this.${table.instanceName}Service.findOneById(+id)
      }

      @Delete(':id')
      @ApiOperation({
        summary:'DELETE ${table.instanceName}'
      })
      @ApiDeleteResponse({
        modelName: '${table.instanceName}'
      })
      @codeGen('${table.id}-remove')
      remove(@Param('id') id: string) {
        return this.${table.instanceName}Service.removeById(+id)
      }
    }
    `
    const expectResult = `import {
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
    import {
      ApiPaginatedResponse,
      ApiFindOneResponse,
      ApiPatchResponse,
      ApiDeleteResponse,
      codeGen,
    } from './../../../core'
    import {
      FindOneResponseSchema,
      FindAllResponseSchema,
    } from './../dto/certificate.response.schema'

    @Controller('certificate')
    @ApiTags('证书')
    export class CertificateController {
      constructor(private readonly certificateService: CertificateService) {}

      @Post('')
      @ApiOperation({
        summary: 'POST certificate',
      })
      @ApiFindOneResponse({
        modelName: 'certificate',
        schema: postResponseSchema,
      })
      @codeGen('273-create')
      create(@Body() createCertificate: CreateCertificateRequestDTO) {
        return this.certificateService.create(createCertificate)
      }

      @Patch(':id')
      @ApiOperation({
        summary: 'PATCH certificate',
      })
      @ApiPatchResponse({
        modelName: 'certificate',
      })
      @codeGen('273-update')
      update(
        @Param('id') id: string,
        @Body() updateCertificateRequestDTO: UpdateCertificateRequestDTO,
      ) {
        return this.certificateService.updateById(+id, updateCertificateRequestDTO)
      }

      @Get('')
      @ApiOperation({
        summary: 'GET certificate(list)',
      })
      @ApiPaginatedResponse({
        modelName: 'certificate',
        schema: findAllResponseSchema,
      })
      @codeGen('273-findAll')
      findAll(@Query() findAllQueryCertificate: FindAllCertificateRequestDTO) {
        return this.certificateService.findAll(findAllQueryCertificate)
      }

      @Get(':id')
      @ApiOperation({
        summary: 'GET certificate(single)',
      })
      @ApiFindOneResponse({
        modelName: 'certificate',
        schema: findOneResponseSchema,
      })
      @codeGen('273-findOne')
      findOne(@Param('id') id: string) {
        return this.certificateService.findOneById(+id)
      }

      @Delete(':id')
      @ApiOperation({
        summary: 'DELETE certificate',
      })
      @ApiDeleteResponse({
        modelName: 'certificate',
      })
      @codeGen('273-remove')
      remove(@Param('id') id: string) {
        return this.certificateService.removeById(+id)
      }
    }`

    const result =
      await codegenControllerService.ensureControllerResponseSchema(table, code)

    expect(codegenUtilService.codeFormat(result)).toStrictEqual(
      codegenUtilService.codeFormat(expectResult),
    )
  })
})
