import { ToolService } from './services/tool.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import { DataTypeService } from './data.type.service'
import { TransformerService } from './transformer.service'
import { CacheService } from './cache.service'
import { Response } from 'express'
@Controller('tool')
export class ToolController {
  private readonly logger = new Logger(ToolController.name)

  constructor(
    private readonly dataTypeService: DataTypeService,
    private readonly transformerService: TransformerService,
    private readonly toolCacheService: CacheService,
    private readonly toolService: ToolService,
  ) {}

  @Get('transfomers')
  getTransformers() {
    return this.transformerService.getTransformerOptions()
  }

  @Post('transform')
  async doTransform(@Body() transformOptions: any) {
    try {
      transformOptions.signature
      const data = await this.transformerService[transformOptions.func](
        transformOptions.content,
        transformOptions.params,
      )
      if (transformOptions.manual) {
        // 自动发起的识别不计入命中
        // TODO: 这里要想下 虽然是自动发起 但是如果认可了这个识别也要计入的
        await this.toolCacheService.incrementSignatureFuncHit(
          transformOptions.signature,
          transformOptions.func,
        )
      }
      return data
    } catch (e) {
      throw e
    }
  }

  @Post('/dataType/signature')
  getDataTypeSignature(
    @Body('content') content: string,
    @Query('debug') debug: number,
  ) {
    return this.dataTypeService.getDataTypeSignature(content, debug)
  }

  @Get('/cache')
  async getCache() {
    return this.toolCacheService.getCache()
  }

  @Delete('cache/:signature')
  deleteSignatureFuncCache(@Param('signature') signature: string) {
    return this.toolCacheService.deleteSignatureFuncCache(signature)
  }

  @Get('urlResTxt2Img')
  async urlResTxt2Img(@Query('url') url: string, @Res() res: Response) {
    res.set('Content-Type', 'image/png')
    res.set('Content-Disposition', `attachment;filename="test.png"`)
    const imgBuf = await this.toolService.urlResTxt2Img(url)
    res.send(imgBuf)
  }
}
