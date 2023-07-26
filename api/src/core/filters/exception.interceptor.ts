import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import * as Sentry from '@sentry/node'

// 处理Sequelize的Error
// AccessDeniedError,AggregateError,AssociationError,AsyncQueueError,BulkRecordError,ConnectionAcquireTimeoutError,ConnectionError,ConnectionRefusedError,ConnectionTimedOutError,DatabaseError,EagerLoadingError,EmptyResultError,ExclusionConstraintError,ForeignKeyConstraintError,HostNotFoundError,HostNotReachableError,InstanceError,InvalidConnectionError,OptimisticLockError,QueryError,SequelizeScopeError,TimeoutError,UniqueConstraintError,UnknownConstraintError,ValidationError,ValidationErrorItem,ValidationErrorItemOrigin,ValidationErrorItemType

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log(exception)
    Sentry.captureException(exception)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const errMsg =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : 'internal error'

    if (exception instanceof Error) {
      exception.message
    }
    const responseBody = {
      err: httpStatus,
      errMsg,
    }
    response.json(responseBody)
  }
}
