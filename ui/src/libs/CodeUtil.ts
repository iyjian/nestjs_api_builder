import * as Diff from 'diff'

export function getLineNumberByCode(lookupCode: string, code: string) {
  const lines = code.split(/\n/)
  const totalLines = lines.length - 1
  let blockStart = 0
  let found = false
  let blockEnd = 0
  for (const [lineNum, line] of code.split(/\n/).entries()) {
    if (line === '' && !found) {
      blockStart = lineNum
    }
    if (new RegExp(lookupCode).test(line)) {
      found = true
    }
    if (line === '' && found) {
      blockEnd = lineNum
      return { blockStart, blockEnd, totalLines }
    }
  }
  return { blockStart, blockEnd, totalLines }
}

export function getDiff(oldText: string, newText: string) {
  return Diff.createTwoFilesPatch('old', 'new', oldText, newText)
}
