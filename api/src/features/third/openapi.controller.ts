import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { OpenAPIService } from './openai.service'

@Controller('openai')
export class OpenAIController {
  constructor(private readonly openAPIService: OpenAPIService) {}

  @Get('models')
  listModels() {
    return this.openAPIService.listModels()
  }

  @Post('gen/image')
  genImage(@Body('prompt') prompt: string, @Body('size') size: string) {
    return this.openAPIService.imageGen(prompt, size)
  }

  @Post('completion/text')
  textCompletion(
    @Body('model') model: 'text-davinci-003',
    @Body('prompt') prompt: string,
  ) {
    return this.openAPIService.textCompletion(model, prompt)
  }

  @Post('completion/chat')
  chatCompletion(
    @Body('model') model: 'gpt-3.5-turbo-0301' | 'gpt-3.5-turbo',
    @Body('message') message: string,
  ) {
    return this.openAPIService.chatCompletion(model, message)
  }
}
