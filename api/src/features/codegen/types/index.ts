/**
 * 抽取ts文件中的export的结构，比如:
 * export {xxx, yyy} from './test.ts'
 *
 * ./test.ts 被称为 specifier
 * xxx, yyy  被称为 identifier
 */
export type ExportsStruncture = {
  [specifier: string]: {
    isExisting: boolean
    identifiers: string[]
  }
}

/**
 * import结构体
 * import { ClassA, ClassB } from './test'
 *             |                     |
 *         identifiers           specifier
 */
export type ImportsStruncture = {
  [specifier: string]: {
    identifiers: string[]
  }
}
