import { stringify } from 'qs';
import request from '../utils/request';
import * as type from './type';

const uri = '/yss-contract-server';

// 获取下一级节点
export async function getChildNode(pams) {
  return request(`/ams-base-parameter/fileTypeInfo/selListByParentIdAndPurpose?${stringify(pams)}`);
}

// 获取下拉列表(文件性质)
export async function getDropdownData(pams) {
  return request(`/ams-base-parameter/fileTypeInfo/selAllTreeByPurposeForVo?${stringify(pams)}`);
}

// 模板查询
export async function templateQuery(pams) {
  return request(`/ams-file-service/template/oftentemplate?${stringify(pams.par)}`, {
    method: 'POST',
    data: pams.body,
  });
}

// 获取文件存放路径
export async function getFilePathByCode(pams) {
  return request(`${uri}/contractfile/getfilebycode?${stringify(pams)}`);
}

// 删除模板
export async function delTemplate(pams) {
  return request(`/ams-file-service/businessArchive/deleteFile`, {
    method: 'POST',
    data: pams,
  });
}

// 删除模板时同步删除掉模板中的标签数据
export async function delTagData(pams) {
  return request(`${uri}/directory/deleteByChangxieKey?${stringify(pams)}`);
}

// 获取类目
export async function getCategoryData(pams) {
  return request(`/ams-base-parameter/fileTypeInfo/selListByParentIdAndPurpose?${stringify(pams)}`);
}

// 校验文件名
export async function checkTemplateName(pams) {
  return request(`/ams-file-service/template/checkthere`, {
    method: 'POST',
    data: pams,
  });
}
// 获取流程
export async function getProcedure() {
  return request(`/api/billow-diplomatic/pending-task/all-process-name`)
}
