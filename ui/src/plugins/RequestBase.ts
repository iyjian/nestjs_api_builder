import axios, { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import router from './../router'
export class RequestBase {
  private readonly TIMEOUT = 0

  protected request: AxiosInstance

  constructor() {
    this.request = axios.create({
      baseURL: import.meta.env.VITE_API_ENDPOINT,
      timeout: this.TIMEOUT,
    })

    this.request.interceptors.request.use((config: any) => {
      config.headers['token'] = localStorage.getItem('token') || ''
      return config
    })

    this.request.interceptors.response.use(
      (response) => {
        if (response.data.err) {
          // console.log(response.data);
          if (response.data.err === 700) {
            router.push('/login')
          }
          return Promise.reject(new Error(response.data.errMsg))
        }
        return response
      },
      (error) => {
        ElMessage.error({
          showClose: true,
          message: error,
        })
        return Promise.reject(error)
      },
    )
  }
}
