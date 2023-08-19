<script setup>
import { showFailToast, showToast } from 'vant'
import backImg from '@/assets/img/3Z.png'
import frontImg from '@/assets/img/6S.png'
import upLoaderImg from '@/utils/upLoaderImg'
import { verifyIdPrimary } from '@/api/user'
import { useUserStore } from '@/stores/user'
const onClickLeft = () => history.back()

const form = ref({
  name: null,
  idnum: null,
  front: frontImg,
  back: backImg,
})

const validForm = ref({
  name: {
    show: false,
    message: '请输入姓名',
  },
  idnum: {
    show: false,
    message: '请输入身份证号',
  },
})

const uploadFront = async (e) => {
  const { url } = await upLoaderImg(e.file)
  form.value.front = url
}

const uploadBack = async (e) => {
  const { url } = await upLoaderImg(e.file)
  form.value.back = url
}

const submitForm = async (e) => {
  e.preventDefault()
  if (!form.value.name) {
    validForm.value.name.show = true
    return
  }
  if (!form.value.idnum) {
    validForm.value.idnum.show = true
    return
  }

  const { msg, code, data } = await verifyIdPrimary(form.value)
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
  if (userStore.userInfo.idnum) {
    const { idnum, name } = userStore.userInfo
    form.value.idnum = idnum
    form.value.name = name
  }
})
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">初级认证</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <van-button v-if="userStore.userInfo.primary_verify_status === '3'" type="primary" disabled block>
        已通过验证
      </van-button>
      <form v-else @submit="submitForm">
        <van-space direction="vertical" fill>
          <div class="login-form-group">
            <div class="login-form-input">
              <input v-model="form.name" name="count" placeholder="输入您的姓名" :class="validForm.name.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.name.show = false">
            </div> <div class="login-from-error">
              <div class="bg-comp-error-normal error" :class="validForm.name.show ? 'opacity-100' : 'opacity-0'">
                {{ validForm.name.message }}
              </div>
            </div>
          </div>
          <div class="login-form-group">
            <div class="login-form-input">
              <input v-model="form.idnum" name="count" placeholder="输入您的身份证号" :class="validForm.idnum.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.idnum.show = false">
            </div> <div class="login-from-error">
              <div class="bg-comp-error-normal error" :class="validForm.idnum.show ? 'opacity-100' : 'opacity-0'">
                {{ validForm.idnum.message }}
              </div>
            </div>
          </div>
          <div>
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
