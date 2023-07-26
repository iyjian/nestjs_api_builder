import { NestFactory } from '@nestjs/core'
import { MetaTableService } from '../features/base/services/meta.table.service'
import { AppModule } from './../app.module'
import { ERService } from '../features/codegen/services/er.service'
import {
  Project,
  Node,
  Decorator,
  StructureKind,
  SourceFile,
  ClassDeclaration,
} from 'ts-morph'
import fs from 'fs'
import { CodegenUtilService } from '../features/codegen/services/codegen.util.service'
import { GitService } from './../features/coding'
import _ from 'lodash'
import { CodegenService } from '../features/codegen/services/codegen.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const erService = app.get(ERService)
  const metaTableService = app.get(MetaTableService)
  const codegenUtilService = app.get(CodegenUtilService)
  const gitService = app.get(GitService)
  const codegenService = app.get(CodegenService)
  // await codegenService.makeupBelongsToColumns()
}
bootstrap()
