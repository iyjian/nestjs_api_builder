export type GitTreeItem = {
  Mode: 'tree' | 'file'
  Path: string
  Name: string
  Sha: string
}

export type DescribeGitFilesResponse = {
  RequestId: string
  Items: GitTreeItem[]
}

// export type CommitAction = 'create' | 'update' | 'delete' | 'chmod' | 'move'

export enum CommitAction {
  create = 'create',
  update = 'update',
  delete = 'delete',
  chmod = 'chmod',
  move = 'move',
}
