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
  FindAllUserRequestDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from './../dto/user.request.dto'
import { UserService } from './../services/user.service'
import {
  ApiPaginatedResponse,
  ApiFindOneResponse,
  ApiPatchResponse,
  ApiDeleteResponse,
  codeGen,
} from './../../../core'
import {
  FindOneResponseSchema,
  FindAllResponseSchema,
} from './../dto/user.response.schema'

@Controller('user')
@ApiTags('用户表')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @ApiOperation({
    summary: 'POST user',
  })
  @ApiFindOneResponse('user', FindOneResponseSchema)
  @codeGen('690-create')
  create(@Body() createUser: CreateUserRequestDTO) {
    return this.userService.create(createUser)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH user',
  })
  @ApiPatchResponse('user')
  @codeGen('690-update')
  update(
    @Param('id') id: string,
    @Body() updateUserRequestDTO: UpdateUserRequestDTO,
  ) {
    return this.userService.updateById(+id, updateUserRequestDTO)
  }

  @Get('')
  @ApiOperation({
    summary: 'GET user(list)',
  })
  @ApiPaginatedResponse('user', FindAllResponseSchema)
  @codeGen('690-findAll')
  findAll(@Query() findAllQueryUser: FindAllUserRequestDTO) {
    return this.userService.findAll(findAllQueryUser)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET user(single)',
  })
  @ApiFindOneResponse('user', FindOneResponseSchema)
  @codeGen('690-findOne')
  findOne(@Param('id') id: string) {
    return this.userService.findOneByIdOrThrow(+id)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'DELETE user',
  })
  @ApiDeleteResponse('user')
  @codeGen('690-remove')
  remove(@Param('id') id: string) {
    return this.userService.removeById(+id)
  }
}
