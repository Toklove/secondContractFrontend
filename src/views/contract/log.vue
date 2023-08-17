<script setup>
import dayjs from 'dayjs'
import { contractList } from '@/api/contract'

const onClickLeft = () => history.back()

const active = ref(0)

const historyList = ref([])
const loading = ref(false)
const getData = async () => {
  loading.value = true
  const { code, data } = await contractList(active.value)
  console.log(data)
  historyList.value = data
  if (active.value === 0) {
    historyList.value.forEach((item) => {
      item.need_count = item.endtime - dayjs().unix()
      const main_sec = item.time * 60
      item.progress = parseInt(item.need_count / (main_sec / 100))
      item.timer = setInterval(async () => {
        if (item.need_count === 0) {
          clearInterval(item.timer)
          setTimeout(async () => {
            await getData()
          }, 3000)
          return
        }
        item.need_count--
        item.progress = parseInt(item.need_count / (main_sec / 100))
      }, 1e3)
    })
    console.log(historyList.value)
  }
  loading.value = false
}

const changeActive = () => {
  historyList.value = []
  getData()
}

onBeforeMount(async () => {
  await getData()
})
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">合约订单</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <van-tabs v-model:active="active" shrink @change="changeActive">
      <van-tab title="当前委托">
        <div v-loading="loading" class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
          <van-empty v-if="historyList.length === 0" description="暂无数据" />
          <div v-else class="flex flex-col order-list">
            <div v-for="item in historyList" :key="item" class="flex flex-col mb-4 order-item">
              <div class="flex flex-row items-center">
                <div class="bgreen py-1 px-2 rounded text-[14px] mr-1">
                  买{{ item.direction_text }}
                </div>
                <span class="text-[#343743]">{{ item.coinname }}</span>
              </div>
              <div class="text-[10px] mt-1 mb-3">
                <span class="text-[#888B91]">{{ item.createtime_text }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">委托价格</span>

                <span class="text-[#282B38]">{{ item.buy_price }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">成交价格</span>

                <span class="text-[#282B38]">--</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-4">
                <span class="text-[#888B91]">结算时间</span>

                <span class="text-[#282B38]">{{ item.endtime_text }}</span>
              </div>
              <div class="flex flex-col bg-[#F8F8FA] rounded px-[12px] py-[14px] mb-4">
                <div class="flex flex-row justify-between text-[14px] mb-2">
                  <span class="text-[#909398]">剩余时间</span>
                  <span class="text-[#282B38]">{{ item.need_count }}s</span>
                </div>
                <van-progress :percentage="item.progress" :show-pivot="false" />
              </div>
              <hr class="text-[#F7F8F9]">
            </div>
          </div>
        </div>
      </van-tab>
      <van-tab title="历史委托">
        <div v-loading="loading" class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
          <van-empty v-if="historyList.length === 0" description="暂无数据" />
          <div v-else class="flex flex-col order-list">
            <div v-for="item in historyList" :key="item.id" class="flex flex-col mb-4 order-item">
              <div class="flex flex-row items-center">
                <div class="py-1 px-2 rounded text-[14px] mr-1" :class="item.direction == 0 ? 'bgreen' : 'bred'">
                  买{{ item.direction_text }}
                </div>
                <span class="text-[#343743]">{{ item.coinname }}</span>
              </div>
              <div class="text-[10px] mt-1 mb-3">
                <span class="text-[#888B91]">{{ item.createtime_text }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">盈亏</span>

                <span class="text-[#282B38]" :class="item.is_win == 0 ? 'red' : 'green'">{{ item.is_win_text }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">盈利金额</span>

                <span class="text-[#282B38]" :class="item.is_win == 0 ? 'red' : 'green'">{{ item.is_win == 0 ? '-' : '+' }}{{ item.ploss }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">委托价格</span>

                <span class="text-[#282B38]">{{ item.buy_price }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">成交价格</span>

                <span class="text-[#282B38]">{{ item.sell_price }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-4">
                <span class="text-[#888B91]">成交时间</span>

                <span class="text-[#282B38]">{{ item.endtime_text }}</span>
              </div>
              <hr class="text-[#F7F8F9]">
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<style lang="scss">
.van-tabs__nav,.van-nav-bar {
  background: transparent;
}
.order-item:last-child {
  hr {
    opacity: 0;
  }
}
</style>
