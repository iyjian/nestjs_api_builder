import { CodingService } from './coding.service'
import { Module, forwardRef } from '@nestjs/common'
import { GitlabService } from './gitlab.service'
import { GitlabController } from './controllers/gitlab.controller'
import { GitlabProjectService } from './gitlab.project.service'
import { CodingController } from './controllers/coding.controller'
import { BaseModule } from '../base/base.module'

@Module({
  providers: [GitlabService, GitlabProjectService, CodingService],
  controllers: [GitlabController, CodingController],
  exports: [GitlabService, GitlabProjectService],
  imports: [forwardRef(() => BaseModule)],
})
export class CodingModule {}
