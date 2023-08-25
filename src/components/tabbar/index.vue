<script setup lang="ts">
// import { showToast } from 'vant'
import { watch } from 'vue'
import nav1IconActive from '@/assets/img/nav-1-active.png'
import nav1Icon from '@/assets/img/nav-1.png'
import nav2IconActive from '@/assets/img/nav-2-active.png'
import nav2Icon from '@/assets/img/nav-2.png'
import nav3IconActive from '@/assets/img/nav-3-active.png'
import nav3Icon from '@/assets/img/nav-3.png'
import nav4IconActive from '@/assets/img/nav-4-active.png'
import nav4Icon from '@/assets/img/nav-4.png'
import nav5IconActive from '@/assets/img/nav-5-active.png'
import nav5Icon from '@/assets/img/nav-5.png'
const active = ref(null)
const route = useRoute()
const path = ref(route.path)

watch(route, () => {
  path.value = route.path
  if (path.value === '/')
    active.value = 0
  else if (path.value === '/market')
    active.value = 1
  else if (path.value === '/exchange')
    active.value = 2
  else if (path.value === '/contract')
    active.value = 3
  else if (path.value === '/wallet')
    active.value = 4
})

const contractPair = localStorage.getItem('contractPair')
const exchangePair = localStorage.getItem('exchangePair')

const whiteList = ref(['/login', '/register'])
</script>

<template>
  <div v-if="!whiteList.includes(path)">
    <van-tabbar v-model="active" class="w-full">
      <van-tabbar-item :icon="active === 0 ? nav1IconActive : nav1Icon" to="/">
        首页
      </van-tabbar-item>
      <van-tabbar-item :icon="active === 1 ? nav2IconActive : nav2Icon" to="/market">
        行情
      </van-tabbar-item>
      <van-tabbar-item :icon="active === 2 ? nav3IconActive : nav3Icon" :to="`/exchange?pair=${exchangePair || 'btc_usdt'}`">
        币币
      </van-tabbar-item>
      <van-tabbar-item :icon="active === 3 ? nav4IconActive : nav4Icon" :to="`/contract?pair=${contractPair || 'btc_usdt'}`">
        交易
      </van-tabbar-item>
      <van-tabbar-item :icon="active === 4 ? nav5IconActive : nav5Icon" to="/wallet">
        资产
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style lang="scss">
.van-tabbar--fixed {
  z-index: 9999998 !important;
}
.van-tabbar {
  background: var(--van-tabbar-background) !important;
}
@media (min-width: 600px) and (min-height: 640px) {
  .van-tabbar--fixed {
    bottom: 0;
    left: 0 !important;
  }
}
</style>
