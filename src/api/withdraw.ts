import request from '@/utils/request'

export async function getWithdrawInfoList(coin): Promise<any> {
  return request(`/withdraw/info?coin=${coin}`, { method: 'get' })
}

export async function addWithdrawInfo(data): Promise<any> {
  return request('/withdraw/add', { method: 'post', data })
}
export async function getWithdrawList(): Promise<any> {
  return request('/withdraw/list', { method: 'get' })
}

export async function getWithdrawLog(page): Promise<any> {
  return request(`/withdraw/log?page=${page}`, { method: 'get' })
}

export async function submitWithdraw(data): Promise<any> {
  return request('/withdraw/submit', { method: 'post', data })
}

