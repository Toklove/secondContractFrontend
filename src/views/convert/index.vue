<script setup lang="ts">
import { showFailToast, showToast } from 'vant'
import { watch } from 'vue'
import { getCoinList, postExchange } from '@/api/convert'
import router from '@/router'

const onClickLeft = () => history.back()
const showPicker = ref(false)
const selectIndex = ref(null)

const form = ref({
  count: null,
  // code: null,
  from: 'usdt',
  to: 'cny',
})

const balance = ref({
  from: 0,
  to: 0,
})

const validForm = ref({
  count: {
    show: false,
    message: '请输入兑换数量',
  },
})

const submitForm = async (e) => {
  e.preventDefault()
  if (!form.value.count) {
    validForm.value.count.show = true
    return
  }
  // if (!form.value.code) {
  //   showFailToast('请完成滑块验证')
  //   return
  // }
  // if (balance.value.from < form.value.count) {
  //   showFailToast('余额不足以兑换')
  //   return
  // }
  const { msg, code, data } = await postExchange(form.value)
  if (code !== 1) {
    showFailToast(msg)
    return
  }
  showToast('兑换成功')
  balance.value = data
  router.push({ name: 'wallet' })
}

// function successCaptcha(e) {
//   form.value.code = e.code
// }

const coinList = reactive([])

const fromCoin = ref({
  text: 'USDT',
  value: 'usdt',
  amount: 0,
  convert: 1,
})
const toCoin = ref({
  text: 'USDT',
  value: 'usdt',
  amount: 0,
  convert: 1,
})

onBeforeMount(async () => {
  const { data } = await getCoinList()
  data.forEach((item) => {
    const record = {
      text: item.title,
      value: item.name,
      amount: item.wallet.amount,
      convert: item.convert,
    }
    if (item.name === 'usdt') {
      fromCoin.value = record
      balance.value.from = record.amount
    } else if (item.name === 'cny') {
      toCoin.value = record
      balance.value.to = record.amount
    }

    coinList.push(record)
  })
})

watch(form.value, (value) => {
  coinList.forEach((item) => {
    if (item.name === value.from)
      fromCoin.value = item
    else if (item.name === value.to)
      toCoin.value = item
  })
})

const convertAmount = computed(() => {
  const usd = form.value.count * fromCoin.value.convert
  return (usd / toCoin.value.convert).toFixed(4)
})

const allIn = () => {
  form.value.count = balance.value.from
}

const selectFunc = (index) => {
  selectIndex.value = index
  showPicker.value = true
}

const confirmPicker = (e) => {
  const selectData = e.selectedOptions[0]
  if (selectIndex.value === 0) {
    form.value.from = selectData.value
    balance.value.from = selectData.amount
  } else if (selectIndex.value === 1) {
    if (form.value.from === selectData.value) {
      showFailToast('兑换币种不能相同')
      return false
    }
    form.value.to = selectData.value
    balance.value.to = selectData.amount
  }
  showPicker.value = false
}

