import request from '@/utils/request';

const serverName = '/yss-lifecycle-flow';
const serverNamePortal =  '/api/portal-manage-server'; // 传送门服务
const serverNameDataList = '/api/amc-datalink-server'; // 数据列表服务
const serverNameColums = '/yss-base-admin';
const serverNameContract = '/yss-contract-server';


const uri = '/yss-lifecycle-flow';

// 列表-传送门服务，获取该页面相关信息
export async function getFundAchieveNote(params) {
  // page:1
  // limit:10
  // ids:7b8aac5e-630a-46d1-a753-2acd765640a8 // 当前菜单Id
  return request((`${serverNameDataList}/application/list`), {
    params,
  });
}
// 表头-通用，保存表头
export async function saveColumn(params) {
  // [{dataIndex:"id"
  // pageCode:"7b8aac5e-630a-46d1-a753-2acd765640a8"
  // prop:"id"
  // show:1
  // sort:0
  // title:"selection"}]
  return request((`/ams/ams-base-admin/dynamic/column/save`), {
    method: 'POST',
    params,
  });
}


// 新增及保存-基金业绩注解
export async function addRpFundAnno(params) {
  // {
//   "TRpFundPerformanceAnno": {
//   "fproName": "国联安鑫悦灵活配置混合A", // 产品名称
//     "fanno": "213213", // 备注
//     "fproCode": "002368-国联安鑫悦灵活配置混合A" // 产品code
// },
//   "coreModule": "TRpFundPerformanceAnno",
//   "listModule": [
//   "TRpFundPerformanceAnno"
// ],
//   "ignoreTable": []
// }
  return request((`${serverNameContract}/RpFundAnno/add`), {
    method: 'POST',
    data: params,
  });
}
// 删除-基金业绩注解
export async function delRpFundAnno(params) {
  // {
  //   "path": "ams/yss-contract-server/RpFundAnno/delete",
  //   "methodName": "POST",
  //   "linkId": "a878187fa60744f895b58fd979194864",
  //   "contentType": 2,
  //   "queryParams": [
  //   {
  //     "code": "ids",
  //     "value": "1668567498237739"
  //   }
  // ]
  // }
  ///api/amc-datalink-server/data-view/query/http
  return request((`${serverNameDataList}/data-view/query/http`), {
    method: 'POST',
    data: params,
  });
}

// /ams/ams-base-admin/dynamic/column/list
export async function getColums(data) {
  return request((`${serverNameColums}/dynamic/column/list`), {
    data,
  });
}

// 列表
export async function getDataList(data) {
  // {
  //   "path": "/ams/yss-contract-server/RpFundAnno/RpFundAnnos",  // 来源 固定
  //   "methodName": "POST",  // 方法，固定
  //   "linkId": "a878187fa60744f895b58fd979194864", // 来源 路径，可以对此项作配置设置
  //   "contentType": 2,  // 未知
  //   "queryParams": [
  //   {
  //     "code": "currentPage",
  //     "value": 1
  //   },
  //   {
  //     "code": "pageSize",
  //     "value": 10
  //   }
  // ]
  // }

  // 删除流程
  // {
  //   "path": "/ams/yss-contract-server/businessArchive/deleteOne",
  //   "methodName": "GET",
  //   "linkId": "a878187fa60744f895b58fd979194864",
  //   "contentType": 2,
  //   "queryParams": [
  //   {
  //     "code": "contractId",
  //     "value": "582528acbff149a488cb810f491e5dfa"
  //   }
  // ]
  // }

  return request((`${serverNameDataList}/data-view/query/http`), {
    method: 'POST',
    data,
  });
}

// 查看详情
export async function getListItemDetail(data) {
  // {
  // coreModule:TRpFundPerformanceAnno // 各页会不同
  // type:view
  // id:1668423289420845
  // }
  return request((`${serverNameContract}/RpFundAnno/getById`), {
    data,
  });
}

