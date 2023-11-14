import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common'
import { MetaTableService } from '../../base/services/meta.table.service'
import { GitService } from '../../coding'
import { CodegenService } from '../services/codegen.service'
import { CodegenServiceService } from '../services/codegen.service.service'
import { Code, CodeType } from '../../../core/interfaces/CodeType'
import moment from 'moment'
import { MetaTable } from '../../base'
import { CodegenControllerService } from '../services/codegen.controller.service'
import { CodegenEntityService } from '../services/codegen.entity.service'
import { CodegenModuleService } from '../services/codegen.module.service'
import { CodePreviewRequestDTO } from '../dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('codegen')
@ApiTags('codegen')
export class CodegenController {
  private readonly logger = new Logger(CodegenController.name)

  constructor(
    private readonly codegenService: CodegenService,
    private readonly codegenServiceService: CodegenServiceService,
    private readonly codegenControllerService: CodegenControllerService,
    private readonly codegenEntityService: CodegenEntityService,
    private readonly gitService: GitService,
    private readonly metaTableService: MetaTableService,
    private readonly codegenModuleService: CodegenModuleService,
  ) {}

  @Post('codePreview')
  @ApiOperation({
    summary: '代码预览',
  })
  async previewCRUDCode(@Body() codePreviewRequest: CodePreviewRequestDTO) {
    const { tableId, branch, codeTypes } = codePreviewRequest

    const table = await this.metaTableService.findOneTableForCodeGen(tableId)

    if (!table) throw new Error('no table info')

    const codes: Promise<Code>[] = []

    /**
     * 以下为生成代码的顺序，因为代码有前后依赖，
     * 比如index文件必须在同目录下其他代码生成后才能生成，所以顺序值不可随意修改。
     *
     */
    /*prettier-ignore*/
    const codeTypeOrder: { [codeType in CodeType]: number } = {
      'enty': 1,
      'dto/req': 2,
      'ctl': 3,
      'serv': 4,
      'mdu': 5,
      'dto/idx': 6,
      'enty/idx': 7,
      'ctl/idx': 8,
      'serv/idx': 9,
      'mdu/idx': 10,
      'schema': 5.5,
      'appMdu': 11
    }

    let entyCodeGen: Promise<Code>,
      requestDTOCodeGen: Promise<Code>,
      ctlCodeGen: Promise<Code>,
      servCodeGen: Promise<Code>,
      mduCodeGen: Promise<Code>,
      dtoIdxCodeGen: Promise<Code>,
      entyIdxCodeGen: Promise<Code>,
      ctlIdxCodeGen: Promise<Code>,
      servIdxCodeGen: Promise<Code>,
      schemaCodeGen: Promise<Code>

    for (const codeType of codeTypes.sort((a, b) =>
      codeTypeOrder[a] > codeTypeOrder[b] ? 1 : -1,
    )) {
      if (codeType === 'enty') {
        entyCodeGen = this.codegenEntityService.getEntityDefinitionCode(
          table,
          branch,
        )
        codes.push(entyCodeGen)
      }

      if (codeType === 'dto/req') {
        requestDTOCodeGen = this.codegenService.getRequestDTOCode(table, branch)
        codes.push(requestDTOCodeGen)
      }

      if (codeType === 'ctl') {
        ctlCodeGen = this.codegenControllerService.getControllerCode(
          table,
          branch,
        )
        codes.push(ctlCodeGen)
      }

      if (codeType === 'serv') {
        servCodeGen = this.codegenServiceService.getServiceCode(table, branch)
        codes.push(servCodeGen)
      }

      if (codeType === 'mdu') {
        mduCodeGen = this.codegenModuleService.getModuleCode(table, branch)

        codes.push(mduCodeGen)
      }

      if (codeType === 'schema') {
        schemaCodeGen = this.codegenControllerService.getSchemaCode(
          table,
          branch,
        )
        codes.push(schemaCodeGen)
      }

      if (codeType === 'dto/idx') {
        dtoIdxCodeGen = Promise.all([requestDTOCodeGen]).then((values) => {
          return this.codegenService.getIndexFileCode(
            table,
            branch,
            'DTODirectory',
            values,
          )
        })
        codes.push(dtoIdxCodeGen)
      }

      if (codeType === 'enty/idx') {
        entyIdxCodeGen = entyCodeGen.then((entyCode) =>
          this.codegenService.getIndexFileCode(
            table,
            branch,
            'entityDirectory',
            entyCode ? [entyCode] : [],
          ),
        )
        codes.push(entyIdxCodeGen)
      }

      if (codeType === 'ctl/idx') {
        ctlIdxCodeGen = ctlCodeGen.then((ctlCode) =>
          this.codegenService.getIndexFileCode(
            table,
            branch,
            'controllerDirectory',
            ctlCode ? [ctlCode] : [],
          ),
        )
        codes.push(ctlIdxCodeGen)
      }

      if (codeType === 'serv/idx') {
        servIdxCodeGen = servCodeGen.then((servCode) =>
          this.codegenService.getIndexFileCode(
            table,
            branch,
            'serviceDirectory',
            servCode ? [servCode] : [],
          ),
        )
        codes.push(servIdxCodeGen)
      }

      if (codeType === 'mdu/idx') {
        const mduIdxCodeGen = Promise.all([
          entyIdxCodeGen,
          servIdxCodeGen,
        ]).then((values) =>
          this.codegenService.getIndexFileCode(
            table,
            branch,
            'moduleDirectory',
            [values[0], values[1]].filter((o) => o),
          ),
        )
        codes.push(mduIdxCodeGen)
      }
    }

    this.logger.debug(`codeGen - total files: ${codes.length}`)

    const allCodes = await Promise.all(codes)

    if (mduCodeGen) {
      const moduleCode = await mduCodeGen
      if (!moduleCode.isExist) {
        const appMduCode = await this.codegenModuleService.updateAppModule(
          table,
          branch,
        )
        allCodes.push(appMduCode)
      }
    }

    return {
      codes: allCodes,
      table,
    }
  }