const changeConvert = () => {
  [form.value.from, balance.value.from, form.value.to, balance.value.to] = [form.value.to, balance.value.to, form.value.from, balance.value.from]
  const temp = fromCoin.value
  fromCoin.value = toCoin.value
  toCoin.value = temp
}
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">闪兑</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <div class="switch-transfer__wrap mt-2">
        <div class="switch-transfer__select">
          <div class="line-wrap relative">
            <div class="line" /> <svg width="8" height="3" viewBox="0 0 8 3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.2484 3L7.75002 0H0.74678L4.2484 3Z" fill="#9aa3a3" /></svg> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="line-logo line-first-logo"><path d="M5 14H9C9.55228 14 10 13.5523 10 13V10C10 9.44772 9.55228 9 9 9H5V14Z" fill="#0d0e0e" /> <rect x="5" y="2" width="9" height="12" rx="1" stroke="#0d0e0e" /> <path d="M4 9H3C2.44772 9 2 9.44772 2 10V13C2 13.5523 2.44772 14 3 14H4" stroke="#0d0e0e" /> <path d="M7 5H10.3333" stroke="#0d0e0e" /> <path d="M7 7H12.3333" stroke="#0d0e0e" /></svg> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="line-logo line-last-logo"><path d="M5.34375 6.19329C5.34375 8.66387 7.28897 10.6667 9.68853 10.6667L10.0104 9.09272L8.88399 7.15977L7.38208 6H6.25565L5.34375 6.19329Z" fill="#0d0e0e" /> <circle cx="6" cy="10" r="4" stroke="#0d0e0e" /> <path d="M11.6776 8.51407C13.0299 8.08931 14.0109 6.82588 14.0109 5.33333C14.0109 3.49238 12.5185 2 10.6776 2C9.15055 2 7.86335 3.02679 7.46875 4.42761" stroke="#0d0e0e" /> <path d="M13.9896 10.666V12.9993C13.9896 13.5516 13.5419 13.9993 12.9896 13.9993H10.6562" stroke="#0d0e0e" /> <path d="M2.01042 5.33398V3.00065C2.01042 2.44837 2.45813 2.00065 3.01042 2.00065H5.34375" stroke="#0d0e0e" /></svg>
          </div> <div class="switch-transfer__account">
            <div class="switch-transfer__account-item">
              <span class="switch-transfer__account_label">
                从
              </span>
              <div class="transfer-casxader" @click="selectFunc(0)">
                <div class="select-show-text">
                  <p class="text-[#121935]">
                    {{ form.from.toUpperCase() }}
                  </p>
                  <p class="text-[10px]">
                    {{ balance.from }}
                  </p>
                </div>
              </div>
            </div> <div class="switch-transfer__account-item">
              <span class="switch-transfer__account_label">
                到
              </span>
              <div class="transfer-casxader" @click="selectFunc(1)">
                <div class="select-show-text">
                  <p class="text-[#121935]">
                    {{ form.to.toUpperCase() }}
                  </p>
                  <p class="text-[10px]">
                    {{ balance.to }}
                  </p>
                </div>
              </div>
            </div> <div class="switch-transfer__change" @click="changeConvert">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="28" rx="2" fill="#eff1f1" /> <path d="M13 7.14872V19.5C13 19.7761 12.7761 20 12.5 20H9.94444C9.6683 20 9.44444 19.7761 9.44444 19.5V13.9487C9.44444 13.6726 9.22059 13.4487 8.94444 13.4487H6.27075C5.81664 13.4487 5.59768 12.8922 5.93003 12.5828L12.1593 6.78279C12.479 6.48506 13 6.71182 13 7.14872Z" fill="#0d0e0e" /> <path d="M15 20.7687V8.5C15 8.22386 15.2239 8 15.5 8H18.0556C18.3317 8 18.5556 8.22386 18.5556 8.5V13.2735C18.5556 13.5496 18.7794 13.7735 19.0556 13.7735H21.8163C22.2584 13.7735 22.483 14.3051 22.1748 14.6221L15.8585 21.1172C15.5455 21.439 15 21.2175 15 20.7687Z" fill="#0d0e0e" /></svg>
            </div>
          </div>
        </div>
      </div>
      <form class="mt-6" @submit="submitForm">
        <div class="login-form-group">
          <div class="login-form-input relative">
            <input v-model="form.count" name="count" placeholder="输入您要兑换的数量" :class="validForm.count.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.count.show = false">
            <div class="all-btn absolute h-full top-0 right-[10px] flex items-center justify-center">
              <span class="text-[#1989fa] text-[14px]" @click="allIn">全部</span>
            </div>
          </div>
          <div class="login-from-error">
            <div class="bg-comp-error-normal error" :class="validForm.count.show ? 'opacity-100' : 'opacity-0'">
              {{ validForm.count.message }}
            </div>
          </div>
        </div>
        <div class="flex justify-end text-[10px]">
          {{ form.count ? form.count : 0 }}&nbsp;{{ form.from.toUpperCase() }}&nbsp;=&nbsp;{{ convertAmount }}&nbsp;{{ form.to.toUpperCase() }}
        </div>
        <div>
          <!--          <mi-captcha ref="captcha" theme-color="#3a98fa" modal-bg-color="#3a98fa" width="100%" init-action="/api/captcha/init" verify-action="/api/captcha/verify" @success="successCaptcha" /> -->
        </div>
        <div class="form-btn-box mt-[24px]">
          <van-button block type="primary" native-type="submit">
            确认兑换
          </van-button>
        </div>
      </form>
    </div>
    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        :columns="coinList"
        @cancel="showPicker = false"
        @confirm="confirmPicker"
      />
    </van-popup>
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
      border: 1px solid #9aa3a3;
      border-radius: 4px;
      outline: none;
      transition: all .35s ease;
    }
  }
}

.van-tabs__nav,.van-nav-bar {
  background: transparent;
}

.switch-transfer__wrap {
  display: flex;
  border: 1px solid #c8cdcd;
  border-radius: 4px;
  overflow: hidden;
  .switch-transfer__change {
    position: absolute;
    width: 28px;
    height: 28px;
    top: 48px;
    right: 34px;
    background: #eff1f1;
    cursor: pointer;
  }
  .switch-transfer__select {
    background: transparent!important;
    padding-left: 30px;
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    flex:1;
     .line-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      right: 14px;
       .line-first-logo {
         top: 35px;
       }
       .line-last-logo {
         bottom: 34px;
       }
       .line-logo {
         width: 16px;
         height: 16px;
         position: absolute;
         left: 50%;
         transform: translateX(-50%);
       }
       .line {
         position: static;
         width: 0;
         height: 19px;
         border-left: 1px dashed #9aa3a3;
         background: unset;
         transform: unset;
       }
    }
    .switch-transfer__account {
      position: relative;
      display: flex;
      flex-direction: column;
      flex:1;
      .switch-transfer__account-item {
        display: flex;
        align-items: center;
        height: 62px;
        .transfer-casxader {
          position: relative;
          height: 100%;
          flex:1;
        }
        .switch-transfer__account_label {
          font-weight: 500;
          font-size: 14px;
          line-height: 20px;
          color: #9aa3a3;
          white-space: nowrap;
          margin-right: 12px;
          min-width: 38px;
        }
      }
      .switch-transfer__account-item:first-child {
        border-bottom: none!important;
      }
    }
  }
}

.switch-transfer__account-item:first-child .select-show-text {
  border-bottom: 1px dashed #c8cdcd;
}

 .select-show-text {
  cursor: default;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
   flex-flow: column;
  margin-right: 76px;
  margin-left: 0;
   text-align: center;

}
</style>
