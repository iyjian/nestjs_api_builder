import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { MetaProjectController } from './controllers/meta.project.controller'

import { MetaProjectService } from './services/meta.project.service'

import { MetaTableController } from './controllers/meta.table.controller'

import { MetaTableService } from './services/meta.table.service'

import { MetaColumnController } from './controllers/meta.column.controller'

import { MetaColumnService } from './services/meta.column.service'

import { MetaDataTypeController } from './controllers/meta.data.type.controller'

import { MetaDataTypeService } from './services/meta.data.type.service'

import {
  MetaProject,
  MetaDataType,
  MetaTable,
  MetaColumn,
  FrontProject,
  ProjectModule,
  Route,
  Log,
} from './entities'
import { FrontProjectController } from './controllers/front.project.controller'
import { FrontProjectService } from './services/front.project.service'
import { ProjectModuleController } from './controllers/project.module.controller'
import { ProjectModuleService } from './services/project.module.service'
import { SwaggerController } from './controllers/swagger.controller'
import { LogService, RouteService } from './services'
import { CodingModule } from '../coding'

@Module({
  imports: [
    SequelizeModule.forFeature([
      MetaTable,
      MetaColumn,
      MetaProject,
      MetaDataType,
      FrontProject,
      ProjectModule,
      Route,
      Log,
    ]),
    forwardRef(() => CodingModule),
  ],
  exports: [
    MetaTableService,
    MetaColumnService,
    MetaProjectService,
    FrontProjectService,
    ProjectModuleService,
  ],
  controllers: [
    MetaProjectController,
    MetaTableController,
    MetaColumnController,
    MetaDataTypeController,
    FrontProjectController,
    ProjectModuleController,
    SwaggerController,
  ],
  providers: [
    MetaProjectService,
    MetaTableService,
    MetaColumnService,
    MetaDataTypeService,
    FrontProjectService,
    ProjectModuleService,
    RouteService,
    LogService,
  ],
})
export class BaseModule {}
