import { Module } from '@nestjs/common'
import { TransformerService } from './transformer.service'
import { ToolController } from './tool.controller'
import { DataTypeService } from './data.type.service'
import { ToolService } from './services/tool.service'
import { CacheService } from './cache.service'

@Module({
  controllers: [ToolController],
  providers: [TransformerService, DataTypeService, ToolService, CacheService],
})
export class ToolModule {}
