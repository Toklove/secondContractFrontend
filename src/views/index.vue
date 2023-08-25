<script setup>
import pako from 'pako'
import { toClipboard } from '@soerenmartius/vue3-clipboard'
import { showToast } from 'vant'
import { indexConfig, market } from '@/api'
import router from '@/router'
import Tabbar from '@/components/tabbar/index.vue'
import { useUserStore } from '@/stores/user'
import { logout } from '@/api/user'

const marketCoin = reactive([])
const wsUrl = getCurrentInstance()?.appContext.config.globalProperties.$wsUrl
let socket = new WebSocket(wsUrl)
const loading = ref(false)

const copy = (text) => {
  toClipboard(text)
  showToast('复制成功')
}

const logoutFunc = async () => {
  const { code, msg } = await logout()
  showToast(msg,
  )
  if (code === 1) {
    localStorage.clear()
    await router.push({ name: 'login' })
  }
}

const handlerData = (msg) => {
  const data = JSON.parse(msg)
  if (data.ping)
  { socket.send(JSON.stringify({ pong: data.ping })) }
  else if (data.tick)
  {
    const flag = data.ch.split('.')[1]
    marketCoin.forEach((item) => {
      if (flag === item.dataFlag) {
        item.prevData = item.nowData
        item.nowData = data.tick
        item.upOrDown = item.nowData.close > item.prevData.close
        item.diff = ((item.nowData.close - item.nowData.open) / item.nowData.open * 100).toFixed(2)
      }
    })
  }
}
const createSubTickerRequest = SYMBOL => ({
  sub: `market.${SYMBOL}.ticker`,
})
const subscribeData = (SYMBOL) => {
  socket.send(JSON.stringify(createSubTickerRequest(SYMBOL)))
}

const config = ref({
  banner: [],
  msg: '',
})
onBeforeMount(async () => {
  loading.value = true
  if (socket.readyState === WebSocket.CLOSED)
    socket = new WebSocket(wsUrl)
  const { data } = await indexConfig()
  config.value = data
})

socket.onopen = () => {
  market().then((res) => {
    res.data.forEach((item) => {
      item.nowData = {
        open: 51732,
        high: 52785.64,
        low: 51000,
        close: 52735.63,
        amount: 13259.24137056181,
        vol: 687640987.4125315,
        count: 448737,
        bid: 52732.88,
        bidSize: 0.036,
        ask: 52732.89,
        askSize: 0.583653,
        lastPrice: 52735.63,
        lastSize: 0.03,
      }
      item.prevData = item.nowData
      item.upOrDown = true
      item.diff = 1
      item.dataFlag = item.symbol.replace('_', '')
      subscribeData(item.dataFlag)
      marketCoin.push(item)
      loading.value = false
    })
  })
}

socket.onmessage = (event) => {
  const blob = event.data
  const fileReader = new FileReader()
  fileReader.onload = (e) => {
    const payloadData = new Uint8Array(e.target.result)
    const msg = pako.inflate(payloadData, { to: 'string' })
    handlerData(msg)
  }
  fileReader.readAsArrayBuffer(blob)
}

onUnmounted(() => {
  socket.close()
})

const is_login = localStorage.getItem('IS_LOGIN')

const showLeft = ref(false)

const showLeftFunc = () => {
  if (is_login !== '1') {
    router.push({ name: 'login' })
    return
  }
  showLeft.value = true
}

const userStore = useUserStore()

const getVerifyStatus = () => {
  switch (userStore.userInfo.verify_status) {
    case '0':
      return '未验证'
    case '1':
      return '已验证'
    case '2':
      return '验证未通过'
  }
}
</script>

