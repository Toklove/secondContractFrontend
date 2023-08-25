<script setup>
import pako from 'pako'
import { useRouter } from 'vue-router'
import { showFailToast, showToast } from 'vant'
import dayjs from 'dayjs'
import Chart from '@/components/chart/index.vue'
import { getPairConfig } from '@/api/market'
import { createContract, getContractInfo } from '@/api/contract'
import { market } from '@/api'
import { resetPwd } from '@/api/user'
import { submitExchange } from '@/api/exchange'

const onClickLeft = () => history.back()
const wsUrl = getCurrentInstance()?.appContext.config.globalProperties.$wsUrl
const marketCoin = reactive([])

const createSubTickerMarketRequest = symbol => ({
  sub: `market.${symbol}.ticker`,
})

let marketSocket = new WebSocket(wsUrl)

const handlerMarketData = (msg) => {
  const data = JSON.parse(msg)
  if (data.ping)
  { marketSocket.send(JSON.stringify({ pong: data.ping })) }
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
const subscribeMarketData = (SYMBOL) => {
  marketSocket.send(JSON.stringify(createSubTickerMarketRequest(SYMBOL)))
}

marketSocket.onopen = () => {
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
      subscribeMarketData(item.dataFlag)
      marketCoin.push(item)
    })
  })
}

marketSocket.onmessage = (event) => {
  const blob = event.data
  const fileReader = new FileReader()
  fileReader.onload = (e) => {
    const payloadData = new Uint8Array(e.target.result)
    const msg = pako.inflate(payloadData, { to: 'string' })
    handlerMarketData(msg)
  }
  fileReader.readAsArrayBuffer(blob)
}

let socket = new WebSocket(wsUrl)
const router = useRouter()
const pair = ref(router.currentRoute.value.query.pair)

const pairInfo = ref(pair.value.split('_'))

const coinName = computed(() => {
  return pairInfo.value[0].toUpperCase()
})
const pairName = computed(() => {
  return pairInfo.value[1].toUpperCase()
})
const SYMBOL = ref(router.currentRoute.value.query.pair.replace('_', ''))

const createSubTickerRequest = () => ({
  sub: `market.${SYMBOL.value}.ticker`,
})

const nowData = ref({
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
})

const prevData = ref({
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
})

const handlerData = (msg) => {
  const data = JSON.parse(msg)
  if (data.ping)
  { socket.send(JSON.stringify({ pong: data.ping })) }
  else if (data.tick) {
    prevData.value = nowData.value
    nowData.value = data.tick
  }
}

const diff = computed(() => {
  return ((nowData.value.close - nowData.value.open) / nowData.value.open * 100).toFixed(2)
})

const upOrDown = computed(() => {
  return (nowData.value.close > prevData.value.close)
})

