import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { BaseService } from '../../../core'
import { Op } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import {
  UpdateMetaProjectRequestDTO,
  CreateMetaProjectRequestDTO,
  FindAllMetaProjectRequestDTO,
} from '../dto'
import { MetaProject } from '../entities/meta.project.entity'

@Injectable()
export class MetaProjectService extends BaseService {
  private readonly include: any[]

  constructor(
    @InjectModel(MetaProject)
    private readonly metaProjectModel: typeof MetaProject,
    private readonly mysql: Sequelize,
  ) {
    super()
    this.include = []
  }

  async createMetaProject(metaProjectObj: CreateMetaProjectRequestDTO) {
    const metaProject = await this.metaProjectModel.create(metaProjectObj)
    return this.findOneMetaProjectById(metaProject.id)
  }

  async findAllMetaProject(
    userId: number,
    findAllQueryMetaProject: FindAllMetaProjectRequestDTO,
  ) {
    const { page, pageSize, skipPaging, ...payload } = findAllQueryMetaProject

    payload[Op.and] = this.mysql.literal(
      `MetaProject.id in (select projectId from t_project_priviledge where userId = ${userId})`,
    )

    const metaProjects = await this.metaProjectModel.findAndCountAll({
      where: { ...payload },
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      include: this.include,
      order: [['createdAt', 'desc']],
    })

    return metaProjects
  }

  async findByIdsMetaProject(ids: number[]) {
    const metaProjects = await this.metaProjectModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    })

    return metaProjects
  }

  async findOneMetaProjectById(id: number) {
    const metaProject = await this.metaProjectModel.findByPk(id, {
      include: this.include,
    })
    return metaProject
  }

  async findOneMetaProject2(
    findAllQueryMetaProject: FindAllMetaProjectRequestDTO,
  ) {
    const { page, pageSize, skipPaging, ...payload } = findAllQueryMetaProject
    const metaProject = await this.metaProjectModel.findOne({
      where: payload,
      include: this.include,
    })
    return metaProject
  }

  async updateMetaProject(
    id: number,
    updateMetaProjectDTO: UpdateMetaProjectRequestDTO,
  ) {
    await this.metaProjectModel.update(updateMetaProjectDTO, {
      where: {
        id,
      },
    })
    return true
  }

  async removeMetaProject(id: number) {
    await this.metaProjectModel.update(
      { isActive: true },
      {
        where: {
          id,
        },
      },
    )
    return true
  }

  async buildMetaProjectCache(id: number) {
    const metaProjectObj = await this.metaProjectModel.findByPk(id, {
      include: [],
    })
    return metaProjectObj
  }
}
