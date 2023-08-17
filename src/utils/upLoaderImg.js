import { Toast } from 'vant'
import request from '@/utils/request'

// 引入Toast

function upLoaderImg(file) { // file为 你读取成功的回调文件信息
  // new 一个FormData格式的参数
  const params = new FormData()
  params.append('file', file)
  const config = {
    headers: { // 添加请求头
      'Content-Type': 'multipart/form-data',
    },
  }
  return new Promise((resolve, reject) => {
    // 把 uploadUrl 换成自己的 上传路径
    request.post('/common/upload', params, config).then((res) => {
      if (res && res.data && res.code === 1) { // 如果为真 resolve出去
        resolve(res.data)
      } else {
        // 否则 Toast 提示
        Toast.fail(res.data && (res.msg))
        reject(res.data)
      }
    }).catch((err) => {
      Toast.fail('系统异常')
      reject(err)
    })
  })
}
export default upLoaderImg
