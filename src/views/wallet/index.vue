<script setup>
import Tabbar from '@/components/tabbar/index.vue'
import { getWallet } from '@/api/user'
import router from '@/router'
import {showToast} from "vant";

const active = ref(0)
const activeList = ref(0)
const loading = ref(false)

const wallet = reactive([{ wallet: { amount: 0.0000 } }])

onBeforeMount(async () => {
  loading.value = true
  const { code, data } = await getWallet()
  wallet.shift()
  data.forEach((item) => {
    wallet.push(item)
  })
  loading.value = false
})

const nowCoin = computed(() => wallet[activeList.value])

function changeItem(index) {
  activeList.value = index
}
</script>

<template>
  <div>
    <div class="head-pro">
      <div class="head-pro-back" style="height: 308px;">
        <img src="@/assets/img/movebricks_bg.png" draggable="true" alt="">
      </div>
      <div class="head-pro-title">
        <div class="uni-status-bar" style="height: 0;" />
        <p class="head-pro-title-sm">
          资产
        </p>
        <h1 class="head-pro-title-lg">
          {{ nowCoin.wallet.amount }}<span class="head-pro-title-small">{{ nowCoin.title }}</span>
        </h1>
        <div class="dd-table2" style="width: 100%;">
          <!----><!---->
        </div>
      </div><div class="head-pro-btn">
        <div class="head-pro-btn-a" @click="showToast('请联系客服充值')">
          <div class="head-pro-btn-icon">
            <img src="@/assets/img/ic_recharge_coin.png" draggable="true" alt="">
          </div>
          <p>
            充值
          </p>
        </div>
        <div class="head-pro-btn-a" @click="router.push({ name: 'withdraw' })">
          <div class="head-pro-btn-icon">
            <img src="@/assets/img/ic_withdraw_coin.png" draggable="true" alt="">
          </div><p>
            提现
          </p>
        </div>
        <div class="head-pro-btn-a" @click="router.push({ name: 'convert' })">
          <div class="head-pro-btn-icon">
            <img src="@/assets/img/ic-transfer.png" draggable="true" alt="">
          </div><p>
            兑换
          </p>
        </div>
      </div>
    </div><div>
      <div v-loading="loading" class="mt-[20px] mb-[80px]">
        <ul v-for="(item, index) in wallet" :key="index" class="pos-box" @click="changeItem(index)">
          <li class="pos-list transition-all" :class="activeList === index ? 'active' : ''">
            <div class="dd-pos-title">
              <h1 class="dd-pos-title-fl">
                {{ item.title }}
              </h1>
            </div><div class="dd-table2">
              <div class="dd-table-cell">
                <p class="dd-table-top">
                  可用(USDT)
                </p><p class="dd-table-bottom">
                  {{ item.wallet.amount }}
                </p>
              </div><div class="dd-table-cell">
                <p class="dd-table-top">
                  处理中(USDT)
                </p><p class="dd-table-bottom">
                  {{ item.wallet.amount_freeze }}
                </p>
              </div><div class="dd-table-cell">
                <p class="dd-table-top">
                  折合(USDT)
                </p><p class="dd-table-bottom">
                  {{ item.wallet.convert }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.head-pro {
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
  height: 270px;
  .head-pro-back {
    position: absolute;
    top: -70px;
    left: 0;
    width: 100%;
    z-index: -1;
  }
}

.head-pro-title {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  color: #fff;
  height: 170px;
  .head-pro-title-sm {
    font-size: 16px;
  }

  .head-pro-title-lg {
    font-size: 32px;
    font-weight: 700;
  }

  .head-pro-title-small {
    font-size: 20px;
    padding-left: 4px;
  }
  .dd-table2 {
    padding: 5px 0;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: space-around;
    justify-content: space-around;
  }

  .uni-status-bar {
    width: 390px;
    height: 20px /* height: var(--status-bar-height); */;
  }
}
.head-pro-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  background: #fff;
  -webkit-border-radius: 10px 10px 0 0;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}
.head-pro-btn-a {
  -webkit-box-flex: 1;
  -webkit-flex: auto;
  flex: auto;
  text-align: center;
  font-size: 14px;
  padding: 20px 0;
  display: flex;
  flex-flow: column;
  align-items: center;
  .head-pro-btn-icon {
    width: 40px;
    height: 40px;
  }
}
.pos-box {
  width: 95%;
  margin: auto;
  .active {
    background: #fff !important;
  }
  .pos-list {
    background-color: #fafafa;
    padding: 0 10px;
    -webkit-border-radius: 10px;
    border-radius: 10px;
    margin-bottom: 10px;
    .dd-pos-title {
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      -webkit-box-pack: justify;
      -webkit-justify-content: space-between;
      justify-content: space-between;
      margin-bottom: 10px;
      -webkit-box-align: center;
      -webkit-align-items: center;
      align-items: center;
      /* border-bottom: solid 1px #e6eaed; */
      line-height: 50px;
      .dd-pos-title-fl {
        color: #000;
        font-size: 18px;
        font-weight: 600;
      }
    }
    .dd-table2 {
      padding: 5px 0;
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      -webkit-justify-content: space-around;
      justify-content: space-around;
      .dd-table-cell {
        display: -webkit-box;
        display: -webkit-flex;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -webkit-flex-direction: column;
        flex-direction: column;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
        -webkit-box-align: center;
        -webkit-align-items: center;
        align-items: center;
        .dd-table-top {
          font-size: 11px;
        }
        .dd-table-bottom {
          font-size: 12px;
          color: #000;
          margin: 7px 0;
        }
      }
    }
  }
}
</style>
