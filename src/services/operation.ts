import { stringify } from 'qs';
import request from '../utils/request';
import * as type from './type';

const uri = '/ams/yss-contract-server';

export async function getNginxIp(pams: any) {
  return request(`${type.GETNGINXIP}?${stringify(pams)}`);
}

// 获取映射信息
export async function getPair(pams: any) {
  return request(`${uri}/data/selectByKey?${stringify(pams)}`);
}

// 添加文档
export async function contractAdd(pams: any) {
  return request(`${uri}/data/add`, {
    method: 'POST',
    body: pams,
  });
}
