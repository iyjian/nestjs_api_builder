import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common'
import { OpenAPIService } from './openai.service'
import { Response } from 'express'
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

  // @Post('completion/text')
  // textCompletion(
  //   @Body('model') model: 'text-davinci-003',
  //   @Body('prompt') prompt: string,
  // ) {
  //   return this.openAPIService.textCompletion(model, prompt)
  // }

  @Get('tts/gen')
  async genTTS(
    @Query('model') model: 'tts-1' | 'tts-1-hd' = 'tts-1',
    @Query('input') input: string,
    @Query('voice')
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'shimmer',
    @Res() res: Response,
  ) {
    res.set('Content-Type', 'audio/wav')
    res.set('Content-Disposition', 'attachment;filename=test.mp3')
    const content = await this.openAPIService.tts(
      model,
      input,
      (voice = 'shimmer'),
    )
    content.pipe(res)
  }

  @Post('completion/chat')
  chatCompletion(
    @Body('model') model: 'gpt-3.5-turbo-0301' | 'gpt-3.5-turbo',
    @Body('messages') messages: any,
  ) {
    return this.openAPIService.chatCompletion(model, messages)
  }

  @Post('/spark/completion/chat')
  chatCompletionSpark(
    @Body('model') model: 'v1' | 'v2',
    @Body('message') message: string,
  ) {
    return this.openAPIService.chatCompletionSpark(model, message)
  }
}
