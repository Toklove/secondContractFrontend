import request from '@/utils/request'

export async function login(data): Promise<any> {
  return request('/user/login', { method: 'post', data })
}

export async function postVerifyId(data): Promise<any> {
  return request('/user/verifyId', { method: 'post', data })
}

export async function verifyIdPrimary(data): Promise<any> {
  return request('/user/verifyIdPrimary', { method: 'post', data })
}

export async function verifyIdAdvanced(data): Promise<any> {
  return request('/user/verifyIdAdvanced', { method: 'post', data })
}

export async function register(data): Promise<any> {
  return request('/user/register', { method: 'post', data })
}

export async function resetPwd(data): Promise<any> {
  return request('/user/resetpwd', { method: 'post', data })
}

export async function resetWithPwd(data): Promise<any> {
  return request('/user/resetWithPwd', { method: 'post', data })
}

export async function logout(): Promise<any> {
  return request('/user/logout', { method: 'post' })
}

export async function getUserInfo(): Promise<any> {
  return request('/user/userinfo', { method: 'get' })
}

export async function getMoneyLogList(): Promise<any> {
  return request('/user/moneyLogList', { method: 'get' })
}

export async function getWallet(): Promise<any> {
  return request('/user/wallet', { method: 'get' })
}
