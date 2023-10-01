import { Table, Project, Code } from '@/types'
import { RequestBase } from './RequestBase'

export class DEVToolApiClient extends RequestBase {
  constructor() {
    super()
  }

  public async getProjectModules(projectId: number) {
    const response = await this.request.get(`/projectModule`, {
      params: {
        projectId,
        skipPaging: true,
      },
    })
    return response.data.data.rows
  }

  public async createProjectModule(payload: {
    projectId: number
    code: string
    name: string
    remark: string
  }) {
    const response = await this.request.post(`/projectModule`, payload)
    return response.data.data
  }

  public async executeSyncDB(tableId: number, sql: string) {
    return this.request.post(`/dbsync/column/executionsql`, {
      tableId,
      sql,
    })
  }

  public async patchProjectModule(
    id: number,
    payload: {
      name: string
      remark: string
    },
  ) {
    const response = await this.request.patch(`/projectModule/${id}`, payload)
    return response.data.data
  }

  public async patchTable(tableId: number, module: string, comment: string) {
    const response = await this.request.patch(`/metaTable/${tableId}`, {
      module,
      comment,
    })
    return response.data.data
  }

  public async updateRelation(tableId: number, relationNodes: any) {
    const response = await this.request.patch(`/metaTable/${tableId}`, {
      relationNodes,
    })
    return response.data.data
  }

  public async updateRelationForOne(tableId: number, relationNodes: any) {
    const response = await this.request.patch(`/metaTable/${tableId}`, {
      relationNodesForOne: relationNodes,
    })
    return response.data.data
  }

  public async updateTableIndex(tableId: number, indexes: object) {
    const response = await this.request.patch(`/metaTable/${tableId}`, {
      indexes,
    })
    return response.data.data
  }

  public async deleteColumn(columnId: number) {
    const response = await this.request.delete(`/metaColumn/${columnId}`)
    return response.data.data
  }

  public async deleteTable(tableId: number) {
    const response = await this.request.delete(`/metaTable/${tableId}`)
    return response.data.data
  }

  public async loadAllTables(projectId: string, simplify = false) {
    const response = await this.request.get(
      `/metaTable?skipPaging=1&projectId=${projectId}&simplify=${simplify}`,
    )
    return response.data.data.rows
  }

  public async getEnumReport(projectId: number) {
    const response = await this.request.get(
      `/dbsync/enumReport/project/${projectId}`,
    )
    return response.data.data
  }

  async getTableInfo(tableId: number) {
    console.log(`requests - getTableInfo - tableId: ${tableId}`)
    const response = await this.request.get(`/metaTable/${tableId}`)
    delete response.data.data.updatedAt
    delete response.data.data.createdAt
    return response.data.data
  }

  async getDBSyncColumnDiffs(tableId: number) {
    const response = await this.request.get(`/dbsync/column/diff`, {
      params: { tableId },
    })
    return response.data.data
  }

  async getProjectInfo(projectId: number) {
    const response = await this.request.get(`/metaProject/${projectId}`)
    return response.data.data
  }

  async getTranslate(q: string) {
    const response = await this.request.get(`/third/trans`, {
      params: {
        q,
      },
    })
    return response.data.data
  }

  async getAllProjects(): Promise<Project[]> {
    const response = await this.request.get('/metaProject?skipPaging=1')
    return response.data.data.rows
  }

  async postProject(project: any): Promise<Project> {
    const response = await this.request.post('/metaProject', project)
    return response.data.data
  }

  async initProject(project: any): Promise<any> {
    const response = await this.request.post('/gitlab/project', project)
    return response.data.data
  }

  async loadDataTypes() {
    const response = await this.request.get(`/metaDataType?skipPaging=true`)
    return response.data.data.rows
  }

  async parseTableImg(tableName: string, base64Img: string) {
    const response = await this.request.post(`/third/reco/table`, {
      tableName,
      base64Img,
    })
    return response.data.data
  }

  async saveEntity(table: object): Promise<Table> {
    const response = await this.request.post('/codegen/saveEntity', table)
    delete response.data.data.updatedAt
    delete response.data.data.createdAt
    return response.data.data
  }

  async genPreviewCode(
    tableId: number,
    selectedCodeTypes: string[],
    branch: string,
  ): Promise<{ codes: Code[]; table: Table }> {
    const response = await this.request.post('/codegen/codePreview', {
      tableId,
      codeTypes: selectedCodeTypes,
      branch,
    })
    return response.data.data
  }

  async getCIStatus(tableId: string) {
    const response = await this.request.get(
      `/codegen/CIStatus?tableId=${tableId}`,
    )
    return response.data.data
  }

  rebuildER(projectId: number): void {
    this.request.post(`/er/cache/${projectId}`)
  }

  async getERAll(tableId: string): Promise<string> {
    const response = await this.request.get(`/er/all?tableId=${tableId}`)
    return response.data.data
  }

  async getRelations(tableId: number, level = 1, parentNodeId: string) {
    const response = await this.request.get(
      `/codegen/relations?tableId=${tableId}&level=${level}&nodeId=${parentNodeId}`,
    )
    return response.data.data
  }

  async saveAndSubmitPR(
    tableId: number,
    codes: Code[],
    sourceBranch: string,
    targetBranch: string,
    comment: string,
  ) {
    const response = await this.request.post(`/codegen/saveAndSubmitPR`, {
      tableId,
      codes,
      sourceBranch,
      targetBranch,
      comment,
    })
    return response.data.data
  }
}
