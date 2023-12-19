import axios from 'axios'
import 'dotenv/config'

const ENDPOINT = 'https://devtool.tltr.top/api'

const codeMap = {
  0: '新约束',
  1: '改约束',
  2: '改null',
  3: '改默认值',
  4: '改注释',
  5: '改数据类型',
  6: '加列',
  7: '删列',
  8: 'error',
}

const request = axios.create({
  baseURL: ENDPOINT,
  headers: {
    token: process.env.SUPER_TOKEN,
  },
})

const projectId = process.argv[2]

console.log(`projectId: ${projectId}`)

const main = async () => {
  const tablesResponse = await request.get(
    `/metaTable?skipPaging=1&projectId=${projectId}&simplify=1`,
  )

  for (const row of tablesResponse.data.data.rows) {
    if (
      [
        't_authing_user',
        't_enum_category',
      ].includes(row.name)
    ) {
      continue
    }
    const tableId = row.id
    const diffResponse = await request.get('/dbsync/column/diff', {
      params: { tableId },
    })
    if (diffResponse.data.data.length > 0) {
      console.log(`-- ${row.name}`)
      for (const sqlRow of diffResponse.data.data) {
        console.log(`-- ${sqlRow.code.map((o) => codeMap[o])}`)
        console.log(sqlRow.sql)
      }
    }
  }
}

main()
