import path from 'path'
import { loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'

import { visualizer } from 'rollup-plugin-visualizer'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import vueJsx from '@vitejs/plugin-vue-jsx'

import viewport from 'postcss-mobile-forever'
import autoprefixer from 'autoprefixer'

import { viteVConsole } from 'vite-plugin-vconsole'
import mock from './build/mock/createMockServer'

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  const env = loadEnv(mode, root)

  return {
    base: env.VITE_APP_PUBLIC_PATH,

    define: {
      'process.env.VUE_APP_API_BASE_URL': JSON.stringify(env.VITE_APP_API_BASE_URL),
      'process.env.VUE_APP_PUBLIC_PATH': JSON.stringify(env.VITE_APP_PUBLIC_PATH),
    },

    plugins: [
      vue(),
      vueJsx(),
      visualizer(),
      WindiCSS(),

      legacy({
        targets: ['defaults', 'not IE 11'],
      }),

      Components({
        dts: true,
        resolvers: [VantResolver()],
        types: [],
      }),

      AutoImport({
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
        ],
        imports: [
          'vue',
          'vue-router',
          'vitest',
        ],
        dts: true,
      }),

      viteVConsole({
        entry: [path.resolve('src/main.ts')],
        localEnabled: command === 'serve',
        enabled: false,
        config: {
          maxLogNumber: 1000,
          theme: 'light',
        },
      }),

      mock({
        watch: true,
        mockUrlList: [/api/],
        cwd: process.cwd(),
        enable: env.VITE_HTTP_MOCK === 'true' && process.env.NODE_ENV !== 'production',
      }),
    ],

    css: {
      postcss: {
        plugins: [
          autoprefixer(),
          viewport({
            rootSelector: '#app',
            viewportWidth: 375,
            maxDisplayWidth: undefined,
            border: false,
            disableMobile: false,
            disableDesktop: false,
            disableLandscape: false,
          }),
        ],
      },
    },

    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 2048,
    },

    resolve: {
      alias: {
        '~@': path.join(__dirname, './src'),
        '@': path.join(__dirname, './src'),
        '~': path.join(__dirname, './src/assets'),
      },
    },

    server: {
      host: true,
      port: 3000,
      proxy: env.VITE_HTTP_MOCK === 'true'
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:8888/',
              ws: false,
              changeOrigin: true,
            },
            '/uploads': {
              target: 'http://localhost:8888/',
              ws: false,
              changeOrigin: true,
            },
            '/assets': {
              target: 'http://localhost:8888/',
              ws: false,
              changeOrigin: true,
            },
          '/json': {
              target: 'http://ip-api.com/',
              ws: false,
              changeOrigin: true,
            },
            '/ws': {
              target: 'wss://api.huobi.pro/', // 这里是后台ws访问地址
              changeOrigin: true, // 允许跨域设置
              ws: true, // websocket代理设置
            },
          },
    },
  }
}
