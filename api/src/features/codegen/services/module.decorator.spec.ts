import { CodegenUtilService } from './codegen.util.service'
import { TSMorphService } from './tsmorph.service'

describe('GitService', () => {
  let codegenUtilService: CodegenUtilService

  beforeEach(async () => {
    const tsMorphService = new TSMorphService()
    codegenUtilService = new CodegenUtilService(tsMorphService)
  })

  describe('module decorator manipulate', () => {
    it('should add TestEntity to Sequelize.ForFeature of module decorator', () => {
      const moduleCode = `@Module({
        imports: [
          ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              node: 'es://localhost:15622',
              auth: {
                username: configService.get<string>("elastic.username"),
                password: configService.get<string>("elastic.password"),
              },
            }),
            inject: [ConfigService],
          }),
        ],
      })
      export class LuggageModule {}`
      const expectResult = codegenUtilService.codeFormat(`@Module({
        imports: [
          ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              node: 'es://localhost:15622',
              auth: {
                username: configService.get<string>('elastic.username'),
                password: configService.get<string>('elastic.password'),
              },
            }),
            inject: [ConfigService],
          }),
          SequelizeModule.forFeature([TestEntity]),
        ],
        controllers: [],
        providers: [],
        exports: [],
      })
      export class LuggageModule {}`)
      const result = codegenUtilService.updateModuleDecorator(
        moduleCode,
        undefined,
        undefined,
        'TestEntity',
      )
      console.log(result)
      expect(result).toBe(expectResult)
    })

    it('should add TestService to providers and exports of module decorator', () => {
      const moduleCode = `@Module({
        imports: [
          ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              node: 'es://localhost:15622',
              auth: {
                username: configService.get<string>("elastic.username"),
                password: configService.get<string>("elastic.password"),
              },
            }),
            inject: [ConfigService],
          }),
        ],
      })
      export class LuggageModule {}`
      const expectResult = codegenUtilService.codeFormat(`@Module({
        imports: [
          ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              node: 'es://localhost:15622',
              auth: {
                username: configService.get<string>('elastic.username'),
                password: configService.get<string>('elastic.password'),
              },
            }),
            inject: [ConfigService],
          }),
          SequelizeModule.forFeature([TestEntity]),
        ],
        controllers: [],
        providers: [TestService],
        exports: [TestService],
      })
      export class LuggageModule {}`)
      const result = codegenUtilService.updateModuleDecorator(
        moduleCode,
        undefined,
        'TestService',
        'TestEntity',
      )
      console.log(result)
      expect(result).toBe(expectResult)
    })
  })
})
