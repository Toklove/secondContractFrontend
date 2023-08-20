// https://router.vuejs.org/zh/
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入路由组件
import mian from '@/views/index.vue'
import market from '@/views/market/index.vue'
import exchange from '@/views/exchange/index.vue'
import contract from '@/views/contract/index.vue'
import wallet from '@/views/wallet/index.vue'
import login from '@/views/user/login.vue'
import { useUserStore } from '@/stores/user'
NProgress.configure({ showSpinner: true, parent: '#app' })

// 定义路由，每个路由都需要映射到一个组件
const routes = [
  {
    path: '/',
    name: 'main',
    component: mian,
    meta: {
      title: '主页',
    },
  },
  {
    path: '/market',
    name: 'market',
    component: market,
    meta: {
      title: '行情',
    },
  },
  {
    path: '/exchange',
    name: 'exchange',
    component: exchange,
    meta: {
      title: '交易',
    },
  },
  {
    path: '/contract',
    name: 'contract',
    component: contract,
    meta: {
      title: '合约',
    },
  }, {
    path: '/wallet',
    name: 'wallet',
    component: wallet,
    meta: {
      title: '资产',
    },
  }, {
    path: '/login',
    name: 'login',
    component: login,
    meta: {
      title: '登录',
    },
  }, {
    path: '/register',
    name: 'register',
    meta: {
      title: '注册',
    },
    component: () => import('@/views/user/register.vue'),
  }, {
    path: '/contract/log',
    name: 'contractLog',
    meta: {
      title: '合约订单',
    },
    component: () => import('@/views/contract/log.vue'),
  }, {
    path: '/exchange/log',
    name: 'exchangeLog',
    meta: {
      title: '交易订单',
    },
    component: () => import('@/views/exchange/log.vue'),
  }, {
    path: '/other',
    name: 'other',
    meta: {
      title: '信息',
    },
    component: () => import('@/views/other/index.vue'),
  }, {
    path: '/convert',
    name: 'convert',
    meta: {
      title: '闪兑',
    },
    component: () => import('@/views/convert/index.vue'),
  }, {
    path: '/withdraw',
    name: 'withdraw',
    meta: {
      title: '提现',
    },
    component: () => import('@/views/withdraw/index.vue'),
  }, {
    path: '/ident',
    name: 'ident',
    meta: {
      title: '身份验证',
    },
    component: () => import('@/views/ident/index.vue'),
  }, {
    path: '/ident/primary',
    name: 'identPrimary',
    meta: {
      title: '初级认证',
    },
    component: () => import('@/views/ident/primary.vue'),
  }, {
    path: '/ident/advanced',
    name: 'identAdvanced',
    meta: {
      title: '高级认证',
    },
    component: () => import('@/views/ident/advanced.vue'),
  }, {
    path: '/resetPassword',
    name: 'resetPassword',
    meta: {
      title: '密码设置',
    },
    component: () => import('@/views/user/resetPassword.vue'),
  }, {
    path: '/resetLoginPass',
    name: 'resetLoginPass',
    meta: {
      title: '登录密码',
    },
    component: () => import('@/views/user/resetLoginPass.vue'),
  }, {
    path: '/resetWithdrawPass',
    name: 'resetWithdrawPass',
    meta: {
      title: '提现密码',
    },
    component: () => import('@/views/user/resetWithdrawPass.vue'),
  }, {
    path: '/chat',
    name: 'chat',
    meta: {
      title: '在线客服',
    },
    component: () => import('@/views/chat/index.vue'),
  }, {
    path: '/addWithdraw',
    name: 'addWithdraw',
    meta: {
      title: '添加提币地址',
    },
    component: () => import('@/views/withdraw/add.vue'),
  }, {
    path: '/withdrawList',
    name: 'withdrawList',
    meta: {
      title: '提币地址',
    },
    component: () => import('@/views/withdraw/list.vue'),
  }, {
    path: '/withdrawLog',
    name: 'withdrawLog',
    meta: {
      title: '提币记录',
    },
    component: () => import('@/views/withdraw/log.vue'),
  },
]

// 创建路由实例并传递 `routes` 配置
const router = createRouter({
  history: createWebHistory(process.env.VUE_APP_PUBLIC_PATH),
  routes,
})

const title = import.meta.env.VITE_APP_TITLE
const defaultRoutePath = '/'
const whiteRoute = ['login', 'main', 'register']

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const toTitle = to.meta.title ? to.meta.title : to.name
  document.title = `${toTitle} - ${title}`
  const token = localStorage.getItem('TOKEN')

  // 登录状态下
  if (token) {
    if (to.name === 'login') {
      next({ path: defaultRoutePath })
      return
    }

    // eslint-disable-next-line eqeqeq
    if (!userStore.userInfo && userStore.userInfo == undefined) {
      const data = await userStore.requestUserInfo()
      data && next({ path: to.path, query: to.query })
    } else {
      next()
    }
  } else {
    // 未登录的情况下允许访问的路由
    if (!whiteRoute.includes(<string>to.name))
      next({ name: 'login', query: { redirect: to.fullPath } })
    else
      next()
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

router.onError((error) => {
  // eslint-disable-next-line no-console
  console.log(error)
  NProgress.done()
})

// 导出路由实例，并在 `main.ts` 挂载
export default router
