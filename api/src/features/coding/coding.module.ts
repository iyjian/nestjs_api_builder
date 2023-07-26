import { CodingService } from './coding.service'
import { Module } from '@nestjs/common'
import { GitlabService } from './gitlab.service'
import { GitlabController } from './controllers/gitlab.controller'
import { GitlabProjectService } from './gitlab.project.service'
import { CodingController } from './controllers/coding.controller'

@Module({
  providers: [GitlabService, GitlabProjectService, CodingService],
  controllers: [GitlabController, CodingController],
  exports: [GitlabService],
})
export class CodingModule {}
