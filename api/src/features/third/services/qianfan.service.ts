import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class QianFanService {
  private readonly logger = new Logger(QianFanService.name)

  constructor(private readonly configService: ConfigService) {}

  async getAccessToken() {
    const response = await axios.get(
      `https://aip.baidubce.com/oauth/2.0/token`,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: '',
          client_secret: '',
        },
      },
    )
    return response.data.access_token
  }
}
