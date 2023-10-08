import { defineStore } from 'pinia'

export const useToolsStore = defineStore('tools', {
  state: () => ({
    crypto: {
      key: '5cmcAjSuaipIJk7I',
      iv: 'uKlQnWkB2WbpmHVZ',
    },
    // options1Key: "",
    // option1Val: "5cmcAjSuaipIJk7I",
    // options2Key: "",
    // option2Val: "uKlQnWkB2WbpmHVZ"
  }),
  actions: {
    setDecryptKey(val: string) {
      this.crypto.key = val
    },
    setDecryptIV(val: string) {
      this.crypto.iv = val
    },
  },
  persist: {
    enabled: true,
    strategies: [{ storage: localStorage, paths: ['tools'] }],
  },
})
