import request from '@/utils/request';

const url = '/yss-contract-server';

/*
 * 模板条款管理列表页接口
 */

export const getListApi = params =>
  request(`${url}/clause/queryAll?currentPage=${params.page}&pageSize=${params.pageSize}`, {
    method: 'POST',
    data: {},
  });

export const getTempListApi = params =>
  request(`/yss-contract-server/directory/getTemplateByLabel`, {
    method: 'POST',
    data: { labelName: params.labelName },
  });

export const deleteItemApi = params =>
  request(`${url}/clause/delete`, {
    method: 'POST',
    data: params,
  });

/*
 * 模板条款管理查看页接口
 */

export const getTableListApi = params =>
  request(`${url}/clause/queryById?currentPage=${params.page}&pageSize=${params.pageSize}`, {
    method: 'POST',
    data: params.data,
  });

export const getLabelListApi = params =>
  request(`${url}/directory/getLabelList`, {
    method: 'POST',
    data: params,
  });
