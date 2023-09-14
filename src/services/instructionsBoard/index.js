import request from '@/utils/request';
import {stringify} from "qs";
const uri = '/ams-file-service';
// 服务名
const [yssConteactServer, amsFileService] = ['/yss-contract-server', '/ams-file-service'];


export async function getInstructionsBoardList(data) {
  return request(`${yssConteactServer}/businessArchive/queryBusinessArchiveList`, {
    method: 'post',
    data,
  });
}

export async function getContractById(params) {
  return request(`${yssConteactServer}/businessArchive/businessArchiveHistory?${stringify(params)}`);
}


export async function updateState(params) {
  return request(`${yssConteactServer}/businessArchive/updateState?${stringify(params)}`);
}
// 获取畅写编辑器服务器地址信息
export async function getNginxIP(params) {
  return request(`${amsFileService}/businessArchive/getnginxip`, {
    method: 'get',
    params,
  });
}
// 清稿后替换原来的文档
export async function insteadWord(params) {
  return request(`${yssConteactServer}/RpTemplate/updateRemoteFileByUrl`, {
    method: 'get',
    params
  });
}




