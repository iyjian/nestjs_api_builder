import { MetaTableService } from '../../base/services/meta.table.service'
import { MetaColumnService } from '../../base/services/meta.column.service'
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import _ from 'lodash'

@Injectable()
export class ResponseCodeGenService {
  private readonly logger = new Logger(ResponseCodeGenService.name)
  constructor(
    private readonly columnService: MetaColumnService,
    private readonly tableService: MetaTableService,
  ) {}

  public async genResponseSchema(
    tableId: number,
    type: 'findOne' | 'findAll',
    validNodeIds: {} = {},
    nodeId: string = '0-0',
  ): Promise<object> {
    const properties = {}

    if (nodeId === '0-0') {
      const table = await this.tableService.findOneMetaTable(tableId)
      // TODO: relationNodes是findAll的关系配置 relationNodesForOne是findOne的关系配置 现在只有findOne的逻辑
      if (
        type === 'findAll' &&
        table.relationNodes &&
        table.relationNodes.length > 0
      ) {
        validNodeIds = _.keyBy(
          this.getCheckedNodesFlat(table.relationNodes[0]).map((o) => o.nodeId),
          (o) => o,
        )
      } else if (
        type === 'findOne' &&
        table.relationNodesForOne &&
        table.relationNodesForOne.length > 0
      ) {
        validNodeIds = _.keyBy(
          this.getCheckedNodesFlat(table.relationNodesForOne[0]).map(
            (o) => o.nodeId,
          ),
          (o) => o,
        )
      }
    }

    const columns = await this.columnService.findAllMetaColumn({
      tableId,
      skipPaging: true,
    })

    for (const column of columns.rows) {
      if (column.dataType.dataType !== 'vrelation') {
        this.logger.debug(
          `generate property1 definition table: ${tableId} column: ${
            column.name
          } nodeId: ${nodeId} valideNodeIds: ${JSON.stringify(validNodeIds)} ${
            nodeId in validNodeIds
          }`,
        )
        properties[column.name] = {
          type: column.dataType.mappingDataType,
          example: column.sampleData || '',
          description: column.fullComment,
        }
      } else if (
        column.relation !== 'HasMany' &&
        `${nodeId}-${column.id}` in validNodeIds
      ) {
        this.logger.debug(
          `generate property2 definition table: ${tableId} column: ${
            column.name
          } nodeId: ${nodeId} valideNodeIds: ${JSON.stringify(validNodeIds)} ${
            nodeId in validNodeIds
          }`,
        )
        properties[column.name] = {
          type: 'object',
          properties: await this.genResponseSchema(
            column.refTableId,
            type,
            validNodeIds,
            // {},
            `${nodeId}-${column.id}`,
          ),
        }
      } else if (`${nodeId}-${column.id}` in validNodeIds) {
        this.logger.debug(
          `generate property3 definition table: ${tableId} column: ${
            column.name
          } nodeId: ${nodeId} valideNodeIds: ${validNodeIds} ${
            nodeId in validNodeIds
          }`,
        )
        properties[column.name] = {
          type: 'array',
          items: {
            type: 'object',
            properties: await this.genResponseSchema(
              column.refTableId,
              type,
              validNodeIds,
              // {},
              `${nodeId}-${column.id}`,
            ),
          },
        }
      }
    }

    return properties
  }

  /**
   * 递归的获取关系树的所有节点(打平)
   *
   * @param nodes
   */
  public _getAllNodes(node: any, allNodes: any[] = []) {
    allNodes.push(node)
    if (node.include && node.include.length > 0) {
      for (const subNode of node.include) {
        const subNodeCloned = _.cloneDeep(subNode)
        this._getAllNodes(subNodeCloned, allNodes)
      }
    }
    return allNodes
  }

  public getAllNodes(_node: any) {
    if (_node) {
      return this._getAllNodes(_node)
    } else {
      return []
    }
  }

  /**
   * 获取选中的节点的平铺数据(非树型结构)
   */
  public getCheckedNodesFlat(node: any) {
    return this.getAllNodes(node).filter((node) => node.isChecked === true)
  }
}
