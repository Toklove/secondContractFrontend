<script setup>
import { showFailToast, showToast } from 'vant'
import backImg from '@/assets/img/3Z.png'
import frontImg from '@/assets/img/6S.png'
import handImg from '@/assets/img/hand.png'
import upLoaderImg from '@/utils/upLoaderImg'
import { verifyIdAdvanced } from '@/api/user'
import { useUserStore } from '@/stores/user'
const onClickLeft = () => history.back()

const form = ref({
  front: frontImg,
  back: backImg,
  hand: handImg,
})

const uploadFront = async (e) => {
  const { url } = await upLoaderImg(e.file)
  form.value.front = url
}

const uploadBack = async (e) => {
  const { url } = await upLoaderImg(e.file)
  form.value.back = url
}

const uploadHand = async (e) => {
  const { url } = await upLoaderImg(e.file)
  form.value.hand = url
}

const submitForm = async (e) => {
  e.preventDefault()
  if (!form.value.front === frontImg || !form.value.back === backImg || !form.value.hand === handImg) {
    showFailToast('请上传完整照片')
    return
  }

  const { msg, code, data } = await verifyIdAdvanced(form.value)
  if (code !== 1) {
    showFailToast(msg)
    return
  }
  showToast('提交成功')
  setTimeout(() => {
    history.back()
  })
}

const userStore = useUserStore()

onBeforeMount(() => {
  if (userStore.userInfo.id_front) {
    const { id_front, id_back, id_hand } = userStore.userInfo
    form.value.front = id_front
    form.value.back = id_back
    form.value.hand = id_hand
  }
})
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">高级认证</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <van-button v-if="userStore.userInfo.advanced_verify_status === '3'" type="primary" disabled block>
        已通过验证
      </van-button>
      <form v-else @submit="submitForm">
        <van-space direction="vertical" fill>
          <div class="w-[60%] mx-auto">
            <van-uploader :max-count="1" reupload :after-read="uploadFront">
              <img :src="form.front" alt="">
            </van-uploader>
          </div>
          <div class="w-[60%] mx-auto">
            <van-uploader :max-count="1" reupload :after-read="uploadBack">
              <img :src="form.back" alt="">
            </van-uploader>
          </div>

          <div class="w-[60%] mx-auto">
            <van-uploader :max-count="1" reupload :after-read="uploadHand">
              <img :src="form.hand" alt="">
            </van-uploader>
          </div>
          <div class="mt-6">
            <van-button block native-type="submit" type="primary">
              提交
            </van-button>
          </div>
        </van-space>
      </form>
    </div>
  </div>
</template>

<style lang="scss">
.van-tabs__nav,.van-nav-bar {
  background: transparent;
}
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
      border: 1px solid #9aa3a3;
      border-radius: 4px;
      outline: none;
      transition: all .35s ease;
    }
  }
}
</style>
