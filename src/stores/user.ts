import { defineStore } from 'pinia'
import router from '@/router'
import { getUserInfo } from '@/api/user'

export const useUserStore = defineStore('userStore', () => {
  const userInfo = ref()

  const clearToken = () => {
    localStorage.removeItem('TOKEN')
  }

  const requestUserInfo = () => {
    return new Promise((resolve, reject) => {
      getUserInfo().then((response) => {
        if (!response || !response.data) {
          clearToken()
          router.push({ name: 'login' })
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(false)
        } else {
          userInfo.value = response.data
          resolve(response.data)
        }
      })
    })
  }
  return {
    userInfo,
    requestUserInfo,
  }
}, {
  persist: true,
})
