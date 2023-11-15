import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import _ from 'lodash'
import { TSMorphService } from './tsmorph.service'
import { ImportDeclaration, SyntaxKind } from 'ts-morph'

@Injectable()
export class CodeGenUICodeService {
  constructor(private readonly tsmorphService: TSMorphService) {}

  private readonly logger = new Logger(CodeGenUICodeService.name)

  public ensureRoutes(
    code: string,
    specifier: string,
    name: string,
    component: string,
  ) {
    const sourceFile = this.tsmorphService.toSourceFile(code)

    //
    const importDeclaration = sourceFile.getImportDeclaration(
      (importDeclaration) => {
        return importDeclaration?.getDefaultImport()?.getText() === component
      },
    )

    if (!importDeclaration) {
      sourceFile.addImportDeclaration({
        defaultImport: component,
        moduleSpecifier: `@/views/${component}.vue`,
      })
    }

    // 找到 `routes` 数组
    const routesArray = sourceFile
      .getVariableDeclarationOrThrow('router')
      .getInitializerIfKindOrThrow(SyntaxKind.CallExpression)
      .getArguments()[0]
      .asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
      .getPropertyOrThrow('routes')
      .asKindOrThrow(SyntaxKind.PropertyAssignment)
      .getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)

    // 找到第一个路由对象
    const firstRoute = routesArray
      .getElements()[0]
      .asKindOrThrow(SyntaxKind.ObjectLiteralExpression)

    // 找到 `children` 数组
    const childrenArray = firstRoute
      .getPropertyOrThrow('children')
      .asKindOrThrow(SyntaxKind.PropertyAssignment)
      .getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)

    childrenArray.forEachChild((node) => {
      const existingPath = node
        .asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
        .getProperty('path')
        .asKindOrThrow(SyntaxKind.PropertyAssignment)
        .getInitializer()
        .getText()
      if (existingPath === specifier) {
        return sourceFile.getText()
      }
    })

    // 添加新的路由对象
    childrenArray.addElement(
      `{path: "${specifier}", name: "${name}", component: ${component}}`,
    )

    // 返回修改后的对象
    return sourceFile.getText()
  }
}
