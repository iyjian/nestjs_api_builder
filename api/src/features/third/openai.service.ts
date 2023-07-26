import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common'
import {
  Configuration,
  CreateCompletionResponse,
  CreateImageRequestSizeEnum,
  OpenAIApi,
} from 'openai'
import tunnel from 'tunnel'

@Injectable()
export class OpenAPIService {
  private readonly configuration: Configuration

  private readonly agent: any

  private readonly openai: OpenAIApi
  private readonly logger = new Logger(OpenAPIService.name)

  constructor(private readonly configService: ConfigService) {
    this.configuration = new Configuration({
      apiKey: this.configService.get('openAI.apiKey'),
    })
    this.openai = new OpenAIApi(this.configuration)

    this.agent = tunnel.httpsOverHttp({
      proxy: {
        host: this.configService.get('proxy.host'),
        port: this.configService.get('proxy.port'),
      },
    })
  }

  async listModels(): Promise<any> {
    const result = await this.openai.listModels({
      httpsAgent: this.agent,
    })
    return result.data
  }

  async codeCompletion() {
    this.openai.createCompletion(
      {
        model: 'code-davinci-002',
        prompt: '',
        temperature: 0,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop: ['#', ';'],
      },
      { httpsAgent: this.agent },
    )
  }

  async textCompletion(
    model: 'text-davinci-003',
    prompt: string,
  ): Promise<CreateCompletionResponse> {
    this.logger.debug(`textCompletion - prompt: ${prompt}`)
    const result = await this.openai.createCompletion(
      {
        model,
        prompt,
        temperature: 0,
        max_tokens: 2048,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 1.0,
        stop: ['#', ';'],
      },
      { httpsAgent: this.agent },
    )
    return result.data
  }

  async chatCompletion(
    model: 'gpt-3.5-turbo-0301' | 'gpt-3.5-turbo',
    content: string,
  ) {
    const result = await this.openai.createChatCompletion(
      {
        model,
        messages: [{ role: 'user', content }],
        temperature: 0,
        max_tokens: 2048,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop: ['#', ';'],
      },
      { httpsAgent: this.agent },
    )
    return result.data
  }

  async imageGen(prompt: string, size: string) {
    const result = await this.openai.createImage(
      {
        size:
          size === 'small'
            ? CreateImageRequestSizeEnum._256x256
            : size === 'medium'
            ? CreateImageRequestSizeEnum._512x512
            : CreateImageRequestSizeEnum._1024x1024,
        n: 1,
        prompt,
        response_format: 'b64_json',
      },
      { httpsAgent: this.agent },
    )
    return result.data
  }

  async getEmbedding(inputs: string[], user?: string) {
    const response = await this.openai.createEmbedding(
      {
        model: 'text-embedding-ada-002',
        input: inputs,
        user,
      },
      { httpsAgent: this.agent },
    )
    return response.data
  }
}
