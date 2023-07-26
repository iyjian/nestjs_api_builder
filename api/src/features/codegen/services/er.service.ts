import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'

import { MetaTableService } from '../../base/services/meta.table.service'
import { MetaColumnService } from '../../base/services/meta.column.service'
import _ from 'lodash'
import { MetaTable } from '../../base/entities/meta.table.entity'
import { MetaColumn } from '../../base/entities/meta.column.entity'
import { Cache } from 'cache-manager'

type Node = MetaTable & { columns: MetaColumn[] }

type Relation = {
  node1: Partial<Node>
  node2: Partial<Node>
  relation: string
}

type GraphCache = {
  [nodeName: string]: Relation[]
}

@Injectable()
export class ERService {
  private readonly logger = new Logger(ERService.name)
  constructor(
    private readonly metaTableService: MetaTableService,
    private readonly metaColumnService: MetaColumnService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 根据projectId构建双向关系
   *
   * @param projectId
   * @returns
   */
  async buildFullRelations(projectId: number): Promise<Relation[]> {
    const columns = await this.metaColumnService.findEnabledMetaColumns({
      projectId,
      skipPaging: true,
      dataTypeId: 0,
    })

    return columns.map((column) => ({
      node1: column.table,
      node2: column.refTable,
      relation: column.relation,
    }))
  }

  /**
   * 获取nodeId节点的所有相邻节点
   *
   * @param nodeId
   * @param relations
   * @returns
   */
  getRelatedNodes(nodeId: number, relations: Relation[]): Relation[] {
    const filtedRelations = relations.filter((relation) => {
      return relation.node1.id === nodeId
    })
    return filtedRelations
  }

  /**
   * 构造projectId的关系图
   *
   * @param projectId
   * @returns
   */
  async buildGraphCache(projectId: number): Promise<GraphCache> {
    const graphCache = {}

    const relations = await this.buildFullRelations(projectId)

    const tables = await this.metaTableService.findAllMetaTable({
      projectId,
      skipPaging: true,
    })

    for (const table of tables.rows) {
      /**
       * 每张表对应的关系
       */
      graphCache[table.id] = this.getRelatedNodes(table.id, relations)
    }

    await this.cacheManager.set(
      `graphCache-${projectId}`,
      JSON.stringify(graphCache),
      {
        ttl: 100000,
      },
    )

    return graphCache
  }

  public async getGraphCache(projectId: number) {
    const cache = await this.cacheManager.get<string>(`graphCache-${projectId}`)

    if (!cache) {
      this.logger.debug(
        `getGraphCache - cache missing - projectId: ${projectId}`,
      )
      return await this.buildGraphCache(projectId)
    }

    return await this.buildGraphCache(projectId)
    // return JSON.parse(cache)
  }

  /**
   * 根据relations生成ER图的 mermaid 定义
   *
   * @param relations - Relation[]
   * @returns
   */
  public async genERDefinitions(relations: Relation[]) {
    let result = 'erDiagram\n'

    const nodes = {}

    // 构造关系定义
    for (const relation of relations) {
      const relationStr =
        relation.relation === 'BelongsTo'
          ? 'o{ -- ||'
          : relation.relation === 'HasMany'
          ? '|| -- o{'
          : relation.relation === 'HasOne'
          ? '|| -- ||'
          : ''
      result +=
        `${relation.node1.className} ${relationStr} ${relation.node2.className} : ""` +
        '\n'
      nodes[relation.node1.id] = relation.node1
      nodes[relation.node2.id] = relation.node2
    }

    /**
     * 构造实体定义
     * 
        LINE-ITEM {
          string productCode
          int quantity
          float pricePerUnit
        }
      */
    for (const nodeId in nodes) {
      const node = nodes[nodeId]

      let entityDefinition = `
        ${node.className} {
          __columns__
        }
      `
      const candidateShowColumns = [`int id`]

      const columns = await this.metaColumnService.findColumnsByTableId(node.id)

      for (const column of columns) {
        if (column.refTableId && column.dataType.dataType !== 'vrelation') {
          candidateShowColumns.push(
            `${column.dataType.dataType.replace(/\(.*?\)/, '')} ${column.name}`,
          )
        }
      }

      result += entityDefinition.replace(
        '__columns__',
        candidateShowColumns.join('\n'),
      )
    }

    return result
  }

  async genERFromNode(tableId: number, depth: number = 1) {
    const table = await this.metaTableService.findOneMetaTable(tableId)
    const graphCache = await this.getGraphCache(table.project.id)
    let relations = []
    relations = relations.concat(graphCache[table.id])
    return this.genERDefinitions(relations)
  }
}
