import { CACHE_MANAGER } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger'
import { Cache } from 'cache-manager'

export default (app: NestExpressApplication) => {
  const configService = app.get(ConfigService)
  const cacheManager = app.get<Cache>(CACHE_MANAGER)
  const appConfig = configService.get('app')

  const config = new DocumentBuilder()
    .setTitle(appConfig.title)
    .setDescription(appConfig.desc)
    .build()

  const swaggerDocumentOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  }

  const document = SwaggerModule.createDocument(
    app,
    config,
    swaggerDocumentOptions,
  )

  cacheManager.set(`swagger-sepc-${appConfig.code}`, document)

  const httpAdapter = app.getHttpAdapter()

  httpAdapter.get('/swagger', (req, res) => {
    res.set('Content-Disposition', `attachment;filename=swagger-spec.json`)
    res.send(Buffer.from(JSON.stringify(document)))
  })

  SwaggerModule.setup('restful', app, document)
}
