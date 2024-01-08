import { Body, Controller, Post } from '@nestjs/common'
import { FrontcodegenService } from './frontcodegen.service'

@Controller('frontcodegen')
export class FrontcodegenController {
  constructor(private readonly frontcodegenService: FrontcodegenService) {}

  @Post('curd')
  public genCRUDCode(@Body() tableConfig: any) {
    return this.frontcodegenService.generate(tableConfig)
  }
}
