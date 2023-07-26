import { Injectable, Logger } from '@nestjs/common'
import crypto from 'crypto'
import { DataTypeService } from './data.type.service'
import transformers from './config/transformers'
import moment from 'moment'
import sharp from 'sharp'
@Injectable()
export class TransformerService {
  private readonly logger = new Logger(TransformerService.name)

  constructor(private readonly dataTypeService: DataTypeService) {}

  public getTransformerOptions() {
    return transformers
  }

  public toJSON(content: string, params: any) {
    return {
      content,
      dataType: this.dataTypeService.getDataType(content),
    }
  }

  public epochStrToDateStr(content: string, params: any) {
    const result = moment(parseInt(content)).format('YYYY-MM-DD HH:mm:ss')

    if (result === 'Invalid date') {
      throw new Error('Invalid date')
    }

    return {
      content: result,
      dataType: 'string',
    }
  }

  public async toImgBase64(content: string) {
    const mimeRegex = 'data:(\\w+\\/[a-zA-Z\\+\\-\\.]+);base64,'

    const matches = content.match(new RegExp(mimeRegex))
    if (matches && matches[1]) {
      return {
        content,
        dataType: 'img',
      }
    } else {
      const buffer = Buffer.from(content, 'base64')
      const meta = await sharp(buffer).metadata()
      return {
        content: `data:${meta.format};base64,${content}`,
        dataType: 'img',
      }
    }
  }

  public decipherIV(
    hexString: string,
    params: { method: string; key: string; iv: string },
  ) {
    const decipher = crypto.createDecipheriv(
      params.method,
      Buffer.from(params.key),
      Buffer.from(params.iv),
    )

    const encryptedBuffer = Buffer.from(hexString, 'hex')

    let decryptedBuffer = decipher.update(encryptedBuffer)

    decryptedBuffer = Buffer.concat([decryptedBuffer, decipher.final()])

    const result = decryptedBuffer.toString()

    return {
      result,
      dataType: this.dataTypeService.getDataType(result),
    }
  }
}
