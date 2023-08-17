import request from '@/utils/request'

export async function getPairConfig(pair): Promise<any> {
  return request(`/market/config?pair=${pair}`, { method: 'get' })
}
