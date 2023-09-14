import request from '@/utils/request';
import { deletNUllProperty } from '@/utils/utils';

const uri = '/yss-lifecycle-flow';
// const uri = '/wangxin';
// 查询投资者审查的表格数据
export function queryTableList(params) {
  deletNUllProperty(params);
  return request.post(`${uri}/investorExamine/taskCount`, {
    data: params,
  });
}

// 根据字典获取对应的值
export function getDicsByTypes(params) {
  return request.get(`/ams-base-parameter/datadict/queryInfoByList`, {
    params: {
      codeList: params,
    },
  });
}
// 获取客户名称下拉列表
export function getFindAllInvest(params) {
  return request.get(`${uri}/investorExamine/findAllInvest`, {
    params: {
      codeList: params,
    },
  });
}

// 获取产品名称下拉列表
export function getProductEnum(params) {
  return request.get(`${uri}/product/review/productEnum/search`, { params });
}
// 撤销
export function revoke(params) {
  return request.get(`${uri}/common/revoke`, { params });
}

// 删除待提交
export function deleteApi(id) {
  return request.post(`${uri}/investorExamine/delete`, {
    data: [id],
  });
}
// 批量提交
export function batchCommit(data) {
  return request.post(`${uri}/investorExamine/batchCommit`, {
    data,
  });
}
