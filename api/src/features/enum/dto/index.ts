import { PagingRequestDTO } from './../../../core/interfaces'

export class CreateEnumDto {
  type: string
  typeDesc?: string
  cnName?: string
  enName?: string
  code?: string
  remark?: string
}

export class EnumsRequestDto extends PagingRequestDTO {
  type?: string
  name?: string
}
