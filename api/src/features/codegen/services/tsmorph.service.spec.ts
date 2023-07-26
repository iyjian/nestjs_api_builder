import { TSMorphService } from './tsmorph.service'

describe('TSMorphService Test', () => {
  let tsMorphService: TSMorphService

  beforeEach(() => {
    tsMorphService = new TSMorphService()
  })

  describe('code gen utils test', () => {
    it('getExportStructure', () => {
      expect(1).toBe(1)
    })
  })
})