const subscribeData = () => {
  socket.send(JSON.stringify(createSubTickerRequest()))
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
socket.onopen = () => {
  subscribeData()
}

const showSelectPopup = ref(false)
const showPopup = ref(false)

const initData = async () => {
  if (marketSocket.readyState === WebSocket.CLOSED)
    marketSocket = new WebSocket(wsUrl)
  if (socket.readyState === WebSocket.CLOSED)
    socket = new WebSocket(wsUrl)
  const { code, data } = await getPairConfig(pair.value)
  const record = {}
  record.wallet = data.wallet
  const contractList = []
  record.contract_time = data.contract_time.split(',')
  record.contract_power = data.contract_power.split(',')
  // record.contract_amount = data.contract_amount.split(',')
  record.contract_time_min = data.contract_time_min.split(',')
  record.contract_time.forEach((item, index) => {
    const data = {
      time: item,
      sec: item * 60,
      power: record.contract_power[index],
      min: record.contract_time_min[index],
    }
    contractList.push(data)
  })
  record.contractList = contractList
}

onBeforeMount(async () => {
  await initData()
})

const contractInfo = ref({})

const getData = async () => {
  const { code, data, msg } = await getContractInfo(contractInfo.value.id)
  if (data.status === '0') {
    setTimeout(() => {
      getData()
    }, 3000)
    return
  }
  if (code !== 1)
    showFailToast(msg)
  contractInfo.value = data
}

const changeSymbol = async (symbol) => {
  localStorage.setItem('exchangePair', symbol)
  await router.push({ path: 'exchange', query: { pair: symbol } })
  location.reload()
}

onUnmounted(() => {
  socket.close()
  marketSocket.close()
  clearInterval(contractInfo.value.timer)
})

const direction = ref(0)

const setDirection = (val) => {
  direction.value = val
}

const active = ref(0)

const form = ref({
  price: null,
  type: null,
  direction: null,
  num: null,
  pair: router.currentRoute.value.query.pair,
})

const validForm = ref({
  price: {
    show: false,
    message: '请输入买入价',
  },
  num: {
    show: false,
    message: '请输入买入量',
  },
})
const submitForm = async (e) => {
  e.preventDefault()
  if (active.value === 1)
    form.value.price = 999
  if (!form.value.price) {
    validForm.value.price.show = true
    return
  }
  if (!form.value.num) {
    validForm.value.num.show = true
    return
  }
  form.value.direction = direction.value
  form.value.type = active.value
  const { msg, code, data } = await submitExchange(form.value)
  if (code !== 1) {
    showFailToast(msg)
    return
  }
  showToast('提交成功')
  showPopup.value = false
}
</script>

<template>
  <div :key="router.currentRoute.value.query.pair">
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <div class="flex items-center">
          <van-icon name="exchange" color="#121935" class="font-bold mr-2" @click="showSelectPopup = true" />
          <span class="text-[#121935]">{{ coinName }}/{{ pairName }} 币币交易</span>
        </div>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
      <template #right>
        <van-icon name="orders-o" color="#121935" @click="router.push({ name: 'exchangeLog' })" />
      </template>
    </van-nav-bar>
    <div class="kline-title grid grid-cols-2 h-[80px] bg-white shadow mb-[1px] px-[20px] rounded-t-xl">
      <div class="left">
        <div class="h-[40px] font-bold leading-[60px] mb-0 flex items-end">
          <p class="text-[22px] transition-all" :class="upOrDown ? 'green' : 'red'">
            {{ nowData.lastPrice.toFixed(2) }}
          </p>
        </div>
        <div class="h-[40px] font-bold leading-[60px] pt-2 flex">
          <p class="text-[16px] transition-all" :class="upOrDown ? 'green' : 'red'">
            {{ diff > 0 ? '+' : '' }}{{ diff }}%
          </p>
        </div>
      </div>
      <div class="right">
        <div class="flex flex-col text-[12px]">
          <div class="flex justify-between flex-row h-[26px] items-end">
            <span class="text-[#707A8A]">最低</span>
            <span class="transition-all">{{ nowData.low.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between flex-row h-[26px] items-center my-[1px]">
            <span class="text-[#707A8A]">最高</span>
            <span class="transition-all">{{ nowData.high.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between flex-row h-[26px]">
            <span class="text-[#707A8A]">24H量</span>
            <span class="transition-all">{{ nowData.vol.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
    <Chart :symbol="SYMBOL" />
    <div class="grid grid-cols-2 gap-8 px-[20px] mt-[25px] mb-[80px]">
      <van-button color="#5FB385" block @click="showPopup = true">
        买入
      </van-button>
      <van-button color="#E35553" block @click="showPopup = true">
        卖出
      </van-button>
    </div>
    <van-popup
      v-model:show="showSelectPopup"
      position="left"
      :style="{ width: '80%', height: '100%' }"
    >
      <div class="flex flex-col p-[20px]">
        <div class="flex justify-between mb-2">
          <span>名称</span>
          <span>最新价格</span>
        </div>
        <div v-for="item in marketCoin" :key="item.id" class="flex justify-between mt-4" @click="changeSymbol(item.symbol)">
          <span class="font-bold">{{ item.title }}</span>
          <span class="font-z-mmm transition-all" :class="item.diff > 0 ? 'green' : 'red'">{{ item.nowData.lastPrice.toFixed(2) }}</span>
        </div>
      </div>
    </van-popup>
    <van-popup
      v-model:show="showPopup"
      position="bottom"
      :style="{ height: '60%' }"
    >
      <div class="p-[20px] h-full">
        <form class="relative h-full" @submit="submitForm">
          <div class="grid grid-cols-2 gap-4">
            <van-button block size="small" :color="direction === 0 ? '#5FB385' : ''" @click="setDirection(0)">
              买入
            </van-button>
            <van-button size="small" block :color="direction === 1 ? '#E35553' : ''" @click="setDirection(1)">
              卖出
            </van-button>
          </div>
          <van-tabs v-model:active="active">
            <van-tab title="限价">
              <div class="pt-6 h-full w-full">
                <div class="login-form-group global-form-group">
                  <label>{{ direction === 0 ? '买入' : '卖出' }}价({{ pairName }})</label>
                  <div class="login-form-input">
                    <input v-model="form.price" name="price" placeholder="输入您的买入价" :class="validForm.price.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.price.show = false">
                  </div> <div class="login-from-error">
                    <div class="bg-comp-error-normal error" :class="validForm.price.show ? 'opacity-100' : 'opacity-0'">
                      {{ validForm.price.message }}
                    </div>
                  </div>
                </div>
                <div class="login-form-group global-form-group">
                  <label>{{ direction === 0 ? '买入' : '卖出' }}量({{ coinName }})</label>
                  <div class="login-form-input">
                    <input v-model="form.num" name="num" placeholder="输入您的买入量" :class="validForm.num.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.num.show = false">
                  </div> <div class="login-from-error">
                    <div class="bg-comp-error-normal error" :class="validForm.num.show ? 'opacity-100' : 'opacity-0'">
                      {{ validForm.num.message }}
                    </div>
                  </div>
                </div>
              </div>
            </van-tab>
            <van-tab title="市价">
              <div class="pt-6 h-full w-full">
                <div class="login-form-group global-form-group">
                  <label>{{ direction === 0 ? '买入' : '卖出' }}价({{ pairName }})</label>
                  <div class="login-form-input">
                    <input name="price" placeholder="输入您的买入价" type="text" class="input" disabled value="以市场最优价格">
                  </div>
                  <div class="login-from-error">
                    <div class="bg-comp-error-normal error" :class="validForm.price.show ? 'opacity-100' : 'opacity-0'">
                      {{ validForm.price.message }}
                    </div>
                  </div>
                </div>
                <div class="login-form-group global-form-group">
                  <label>{{ direction === 0 ? '买入' : '卖出' }}量({{ coinName }})</label>
                  <div class="login-form-input">
                    <input v-model="form.num" name="num" placeholder="输入您的买入量" :class="validForm.num.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.num.show = false">
                  </div> <div class="login-from-error">
                    <div class="bg-comp-error-normal error" :class="validForm.num.show ? 'opacity-100' : 'opacity-0'">
                      {{ validForm.num.message }}
                    </div>
                  </div>
                </div>
              </div>
            </van-tab>
          </van-tabs>
          <div class="absolute bottom-0 w-full">
            <van-button type="primary" block native-type="submit">
              确认
            </van-button>
          </div>
        </form>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.time-box {
  flex: none;
  text-align: center;
  position: relative;
  margin-right: 15px;
  width: 72px;
  height: 64px;
  background: #f8f8fb;
  display: flex;
  flex-flow: column;
  border-radius: 12px;
  .time-box-txt-time {
    color: #4b618c;
    font-size: 20px;
    font-weight: 600;
    padding: 5px 0;
    border-radius: 8px 8px 0 0;
    background: #eeeef5;
    flex-grow: 1;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
  }
  .time-box-txt-time-s {
    font-size: 13px;
  }
  .time-box-txt-sm {
    color: #4b618c;
    margin: 5px auto;
  }
}

.time-box.active {
  background: #72a0ff;
  color: #fff;
}

.time-box.active .time-box-txt-time {
  background: #578af7;
  color: #fff;
}

.time-box.active .time-box-txt-sm {
  color: white;
}

.time-box:last-child {
  margin-right: 0 !important;
}

.van-tabs__nav,.van-nav-bar {
  background: transparent;
}
</style>

<style lang="scss">
.login-form-group {
  margin-bottom: 12px;
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #909898;
  }
  .login-from-error {
    position: relative;
    margin-top: 16px;
    padding-top: 3px;
    font-size: 14px;
    line-height: 1.2;
    color: #f7647e;
    .error {
      position: absolute;
      top: -8px;
    }
    .bg-comp-error-normal {
      color: #f7647e;
      transition: all .35s ease;
    }
  }
  .phone-email-wrap,.login-form-input {
    position: relative;
    input.error-border {
      border-color: #f7647e;
    }
    input {
      position: relative;
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 17px 40px 16px 16px;
      height: 48px;
      font-size: 16px;
      border: 1px solid #c8cdcd;
      border-radius: 4px;
      outline: none;
      transition: all .35s ease;
    }
  }
}

.van-tabs__nav,.van-nav-bar {
  background: transparent;
}

.global-form-group {
  label {
    font-weight: 500;
    font-size: 1rem;
    line-height: 22px;
    margin-bottom: 8px;
    display: inline-block;
    color: #0d0e0e !important;
  }
  .moblie-select-coin {
    display: block;
    .coin-box {
      cursor: pointer;
      height: 48px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      color: #0d0e0e;
      border: 1px solid #c8cdcd;
      border-radius: 4px;
      padding: 0 16px;
      box-sizing: border-box;
      .coin-left {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        .coin-name {
          font-size: 14px;
          line-height: 14px;
        }
      }
    }
  }
}
</style>
