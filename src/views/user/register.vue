<script setup>
import { showFailToast, showToast } from 'vant'
import router from '@/router'
import {register} from '@/api/user'
import { useUserStore } from '@/stores/user'

const form = ref({
  username: null,
  password: null,
  agent_password: null,
  // code: null,
  invite_code: null,
})

const validForm = ref({
  username: {
    show: false,
    message: '请输入您的邮箱 / 手机号',
  },
  password: {
    show: false,
    message: '请输入您的密码',
  },
  agent_password: {
    show: false,
    message: '请再次输入您的密码',
  },
  invite_code: {
    show: false,
    message: '请输入邀请码',
  },
})
const route = useRoute()
const userStore = useUserStore()
const redirect = route.query.redirect ? route.query.redirect : '/'

const validFormFunc = () => {
  if (!form.value.username) {
    validForm.value.username.show = true
    return false
  }
  if (!form.value.password) {
    validForm.value.password.show = true
    return false
  }
  if (!form.value.agent_password) {
    validForm.value.agent_password.message = '请再次输入您的密码'
    validForm.value.agent_password.show = true
    return false
  }
  if (form.value.password !== form.value.agent_password) {
    validForm.value.agent_password.message = '两次密码不一致'
    validForm.value.agent_password.show = true
    return false
  }
  if (!form.value.invite_code) {
    validForm.value.invite_code.show = true
    return false
  }
  // if (!form.value.code) {
  //   showFailToast('请完成滑块验证')
  //   return false
  // }
  return true
}

const submitForm = async (e) => {
  e.preventDefault()
  if (!validFormFunc())
    return

  const { data, code, msg } = await register(form.value)
  if (code === 1)
  {
    const LOGIN_SUCCESS_MESSAGE = '注册成功'
    userStore.userInfo = data.userinfo
    localStorage.setItem('TOKEN', data.userinfo.token)
    localStorage.setItem('IS_LOGIN', '1')
    showToast(LOGIN_SUCCESS_MESSAGE)
    const loginIp = userStore.userInfo.loginip
    _MEIQIA('metadata', {
      name: userStore.userInfo.username,
    })
    await fetch(`/json/${loginIp}?lang=zh-CN`).then(r => r.json()).then((res) => {
      if (res.status === 'success') {
        _MEIQIA('metadata', {
          name: userStore.userInfo.username,
          address: `${res.country} ${res.city}`,
        })
      }
    })
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
                      欢迎加入👏
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
                            <input v-model="form.username" :class="validForm.username.show ? 'error-border' : ''" type="text" autocomplete="off" name="username" placeholder="输入您的邮箱 / 手机号" class="input" @focus="validForm.username.show = false">
                          </div>
                        </div>
                        <label for="username" class="for-border" />
                        <div class="login-from-error">
                          <div class="bg-comp-error-normal error" :class="validForm.username.show ? 'opacity-100' : 'opacity-0'">
                            {{ validForm.username.message }}
                          </div>
                        </div>
                      </div>
                      <div class="login-form-group">
                        <div class="login-form-input">
                          <input v-model="form.password" autocomplete="new-password" name="password" :class="validForm.password.show ? 'error-border' : ''" placeholder="输入您的密码" type="password" class="input" @focus="validForm.password.show = false">
                        </div> <div class="login-from-error">
                          <div class="bg-comp-error-normal error" :class="validForm.password.show ? 'opacity-100' : 'opacity-0'">
                            {{ validForm.password.message }}
                          </div>
                        </div>
                      </div>
                      <div class="login-form-group">
                        <div class="login-form-input">
                          <input v-model="form.agent_password" autocomplete="new-password" name="agent_password" :class="validForm.agent_password.show ? 'error-border' : ''" placeholder="再次输入您的密码" type="password" class="input" @focus="validForm.agent_password.show = false">
                        </div> <div class="login-from-error">
                          <div class="bg-comp-error-normal error" :class="validForm.agent_password.show ? 'opacity-100' : 'opacity-0'">
                            {{ validForm.agent_password.message }}
                          </div>
                        </div>
                      </div>
                      <div class="login-form-group">
                        <div class="login-form-input">
                          <input v-model="form.invite_code" name="dnEmail" placeholder="输入您的邀请码" :class="validForm.invite_code.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.invite_code.show = false">
                        </div> <div class="login-from-error">
                          <div class="bg-comp-error-normal error" :class="validForm.invite_code.show ? 'opacity-100' : 'opacity-0'">
                            {{ validForm.invite_code.message }}
                          </div>
                        </div>
                      </div>
                      <div>
<!--                        <mi-captcha ref="captcha" theme-color="#3a98fa" modal-bg-color="#3a98fa" width="100%" init-action="/api/captcha/init" verify-action="/api/captcha/verify" @success="successCaptcha" />-->
                      </div>
                      <div class="form-btn-box">
                        <div class="mt-24px">
                          <van-button block native-type="submit" type="primary">
                            创建账户
                          </van-button>
                        </div>
                      </div>
                    </form>
                  </div> <div class="go-reg">
                    <span class="mr-3">
                      已经有账号了?
                    </span> <a @click="router.push({ path: '/login' })">登录</a>
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
