<script setup>
import { showFailToast, showToast } from 'vant'
import router from '@/router'
import { login } from '@/api/user'
import { useUserStore } from '@/stores/user'

const form = ref({
  account: null,
  password: null,
  // code: null,
})

const validForm = ref({
  account: {
    show: false,
    message: '请输入您的邮箱 / 手机号',
  },
  password: {
    show: false,
    message: '请输入您的密码',
  },
})
const route = useRoute()
const userStore = useUserStore()
const redirect = route.query.redirect ? route.query.redirect : '/'

const submitForm = async (e) => {
  e.preventDefault()
  if (!form.value.account) {
    validForm.value.account.show = true
    return
  }
  if (!form.value.password) {
    validForm.value.password.show = true
    return
  }
  // if (!form.value.code) {
  //   showFailToast('请完成滑块验证')
  //   return
  // }
  const { data, code, msg } = await login(form.value)
  if (code === 1)
  {
    const LOGIN_SUCCESS_MESSAGE = '登录成功'
    userStore.userInfo = data.userinfo
    localStorage.setItem('TOKEN', data.userinfo.token)
    localStorage.setItem('IS_LOGIN', '1')
    showToast(LOGIN_SUCCESS_MESSAGE)

    setTimeout(async () => {
      await router.push(redirect)
    }, 300)
  }
  else {
    showFailToast(msg)
  }
}

// function successCaptcha(e) {
//   form.value.code = e.code
// }
</script>

<template>
  <div class="bg-white w-full min-h-screen">
    <div class="main-box lay-box clearfix">
      <div class="light">
        <div class="main-login-wrapper">
          <div class="main-login">
            <div class="container main-box-container main-box-container-login">
              <div class="login-wrap">
                <div class="login-qr-box">
                  <div class="clearfix login-title-box">
                    <div class="login-qr-title">
                      欢迎回来👏
                    </div>
                    <div class="type-tab">
                      <span class="active">
                        邮箱 / 手机号
                      </span>
                    </div>
                  </div> <div>
                    <form class="login-qr-form" @submit="submitForm">
                      <div class="login-form-group">
                        <div>
                          <div class="phone-email-wrap">
                            <input v-model="form.account" type="text" autocomplete="off" name="account" :class="validForm.account.show ? 'error-border' : ''" placeholder="输入您的邮箱 / 手机号" class="input" @focus="validForm.account.show = false">
                          </div>
                        </div>
                        <label for="username" class="for-border" />
                        <div class="login-from-error">
                          <div class="bg-comp-error-normal error" :class="validForm.account.show ? 'opacity-100' : 'opacity-0'">
                            {{ validForm.account.message }}
                          </div>
                        </div>
                      </div>
                      <div class="login-form-group">
                        <div class="login-form-input">
                          <input v-model="form.password" autocomplete="new-password" name="password" placeholder="输入您的密码" :class="validForm.password.show ? 'error-border' : ''" type="password" class="input" @focus="validForm.password.show = false">
                        </div> <div class="login-from-error">
                          <div class="bg-comp-error-normal error" :class="validForm.password.show ? 'opacity-100' : 'opacity-0'">
                            {{ validForm.password.message }}
                          </div>
                        </div>
                      </div>
                      <div>
<!--                        <mi-captcha ref="captcha" theme-color="#3a98fa" modal-bg-color="#3a98fa" width="100%" init-action="/api/captcha/init" verify-action="/api/captcha/verify" @success="successCaptcha" />-->
                      </div>
                      <div class="form-btn-box">
                        <div class="mt-24px">
                          <van-button block type="primary" native-type="submit">
                            登录
                          </van-button>
                        </div>
                      </div>
                    </form>
                    <div class="forget-line">
                      <a>
                        忘记密码?
                      </a>
                    </div>
                  </div> <div class="go-reg">
                    <span class="mr-3">
                      还没有账号?
                    </span> <a @click="router.push({ path: '/register' })">注册</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url(auth.scss);
</style>
