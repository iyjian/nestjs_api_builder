import { PagingRequestDTO } from './../../../core/interfaces/requestDto'
import { Type } from 'class-transformer'

export class CreateI18nRequestDto {
  @Type(() => Boolean)
  isTableColumn: boolean

  tableName: string

  columnName: string

  columnComment: string

  columnDataType: string

  cnName: string

  enName: string

  remark: string
}

export class UpdateI18nRequestDto {
  @Type(() => Boolean)
  isTableColumn: boolean

  tableName: string

  columnName: string

  columnComment: string

  columnDataType: string

  cnName: string

  enName: string

  remark: string
}

export class FindAllI18nDto extends PagingRequestDTO {
  @Type(() => Boolean)
  skipPaging?: boolean

  @Type(() => Boolean)
  isTableColumn?: boolean

  tableName?: string

  columnName?: string

  columnComment?: string

  columnDataType?: string

  cnName?: string

  enName?: string

  remark?: string
}
