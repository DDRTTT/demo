import request from '@/utils/request';

const uri = '/yss-lifecycle-flow';
// 获取流程连线图的数据
export function getProcessTree(params) {
  return request.get(`${uri}/controlInfo/getProcessTree`, {
    params,
  });
}

// 获取统计的数据
export function getStatistics(params) {
  // return request.post(`${uri}/taskCount/getTodoTask/proTypeAndCode`, {
  params.currentUserTask = 0;
  return request.post(`${uri}/taskCount/getTodoTaskCount`, {
    data: params,
  });
}

// 通用的,点击节点跳转的时候需要调接口
export function commonRequest(uri) {
  return request.get(uri);
}
