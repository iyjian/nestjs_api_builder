import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  FindAllRouteRequestDTO,
  CreateRouteRequestDTO,
  UpdateRouteRequestDTO,
} from './../dto'
import { RouteService } from './../services'

@Controller('route')
@ApiTags('路由表')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post('')
  @ApiOperation({
    summary: 'POST route',
  })
  create(@Body() createRoute: CreateRouteRequestDTO) {
    return this.routeService.create(createRoute)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH route',
  })
  update(
    @Param('id') id: string,
    @Body() updateRouteRequestDTO: UpdateRouteRequestDTO,
  ) {
    return this.routeService.updateById(+id, updateRouteRequestDTO)
  }

  @Get('')
  @ApiOperation({
    summary: 'GET route(list)',
  })
  findAll(@Query() findAllQueryRoute: FindAllRouteRequestDTO) {
    return this.routeService.findAll(findAllQueryRoute)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET route(single)',
  })
  findOne(@Param('id') id: string) {
    return this.routeService.findOneById(+id)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'DELETE route',
  })
  remove(@Param('id') id: string) {
    return this.routeService.removeById(+id)
  }
}
