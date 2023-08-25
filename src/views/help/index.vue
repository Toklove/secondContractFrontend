<script setup>
import { getHelp } from '@/api'

const onClickLeft = () => history.back()
const activeNames = ref(['1'])
const router = useRouter()
const list = ref([])
onBeforeMount(async () => {
  const { data } = await getHelp()
  console.log(data)
  list.value = data
})
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">帮助中心</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <div class="shadow rounded overflow-hidden">
        <van-collapse v-model="activeNames">
          <van-collapse-item v-for="(item, index) in list" :key="index" :title="item.question" :name="index">
            <div v-html="item.answer" />
          </van-collapse-item>
        </van-collapse>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
