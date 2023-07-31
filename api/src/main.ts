import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import express from 'express'
// import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipeWithTransform } from './core/pipes'
import { AllExceptionFilter } from './core/filters'
import { LoggingInterceptor, TransformInterceptor } from './core/interceptors'
import { ApiGuard } from './core/guards'
import * as Sentry from '@sentry/node'
import logRoutes from './scripts/logRoutes'
import setupSwagger from './scripts/setupSwagger'
import { LogService } from './features/base/services/log.service'
// import { run } from './scripts/seed'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)

  if (configService.get('app.sentryDSN')) {
    Sentry.init({
      dsn: configService.get('app.sentryDSN'),
      environment: configService.get('app.NODE_ENV'),
      tracesSampleRate: 1.0,
    })
  }

  app.useGlobalPipes(new ValidationPipeWithTransform())
  app.enableCors()
  app.set('trust proxy', true)
  app.set('etag', false)
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ limit: '50mb', extended: true }))
  app.use(compression())
  app.use(helmet())
  app.useGlobalFilters(new AllExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(LogService)))
  app.useGlobalGuards(new ApiGuard(configService))

  /**
   * nest swagger config(enabled on development env)
   */
  if (configService.get('app.env') === 'development') {
    setupSwagger(app)
  }

  const port = configService.get<number>('app.port')
  if (!port) throw new Error('no port')
  await app.listen(port)

  logRoutes(app)
}
bootstrap()
