import { Controller, Get, Query } from '@nestjs/common'
import { DataTypeReductionService } from '../services/datatype.reduction.service'

@Controller('datatypereduction')
export class DatatypeReductionController {
  constructor(
    private readonly dataTypeReductionService: DataTypeReductionService,
  ) {}

  @Get('reduction')
  reduction(
    @Query('cnName') cnName: string,
    @Query('enName') enName: string,
    @Query('comment') comment: string,
    @Query('sample') sample: string[],
  ) {
    return this.dataTypeReductionService.reduction(
      cnName,
      enName,
      comment,
      sample,
    )
  }
}
