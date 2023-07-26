import { Test, TestingModule } from '@nestjs/testing'
import { OpenAPIService } from './openai.service'
import 'dotenv/config'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from './../../config/configuration'

describe('openAIService', () => {
  let openAPIService: OpenAPIService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
      ],
      providers: [OpenAPIService, ConfigService],
    }).compile()

    openAPIService = module.get<OpenAPIService>(OpenAPIService)
  })

  it('should get text embedding', async () => {
    const result = await openAPIService.getEmbedding([
      '庞天熙，男，98岁，江苏苏州人，曾就读于华东理工大学是数学与应用数学系01级学生，电话18913170261。',
    ])
    console.log(result)
    expect(result.data.length).toBeGreaterThan(0)
  })
})