  @Post('saveEntity')
  saveEntity(@Body() table: MetaTable) {
    table.columns = table?.columns?.filter((column) => column.name) || []
    return this.codegenService.saveEntity(table)
  }

  @Post('commitV2')
  async commitV2(
    @Body('repoId') repoId: number,
    @Body('codes') codes: Code[],
    @Body('sourceBranch') sourceBranch: string,
    @Body('targetBranch') targetBranch?: string,
    @Body('comment') comment?: string,
  ) {
    // 如果没有指定目标分支, 则创建一个
    if (!targetBranch) {
      targetBranch = `${repoId}_${moment().format('YYYYMMDD_HHmmss')}`
      await this.gitService.createBranch(repoId, targetBranch, sourceBranch)
    }

    const commitFiles = [] as any

    for (const code of codes) {
      
      const existingFile = await this.gitService.getFileContent(repoId, targetBranch, code.path)
      console.log(existingFile)

      if (existingFile.err === 404) {
        this.logger.debug(`commitV2 - add new file ${code.path}`)
        commitFiles.push({
          filePath: code.path,
          content: code.content,
          action: 'create',
        })
      } else if (code.content !== existingFile.content) {
        this.logger.debug(`commitV2 - update file`, code.content, existingFile.content)
        commitFiles.push({
          filePath: code.path,
          content: code.content,
          action: 'update',
        })
      } else {
        this.logger.debug(`commitV2 - skip commit - file: ${code.path} does not change`)
      }
    }

    // 如果没有文件要提交，则直接返回true
    if (commitFiles.length === 0) {
      return true
    }

    await this.gitService.commitFiles(
      repoId,
      targetBranch,
      commitFiles as any,
      comment ? comment : 'commit',
    )

    if (sourceBranch !== targetBranch) {
      return this.gitService.createMergeRequest(
        repoId,
        targetBranch,
        targetBranch,
        targetBranch,
        sourceBranch,
      )
    } else {
      return true
    }
  }

  @Post('saveAndSubmitPR')
  async saveAndSubmitPR(
    @Body('codes') codes: Code[],
    @Body('tableId') tableId: number,
    @Body('sourceBranch') sourceBranch: string,
    @Body('targetBranch') targetBranch?: string,
    @Body('comment') comment?: string,
  ) {
    const table = await this.metaTableService.findOneMetaTable(tableId)

    if (!table) throw new Error('empty table')

    // 如果没有指定目标分支, 则创建一个
    if (!targetBranch) {
      targetBranch = `${table.name}_${moment().format('YYYYMMDD_HHmmss')}`
      await this.gitService.createBranch(
        table.project.repoId,
        targetBranch,
        sourceBranch,
      )
    }

    const comitFiles = codes.map((code) => ({
      filePath: code.path,
      content: code.content,
      action: code.isExist ? 'update' : 'create',
    }))

    await this.gitService.commitFiles(
      table.project.repoId,
      targetBranch,
      comitFiles as any,
      comment ? comment : 'commit',
    )

    if (sourceBranch !== targetBranch) {
      return this.gitService.createMergeRequest(
        table.project.repoId,
        targetBranch,
        targetBranch,
        targetBranch,
        sourceBranch,
      )
    } else {
      return true
    }
  }

  @Get('relations')
  async getRelations(
    @Query('tableId') tableId: number,
    @Query('level') level: number,
    @Query('nodeId') nodeId: string,
  ) {
    const result = await this.codegenService.getRelations(
      tableId,
      +level,
      nodeId,
    )
    return result
  }

  @Post('genFrontCode')
  genFrontCode(@Body() config: any) {
    return true
  }
}
