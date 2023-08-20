import request from '@/utils/request'

export async function submitExchange(data): Promise<any> {
  return request('/exchange/submit', { method: 'post', data })
}
export async function exchangeList(type): Promise<any> {
  return request(`/exchange/record?type=${type}`, { method: 'get' })
}

export async function cancelExchange(id): Promise<any> {
  return request(`/exchange/cancel?id=${id}`, { method: 'get' })
}