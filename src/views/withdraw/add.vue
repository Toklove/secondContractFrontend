<script setup lang="ts">
import { showFailToast, showToast } from 'vant'
import { getCoinList } from '@/api/convert'
import { addWithdrawInfo } from '@/api/withdraw'

const onClickLeft = () => history.back()
const showPicker = ref(false)

const form = ref({
  number: null,
  address: null,
  name: null,
  // code: null,
  coin: 'usdt',
})

const validForm = ref({
  number: {
    show: false,
    message: '请输入提币地址',
  },
  address: {
    show: false,
    message: '请输入开户行',
  },
  name: {
    show: false,
    message: '请输入姓名',
  },
})

const submitForm = async (e) => {
  e.preventDefault()
  if (!form.value.number) {
    validForm.value.number.show = true
    return
  }
  if (form.value.coin === 'cny') {
    if (!form.value.address) {
      validForm.value.address.show = true
      return
    }
    if (!form.value.name) {
      validForm.value.name.show = true
      return
    }
  }
  // if (!form.value.code) {
  //   showFailToast('请完成滑块验证')
  //   return
  // }
  const { msg, code } = await addWithdrawInfo(form.value)
  if (code !== 1) {
    showFailToast(msg)
    return
  }
  showToast('添加成功')
}

// function successCaptcha(e) {
//   form.value.code = e.code
// }

const coinList = reactive([])

onBeforeMount(async () => {
  const { data } = await getCoinList()
  data.forEach((item) => {
    const record = {
      text: item.title,
      value: item.name,
      amount: item.wallet.amount,
    }
    coinList.push(record)
  })
})

const confirmPicker = async (e) => {
  const selectData = e.selectedOptions[0]
  form.value.coin = selectData.value
  showPicker.value = false
}
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">添加提币地址</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
    </van-nav-bar>
    <div class="w-full bg-white mt-4 rounded-t-xl min-h-[100vh] p-[20px]">
      <form class="mt-6" @submit="submitForm">
        <div class="global-form-group">
          <label>币种</label>
          <div class="moblie-select-coin" @click="showPicker = true">
            <div class="coin-box flex">
              <div class="coin-left">
                <span class="coin-name">
                  {{ form.coin.toUpperCase() }}
                </span>
              </div> <div class="coin-right">
                <van-icon name="arrow-down" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="form.coin === 'cny'">
          <div class="login-form-group global-form-group">
            <label>银行卡号</label>
            <div class="login-form-input">
              <input v-model="form.number" name="number" placeholder="输入您的银行卡号" :class="validForm.number.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.number.show = false">
            </div> <div class="login-from-error">
              <div class="bg-comp-error-normal error" :class="validForm.number.show ? 'opacity-100' : 'opacity-0'">
                请输入您的银行卡号
              </div>
            </div>
          </div>
          <div class="login-form-group global-form-group">
            <label>姓名</label>
            <div class="login-form-input">
              <input v-model="form.name" name="name" placeholder="输入您的姓名" :class="validForm.name.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.name.show = false">
            </div> <div class="login-from-error">
              <div class="bg-comp-error-normal error" :class="validForm.name.show ? 'opacity-100' : 'opacity-0'">
                {{ validForm.name.message }}
              </div>
            </div>
          </div>
          <div class="login-form-group global-form-group">
            <label>开户行</label>
            <div class="login-form-input">
              <input v-model="form.address" name="address" placeholder="输入您的开户行" :class="validForm.address.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.address.show = false">
            </div> <div class="login-from-error">
              <div class="bg-comp-error-normal error" :class="validForm.address.show ? 'opacity-100' : 'opacity-0'">
                {{ validForm.address.message }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="login-form-group global-form-group">
          <label>提币地址</label>
          <div class="login-form-input">
            <input v-model="form.number" name="number" placeholder="输入您的提币地址" :class="validForm.number.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.number.show = false">
          </div> <div class="login-from-error">
            <div class="bg-comp-error-normal error" :class="validForm.number.show ? 'opacity-100' : 'opacity-0'">
              {{ validForm.number.message }}
            </div>
          </div>
        </div>

        <div>
<!--          <mi-captcha ref="captcha" theme-color="#3a98fa" modal-bg-color="#3a98fa" width="100%" init-action="/api/captcha/init" verify-action="/api/captcha/verify" @success="successCaptcha" />-->
        </div>
        <div class="form-btn-box mt-[24px]">
          <van-button block type="primary" native-type="submit">
            确认添加
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
  margin-bottom: 12px !important;
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
  margin-bottom: 24px;
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
