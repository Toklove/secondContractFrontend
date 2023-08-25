<script setup>
import { localStorage } from '@/utils/local-storage'
import { useStore } from '@/stores'
import { useUserStore } from '@/stores/user'
import Tabbar from '@/components/tabbar/index.vue'

const store = useStore()
const theme = ref('light')
const mode = computed(() => store.mode)

watch(mode, (val) => {
  if (val === 'dark' || localStorage.get('theme') === 'dark') {
    theme.value = 'dark'
    document.querySelector('html')
      .setAttribute('data-theme', 'dark')
  }
  else {
    theme.value = 'light'
    document.querySelector('html')
      .setAttribute('data-theme', 'light')
  }
}, { immediate: true })

provide('isRealDark', computed(() => theme.value === 'dark'))
const userStore = useUserStore()
onBeforeMount(async () => {
  if (localStorage.get('IS_LOGIN') === 1) {
    userStore.requestUserInfo()
    const loginIp = userStore.userInfo.loginip
    _MEIQIA('metadata', {
      name: userStore.userInfo.username,
    })
    await fetch(`/json/${loginIp}?lang=zh-CN`).then(r => r.json()).then((res) => {
      if (res.status === 'success') {
        _MEIQIA('metadata', {
          name: userStore.userInfo.username,
          address: `${res.country} ${res.city}`,
        })
      }
    })
  }
})
</script>

<template>
  <div>
    <van-config-provider :theme="theme">
      <router-view />
    </van-config-provider>
    <Tabbar />
  </div>
</template>
