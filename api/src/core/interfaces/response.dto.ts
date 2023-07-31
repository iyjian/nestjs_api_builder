import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'

export const ApiPaginatedResponse = (modelName: string, schema: any) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${modelName}`,
        properties: {
          err: {
            type: 'number',
          },
          data: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
              },
              rows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: schema,
                },
              },
            },
          },
        },
      },
    }),
  )
}

export const ApiFindOneResponse = (modelName: string, schema: any) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `FindOneResponseOf${modelName}`,
        properties: {
          err: {
            type: 'number',
          },
          data: {
            type: 'object',
            properties: schema,
          },
        },
      },
    }),
  )
}

export const ApiPatchResponse = (modelName: string) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PatchResponseOf${modelName}`,
        properties: {
          err: {
            type: 'number',
          },
          data: {
            type: 'boolean',
            example: true,
          },
        },
      },
    }),
  )
}

export const ApiDeleteResponse = (modelName: string) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `DeleteResponseOf${modelName}`,
        properties: {
          err: {
            type: 'number',
          },
          data: {
            type: 'boolean',
            example: true,
          },
        },
      },
    }),
  )
}
