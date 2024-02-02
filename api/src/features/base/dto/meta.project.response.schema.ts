export const FindOneResponseSchema = {
  name: { type: 'string', example: '', description: '项目名' },
  repo: { type: 'string', example: '', description: '所在仓库地址' },
  repoId: { type: 'number', example: '', description: '仓库id' },
  version: { type: 'number', example: '', description: '代码风格' },
  baseDirectory: { type: 'string', example: '', description: '代码路径' },
  strictRequest: {
    type: 'boolean',
    example: '',
    description: '是否严格检查请求中的参数',
  },
  dbName: { type: 'string', example: '', description: '数据库名' },
  dbHost: { type: 'string', example: '', description: '数据库host' },
  dbPort: { type: 'string', example: '', description: '数据库端口' },
  dbUser: { type: 'string', example: '', description: '数据库用户' },
  dbPassword: { type: 'string', example: '', description: '数据库密码' },
  repoName: {
    type: 'string',
    example: '',
    description: '仓库名称-只能填英文名',
  },
  gitlabToken: {
    type: 'string',
    example: 'glpat-6eHnu5BQjYEkC9frWoSm',
    description: 'gitlabToken',
  },
  gitlabHost: {
    type: 'string',
    example: 'https://gitlab.bigcruise.cn',
    description: 'gitlabHost',
  },
  userId: { type: 'number', example: '', description: '用户id' },
  isPublic: { type: 'boolean', example: '', description: '是否公开' },
  status: {
    type: 'number',
    example: '0 - 创建中 1 - 创建成功',
    description: '创建状态',
  },
}

export const FindAllResponseSchema = {
  name: { type: 'string', example: '', description: '项目名' },
  repo: { type: 'string', example: '', description: '所在仓库地址' },
  repoId: { type: 'number', example: '', description: '仓库id' },
  version: { type: 'number', example: '', description: '代码风格' },
  baseDirectory: { type: 'string', example: '', description: '代码路径' },
  strictRequest: {
    type: 'boolean',
    example: '',
    description: '是否严格检查请求中的参数',
  },
  dbName: { type: 'string', example: '', description: '数据库名' },
  dbHost: { type: 'string', example: '', description: '数据库host' },
  dbPort: { type: 'string', example: '', description: '数据库端口' },
  dbUser: { type: 'string', example: '', description: '数据库用户' },
  dbPassword: { type: 'string', example: '', description: '数据库密码' },
  repoName: {
    type: 'string',
    example: '',
    description: '仓库名称-只能填英文名',
  },
  gitlabToken: {
    type: 'string',
    example: 'glpat-6eHnu5BQjYEkC9frWoSm',
    description: 'gitlabToken',
  },
  gitlabHost: {
    type: 'string',
    example: 'https://gitlab.bigcruise.cn',
    description: 'gitlabHost',
  },
  userId: { type: 'number', example: '', description: '用户id' },
  isPublic: { type: 'boolean', example: '', description: '是否公开' },
  status: {
    type: 'number',
    example: '0 - 创建中 1 - 创建成功',
    description: '创建状态',
  },
  user: {
    type: 'object',
    properties: {
      name: { type: 'string', example: '', description: '名字' },
      accountId: { type: 'string', example: '', description: '账户id' },
      isEnable: { type: 'boolean', example: '', description: '是否启用' },
      isAdmin: { type: 'boolean', example: '', description: '是否超管' },
      namespaceId: { type: 'number', example: '', description: 'gitlab组id' },
    },
  },
}
