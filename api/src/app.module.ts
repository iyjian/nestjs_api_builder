import { CacheModule, Module } from '@nestjs/common'
import { EnumModule } from './features/enum/enum.module'
import configuration from './config/configuration'
import redisStore from 'cache-manager-ioredis'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { BaseModule } from './features/base/base.module'
import { CodegenModule } from './features/codegen/codegen.module'
import { CodingModule } from './features/coding/coding.module'
import { ToolModule } from './features/tool/tool.module'
import { ThirdModule } from './features/third/third.module'
import { FrontcodegenModule } from './features/frontcodegen/frontcodegen.module'
import fs from 'fs'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('mysql.host'),
        port: +configService.get<number>('mysql.port'),
        username: configService.get('mysql.username'),
        password: configService.get('mysql.password'),
        database: configService.get('mysql.db'),
        models: [],
        autoLoadModels: true,
        synchronize: true,
        logging: configService.get<string>('sqlLogging') === 'true' ? true : false,
        sync: {
          alter: false,
        },
        pool: {
          max: 100,
          min: 10,
          idle: 10000,
        },
        timezone: '+08:00',
        dialectOptions: configService.get('mysql.sslCert')
          ? {
              ssl: fs.readFileSync(configService.get('mysql.sslCert')),
            }
          : undefined,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          store: redisStore,
          host: configService.get('redis.host'),
          port: +configService.get<number>('redis.port'),
          db: +configService.get<number>('redis.db'),
          ttl: 0,
        }
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    EnumModule,
    BaseModule,
    CodegenModule,
    CodingModule,
    ToolModule,
    ThirdModule,
    FrontcodegenModule,
  ],
})
export class AppModule {}
