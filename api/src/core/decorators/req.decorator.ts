import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const RequestUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    return parseInt(request['locals']['userId'])
  },
)
