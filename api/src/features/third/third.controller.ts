import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AliyunApiService } from './aliyun.api.service'
@Controller('third')
export class AliyunController {
  constructor(private readonly aliyunApiService: AliyunApiService) {}
  @Post('reco/table')
  recoTable(
    @Body('tableName') tableName: string,
    @Body('base64Img') base64Img: string,
  ) {
    return this.aliyunApiService.tableImg2tableDefinition(tableName, base64Img)
  }

  @Get('trans')
  trans(@Query('q') q: string) {
    return this.aliyunApiService.translate(q)
  }
}
