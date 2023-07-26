import { ApiExcludeController } from '@nestjs/swagger'
import { Controller, Get, CACHE_MANAGER, Inject, Res } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'

@Controller('swagger')
@ApiExcludeController()
export class SwaggerController {
  constructor(
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  @Get('')
  async findAll(@Res() res: Response) {
    const appConfig = this.configService.get(`app`)
    const result = await this.cacheManager.get<object>(
      `swagger-sepc-${appConfig.code}`,
    )
    res.set('Content-Type', 'application/json')
    res.set('Content-Disposition', `attachment;filename=swagger-spec.json`)
    res.send(Buffer.from(JSON.stringify(result)))
  }

  @Get('json')
  async getJson() {
    const appConfig = this.configService.get(`app`)
    const result = await this.cacheManager.get<object>(
      `swagger-sepc-${appConfig.code}`,
    )
    return result
  }
}
