import { Gitlab } from '@gitbeaker/node'
import 'dotenv/config'

const api = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_TOKEN,
})

;(async () => {
  // Listing users
  // let users = await api.Users.all();

  // Or using Promise-Then notation
  const projects = await api.Projects.all()

  for (const project of projects) {
    console.log(project.id, project.name)
  }
})()