// 新增页面产品名称
export async function addPageOptionsData(data) {
  //   "viewId": "yss3FEEF95F8CA3333FC9D22C4E5733345F", // 基金业绩备注，加载产品
  // 流程
  //   "viewId": "yss4A5EE172F340EB6DC3E5551F0848B9A0", // 加载产品
  //   "viewId": "yssF5E7DAB365DBBA096331DED5C47F0381", // 加载托管人
  // {
  //   "viewId": viewId,
  // queryParams: [{"type": 0, "code": "id", "required": 1, "value": ""}]
  //   "authStationAndUsers": []
  // }

  return request((`/api/amc-datalink-server/data-link/process/internal-query`), {
    method: 'POST',
    data,
  });
}
// optionsData，获取产品下拉列表
export async function queryOptionsData(data) {
  // {
  //   "path": "/ams/yss-contract-server/RpFund/fuzzyQueryByName",
  //   "methodName": "POST",
  //   "linkId": "a878187fa60744f895b58fd979194864",
  //   "contentType": 2,
  //   "queryParams": [
  //   {
  //     "code": "keyWords",
  //     "value": ""
  //   },
  //   {
  //     "code": "currentPage"
  //   },
  //   {
  //     "code": "pageSize"
  //   }
  // ]
  // }


  return request((`${serverNameDataList}/data-view/query/http`), {
    method: 'POST',
    data,
  });
}

// 获取流程数据
export function getStageCell(params) {
  return request.post(`${uri}/controlCell/getStageCell?proCode=${params.proCode}`);
}

// 新增submit
export function submitNewProcess(data) {
  // {
  //   "id": "", // 修改时的id
  //   "TContractBusinessArchive": {
  //   "custodian": [  // 托管人
  //     "20221130092435779642",
  //     "20221130092435779562"
  //   ],
  //     "proCode": [  // 产品名称
  //     "090008"
  //   ],
  //     "type": "none", // 是否全选
  //     "useTemplate": "0", // 是否优先使用模板
  //     "financialDate": "2022-12-07", // 财务日期
  //     "expiryDate": "2022-12-08",  // 截至日期
  //     "disclosureDate": "2022-12-09", // 披露日期
  //     "directoryNames": [
  //     "填充-产品名称"
  //   ],
  //     "yesOrNo": "0"
  // },
  //   "coreModule": "TContractBusinessArchive", // 核心模块
  //   "listModule": [
  //   ""
  // ],
  //   "ignoreTable": [
  //   ""
  // ],
  //   "updateType": "1",   // 1 新增？
  //   "currentNode": "chief",  // 创建
  //   "fileData": "",
  //   "type": "none"
  // }
  return request((`/yss-contract-server/businessArchive/businessArchiveAllUpdateSubmit`), {
    method: 'POST',
    data,
  });
}

// 点击新增后加载的东西
export async function addNewPreData(data) {
  // id: 4028e9c1804ed6ec0180a682ebe50000
  return request((`${serverNameDataList}/data-view/query/http`), {
    method: 'GET',
    data,
  });
}
//
export async function getListPreData(data) {
  // page:1
  // limit:10
  // ids:020686d9-96d9-4fe1-bff9-76361e4be026
  return request((`/api/portal-manage-server/application/list`), {
    method: 'GET',
    data,
  });
}

export async function getTaskData(data) {
  // page:1
  // limit:10
  // ids:020686d9-96d9-4fe1-bff9-76361e4be026
  return request((`/yss-contract-server/businessArchive/getTask`), {
    method: 'GET',
    data,
  });
}

export async function getServiceCdn() {
  // 获取serviceCdn
  return request(`/ams-file-service/businessArchive/getnginxip`);
}

export async function getProNameByProCode(data) {
  // 获取已选产品 ?proCode=010345
  return request(`/ams/yss-contract-server/RpProduct/getProNameByProCode`, {
    method: 'GET',
    data
  });
}
export async function getProcessInfoByInstanceId(data) {
  // 通过流程实例ID，查找流程相关信息
  const urlParams = data.urlParams;
  // &variableNames=PROCESS_INITIATE_USER_NAME&variableNames=PROCESS_START_TIME&variableNames=PROCESS_NAME
  return request(`/api/yss-base-billows/variable-query/history/process-id/names${urlParams}`,
    {
      method: 'GET',
      data: {
        processInstanceId: data.processInstanceId,
      }
    });
}

