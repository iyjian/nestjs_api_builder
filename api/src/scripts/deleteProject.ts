import { Gitlab } from '@gitbeaker/node'
import 'dotenv/config'

const projectId = process.argv[2]

const api = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_TOKEN,
})

;(async () => {
  await api.Projects.remove(projectId)
  return true
})()
