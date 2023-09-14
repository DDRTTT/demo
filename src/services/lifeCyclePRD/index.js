import { stringify } from 'qs';
import request from '@/utils/request';

const uri = '/ams-file-service';

// 生命周期树形
export async function handleGetTreeAPI() {
  return request(`/yss-lifecycle-flow/ownfunds/productTree`);
}
// 列表信息
export async function handleGetListAPI(params) {
  return request(`${uri}/businessArchive/selectElectronicFile`, {
    method: 'POST',
    data: params,
  });
}
// 文档版本列表信息
export async function handleGetVersionListAPI(params) {
  return request(`${uri}/businessArchive/selectFileVersion`, {
    method: 'POST',
    data: params,
  });
}
// 同步个人管理--保存个性化文件信息
export async function handlesaveTagsListAPI(params) {
  return request(`${uri}/attachedbusiness/moveFile`, {
    method: 'POST',
    data: params,
  });
}
// 流转历史列表信息
export async function handleGetRecordListAPI(params) {
  return request(`${uri}/businessArchive/sselectFileHistory?${stringify(params)}`);
}
// 档案大类
export async function handleGetDocumentBigTypeAPI() {
  return request(`/ams-base-parameter/fileType/queryArchives`);
}
// 文档类型
export async function handleGetDocumentTypeAPI(params) {
  return request(`/ams-base-parameter/fileType/queryDocType/old?${stringify(params)}`);
}
// 明细分类
export async function handleBreakdownAPI() {
  return request(`/ams-base-parameter/fileType/query/file-type-list/map`, {
    method: 'POST',
    data: {},
  });
}
// 查询档案大类/文档类型对应子目录
export async function handleGetChildListAPI(params) {
  return request(`/ams-base-parameter/fileType/queryDocType/old/list`, {
    method: 'POST',
    data: params,
  });
}
// 根据档案大类查询明细分类
export async function handleGetFileTypeByDocAPI(params) {
  return request(`/ams-base-parameter/fileType/queryFileTypeByArchList/old/list`, {
    method: 'POST',
    data: params,
  });
}
// 标签
export async function handleTagsAPI() {
  return request(`${uri}/businessArchive/getPersonLabel`);
}
/**************************************************** */
// 个性化树形
export async function handleGetPersonalTreeAPI() {
  return request(`${uri}/businessArchive/personalTree`);
}
// 个性化树，添加修改
export async function handleAddTreeAPI(params) {
  return request(`${uri}/attachedbusiness/updateById`, {
    method: 'POST',
    data: params,
  });
}
// 个性化树删除
export async function handleDeleteTreeAPI(params) {
  return request(`${uri}/attachedbusiness/deleteByIds`, {
    method: 'POST',
    data: params,
  });
}
// 个性化列表
export async function handleGetPersonalListAPI(params) {
  return request(`${uri}/businessArchive/selectPersonalFile`, {
    method: 'POST',
    data: params,
  });
}
// 批量删除个性化列表文件
export async function handleDeletePersonalListAPI(params) {
  return request(`${uri}/attachedbusiness/deleteGroupById`, {
    method: 'POST',
    data: params,
  });
}
// 列表文件修改标签
export async function handleUpdatePersonalTagAPI(params) {
  return request(`${uri}/attachedbusiness/updateLabelById`, {
    method: 'POST',
    data: params,
  });
}

// 上传人
export async function handleGetPersonAPI() {
  return request(`/yss-base-admin/user/getperson`);
}
/******************************************************* */

// 产品树
export async function handleGetProductTreeAPI() {
  return request(`${uri}/businessArchive/lifeTree`);
}
// 产品树的子节点查询
export async function handleGetProductTreeNodesAPI(params) {
  return request(`${uri}/businessArchive/lifeTree/getSecNodes?${stringify(params)}`);
}
