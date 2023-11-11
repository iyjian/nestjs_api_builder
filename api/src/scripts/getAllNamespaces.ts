import { Gitlab } from '@gitbeaker/node'
import 'dotenv/config'

console.log(
  `GITLAB_HOST: ${process.env.GITLAB_HOST} GITLAB_TOKEN: ${process.env.GITLAB_TOKEN}`,
)

const api = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_TOKEN,
})

;(async () => {
  const results = await api.Namespaces.all()
  console.log(results)
})()
