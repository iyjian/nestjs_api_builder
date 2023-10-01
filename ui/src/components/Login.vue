<template>
  <div class="loginform">
    <Guard :appId="appId" @login="handleLogin" />
  </div>
</template>

<script lang="ts">
// 解决方法: https://github.com/Authing/authing-ui-components/issues/2
// @ts-ignore
import { Guard } from '@authing/vue-ui-components'
import '@authing/vue-ui-components/lib/index.min.css'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginView',
  components: {
    Guard,
  },
  data() {
    return {
      appId: '62315258ab0a42505a0d6bb8',
    }
  },
  methods: {
    handleLogin(userInfo: any) {
      localStorage.setItem('token', userInfo.token)
      console.log('userInfo.token', userInfo.token)
      this.$router.push('/entities')
    },
  },
})
</script>

<style lang="stylus" scoped>
.loginform
  height 100vh
  width 100vw
  display flex
  align-items center
  justify-content center
</style>
