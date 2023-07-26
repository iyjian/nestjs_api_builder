import { GitlabService } from './gitlab.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { v1 as uuidv1 } from 'uuid'
import { Test } from '@nestjs/testing'
import configuration from '../../config/configuration'

describe('GitService', () => {
  let gitService: GitlabService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
      ],
      providers: [GitlabService],
    }).compile()
    gitService = moduleRef.get(GitlabService)
  })

  describe('getFile', () => {
    it('should return the file content', async () => {
      // TODO: 补测试用例
      // const result = await gitService.getFilesContent()
      expect(true).toBe(true)
    })
  })
})
