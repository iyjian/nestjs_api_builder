import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { Redis } from 'ioredis'
import { InjectModel } from '@nestjs/sequelize'
import { Enum } from './entities/enum.entity'
import { CreateEnumDto, EnumsRequestDto } from './dto'
import _ from 'lodash'
import { Op } from 'sequelize'

@Injectable()
export class EnumService {
  constructor(
    @InjectModel(Enum)
    private readonly enumModel: typeof Enum,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAll(): Promise<Enum[]> {
    const key = 'fleet:api:enums'
    const client: Redis = (this.cacheManager.store as any).getClient()
    const exist = await client.exists(key)
    if (exist === 0) {
      const enums = await this.enumModel.findAll()
      this.cacheManager.set<Enum[]>(key, enums)
    }
    return this.cacheManager.get<Enum[]>(key)
  }

  async create(createEnumDto: CreateEnumDto) {
    const lastEnum = await this.enumModel.findOne({
      where: {
        type: createEnumDto.type,
      },
      order: [['num', 'desc']],
    })
    // this.enumModel()
    return this.enumModel.create(
      _.extend(createEnumDto, { num: lastEnum ? lastEnum.num + 1 : 1 }),
    )
  }

  findAll(query: EnumsRequestDto) {
    let where = {}
    if (query.name) {
      where = {
        [Op.or]: {
          cnName: {
            [Op.like]: `%${query.name}%`,
          },
          enName: {
            [Op.like]: `%${query.name}%`,
          },
        },
      }
    }

    if (query.type) {
      where['type'] = query.type
    }

    return this.enumModel.findAndCountAll({
      where,
      offset: (query.page || 0 - 1) * (query?.pageSize || 20),
      limit: query.pageSize,
    })
  }

  findOne(id: number) {
    return this.enumModel.findByPk(id)
  }

  async update(id: number, updateEnumDto: CreateEnumDto) {
    await this.enumModel.update(updateEnumDto, {
      where: {
        id,
      },
    })
    return true
  }

  async remove(id: number) {
    await this.enumModel.update(
      { isActive: null },
      {
        where: {
          id,
        },
      },
    )
    return true
  }
}
