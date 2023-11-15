import { Test } from '@nestjs/testing'
import { INestApplicationContext } from '@nestjs/common'
import { CodeGenUICodeService } from './codegen.ui.code.service'
import { TSMorphService } from './tsmorph.service'
import { CodegenUtilService } from './codegen.util.service'

describe('CodeGenUICodeService Test', () => {
  let codeGenUICodeService: CodeGenUICodeService
  let codegenUtilService: CodegenUtilService

  beforeEach(async () => {
    // dataTypeReductionService = app.get(DataTypeReductisonService)
    const moduleRef = await Test.createTestingModule({
      providers: [TSMorphService, CodeGenUICodeService, CodegenUtilService],
    }).compile()

    codeGenUICodeService =
      moduleRef.get<CodeGenUICodeService>(CodeGenUICodeService)

    codegenUtilService = moduleRef.get<CodegenUtilService>(CodegenUtilService)
  })

  it('should add route to router', () => {
    const code = `  import Test from './../test.vue'
                    const router = createRouter({
                      history: createWebHistory(import.meta.env.BASE_URL),
                      routes: [
                        {
                          path: "/",
                          name: "base",
                          component: Base,
                          children: [
                            {
                              path: "/test",
                              name: "test",
                              component: Test,
                            }
                          ],
                        }
                      ],
                    });`

    const returnCode = codeGenUICodeService.ensureRoutes(
      code,
      '/problem',
      'problem',
      'Problem',
    )
    const expectCode = `import Test from './../test.vue'
import Problem from '@/views/Problem.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'base',
      component: Base,
      children: [
        {
          path: '/test',
          name: 'test',
          component: Test,
        },
        { path: '/problem', name: 'problem', component: Problem },
      ],
    },
  ],
})
`
    expect(codegenUtilService.codeFormat(returnCode)).toBe(expectCode)
  })
})
