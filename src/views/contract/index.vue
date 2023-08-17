<script setup>
import pako from 'pako'
import { useRouter } from 'vue-router'
import { showFailToast } from 'vant'
import dayjs from 'dayjs'
import Chart from '@/components/chart/index.vue'
import { getPairConfig } from '@/api/market'
import { createContract, getContractInfo } from '@/api/contract'

const onClickLeft = () => history.back()
const wsUrl = getCurrentInstance()?.appContext.config.globalProperties.$wsUrl

const socket = new WebSocket(wsUrl)
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

const showPopup = ref(false)
const showOrderPopup = ref(false)

const form = ref({
  type: null,
  power: 0,
  amount: null,
})

const buyContact = (type) => {
  showPopup.value = true
  form.value.type = type
}

const config = ref({
  contract_time: '1,5,10,20',
  contract_power: '5~10,20~30,30~40,40~50',
  contract_amount: '10,100,1000,10000,100000',
  contract_time_min: '1,2,3,4',
  contractList: [],
  wallet: {
    amount: 0,
  },
})

const nowConfig = ref({})

const initData = async () => {
  const { code, data } = await getPairConfig(pair.value)
  const record = {}
  record.wallet = data.wallet
  const contractList = []
  record.contract_time = data.contract_time.split(',')
  record.contract_power = data.contract_power.split(',')
  record.contract_amount = data.contract_amount.split(',')
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
  config.value = record
  nowConfig.value = config.value.contractList[0]
}

onBeforeMount(async () => {
  await initData()
})

const changeContract = (index) => {
  form.value.power = index
  nowConfig.value = config.value.contractList[index]
}

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

const confirmContract = async () => {
  if (!form.value.amount) {
    showFailToast('请输入金额')
    return
  }

  if (form.value.amount < nowConfig.value.min) {
    showFailToast('小于最低下注金额')
    return
  }

  if (form.value.amount > config.value.wallet.amount) {
    showFailToast('余额不足')
    return
  }
  form.value.pair = pair.value
  const { code, data, msg } = await createContract(form.value)
  if (code !== 1) {
    showFailToast(msg)
    return
  }
  data.need_count = data.endtime - dayjs().unix()
  const main_sec = data.time * 60

  data.timer = setInterval(async () => {
    if (data.need_count === 0) {
      clearInterval(data.timer)
      await getData()
      return
    }
    data.need_count--
    data.progress = parseInt(data.need_count / (main_sec / 100))
  }, 1e3)

  contractInfo.value = data
  initData()
  showOrderPopup.value = true
}

const formatProgress = (e) => {
  return `${contractInfo.value.need_count}s`
}

const continueOrder = async () => {
  // await initData()
  showOrderPopup.value = false
  // contractInfo.value = null
}

onUnmounted(() => {
  socket.close()
  clearInterval(contractInfo.value.timer)
})
</script>

<template>
  <div class="">
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">{{ coinName }}/{{ pairName }} 极速合约</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
      <template #right>
        <van-icon name="orders-o" color="#121935" @click="router.push({ name: 'contractLog' })" />
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
      <van-button color="#5FB385" block @click="buyContact(0)">
        买涨
      </van-button>
      <van-button color="#E35553" block @click="buyContact(1)">
        买跌
      </van-button>
    </div>
    <van-popup v-model:show="showPopup" round :style="{ padding: '16px 24px', width: '90%', top: '40%' }" closeable>
      <div class="flex flex-col">
        <h1 class="text-center text-[#666]">
          订单确认
        </h1>
        <hr class="my-3 block">
        <div class="flex bg-[#f8f8fb] flex-col text-[13px] mb-3 p-3 rounded overflow-hidden">
          <div class="flex justify-between items-center">
            <span class="text-[#8d9dbc]">名称</span>
            <span>{{ coinName }} <span class="text-[#777] text-[11px]">/{{ pairName }}</span></span>
          </div>
          <div class="flex justify-between items-center my-2">
            <span class="text-[#8d9dbc]">方向</span>
            <span v-if="form.type === 0" class="green">买涨</span>
            <span v-if="form.type === 1" class="red">买跌</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#8d9dbc]">现价</span>
            <span>{{ nowData.lastPrice.toFixed(2) }}</span>
          </div>
        </div>
        <div class="flex flex-col mb-3 text-[13px]">
          <h3 class="mb-[5px] text-[#888]">
            选择到期时间(左滑动收益更高)
          </h3>
          <div class="w-full overflow-hidden">
            <div class="flex flex-row items-center overflow-scroll py-3">
              <div v-for="(item, index) in config.contractList" :key="index" class="time-box" :class="form.power === index ? 'active' : ''" @click="changeContract(index)">
                <div class="time-box-txt-time">
                  <span>{{ item.sec }}</span>
                  <span class="time-box-txt-time-s">秒</span>
                </div>
                <div class="time-box-txt-sm">
                  {{ item.power }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col mb-3">
          <h3 class="text-[13px] text-[#888] mb-3">
            买入数量
          </h3>
          <div class="border-[#eeeef5] border rounded overflow-hidden">
            <van-field v-model="form.amount" :placeholder="`最少${nowConfig.min}起买`" />
          </div>
        </div>
        <div class="flex flex-row justify-between items-center text-[11px]">
          <span>
            <span>可用余额:</span> <span>{{ config.wallet.amount }}</span>
          </span>
          <span>
            <span>手续费:</span> <span>0%</span>
          </span>
        </div>
        <div class="my-4 mx-6">
          <van-button color="#588bf7" block round @click="confirmContract">
            确认下单
          </van-button>
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="showOrderPopup" round :style="{ padding: '16px 24px', width: '80%', top: '40%' }" closeable>
      <div class="flex flex-col">
        <h1 class="text-center text-[#666]">
          {{ contractInfo.coinname }}
        </h1>
        <hr class="my-3 block">
        <div class="flex items-center justify-center">
          <el-progress v-if="contractInfo.status == 0" type="dashboard" :percentage="contractInfo.progress" :duration="1" :striped-flow="true" :striped="true" :format="formatProgress" />
          <div v-else class="text-[26px] my-3 font-bold" :class="contractInfo.is_win == 0 ? 'red' : 'green'">
            {{ contractInfo.is_win == 0 ? '-' : '+' }}{{ contractInfo.ploss }}&nbsp;USD
          </div>
        </div>
        <div class="flex bg-[#f8f8fb] flex-col text-[13px] mt-3 p-3 rounded overflow-hidden">
          <div class="flex justify-between items-center">
            <span class="text-[#8d9dbc]">现价</span>
            <span>{{ contractInfo.status == 0 ? nowData.lastPrice.toFixed(2) : contractInfo.sell_price }}</span>
          </div>
          <div class="flex justify-between items-center my-2">
            <span class="text-[#8d9dbc]">方向</span>
            <span v-if="form.type === 0" class="green">买涨</span>
            <span v-if="form.type === 1" class="red">买跌</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#8d9dbc]">数量</span>
            <span>{{ contractInfo.amount }}</span>
          </div>
          <div class="flex justify-between items-center my-2">
            <span class="text-[#8d9dbc]">执行价</span>
            <span>{{ contractInfo.buy_price }}</span>
          </div>
          <div v-if="contractInfo.status == 0" class="flex justify-between items-center green">
            <span>预期收益</span>
            <span>{{ (contractInfo.amount * contractInfo.power_list[1] / 100).toFixed(2) }}</span>
          </div>
        </div>
        <div class="my-4 mx-6">
          <van-button color="#588bf7" block round @click="continueOrder">
            继续下单
          </van-button>
        </div>
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

