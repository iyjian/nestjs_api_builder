import { Project, Node } from 'ts-morph'

const run = () => {
  const project = new Project({})

  project.addSourceFilesFromTsConfig('./tsconfig.json')

  for (const sourceFile of project.getSourceFiles()) {
    const fileName = sourceFile.getBaseName()
    const dirPath = sourceFile.getDirectoryPath()

    if (!/entity\.ts$/.test(fileName)) {
      continue
    }

    const class_ = sourceFile.getClasses()[0]

    for (const member of class_.getMembers()) {
      // if (Node.isPropertyDeclaration)
      // console.log(member.getKindName())
      if (Node.isPropertyDeclaration(member)) {
        console.log(fileName, member.getName())
      } else if (Node.isGetAccessorDeclaration(member)) {
        console.log(fileName, 'get', member.getName())
        console.log(member.getFullText())
      } else if (Node.isSetAccessorDeclaration(member)) {
        console.log(fileName, member.getName())
      }
    }
  }
}

run()
