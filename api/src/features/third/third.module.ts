import { OpenAPIService } from './openai.service'
import { OpenAIController } from './openapi.controller'
import { Module } from '@nestjs/common'
import { AliyunApiService } from './aliyun.api.service'
import { AliyunController } from './third.controller'
import { CodegenModule } from '../codegen/codegen.module'

@Module({
  imports: [CodegenModule],
  controllers: [AliyunController, OpenAIController],
  providers: [AliyunApiService, OpenAPIService],
})
export class ThirdModule {}
