import { Gitlab } from '@gitbeaker/node'
import 'dotenv/config'

const api = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_TOKEN,
})

;(async () => {
  const files = await api.Repositories.tree(20, {
    ref: 'master',
    path: '',
    recursive: true,
    per_page: 10000,
  })
  console.log(files.length)
})()
