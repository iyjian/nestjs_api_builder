import { Test, TestingModule } from '@nestjs/testing'
import { FrontcodegenService } from './frontcodegen.service'

describe('FrontcodegenService', () => {
  let service: FrontcodegenService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrontcodegenService],
    }).compile()

    service = module.get<FrontcodegenService>(FrontcodegenService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
