import 'reflect-metadata'

const codeGenCode = Symbol('codeGenCode')

/**
 *
 * @param code - 类属性的代码, 是包含columnId的名称
 * @returns
 */
export function codeGen(code: string) {
  return Reflect.metadata(codeGenCode, code)
}
