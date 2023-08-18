<script setup lang="ts">
import { showFailToast, showToast } from 'vant'
import router from '@/router'
import { getCoinList } from '@/api/convert'
import { getWithdrawInfoList, submitWithdraw } from '@/api/withdraw'

const onClickLeft = () => history.back()
const showPicker = ref(false)
const showBankPicker = ref(false)

const form = ref({
  count: null,
  // code: null,
  coin: 'usdt',
  info_id: null,
  pass: null,
  show_text: '请选择提现地址',
})

const validForm = ref({
  count: {
    show: false,
    message: '请输入提现数量',
  },
  pass: {
    show: false,
    message: '请输入您的提现密码',
  },
})

const submitForm = async (e) => {
  e.preventDefault()
  if (!form.value.count) {
    validForm.value.count.show = true
    return
  }
  if (!form.value.pass) {
    validForm.value.pass.show = true
    return
  }
  if (!form.value.info_id) {
    showFailToast('请选择提现信息')
    return
  }
  // if (!form.value.code) {
  //   showFailToast('请完成滑块验证')
  //   return
  // }
  const { msg, code } = await submitWithdraw(form.value)
  if (code !== 1) {
    showFailToast(msg)
    return
  }
  showToast('提交成功')
  await router.push({ name: 'withdrawLog' })
}

// function successCaptcha(e) {
//   form.value.code = e.code
// }

const coinList = reactive([])
const bankList = reactive([])

const getCoinWithdraw = async () => {
  const { data } = await getWithdrawInfoList(form.value.coin)
  bankList.splice(0, bankList.length)
  data.forEach((item) => {
    let record = {}
    if (form.value.coin === 'cny') {
      record = {
        text: `${item.name} ${item.number} ${item.address}`,
        value: item.id,
      }
    } else {
      record = {
        text: item.number,
        value: item.id,
      }
    }

    bankList.push(record)
  })
}

const selectConfig = ref({
  text: null,
  time: null,
  today_free_fee: null,
  value: null,
  min: null,
  max: null,
  fee_type: null,
  fee_scale: null,
  fee_num: null,
  amount: null,
})

onBeforeMount(async () => {
  const { data } = await getCoinList()
  data.forEach((item) => {
    const record = {
      text: item.title,
      value: item.name,
      time: item.time,
      today_free_fee: item.today_free_fee,
      min: item.withdraw_min,
      max: item.withdraw_max,
      fee_type: item.withdraw_fee_type,
      fee_scale: item.withdraw_fee_scale,
      fee_num: item.withdraw_fee_num,
      amount: item.wallet.amount,
    }
    console.log(record.value === 'usdt')
    if (record.value === 'usdt')
      selectConfig.value = record

    console.log(selectConfig)
    coinList.push(record)
  })
  await getCoinWithdraw()
})

const confirmPicker = async (e) => {
  const selectData = e.selectedOptions[0]
  selectConfig.value = selectData
  form.value.coin = selectData.value
  await getCoinWithdraw()
  form.value.show_text = '请选择提现地址'
  form.value.info_id = null
  showPicker.value = false
}
const confirmBankPicker = (e) => {
  const selectData = e.selectedOptions[0]
  form.value.show_text = selectData.text
  form.value.info_id = selectData.value
  showBankPicker.value = false
}
</script>

<template>
  <div>
    <van-nav-bar
      @click-left="onClickLeft"
    >
      <template #title>
        <span class="text-[#121935]">提现</span>
      </template>
      <template #left>
        <van-icon name="arrow-left" color="#121935" />
      </template>
      <template #right>
        <van-icon name="orders-o" color="#121935" @click="router.push({ name: 'withdrawLog' })" />
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
        <div class="global-form-group">
          <label>提现地址(账号)</label>
          <div class="moblie-select-coin" @click="showBankPicker = true">
            <div class="coin-box flex">
              <div class="coin-left">
                <span class="coin-name">
                  {{ form.show_text }}
                </span>
              </div> <div class="coin-right">
                <van-icon name="arrow-down" />
              </div>
            </div>
          </div>
        </div>
        <div class="login-form-group">
          <label style="color: #0d0e0e;font-weight: 500;">提现数量</label>
          <div class="login-form-input">
            <input v-model="form.count" name="count" placeholder="输入您要提现的数量" :class="validForm.count.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.count.show = false">
          </div> <div class="login-from-error">
            <div class="bg-comp-error-normal error" :class="validForm.count.show ? 'opacity-100' : 'opacity-0'">
              {{ validForm.count.message }}
            </div>
          </div>
        </div>
        <div class="login-form-group global-form-group">
          <label>提现密码</label>
          <div class="login-form-input">
            <input v-model="form.pass" name="pass" placeholder="输入您的提现密码" :class="validForm.pass.show ? 'error-border' : ''" type="text" class="input" @focus="validForm.pass.show = false">
          </div> <div class="login-from-error">
            <div class="bg-comp-error-normal error" :class="validForm.pass.show ? 'opacity-100' : 'opacity-0'">
              {{ validForm.pass.message }}
            </div>
          </div>
        </div>
        <div>
          <!--          <mi-captcha ref="captcha" theme-color="#3a98fa" modal-bg-color="#3a98fa" width="100%" init-action="/api/captcha/init" verify-action="/api/captcha/verify" @success="successCaptcha" /> -->
        </div>
        <div class="form-btn-box mt-[24px]">
          <van-button block type="primary" native-type="submit">
            确认提现
          </van-button>
        </div>
      </form>
      <div class="mt-8">
        <div class="alert">
          <div class="flex">
            <span>提现时间:&nbsp;</span>
            <span class="font-bold">{{ selectConfig.time }}</span>
          </div>
          <div class="flex">
            <span>最低提现金额:&nbsp;</span>
            <span class="font-bold">{{ selectConfig.min }}</span>
          </div>
          <div class="flex">
            <span>最高提现金额:&nbsp;</span>
            <span class="font-bold">{{ selectConfig.max }}</span>
          </div>
          <div class="flex">
            <span>提现手续费:&nbsp;</span>
            <span class="font-bold">{{ selectConfig.fee_type === '0' ? `${selectConfig.fee_scale}%` : selectConfig.fee_num }}</span>
          </div>
          <div class="flex">
            <span>当日首次提现免手续费金额:&nbsp;</span>
            <span class="font-bold">{{ selectConfig.today_free_fee }}</span>
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        :columns="coinList"
        @cancel="showPicker = false"
        @confirm="confirmPicker"
      />
    </van-popup>
    <van-popup v-model:show="showBankPicker" round position="bottom">
      <van-picker
        :columns="bankList"
        @cancel="showBankPicker = false"
        @confirm="confirmBankPicker"
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
 .alert {
   border: 1px solid var(--van-primary-color);
   padding: 8px 12px;
   border-radius: 4px;
   color: #4b618c;
   font-size: 12px;
 }
</style>
