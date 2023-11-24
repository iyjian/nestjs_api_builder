import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthenticationClient } from 'authing-js-sdk'
import { UserService } from './../../features/base/services/user.service'

@Injectable()
export class ApiGuard implements CanActivate {
  private readonly logger = new Logger(ApiGuard.name)
  private readonly authing = new AuthenticationClient({
    appId: this.configService.get('auth.authingAppId'),
    appHost: this.configService.get('auth.authingAppHost'),
  })

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>()
      const token = request.headers['token'] || request['query']['token']
      if (
        this.configService.get('auth.superToken') &&
        token === this.configService.get('auth.superToken')
      ) {
        delete request['query']['token']
        request['locals'] = { userId: 1 }
        return true
      }

      /**
       * AUTHING 认证
       * loginStatus:
          {
            code: 200,
            message: '已登录',
            status: true,
            exp: 1692245610,
            iat: 1691036010,
            data: {
              id: '63feb4dXXXXXXX59c5c8be',
              userPoolId: '62280996eXXXXXXXXXXb3',
              arn: null
            }
          }
       */
      const loginStatus = await this.authing.checkLoginStatus(token)

      if (loginStatus.status) {
        const user = await this.userService.findOne({
          accountId: loginStatus.data.id,
        })

        if (!user || !user.isEnable) {
          throw new HttpException('无权限', HttpStatus.UNAUTHORIZED)
        }

        request['locals'] = { userId: loginStatus.data.id }

        return true
      } else {
        this.logger.debug(`apiGuard - canActivate - token: ${token}`)
        throw new HttpException('未登录', 700)
      }
      /**
       * BG-AUTHING 认证
       */

      // const response = await axios.post(
      //   `${this.configService.get<string>(
      //     'auth.server',
      //   )}/auth/permissions/check`,
      //   {
      //     path: request.url,
      //     action: request.method,
      //   },
      //   {
      //     headers: {
      //       token,
      //     },
      //   },
      // )
      // this.logger.verbose(`${JSON.stringify(response.data)}`)
      // if (response.data.err === 0) {
      //   return response.data.data.permission
      // } else {
      //   throw new HttpException('未登录', 700)
      // }
      // return true
    } catch (e) {
      console.log(e)
      throw new HttpException('未登录', 700)
    }
  }
}
