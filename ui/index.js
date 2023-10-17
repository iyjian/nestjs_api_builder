const Proxy = require('static-web-proxy')
const path = require('path')

const proxy = new Proxy({
  proxy: [
    {
      host: 'devtool-api',
      scheme: 'http',
      port: process.env.PORT,
      targetPath: '/',
      path: '/api',
    },
  ],
  web: {
    dir: path.join(__dirname, '/dist'), //静态网站目录
    index: 'index.html', //初始页面文件
  },
  bind: {
    host: '0.0.0.0',
    port: 3000,
  },
})

proxy.start()
