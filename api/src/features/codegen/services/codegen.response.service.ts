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
    validNodeIds: {} = {},
    properties: {} = {},
    nodeId: string = '0-0',
  ): Promise<object> {
    const table = await this.tableService.findOneMetaTable(tableId)

    if (nodeId === '0-0') {
      if (table.relationNodes && table.relationNodes.length > 0) {
        validNodeIds = _.keyBy(
          this.getCheckedNodesFlat(table.relationNodes[0]).map((o) => o.nodeId),
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
          `generate property1 definition table: ${table.name} column: ${
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
          `generate property2 definition table: ${table.name} column: ${
            column.name
          } nodeId: ${nodeId} valideNodeIds: ${JSON.stringify(validNodeIds)} ${
            nodeId in validNodeIds
          }`,
        )
        properties[column.name] = {
          type: 'object',
          properties: await this.genResponseSchema(
            column.refTableId,
            validNodeIds,
            {},
            `${nodeId}-${column.id}`,
          ),
        }
      } else if (`${nodeId}-${column.id}` in validNodeIds) {
        this.logger.debug(
          `generate property3 definition table: ${table.name} column: ${
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
              validNodeIds,
              {},
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