<template>
  <div class="container">
    <div class="main-box w-full">
      <div
        class="main-header w-full fixed z-100 bg-[F5F5F5FF] px-[10px] flex items-center justify-between top-0 py-[10px] bg-[#eff2f5]"
      >
        <div class="header-box flex flex-row items-center">
          <a @click="showLeftFunc">
            <div class="img-size-box">
              <img src="@/assets/img/cube.svg" class="w-[25px] h-[25px]" alt="">
            </div>
          </a>
          <span v-if="is_login !== '1'" class="ml-4 text-[14px] text-[#333]" @click="router.push({ name: 'login' })">登录 / 注册</span>
          <span v-else class="ml-4 text-[14px] text-[#333]">{{ userStore.userInfo.username }}</span>
        </div>
        <a>
          <div class="header-box">
            <img src="@/assets/img/lang.svg" alt="" class="w-[25px] h-[25px]">
          </div>
        </a>
      </div>
      <div class="mt-[40px]" />
      <div v-loading="loading" class="mx-[6px] mb-3" :class="loading ? 'h-[160px]' : ''">
        <van-swipe :autoplay="3000" class="my-swipe rounded overflow-hidden" indicator-color="white">
          <van-swipe-item v-for="(item, index) in config.banner" :key="index" class="w-full h-full">
            <img alt="" :src="item" class="object-cover">
          </van-swipe-item>
        </van-swipe>
      </div>
    </div>
    <div class="px-[6px] overflow-hidden">
      <div v-loading="loading" class="flex flex-row overflow-x-scroll mb-[4px] min-h-[90px] market-grid">
        <div v-for="(item, index) in marketCoin" :key="index" class="market-grid-item bg-white min-w-[31%] text-center flex-1 flex flex-col py-[12px] px-[24px] rounded-[10px] mr-[3.5%] justify-center items-center cursor-pointer" @click="router.push({ path: `contract`, query: { pair: item.symbol } })">
          <img class="w-[20px] h-[20px] rounded-[100%]" :src="item.icon">
          <span
            class="text-[#1f3f59] text-[12px] mt-[10px]"
          >{{ item.title }}
          </span>
          <span class="text-[16px] font-[500] transition-all mt-[6px]" :class="item.diff > 0 ? 'green' : 'red'">{{ item.nowData.lastPrice.toFixed(2) }}</span>
          <span class="text-[10px] font-[500] transition-all mt-[2px]" :class="item.diff > 0 ? 'green' : 'red'">{{ item.diff > 0 ? '+' : '' }}{{ item.diff }}%</span>
        </div>
      </div>
      <div class="flex">
        <div class="op-size-box" style="width: 66%">
          <van-notice-bar background="transparent" color="#1f3f59" left-icon="volume-o">
            {{ config.msg }}
          </van-notice-bar>
        </div>
        <div class="op-size-box ml-2 flex items-center flex-col justify-center text-[10px] py-4" style="width: 33%" @click="router.push({ name: 'chat' })">
          <van-icon name="https://fastly.jsdelivr.net/npm/@vant/assets/icon-demo.png" size="24" />
          <span class="mt-2">
            联系客服
          </span>
        </div>
      </div>
      <div
        v-loading="loading" class="min-h-[400px] market"
      >
        <div class="grid grid-cols-3 gap-4 w-full h-[30px] leading-[30px]">
          <div style="text-align: center;">
            <span
              class="font-z-m font-cc" style="margin-left: -30px;"
            >交易对</span>
          </div>
          <div style="text-align: center;">
            <span
              class="font-z-m font-cc"
            >最新价格</span>
          </div>
          <div style="text-align: right;">
            <span
              class="font-z-m font-cc"
            >24h涨跌幅</span>
          </div>
        </div>
        <div id="box-size-trade" class="w-full">
          <div v-for="item in marketCoin" :key="item.id" class="w-full h-[50px] grid grid-cols-3 gap-4 cursor-pointer" @click="router.push({ path: `contract`, query: { pair: item.symbol } })">
            <div class="flex items-center flex-row">
              <img class="w-[20px] h-[20px] mr-[10px] rounded-[100%]" :src="item.icon">
              <span class="font-z-mmm font-cc cn_btc">{{ item.title }}</span>
            </div>
            <div class="flex justify-center items-center">
              <span class="font-z-mmm transition-all" :class="item.diff > 0 ? 'green' : 'red'">{{ item.nowData.lastPrice.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-end">
              <span
                class="text-[13px] transition-all up-down" :class="item.diff > 0 ? 'bgreen' : 'bred'"
              >{{ item.diff > 0 ? '+' : '' }}{{ item.diff }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <van-popup
      v-model:show="showLeft"
      position="left"
      :style="{ width: '80%', height: '100%' }"
      closeable
      close-icon-position="top-left"
    >
      <div class="relative h-full">
        <div class="flex flex-col px-[18px] pt-[32px] bg-[#F5F5F5FF] h-full">
          <div class="flex mt-[30px] items-center flex-row justify-between shadow p-[10px] rounded bg-white">
            <div class="flex items-center flex-row">
              <img :src="userStore.userInfo.avatar" class="w-[52px] h-[52px] rounded-[100%] mr-4" alt="">
              <div class="flex flex-col items-start">
                <span class="text-[#353944] font-bold text-[20px] mb-2">{{ userStore.userInfo.username }}</span>
                <span class="text-[#83878C text-[12px] flex flex-row items-center" @click="copy(userStore.userInfo.invite_code)">
                  <span>邀请码: {{ userStore.userInfo.invite_code }}</span>
                  <van-icon name="enlarge" class="ml-1 font-bold" />
                </span>
              </div>
            </div>
            <van-icon name="arrow" class="font-bold" />
          </div>
          <div class="mt-4 rounded overflow-hidden">
            <van-cell-group>
              <van-cell title="身份验证" :value="getVerifyStatus()" is-link to="ident" />
              <van-cell title="密码设置" is-link to="resetPassword" />
              <van-cell title="提币地址" is-link to="withdrawList" />
              <van-cell title="我的账单" is-link to="moneyLogList" />
            </van-cell-group>
          </div>
          <div class="mt-4 rounded overflow-hidden">
            <van-cell-group>
<!--              <van-cell title="我的邀请" is-link />-->
              <van-cell title="帮助中心" is-link to="help" />
              <van-cell title="关于我们" is-link to="other?type=aboutus" />
            </van-cell-group>
          </div>
        </div>
        <div class="absolute bottom-[20px] px-[20px] w-full">
          <van-button type="danger" block @click="logoutFunc">
            退出登录
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="less" scoped>
.container {
  width: 100vw;
  height: 100vh;
  padding-top: 10px;
  position: relative;

  .op-size-box {
    width: 100%;
    background: #fff;
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    padding: 5px 8px;
  }

  .list_open {
    width: 30%;
    height: 50px;
    line-height: 50px;
    float: left;
    text-align: center;
  }

  .list_cname {
    width: 40%;
    height: 50px;
    line-height: 50px;
    float: left;
  }

  .font-z-m {
    font-size: 12px;
  }

  .font-z-mmm {
    font-size: 14px;
  }

  .font-cc {
    color: #000;
  }
}
.market {
  width: 100%;
  background: rgb(255, 255, 255);
  padding: 20px 20px 60px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
.market-grid-item:last-child {
  margin-right: 0!important;
}

.up-down {
  color:#fff;
  border-radius: 2px;
  width:70px;
  height:35px;
  line-height:35px;
  text-align:center;
  display:inline-block;
}
</style>

<style>
.van-popup,.van-overlay {
  z-index: 9999999 !important;
}
</style>