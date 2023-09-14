import request from '@/utils/request';
// 服务名
const [yssContractServer, amsFileService, amcDatalinkServer, billowDiplomatic] = [
  '/yss-contract-server',
  '/ams-file-service',
  '/amc-datalink-server',
  '/billow-diplomatic',
];
// yssContractServer

// 查询产品list
export async function getAllProductList(data) {
  return request(`${yssContractServer}/RpProduct/queryAllByCondition`, {
    method: 'post',
    data,
  });
}

// 获取畅写编辑器sdk服务器IP地址
export async function getNginxIp(params) {
  return request(`${amsFileService}/businessArchive/getnginxip`, {
    method: 'get',
    params,
  });
}

export async function getTask(id) {
  return request(`/api/yss-base-billows/variable-query/history/map/process-id/${id}`, {
    method: 'get',
  });
}
//获取所有待办数据
export async function getIsCallback(params) {
  return request(`${yssContractServer}/businessArchive/isCallback`, {
      method: 'get',
      params
    },
  );
}
//获取岗位信息
export async function getPositions(processInstanceId) {
    return request(`/api/billow-diplomatic/todo-task/flow-history/v2/${processInstanceId}`, {
        method: 'get',
      },
    );
}
//通过流程id获取已办理的岗位
export async function getBanLiList(processInstanceId) {
    return request(`/api/yss-base-billows/comment/approval-comment/${processInstanceId}`, {
        method: 'get',
      },
    );
}
//退回并行节点
export async function backBingXing(data) {
    return request(`/api/yss-base-billows/task-reject/alreadyDealtReject`, {
        method: 'post',
        data
      },
    );
}

