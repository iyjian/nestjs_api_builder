// import { GitLabService } from './gitlab.service'
import { Test } from '@nestjs/testing'
import { v1 as uuidv1 } from 'uuid'
import { ConfigModule } from '@nestjs/config'
import configuration from './../../config/configuration'

describe('CodingService', () => {
  // let gitService: GitLabService
  // const testRepoId = 9623664

  beforeEach(async () => {
    // const moduleRef = await Test.createTestingModule({
    //   imports: [
    //     ConfigModule.forRoot({
    //       load: [configuration],
    //       isGlobal: true,
    //     }),
    //   ],
    //   providers: [GitLabService],
    // }).compile()
    // gitService = moduleRef.get<GitLabService>(GitLabService)
  })

  describe('getFile', () => {
    it('should be true', () => {
      // TODO: 补测试用例
      expect(true).toBe(true)
    })
    // it('should return the file content when file exist', async () => {
    //   const result = await gitService.getFileContent(
    //     testRepoId,
    //     'dev',
    //     'src/features/enum/entities/enum.entity.ts',
    //   )
    //   expect(result.content.length).toBeGreaterThan(100)
    // })

    // it('should return git commits', async () => {
    //   const content = await gitService.getCommits(9623664, 'dev')
    //   expect(content.length).toBeGreaterThan(1)
    // })

    // it('should create a random branch', async () => {
    //   const content = await gitService.createBranch(
    //     testRepoId,
    //     `test_${uuidv1()}`,
    //     'dev',
    //   )
    //   expect(content).toHaveProperty('RequestId')
    // })

    // it('should get git files when path exists', async () => {
    //   const codes = await gitService.getFilesContent(9760825, 'dev', 'src')
    //   expect(codes.length).toBeGreaterThan(1)
    // })

    // it('should get empty git files when path not exists', async () => {
    //   const codes = await gitService.getFilesContent(
    //     testRepoId,
    //     'dev',
    //     'src/dummy',
    //   )
    //   expect(codes.length).toBe(0)
    // })
  })
})
