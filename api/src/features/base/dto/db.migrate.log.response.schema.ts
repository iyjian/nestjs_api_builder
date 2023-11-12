export const FindOneResponseSchema = {
  sql: { type: 'string', example: '', description: 'sql语句' },
  tableId: { type: 'number', example: '', description: '对应表' },
  isExecutedInProd: {
    type: 'boolean',
    example: '',
    description: '是否在生产环境执行过',
  },
}

export const FindAllResponseSchema = {
  sql: { type: 'string', example: '', description: 'sql语句' },
  tableId: { type: 'number', example: '', description: '对应表' },
  isExecutedInProd: {
    type: 'boolean',
    example: '',
    description: '是否在生产环境执行过',
  },
}
