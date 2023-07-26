import { NestExpressApplication } from '@nestjs/platform-express'
import { BaseModule, RouteService } from './../features/base'

export default (app: NestExpressApplication) => {
  const server = app.getHttpServer()

  const router = server._events.request._router

  const allRoutes: [] = router.stack
    .map((layer: any) => {
      if (layer.route) {
        return {
          obj: layer.route?.path,
          method: layer.route?.stack[0].method,
          regexp: layer.regexp?.toString(),
        }
      }
    })
    .filter((item: any) => item !== undefined)
  app
    .select(BaseModule)
    .get(RouteService, { strict: true })
    .loadRoute(allRoutes)
}
