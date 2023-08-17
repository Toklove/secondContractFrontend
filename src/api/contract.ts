import request from '@/utils/request'

export async function createContract(data): Promise<any> {
  return request('/contract/createOrder', { method: 'post', data })
}

export async function getContractInfo(id): Promise<any> {
  return request(`/contract/info?id=${id}`, { method: 'get' })
}

export async function contractList(type): Promise<any> {
  return request(`/contract/record?type=${type}`, { method: 'get' })
}
