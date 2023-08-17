<script setup>
import { init } from 'klinecharts'
import pako from 'pako'

const props = defineProps({
  symbol: {
    type: String,
    default: 'btcusdt',
  },
})

const chartContainer = ref()
const SYMBOL = ref(props.symbol)
const wsUrl = getCurrentInstance()?.appContext.config.globalProperties.$wsUrl

const socket = new WebSocket(wsUrl)
const Interval = ref('m1')
const chart = ref()
const paneId = ref()
const loading = ref(false)
onUnmounted(() => {
  socket.close()
})
const handlerData = (msg) => {
  const data = JSON.parse(msg)
  if (data.ping) {
    socket.send(JSON.stringify({ pong: data.ping }))
  } else if (data.data) {
    const dataList = data.data.map(({ id, open, close, high, low, vol }) => ({
      timestamp: id * 1000,
      open,
      close,
      high,
      low,
      volume: vol,
    }))
    chart.value.applyNewData(dataList)
    loading.value = false
  } else if (data.tick) {
    const { id, open, close, high, low, vol } = data.tick
    const candle = { timestamp: id * 1000, open, close, high, low, volume: vol }
    chart.value.updateData(candle)
  } else if (data.unsubbed) {
    subscribeData()
  }
}

const TIME_UNIT_MAP = {
  m: 'min',
  h: 'hour',
  d: 'day',
  w: 'week',
  M: 'mon',
}

const formatPeriod = (str) => {
  const [, unit, number] = str.match(/([A-z]+)([0-9]+)/)
  return number + TIME_UNIT_MAP[unit]
}

const createHistoryKRequest = (interval) => {
  const [, unit, number] = interval.match(/([A-z]+)([0-9]+)/)
  let shijian = number
  if (unit === 'h')
    shijian *= 60
  else if (unit === 'd')
    shijian *= 60 * 24
  else if (unit === 'w')
    shijian *= 60 * 24 * 3.5

  const from = Math.trunc(Date.now() / 1000) - 60 * 900 * shijian

  return {
    req: `market.${SYMBOL.value}.kline.${formatPeriod(interval)}`,
    id: SYMBOL.value,
    from,
    to: Math.trunc(Date.now() / 1000),
  }
}

const createSubKRequest = interval => ({
  sub: `market.${SYMBOL.value}.kline.${formatPeriod(interval)}`,
  id: SYMBOL.value,
})

const createUnsubKRequest = interval => ({
  unsub: `market.${SYMBOL.value}.kline.${formatPeriod(interval)}`,
  id: SYMBOL.value,
})

const subscribeData = () => {
  socket.send(JSON.stringify(createHistoryKRequest(Interval.value)))
  socket.send(JSON.stringify(createSubKRequest(Interval.value)))
}

socket.onopen = () => {
  subscribeData()
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

const setMainIndicator = (name) => {
  chart.value.createIndicator(name, false, { id: 'candle_pane' })
}

const setSubIndicator = (name) => {
  chart.value.createIndicator(name, false, { id: paneId.value })
}

const initChart = () => {
  loading.value = true
  chart.value = init(chartContainer.value)
  paneId.value = chart.value.createIndicator('VOL')

  setMainIndicator('MA')
  setSubIndicator('VOL')
}

onMounted(() => {
  initChart()
})

const activeNav = ref(0)

const timeList = reactive([
  {
    name: '1M',
    value: 'm1',
  }, {
    name: '5M',
    value: 'm5',
  }, {
    name: '15M',
    value: 'm15',
  }, {
    name: '30M',
    value: 'm30',
  }, {
    name: '60M',
    value: 'm60',
  }, {
    name: '4H',
    value: 'h4',
  }, {
    name: '1D',
    value: 'd1',
  },
])

const changeInterval = (val) => {
  socket.send(JSON.stringify(createUnsubKRequest(Interval.value)))
  loading.value = true
  const { name: index } = val
  Interval.value = timeList[index].value
}
</script>

<template>
  <div class="bg-white">
    <van-tabs v-model:active="activeNav" @click-tab="changeInterval">
      <van-tab v-for="item in timeList" :key="item.value" :title="item.name" />
    </van-tabs>
    <div class="w-full h-[500px] relative">
      <div v-if="loading" class="absolute w-full h-full top-0 left-0 bg-white z-100 flex items-center justify-center">
        <van-loading size="24px" vertical>
          加载中...
        </van-loading>
      </div>
      <div ref="chartContainer" class="w-full h-full" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>

