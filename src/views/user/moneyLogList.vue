<script setup>
import dayjs from 'dayjs'
import { showFailToast } from 'vant'
import { contractList } from '@/api/contract'
import { cancelExchange, exchangeList } from '@/api/exchange'
import { getMoneyLogList } from '@/api/user'

const onClickLeft = () => history.back()

const active = ref(0)

const historyList = ref([])
const loading = ref(false)
const getData = async () => {
  loading.value = true
  const { code, data } = await getMoneyLogList()
  historyList.value = data
  loading.value = false
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
        <span class="text-[#121935]">我的账单</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <van-tabs v-model:active="active" shrink>
      <van-tab title="历史账单">
        <div v-loading="loading" class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
          <van-empty v-if="historyList.length === 0" description="暂无数据" />
          <div v-else class="flex flex-col order-list">
            <div v-for="item in historyList" :key="item" class="flex flex-col mb-4 order-item">
              <div class="flex flex-row items-center justify-between">
                <div class="flex flex-row items-center">
                  <div class="py-1 px-2 rounded text-[14px] mr-1" :class="item.money > 0 ? 'bgreen' : 'bred'">
                    {{ item.memo }}
                  </div>
                  <span class="text-[#343743]">{{ item.coin.title }}</span>
                </div>
              </div>
              <div class="text-[10px] mt-1 mb-3">
                <span class="text-[#888B91]">{{ item.createtime_text }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">变动金额</span>

                <span class="text-[#282B38]">{{ item.money }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">变动前</span>

                <span class="text-[#282B38]">{{ item.before }}</span>
              </div>
              <div class="flex flex-row items-center justify-between text-[10px] mb-2">
                <span class="text-[#888B91]">变动后</span>

                <span class="text-[#282B38]">{{ item.after }}</span>
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
