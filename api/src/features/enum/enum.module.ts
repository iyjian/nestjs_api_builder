import { Enum } from './entities/enum.entity'
import { SequelizeModule } from '@nestjs/sequelize'
import { CacheModule, Global, Module } from '@nestjs/common'
import { EnumService } from './enum.service'
import { EnumController } from './enum.controller'
import { ConfigService } from '@nestjs/config'
import * as redisStore from 'cache-manager-ioredis'

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([Enum]),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: +configService.get<number>('redis.port')!,
        password: configService.get('redis.password')!,
        db: +configService.get<number>('redis.db')!,
        ttl: +configService.get<number>('redis.ttl')!,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EnumService],
  exports: [EnumService],
  controllers: [EnumController],
})
export class EnumModule {}
