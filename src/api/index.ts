import request from '@/utils/request'

export async function queryProse(): Promise<any> {
  return request('/project/prose')
}

export async function market(): Promise<any> {
  return request('/index/market')
}


export async function indexConfig(): Promise<any> {
  return request('/index/index')
}
