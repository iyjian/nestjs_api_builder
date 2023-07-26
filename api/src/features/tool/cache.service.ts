import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { Redis } from 'ioredis'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)
  private readonly redisClient: Redis = (this.cache.store as any).getClient()
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  public async incrementSignatureFuncHit(signature: string, func: string) {
    // const redisClient: Redis = (this.cache.store as any).getClient()
    const hKey = `SS:${signature}`
    const hits = await this.redisClient.hget(hKey, func)
    if (hits) {
      this.logger.verbose(
        `ToolController - incrementSignatureFuncHit - key: ${hKey} cache exist`,
      )
      await this.redisClient.hset(hKey, func, parseInt(hits) + 1)
    } else {
      this.logger.verbose(
        `ToolController - incrementSignatureFuncHit - key: ${hKey} cache init`,
      )
      await this.redisClient.hset(hKey, func, 1)
    }
  }

  public async deleteSignatureFuncCache(signature: string) {
    const hKey = `SS:${signature}`
    return this.redisClient.del(hKey)
  }

  /**
   * 根据数据类型签名找到分数最高的转化函数
   *
   * @param signature
   */
  public async findHighestScoreFuncBySignature(signature: string): Promise<{
    highestScoreFunc: string
    score: number
    highestScore: number
    totalScore: number
  }> {
    const hKey = `SS:${signature}`
    const resultObj = await this.redisClient.hgetall(hKey)
    let highestScoreFunc = ''
    let highestScore = 0
    let totalScore = 0
    for (const func in resultObj) {
      const score = parseInt(resultObj[func])
      if (score > highestScore) {
        highestScoreFunc = func
        highestScore = score
      }
      totalScore += score
    }
    return {
      highestScoreFunc,
      score: highestScore / (totalScore + 0.001),
      highestScore,
      totalScore,
    }
  }

  public async getCache() {
    const caches: any[] = []
    // const redisClient: Redis = (this.cache.store as any).getClient()
    const stream = this.redisClient.scanStream({
      match: 'SS:*',
      count: 1000,
    })
    stream.on('data', async (keys: string[]) => {
      for (const key of keys) {
        const result = await this.redisClient.hgetall(key)
        caches.push({
          [key]: result,
        })
      }
    })

    return new Promise((resolve) => {
      stream.on('end', () => {
        resolve(caches)
      })
    })
  }
}
