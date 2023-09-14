import { stringify } from 'qs';
import request from '@/utils/request';
// 获取列表数据
export async function handIndexAPI(params,val) {
  return request(val?.url, {
    method: val?.method||'POST',
    data: params,
  });
}
// 高级搜索下拉框
export async function handSearchAPI(params,val) {
  return request(val?.url, {
    method: val?.method||'POST',
    data: params,
  });
}
