<script setup>
import pako from 'pako/dist/pako.esm.mjs'
import router from '@/router'
import { indexConfig, market } from '@/api'

const marketCoin = reactive([])
const wsUrl = getCurrentInstance()?.appContext.config.globalProperties.$wsUrl

let socket = new WebSocket(wsUrl)
const loading = ref(false)

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

onBeforeMount(async () => {
  loading.value = true
  if (socket.readyState === WebSocket.CLOSED)
    socket = new WebSocket(wsUrl)
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
</script>

<template>
  <div>
    <div
      v-loading="loading" class="min-h-screen market"
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
</template>

<style scoped lang="scss">
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
