import request from '@/utils/request';

const serverName = '/ams-file-service';

// 超募说明书设置-查询列表
export async function queryAllSettingTemplate(params) {
  // {
  //   "pageSize": 10,
  //   "currentPage": 1,
  //   "proCode": "",
  //   "templateType": 1
  // }
  return request((`${serverName}/template/queryAllSettingTemplate`), {
    method: 'POST',
    data: params,
  });
}
// 超募说明书设置-导出
export async function batchExport(params) {
  // {
  //   "pageSize": 10,
  //   "currentPage": 1,
  //   "templateType": 1,
  //   "ids": [
  //   "12231132091511822154"
  // ]
  // }
  return request((`${serverName}/template/batchExport`), {
    method: 'POST',
    data: params,
  });
}
// 超募说明书设置-审核通过
export async function checkSelectData(params) {
  // {
  //   "id": [
  //   88889108
  // ]
  // }
  return request((`${serverName}/template/checked`), {
    method: 'POST',
    data: params,
  });
}
// 超募说明书设置-反审核
export async function uncheckSelectData(params) {
  // {
  //   "id": [
  //   88889108
  // ]
  // }
  return request((`${serverName}/template/unChecked`), {
    method: 'POST',
    data: params,
  });
}
// 超募说明书设置-查找产品列表
export async function queryAllByCondition(params) {
  // {
  //   "id": [
  //   88889108
  // ]
  // }
  return request((`/yss-contract-server/RpProduct/queryAllByCondition`), {
    method: 'POST',
    data: params,
  });
}
// 超募说明书设置-获取托管人列表
export async function querycCustodian(params) {
  // {
  //   "path": null,
  //   "methodName": "POST",
  //   "linkId": "yssBC8822B74290D2EF2C6ED8403129EE96",
  //   "queryParams": [
  //   {
  //     "type": 0,
  //     "code": "orgId",
  //     "required": 1,
  //     "value": "0"
  //   }
  // ],
  //   "viewId": "yssBC8822B74290D2EF2C6ED8403129EE96"
  // }
  return request((`/api/amc-datalink-server/data-link/process/internal-query`), {
    method: 'POST',
    data: params,
  });
}
