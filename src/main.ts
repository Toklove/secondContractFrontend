import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createRouterScroller } from 'vue-router-better-scroller'
import { ElLoading, ElProgress } from 'element-plus'
import App from './App.vue'
import router from './router'
import 'virtual:windi.css'
import MakeitCaptcha from 'makeit-captcha'
import { VueClipboard } from '@soerenmartius/vue3-clipboard'
import 'makeit-captcha/dist/captcha.min.css'

import './app.less'

// Vant 桌面端适配
import '@vant/touch-emulator'

/* --------------------------------
Vant 中有个别组件是以函数的形式提供的，
包括 Toast，Dialog，Notify 和 ImagePreview 组件。
在使用函数组件时，unplugin-vue-components
无法自动引入对应的样式，因此需要手动引入样式。
------------------------------------- */
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 根据HTTP类型生成ws链接
const isHttps = document.location.protocol === 'https:'
if (isHttps)
  app.config.globalProperties.$wsUrl = `wss://${document.location.host}/ws`
else
  app.config.globalProperties.$wsUrl = `ws://${document.location.host}/ws`

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(router)
app.use(pinia)
app.use(MakeitCaptcha)
app.use(ElLoading)
app.use(ElProgress)
app.use(VueClipboard)

// 增强了 Vue Router v4 的滚动行为
app.use(createRouterScroller({
  selectors: {
    'window': true,
    'body': true,
    '.scrollable': true,
  },
}))

app.mount('#app')
