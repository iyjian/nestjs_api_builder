import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { QianFanService } from './../services/qianfan.service.js'

@Controller('openai')
export class OpenAIController {
  constructor(private readonly qianFanService: QianFanService) {}

  @Post('chat')
  qianfanChat() {
    return this.qianFanService.getAccessToken()
  }
}
