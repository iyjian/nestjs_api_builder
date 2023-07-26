import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { BaseService } from '../../../core'
import { Op } from 'sequelize'
import {
  UpdateMetaDataTypeRequestDTO,
  CreateMetaDataTypeRequestDTO,
  FindAllMetaDataTypeRequestDTO,
} from '../dto'
import { MetaDataType } from '../entities/meta.data.type.entity'

@Injectable()
export class MetaDataTypeService extends BaseService {
  private readonly include: any[]

  constructor(
    @InjectModel(MetaDataType)
    private readonly metaDataTypeModel: typeof MetaDataType,
  ) {
    super()
    this.include = []
  }

  async createMetaDataType(metaDataTypeObj: CreateMetaDataTypeRequestDTO) {
    const metaDataType = await this.metaDataTypeModel.create(metaDataTypeObj)
    return this.findOneMetaDataType(metaDataType.id)
  }

  async findAllMetaDataType(
    findAllQueryMetaDataType: FindAllMetaDataTypeRequestDTO,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      ...payload
    } = findAllQueryMetaDataType

    const metaDataTypes = await this.metaDataTypeModel.findAndCountAll({
      where: { ...payload },
      offset: skipPaging ? undefined : (page - 1) * pageSize,
      limit: skipPaging ? undefined : pageSize,
      include: this.include,
    })

    return metaDataTypes
  }

  async findByIdsMetaDataType(ids: number[]) {
    const metaDataTypes = await this.metaDataTypeModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    })

    return metaDataTypes
  }

  async findOneMetaDataType(id: number) {
    const metaDataType = await this.metaDataTypeModel.findByPk(id, {
      include: this.include,
    })
    return metaDataType
  }

  async updateMetaDataType(
    id: number,
    updateMetaDataTypeDto: UpdateMetaDataTypeRequestDTO,
  ) {
    await this.metaDataTypeModel.update(updateMetaDataTypeDto, {
      where: {
        id,
      },
    })
    return true
  }

  async removeMetaDataType(id: number) {
    await this.metaDataTypeModel.update(
      { deleted: true },
      {
        where: {
          id,
        },
      },
    )
    return true
  }
}
