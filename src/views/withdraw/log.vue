<script setup>
import dayjs from 'dayjs'
import { contractList } from '@/api/contract'
import { getWithdrawLog } from '@/api/withdraw'

const onClickLeft = () => history.back()

const active = ref(1)

const historyList = ref([])
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const listQuery = ref({
  page: 1,
})
const getData = async () => {
  if (loading.value)
    return
  loading.value = true
  const result = await getWithdrawLog(listQuery.value.page)
  const { data, current_page, last_page } = result.data
  if (current_page === 1)
  { historyList.value = data }
  else
  { data.forEach((item) => {
    historyList.value.push(item)
  }) }

  loading.value = false
  if (last_page > current_page)
    listQuery.value.page++
  else if (last_page === current_page)
    finished.value = true
}

const onLoad = async () => {
  await getData()
}

const onRefresh = () => {
  finished.value = false
  setTimeout(() => {
    listQuery.value.page = 1
    getData()
    refreshing.value = false
  }, 1000)
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
        <span class="text-[#121935]">提币记录</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div v-loading="loading" class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <van-empty v-if="historyList.length === 0" description="暂无数据" />
      <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model="loading"
          class="flex flex-col order-list mb-[40px]"
          :finished="finished"
          :offset="10"
          :immediate-check="false"
          finish-text="没有更多了"
          @load="onLoad"
        >
          <div v-for="item in historyList" :key="item.id" class="flex flex-col mb-4 order-item">
            <div class="flex flex-row items-center">
              <div class="py-1 px-2 rounded text-[14px] mr-1" :class="item.status === '2' ? 'bred' : 'bgreen'">
                {{ item.status_text }}
              </div>
              <span class="text-[#343743]">{{ item.coin.title }}</span>
            </div>
            <div class="text-[10px] mt-1 mb-3">
              <span class="text-[#888B91]">{{ item.createtime_text }}</span>
            </div>
            <div v-if="item.status === '2'" class="flex flex-row items-center justify-between text-[10px] mb-2">
              <span class="text-[#888B91] red">驳回理由</span>
              <span class="text-[#282B38] red">{{ item.remark }}</span>
            </div>
            <div class="flex flex-row items-center justify-between text-[10px] mb-2">
              <span class="text-[#888B91] green">金额</span>
              <span class="text-[#282B38] green">{{ item.amount }}</span>
            </div>
            <div v-if="item.coin.name === 'cny'" class="flex flex-row items-center justify-between text-[10px] mb-2">
              <span class="text-[#888B91]">申请姓名</span>
              <span class="text-[#282B38]">{{ item.name }}</span>
            </div>
            <div v-if="item.coin.name === 'cny'" class="flex flex-row items-center justify-between text-[10px] mb-2">
              <span class="text-[#888B91]">开户行</span>
              <span class="text-[#282B38]">{{ item.address }}</span>
            </div>
            <div class="flex flex-row items-center justify-between text-[10px] mb-4">
              <span class="text-[#888B91]">地址(卡号)</span>
              <span class="text-[#282B38]">{{ item.number }}</span>
            </div>
            <hr class="text-[#F7F8F9]">
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
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
