export default (): any => ({
  app: {
    sentryDSN: process.env.SENTRY_DSN,
    code: process.env.APP_CODE,
    title: process.env.APP_TITLE,
    desc: process.env.APP_DESC,
    port: parseInt(process.env.PORT),
    env:
      process.env.NODE_ENV === 'development'
        ? 'development'
        : process.env.NODE_ENV === 'production'
        ? 'production'
        : undefined,
  },
  mysql: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 0) || 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWD,
    db: process.env.MYSQL_DB,
    sslCert: process.env.MYSQL_SSL_CERT,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 0) || 6379,
    password: process.env.REDIS_PASSWD,
    db: parseInt(process.env.REDIS_DB, 0) || 0,
    ttl: parseInt(process.env.REDIS_TTL, 0) || 300,
  },
  coding: {
    apiEndpoint: process.env.CODING_API_ENDPOINT,
    apiToken: process.env.CODING_API_TOKEN,
  },
  gitlab: {
    host: process.env.GITLAB_HOST,
    token: process.env.GITLAB_TOKEN,
    namespaceId: process.env.GITLAB_DEFAULT_NAMESPACE_ID,
    templateProjectId: process.env.GITLAB_TEMPLATE_PROJECT_ID,
    defaultBranch: process.env.GITLAB_DEFAULT_BRANCH,
  },
  auth: {
    authingAppId: process.env.AUTHING_APP_ID,
    authingAppHost: process.env.AUTHING_APP_HOST,
    superToken: process.env.SUPER_TOKEN,
  },
  proxy: {
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT,
  },
  openAI: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  aliyunAPI: {
    accessKeyId: process.env.ALIYUN_API_ACCESSS_KEY,
    accessKeySecret: process.env.ALIYUN_API_ACCESS_SECRET,
    endpoint: process.env.ALIYUN_API_ENDPOINT,
  },
  baiduAPI: {
    appId: process.env.BAIDU_APP_ID,
    appSecret: process.env.BAIDU_APP_SECRET,
  },
  iflyTechSpark: {
    appId: process.env.IFLY_TECH_SPARK_APPID,
    apiKey: process.env.IFLY_TECH_SPARK_API_KEY,
    apiSecret: process.env.IFLY_TECH_SPARK_SECRET_KEY
  }
})
