import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/api/users');
}

export async function queryCurrent(): Promise<any> {
  return request('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}

// 动态列保存
export async function dynamicColumnSave(params:any) {
  return request('/ams-base-admin/dynamic/column/save', {
    method: 'POST',
    data: params,
  });
}
// 动态列获取
export async function dynamicColumnList(pageCode:any) {
  return request('/ams-base-admin/dynamic/column/list?pageCode=' + pageCode, {
    method: 'GET',
  });
}
// 动态列删除
export async function dynamicColumnDelete(pageCode:any) {
  return request('/ams-base-admin/dynamic/column/delete?pageCode=' + pageCode, {
    method: 'DELETE',
  });
}
