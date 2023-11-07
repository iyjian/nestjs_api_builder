import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common'
// import {
//   Configuration,
//   CreateCompletionResponse,
//   CreateImageRequestSizeEnum,
//   OpenAIApi,
// } from 'openai'
import OpenAI from 'openai'
import tunnel from 'tunnel'
import { Spark } from 'iflytek-spark-nodejs'
import fs from 'fs'
import { Readable } from 'stream'

@Injectable()
export class OpenAPIService {
  // private readonly configuration: Configuration

  private readonly agent: any

  private readonly openai: OpenAI
  private readonly logger = new Logger(OpenAPIService.name)

  constructor(private readonly configService: ConfigService) {
    // this.configuration = new Configuration({
    //   apiKey: this.configService.get('openAI.apiKey'),
    // })
    this.openai = new OpenAI({
      apiKey: this.configService.get('openAI.apiKey'),
    })

    this.agent = tunnel.httpsOverHttp({
      proxy: {
        host: this.configService.get('proxy.host'),
        port: this.configService.get('proxy.port'),
      },
    })
  }

  async listModels(): Promise<any> {
    this.openai.models.list
    const result = await this.openai.models.list({
      httpAgent: this.agent,
    })
    return result.data
  }

  // async codeCompletion() {
  //   this.openai.chat.completions.create(
  //     {
  //       model: 'code-davinci-002',
  //       prompt: '',
  //       temperature: 0,
  //       max_tokens: 150,
  //       top_p: 1.0,
  //       frequency_penalty: 0.0,
  //       presence_penalty: 0.0,
  //       stop: ['#', ';'],
  //     },
  //     { httpsAgent: this.agent },
  //   )
  // }

  async textCompletion(model: 'text-davinci-003', prompt: string) {
    this.logger.debug(`textCompletion - prompt: ${prompt}`)
    const result = await this.openai.completions.create(
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
      { httpAgent: this.agent },
    )
    return result
  }

  async tts(
    model: 'tts-1' | 'tts-1-hd',
    input: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
  ) {
    const result = await this.openai.audio.speech.create(
      {
        model,
        input,
        voice,
      },
      {
        httpAgent: this.agent,
      },
    )
    const content = await result.arrayBuffer()
    return Readable.from(Buffer.from(content))
  }

  async chatCompletion(
    model: 'gpt-3.5-turbo-0301' | 'gpt-3.5-turbo' = 'gpt-3.5-turbo-0301',
    messages: any[],
  ) {
    try {
      this.logger.debug(`chatCompletion - begin - model: ${model}`)
      const result = await this.openai.chat.completions.create(
        {
          model,
          // messages: [{ role: 'user', content: '你好呀' }],
          messages,
          temperature: 0,
          max_tokens: 2048,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          stop: ['#', ';'],
        },
        { httpAgent: this.agent },
      )
      return result
    } catch (e) {
      console.log(e.message)
      console.log(e.response.data)
      throw e
    }
  }

  async imageGen(prompt: string, size: string) {
    const result = await this.openai.images.generate(
      {
        size:
          size === 'small'
            ? '256x256'
            : size === 'medium'
            ? '512x512'
            : '1024x1024',
        n: 1,
        prompt,
        response_format: 'b64_json',
      },
      { httpAgent: this.agent },
    )
    return result.data
  }

  // async getEmbedding(inputs: string[], user?: string) {
  //   const response = await this.openai.createEmbedding(
  //     {
  //       model: 'text-embedding-ada-002',
  //       input: inputs,
  //       user,
  //     },
  //     { httpsAgent: this.agent },
  //   )
  //   return response.data
  // }

  async chatCompletionSpark(model: 'v1' | 'v2' = 'v2', content: string) {
    const spark = new Spark({
      // 自行填入相关参数
      secret: this.configService.get('iflyTechSpark.apiSecret'),
      key: this.configService.get('iflyTechSpark.apiKey'),
      appid: this.configService.get('iflyTechSpark.appId'),
      version: model,
    })

    return await spark.chat({
      content,
    })
  }
}
