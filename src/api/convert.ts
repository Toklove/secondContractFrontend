import request from '@/utils/request'

export async function getCoinList(): Promise<any> {
  return request('/convert/coinList', { method: 'get' })
}

export async function postExchange(data): Promise<any> {
  return request('/convert/exchange', { method: 'post', data })
}