export async function getDirectoryVoListByChangxiekeyInFlow(data) {
  // 获取流程中标签列表
  // changxieKey: 1212113817129220294   // formData.fileData 拿
  // isTransacting:true  // 未知
  return request(`/yss-contract-server/directory/selectDirectoryVoListByChangxiekeyInFlow`, {
    method: 'GET',
    data
  });
}
export async function getChangXieKey(data) {
  // 获取畅写标签列表,，该列表没有同步到右侧标签列表中
  // changxieKey: 1212113817129220294   // formData.fileData 拿
  // orgId: 2  // 组织 Id
  return request(`/ams/yss-contract-server/data/selectByKey`, {
    method: 'GET',
    data
  });
}
export async function completeTask(data) {
  // {
  //   "files": [],
  //   "formData": {
  //   "TContractBusinessArchive": {
  //     "custodian": [],
  //       "proCode": [
  //       "010345"
  //     ],
  //       "financialDate": "2022-12-13",
  //       "expiryDate": "2022-12-13",
  //       "disclosureDate": "2022-12-13",
  //       "yesOrNo": "0"
  //   },
  //   "coreModule": "TContractBusinessArchive",
  //     "listModule": [
  //     ""
  //   ],
  //     "ignoreTable": [
  //     ""
  //   ],
  //     "processId": "c054d6d3b36b4dfc84965064169f59c5",
  //     "job": "19",
  //     "fileData": {
  //     "fileName": "华泰柏瑞成长智选混合型证券投资基金招募说明书更新(2022年第3号).docx",
  //       "fileFormat": "docx",
  //       "fileSerialNumber": "1213113816369605351"
  //   },
  //   "updateType": "0",
  //     "returnedTags": "",
  //     "id": "f057b0e82fd6445d990b5d309da3d3c0",
  //     "taskDefinitionKey": "Activity_04g8lqd",
  //     "processInstanceId": "851acd7a-7a97-11ed-b6b1-1636d6aaf527"
  // },
  //   "taskId": "888d86e3-7a97-11ed-b6b1-1636d6aaf527",
  //   "editMarks": {}
  // }
  return request(`/api/billow-diplomatic/todo-task/complete-task`, {
    method: 'POST',
    data
  });
}


export async function getNodeListByPositionIdList(data) {
  // 获取返回列表
  // positionIdList: 19
  return request(`/yss-contract-server/baseContract/getNodeListByPositionIdList`, {
    method: 'GET',
    data
  });
}
export async function multitaskingReject(data) {
  // 退回
  // {
  //   "files": [],
  //   "formData": {
  //   "TContractBusinessArchive": {
  //     "custodian": [],
  //       "proCode": [
  //       "010345"
  //     ],
  //       "financialDate": "2022-12-01",
  //       "expiryDate": "2022-12-01",
  //       "disclosureDate": "2022-12-01",
  //       "yesOrNo": "0"
  //   },
  //   "coreModule": "TContractBusinessArchive",
  //     "listModule": [
  //     ""
  //   ],
  //     "ignoreTable": [
  //     ""
  //   ],
  //     "processId": "c054d6d3b36b4dfc84965064169f59c5",
  //     "jianchajiheyijian": "已办理",
  //     "job": "19", // 当前job
  //     "fileData": {
  //     "fileSerialNumber": "1219221419638958531",
  //       "fileName": "华泰柏瑞成长智选混合型证券投资基金招募说明书更新(2022年第2号).docx",
  //       "fileFormat": "docx"
  //   },
  //   "updateType": "0", // 未知
  //     "id": "987fb89ee8114e0dbb45b876fc41633d",
  //     "returnedTags": "[\"59009884\"]" // 退回标签列表
  // },
  //   "taskId": "d3664a53-803d-11ed-9a00-125db8f6da49",
  //   "editMarks": {},
  //   "job": "19", // 当前job
  //   "executionId": "d3655fbf-803d-11ed-9a00-125db8f6da49"
  // }
  return request(`/yss-contract-server/businessArchive/multitaskingReject`, {
    method: 'POST',
    data
  });
}
