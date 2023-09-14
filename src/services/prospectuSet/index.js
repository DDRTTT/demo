import request from '@/utils/request';
// 服务名
const [yssContractServer, amsFileService, amcDatalinkServer, billowDiplomatic] =
  ['/yss-contract-server', '/ams-file-service', '/amc-datalink-server', '/billow-diplomatic'];
// yssContractServer
// 根据机构id list,查询产品list
export async function getProductList(data) {
  return request(`${yssContractServer}/RpProductOrg/queryByOrgId`, {
    method: 'post',
    data,
  });
}

//没有托管人时查询产品名称
export async function getProList(data) {
  return request(`${yssContractServer}/RpProductOrg/queryByOrgIdAndKeyWords`, {
    method: 'post',
    data,
  });
}
// 查询产品list
export async function getAllProductList(data) {
  return request(`${yssContractServer}/RpProduct/queryAllByCondition`, {
    method: 'post',
    data,
  });
}
// 1.根据机构类型code查询机构list
export async function getCustodianList() {
  return request(`${yssContractServer}/RpOrg/queryByOrgType/OT001`, {
    method: 'get',
  });
}
// 获取智能模型数据（业务数据）
export async function getBusinessData(params) {
  return request(`${yssContractServer}/RpTemplate/findAllRecruitmentBusiness`, {
    method: 'get',
    params,
  });
}
// 获取标签与业务要素的关联关系
export async function getMapping(params) {
  return request(`${yssContractServer}/data/selectByKey`, {
    method: 'get',
    params,
  });
}
// 保存文档中的标签
export async function saveTpltags(data, str) {
  return request(`${yssContractServer}/directory/add?${str}`, {
    method: 'post',
    data,
  });
}
//一键配置标签权限与映射
export async function setAuthorize(params) {
  return request( `${yssContractServer}/RpTemplate/insertControlAndFormByStandardTemplateNew`,{
    method: 'get',
    params
  });
}
// 查询权限设置列表
export async function getStaffList(params) {
  return request(`${yssContractServer}/directory/selectDirectoryVoListByChangxiekey`, {
    method: 'get',
    params,
  });
}
// 如果文档没有入库 清理掉文档上的标签信息
export async function deleteByChangxieKey(params) {
  return request(`${yssContractServer}/directory/deleteByChangxieKey`, {
    method: 'get',
    params,
  });
}
// 保存标签与业务要素之间的关系
export async function saveTagContent(data) {
  return request(`${yssContractServer}/data/add`, {
    method: 'post',
    data,
  });
}
//一键配置标签权限与映射
// export async function setAuthorize(params) {
//   return request( `${yssContractServer}/RpTemplate/insertControlAndFormByStandardTemplate`,{
//     method: 'get',
//     params
//   });
// }
// 保存标签权限
export async function staffSave(data) {
  return request(`${yssContractServer}/directorycontrol/update`, {
    method: 'put',
    data,
  });
}
// 获取已经设置过的权限
export async function getByOrgId(params) {
  return request(`${yssContractServer}/contractuser/getbyorgid`, {
    method: 'get',
    params,
  });
}
export async function getAll(params) {
  return request(`/yss-base-admin/positionInfo/getAll`, {
    method: 'get',
    params,
  });
}
// 复制模版
export async function copyTemplate(params) {
  return request(`${yssContractServer}/baseContract/addTemplate`, {
    method: 'get',
    params,
  });
}
// 根据招募说明书id获取流程信息
// http://192.168.105.46:18289/businessArchive/businessArchiveHistory?id=f6435fa4045d400a9eaca54fba024bd7
export async function getProcessInfo(params) {
  return request(`${yssContractServer}/businessArchive/businessArchiveHistory`, {
    method: 'get',
    params,
  });
}
// export async function getProcessHistory(params) {
//   return request(`/api${billowDiplomatic}/todo-task/processInfo`, {
//     method: 'get',
//     params,
//   });
// }
export async function getBusinessArchiveListProcessInfo(data) {
  return request(`${yssContractServer}/businessArchive/getBusinessArchiveListProcessInfo`, {
    method: 'post',
    data,
  });
}
export async function approveContractBusinessArchive(data) {
  return request(`${yssContractServer}/businessArchive/approveContractBusinessArchive`, {
    method: 'post',
    data,
  });
}
// 招募说明书看板右侧列删除按钮
// http://localhost:18289/businessArchive/deleteOne?contractId=aa7e4e6a717b425aa6432a5fb2255cee
export async function delBusinessArchive(params) {
  return request(`${yssContractServer}/businessArchive/deleteOne`, {
    method: 'get',
    params,
  });
}

// amsFileService
// 获取畅写编辑器服务器地址信息
export async function getNginxIP(params) {
  return request(`${amsFileService}/businessArchive/getnginxip`, {
    method: 'get',
    params,
  });
}
// 获取模板列表信息
export async function getTplList(data) {
  return request(`${amsFileService}/template/queryAllSettingTemplate`, {
    method: 'post',
    data,
  });
}

export async function getBaseList(data) {
  return request(`${amsFileService}/template/getStandardTemplate`, {
    method: 'get',
    data,
  });
}
// 根据产品代码获取指定模版的流水号
export async function getTplInfo(params) {
  return request(`${amsFileService}/template/getTemplateByProCode`, {
    method: 'get',
    params,
  });
}
// 获取畅写编辑器sdk服务器IP地址
export async function getNginxIp(params) {
  return request(`${amsFileService}/businessArchive/getnginxip`, {
    method: 'get',
    params,
  });
}
// 如果文档没有入库 清理掉文档上的标签信息
export async function getCountByChangxieKey(params) {
  return request(`${amsFileService}/template/getCountByChangxieKey`, {
    method: 'get',
    params,
  });
}
// // 保存模板
// export async function saveTemplate(data) {
//   return request(`${amsFileService}/template/add`, {
//     method: 'post',
//     data,
//   });
// }
// 保存模板
export async function saveTemplate(data) {
  return request(`${amsFileService}/template/addRpTemplate`, {
    method: 'post',
    data,
  });
}
// // http://localhost:18024/template/checked?id=614 
// // http://localhost:18024/template/unChecked?id=614
// export async function auditTpl(params, doAudit) {
//   return request(`${amsFileService}/template/${doAudit}`, {
//     method: 'get',
//     params,
//   });
// }
export async function auditTpls(data, doAudit) {
  return request(`${amsFileService}/template/${doAudit}`, {
    method: 'post',
    data,
  });
}

export async function dictsInfo(data) {
  return request(`/api${amcDatalinkServer}/data-link/process/internal-query`, {
    method: 'post',
    data,
  });
}
// 标准书模板核对
export async function baseCompare(data) {
  return request(`${yssContractServer}/RpTemplate/standardTemplateCompare`, {
    data,
    method: 'post',
  });
}
export async function getTask(id) {
  return request( `/api/yss-base-billows//variable-query/history/map/process-id/${id}`,{
    method: 'get'
  });
}