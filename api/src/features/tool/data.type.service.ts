import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { BooleanNumber, DataType } from './types'
import { Cache } from 'cache-manager'
import crypto from 'crypto'
import { CacheService } from './cache.service'
import sharp from 'sharp'

/**
 * 判断字符串的数据类型
 */
@Injectable()
export class DataTypeService {
  // private readonly md5 = crypto.createHash('md5')

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly toolCacheService: CacheService,
  ) {}

  public isJsonStr(str: string): number {
    // try {
    //   JSON.parse(str)
    // } catch (e) {
    //   return 0
    // }
    // return 1
    if (typeof str !== 'string') return 0
    try {
      const result = JSON.parse(str)
      const type = Object.prototype.toString.call(result)
      return type === '[object Object]' || type === '[object Array]' ? 1 : 0
    } catch (err) {
      return 0
    }
  }

  public isEpochStr(str: string): BooleanNumber {
    if (/\d{10}/.test(str) || /\d{13}/.test(str)) {
      return 1
    } else {
      return 0
    }
  }

  public isHexStr(str: string): number {
    return /^[0123456789abcde]{1,}$/.test(str) ? 1 : 0
  }

  // public strLen(str: string) {
  //   return str.length
  // }

  public isNumStr(str: string) {
    return /^\d+$/.test(str) ? 1 : 0
  }

  public isBase64Str(str: string) {
    // let regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?'
    let regex =
      '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}(==)?|[A-Za-z0-9+\\/]{3}=?)?'
    const mimeRegex = '(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)'
    // if (mimeRequired === true) {
    //   regex =  mimeRegex + regex
    // } else if (allowMime === true) {
    //   regex = mimeRegex + '?' + regex
    // }
    // if (paddingRequired === false) {
    //   regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}(==)?|[A-Za-z0-9+\\/]{3}=?)?'
    // }
    return new RegExp('^' + mimeRegex + '?' + regex + '$', 'gi').test(str)
      ? 1
      : 0
  }

  public async isImage(str: string): Promise<BooleanNumber> {
    if (this.isBase64Str(str)) {
      try {
        const buffer = Buffer.from(str, 'base64')
        const meta = await sharp(buffer).metadata()
        return 1
      } catch (e) {
        return 0
      }
    } else {
      return 0
    }
  }

  public getAllMethodNames() {
    const methods = Object.getOwnPropertyNames(DataTypeService.prototype)
    return methods.filter(
      (name) =>
        ![
          'constructor',
          'getAllMethodNames',
          'getDataType',
          'getDataTypeSignature',
        ].includes(name),
    )
  }

  public getDataType(str: string): DataType {
    if (this.isJsonStr(str)) {
      return DataType.jsonStr
    } else if (this.isHexStr(str)) {
      return DataType.hexStr
    } else {
      return DataType.unknow
    }
  }

  public async getDataTypeSignature(str: string, debug: number) {
    const signatures: any[] = []
    const methods = this.getAllMethodNames()
    for (const method of methods) {
      const result = await this[method](str)
      signatures.push({
        method,
        result: result,
      })
    }

    const signatureMD5 = crypto
      .createHash('md5')
      .update(JSON.stringify(signatures))
      .digest('hex')

    if (!(await this.cache.get(signatureMD5))) {
      await this.cache.set(signatureMD5, { signatures })
    }

    const possibleFunc =
      await this.toolCacheService.findHighestScoreFuncBySignature(signatureMD5)

    return {
      signature: signatureMD5,
      possibleFunc: {
        highestScoreFunc: possibleFunc.highestScoreFunc,
        highestScore: possibleFunc.highestScore,
        score: debug ? possibleFunc.score : undefined,
        totalScore: debug ? possibleFunc.totalScore : undefined,
      },
      debug: debug ? signatures : undefined,
    }
  }
}
