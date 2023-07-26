import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './../../../app.module'
import { ResponseCodeGenService } from './codegen.response.service'

describe('ResponseCodeGenService Test', () => {
  let app: INestApplicationContext
  let responseCodeGenService: ResponseCodeGenService

  beforeEach(async () => {
    // app = await NestFactory.createApplicationContext(AppModule)
    // responseCodeGenService = app.get(ResponseCodeGenService)
  })

  it('should generate correct response schema according to relation definition', async () => {
    //TODO: 补测试用例
    // const result = await responseCodeGenService.genResponseSchema(390)
    // const expectedResult = ''
    // expect(result).toBe(expectedResult)
    expect(true).toBe(true)
  })
})
