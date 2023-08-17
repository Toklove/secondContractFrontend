<script setup>
import { showFailToast, showToast } from 'vant'
import { login } from '@/api/user'
import router from '@/router'
import { getCoinList, postExchange } from '@/api/convert'
import { getWithdrawInfoList, getWithdrawList } from '@/api/withdraw'

const onClickLeft = () => history.back()

const list = reactive([])

onBeforeMount(async () => {
  const { data, code } = await getWithdrawList()
  data.forEach((item) => {
    list.push(item)
  })
})
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">提币地址</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
      <template #right>
        <van-icon name="plus" color="#121935" @click="router.push({ name: 'addWithdraw' })" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <div v-for="item in list" :key="item.id" class="bg-[#F6F7F9] rounded p-[10px] mb-4">
        <div class="px-[15px] flex flex-col">
          <span class="font-bold border-b pb-[6px] mb-[6px]">
            {{ item.coin.title }}
          </span>
          <span v-if="item.coin.name === 'cny'" class="text-[#282B38] mb-1">
            {{ item.name }}
          </span>
          <span class="text-[#282B38] mb-1">
            {{ item.number }}
          </span>
          <span v-if="item.coin.name === 'cny'" class="text-[#282B38] mb-1">
            {{ item.address }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.van-tabs__nav,.van-nav-bar {
  background: transparent;
}
</style>
