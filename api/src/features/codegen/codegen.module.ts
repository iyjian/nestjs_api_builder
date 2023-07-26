import { Module } from '@nestjs/common'
import { BaseModule } from '../base'
import { CodingModule, GitService } from '../coding'
import { CodegenController } from './controllers/codegen.controller'
import { CodegenControllerService } from './services/codegen.controller.service'
import { CodegenEntityService } from './services/codegen.entity.service'
import { CodegenService } from './services/codegen.service'
import { CodegenServiceService } from './services/codegen.service.service'
import { CodegenUtilService } from './services/codegen.util.service'
import { DBSyncController } from './controllers/db.sync.controller'
import { ERController } from './controllers/er.controller'
import { ERService } from './services/er.service'
import { ResponseCodeGenService } from './services/codegen.response.service'
import { DataTypeReductionService } from './services/datatype.reduction.service'
import { DBSyncService } from './services/db.sync.service'
import { TSMorphService } from './services/tsmorph.service'
import { CodegenModuleService } from './services/codegen.module.service'

@Module({
  controllers: [CodegenController, ERController, DBSyncController],
  providers: [
    CodegenService,
    CodegenUtilService,
    ERService,
    TSMorphService,
    CodegenServiceService,
    CodegenEntityService,
    CodegenControllerService,
    DBSyncService,
    DataTypeReductionService,
    ResponseCodeGenService,
    CodegenModuleService,
  ],
  imports: [BaseModule, CodingModule],
  exports: [DataTypeReductionService],
})
export class CodegenModule {}
