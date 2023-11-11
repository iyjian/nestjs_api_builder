import { Module } from '@nestjs/common'
import { FrontcodegenController } from './frontcodegen.controller'
import { FrontcodegenService } from './frontcodegen.service'
import { BaseModule } from '../base/base.module.js'

@Module({
  imports: [BaseModule],
  controllers: [FrontcodegenController],
  providers: [FrontcodegenService],
})
export class FrontcodegenModule {}
