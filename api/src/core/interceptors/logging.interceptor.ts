import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import moment from 'moment'
import { LogService } from 'src/features/base'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger()

  constructor(private readonly logService: LogService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const contextType = context.getType<'http' | 'rmq'>()

    if (contextType === 'http') {
      /**
       * HTTP 语境下的日志记录
       */
      const request: any = context.switchToHttp().getRequest<any>()
      const method = request.method
      if (request.method === 'GET') {
        for (const key in request.query) {
          /**
           * 将请求中的 equipment_name=xxxx 改为 equipment.name=xxxxx
           */
          if (key.indexOf('_') !== -1) {
            request.query[key.replace(/_/g, '.')] = request.query[key]
            delete request.query[key]
          }
        }
      }
      const url = request.originalUrl
      const ip = request.ip
      const path = request.path
      const requestDate = moment().toDate()

      this.logger.debug(
        `${method} - ${path} - ${url} - ${ip} - ${JSON.stringify(
          request.body,
        )}`,
      )

      await this.logService.create({
        requestDate,
        userId: request?.locals?.user?.id,
        method,
        path,
        url,
        ip,
        payload: JSON.stringify(request.body),
      })
    }

    return next.handle()
  }
}
