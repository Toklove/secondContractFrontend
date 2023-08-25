<script setup>
import { showFailToast, showToast } from 'vant'
import { resetPwd, resetWithPwd } from '@/api/user'
import { useUserStore } from '@/stores/user'

const onClickLeft = () => history.back()

const form = ref({
  old_password: null,
  new_password: null,
  agent_new_password: null,
})

const validForm = ref({
  old_password: {
    show: false,
    message: '请输入旧密码',
  },
  new_password: {
    show: false,
    message: '请输入新密码',
  },
  agent_new_password: {
    show: false,
    message: '请再次输入新密码',
  },
})

const userStore = useUserStore()

const submitForm = async (e) => {
  e.preventDefault()
  if (!form.value.old_password && userStore.userInfo.withdraw_pass) {
    validForm.value.old_password.show = true
    return
  }
  if (!form.value.new_password) {
    validForm.value.new_password.show = true
    return
  }
  if (!form.value.agent_new_password) {
    validForm.value.agent_new_password.show = true
    return
  }
  const { msg, code, data } = await resetWithPwd(form.value)
  if (code !== 1) {
    showFailToast(msg)
    return
  }
  showToast('修改成功')
  onClickLeft()
}
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">提现密码</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <form @submit="submitForm">
        <div v-if="userStore.userInfo.withdraw_pass" class="login-form-group global-form-group">
          <label>旧密码</label>
          <div class="login-form-input">
            <input v-model="form.old_password" name="old_password" placeholder="输入您的旧密码" :class="validForm.old_password.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.old_password.show = false">
          </div> <div class="login-from-error">
            <div class="bg-comp-error-normal error" :class="validForm.old_password.show ? 'opacity-100' : 'opacity-0'">
              {{ validForm.old_password.message }}
            </div>
          </div>
        </div>
        <div class="login-form-group global-form-group">
          <label>新密码</label>
          <div class="login-form-input">
            <input v-model="form.new_password" name="new_password" placeholder="输入您的新密码" :class="validForm.new_password.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.new_password.show = false">
          </div> <div class="login-from-error">
            <div class="bg-comp-error-normal error" :class="validForm.new_password.show ? 'opacity-100' : 'opacity-0'">
              {{ validForm.new_password.message }}
            </div>
          </div>
        </div>
        <div class="login-form-group global-form-group">
          <label>再次输入新密码</label>
          <div class="login-form-input">
            <input v-model="form.agent_new_password" name="agent_new_password" placeholder="请再次输入您的新密码" :class="validForm.agent_new_password.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.agent_new_password.show = false">
          </div> <div class="login-from-error">
            <div class="bg-comp-error-normal error" :class="validForm.agent_new_password.show ? 'opacity-100' : 'opacity-0'">
              {{ validForm.agent_new_password.message }}
            </div>
          </div>
        </div>
        <div class="form-btn-box mt-[24px]">
          <van-button block type="primary" native-type="submit">
            确认修改
          </van-button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss">
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
      border: 1px solid #c8cdcd;
      border-radius: 4px;
      outline: none;
      transition: all .35s ease;
    }
  }
}

.van-tabs__nav,.van-nav-bar {
  background: transparent;
}

.global-form-group {
  label {
    font-weight: 500;
    font-size: 1rem;
    line-height: 22px;
    margin-bottom: 8px;
    display: inline-block;
    color: #0d0e0e !important;
  }
  .moblie-select-coin {
    display: block;
    .coin-box {
      cursor: pointer;
      height: 48px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      color: #0d0e0e;
      border: 1px solid #c8cdcd;
      border-radius: 4px;
      padding: 0 16px;
      box-sizing: border-box;
      .coin-left {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        .coin-name {
          font-size: 14px;
          line-height: 14px;
        }
      }
    }
  }
}
</style>
