import { GitlabProjectService } from './gitlab.project.service'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { v1 as uuidv1 } from 'uuid'
import configuration from './../../config/configuration'
import { GitlabService } from './gitlab.service'

describe('GitProjectService Test', () => {
  let gitlabProjectService: GitlabProjectService

  beforeEach(async () => {
    jest.setTimeout(60000)
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
      ],
      providers: [GitlabProjectService, GitlabService],
    }).compile()
    gitlabProjectService = moduleRef.get(GitlabProjectService)
  })

  describe('project manipulate', () => {
    let projectId: number

    it('should create an empty project', async () => {
      const projectName = uuidv1()
      const result = await gitlabProjectService.createProject(projectName)
      projectId = result.id
      expect(result.name).toBe(projectName)
    })

    it('should remove the created project', async () => {
      const result = await gitlabProjectService.deleteProject(projectId)
      console.log(result)
    })

    // TODO: 执行时间太长
    // 参考issue: https://github.com/facebook/jest/issues/11607
    // it('should create an empty project from template project 20', async () => {
    //   const projectName = uuidv1()
    //   const result = await gitlabProjectService.createProject(projectName, 20)
    //   projectId = result.id
    //   expect(result.name).toBe(projectName)
    // })
  })
})
