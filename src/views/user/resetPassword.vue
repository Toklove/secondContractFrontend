<script setup>
import { useUserStore } from '@/stores/user'
const onClickLeft = () => history.back()

const userStore = useUserStore()
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">密码设置</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <div>
        <van-button type="primary" block class="mb-4" @click="$router.push({ name: 'resetLoginPass' })">
          登录密码
        </van-button>
        <van-button type="primary" block @click="$router.push({ name: 'resetWithdrawPass' })">
          提现密码
        </van-button>
      </div>
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
