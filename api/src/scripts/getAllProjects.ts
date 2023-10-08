import { Gitlab } from '@gitbeaker/node'
// import { Gitlab } from '@gitbeaker/rest'
import 'dotenv/config'

const api = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_TOKEN,
})

;(async () => {
  console.log(`getAllProjects - start`)
  // 仅读取私有的项目
  const projects = await api.Projects.all({ membership: true })
  for (const project of projects) {
    console.log(project.id, project.name)
  }
  console.log(`getAllProjects - done`)
})()
