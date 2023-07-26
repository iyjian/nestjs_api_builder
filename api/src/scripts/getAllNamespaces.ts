import { Gitlab } from '@gitbeaker/node'
import 'dotenv/config'

const api = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_TOKEN,
})

;(async () => {
  const results = await api.Namespaces.all()
  console.log(results)
})()
