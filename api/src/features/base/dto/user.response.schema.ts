export const FindOneResponseSchema = {
  name: { type: 'string', example: '', description: '名字' },
  accountId: { type: 'string', example: '', description: '账户id' },
  isEnable: { type: 'boolean', example: '', description: '是否启用' },
  isAdmin: { type: 'boolean', example: '', description: '是否超管' },
}

export const FindAllResponseSchema = {
  name: { type: 'string', example: '', description: '名字' },
  accountId: { type: 'string', example: '', description: '账户id' },
  isEnable: { type: 'boolean', example: '', description: '是否启用' },
  isAdmin: { type: 'boolean', example: '', description: '是否超管' },
}
