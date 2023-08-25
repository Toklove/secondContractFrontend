<script setup lang="ts">
import { other } from '@/api'

const onClickLeft = () => history.back()

const html = ref(null)

const router = useRouter()
const type = ref(router.currentRoute.value.query.type)
console.log(type.value)
onBeforeMount(async () => {
  const { data } = await other(type.value)
  console.log(data)
  html.value = data
})
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">信息</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <div v-html="html" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
