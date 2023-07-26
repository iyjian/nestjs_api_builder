import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const ReqEmployeeId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // const request = ctx.switchToHttp().getRequest<Request>()
    return 1
  },
)
