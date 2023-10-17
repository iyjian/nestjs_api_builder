import { TransformerOptions } from '@/components/Tools/types'
import { RequestBase } from './RequestBase'

export class ToolsClient extends RequestBase {
  constructor() {
    super()
  }

  public async getTransformers(): Promise<{
    [key: string]: TransformerOptions
  }> {
    const response = await this.request.get('/tool/transfomers')
    return response.data.data
  }

  public async getDateTypeSignature(content: string): Promise<{
    signature: string
    possibleFunc: {
      highestScoreFunc: string
      score: number
    }
  }> {
    const response = await this.request.post('/tool/dataType/signature', {
      content,
    })
    return response.data.data
  }

  public async doTransform(transformerOptions: TransformerOptions) {
    const response = await this.request.post(
      '/tool/transform',
      transformerOptions,
    )
    return response.data.data
  }

  public async decrypt(
    path: string,
    hexString: string,
    key: string,
    iv: string,
  ): Promise<string> {
    const response = await this.request.post(path, {
      hexString,
      key,
      iv,
    })
    return response.data.data
  }
}
