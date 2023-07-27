import { Gitlab } from '@gitbeaker/rest'
import 'dotenv/config'

const api = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_TOKEN,
})

;(async () => {
  // Listing users
  // let users = await api.Users.all();

  // Or using Promise-Then notation
  console.log(`getAllProjects - start`)
  const projects = await api.Projects.all({membership: true})
  for (const project of projects) {
    console.log(project.id, project.name)
  }
  console.log(`getAllProjects - done`)
})()
