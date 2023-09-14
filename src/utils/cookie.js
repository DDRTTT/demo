const AUTH_TOKEN = 'auth_token';
const TOKEN_TIME = 'token_time';
const ONCLICK_TIME = 'ONCLICK_TIME';
const YYS_ORGID = 'yys_orgid';
const YSS_ORGNAME = 'yss_orgname';
const NOUNT_TYPE = 'nount_type';
const LOGIN_ORG = 'login_org';
export const CHECK_TIME = 60; // 分钟

/**
 * 登录机构-保存登录机构的标识
 * * */
export function setLoginOrg(LoginOrg) {
  sessionStorage.setItem(LOGIN_ORG, LoginOrg);
}

/**
 * 登录机构-获取登录机构的标识
 * * */
export function getLoginOrg() {
  return sessionStorage.getItem(LOGIN_ORG);
}

/**
 * 投资人版本-设置全局的机构id
 * * */
export function setYssOrgId(YssOrgId) {
  sessionStorage.setItem(YYS_ORGID, YssOrgId);
}

/**
 * 投资人版本-获取全局的机构id
 * * */
export function getYssOrgId() {
  return sessionStorage.getItem(YYS_ORGID);
}

/**
 * 投资人版本-移除全局的机构id
 * * */
export function removeYssOrgId() {
  sessionStorage.removeItem(YYS_ORGID);
}

/**
 * 投资人版本-设置全局的机构名称
 * * */
export function setYssOrgName(YssOrgName) {
  sessionStorage.setItem(YSS_ORGNAME, YssOrgName);
}

/**
 * 投资人版本-获取全局的机构名称
 * * */
export function getYssOrgName() {
  return sessionStorage.getItem(YSS_ORGNAME);
}

/**
 * 投资人版本-移除全局的机构名称
 * * */
export function removeYssOrgName() {
  sessionStorage.removeItem(YSS_ORGNAME);
}

/**
 * 保存登录标识
 * * */
export function setNountType(NountType) {
  sessionStorage.setItem(NOUNT_TYPE, NountType);
}

/**
 * 获取登录标识
 * * */
export function getNountType() {
  return sessionStorage.getItem(NOUNT_TYPE);
}

/**
 * 移除登录标识
 * * */
export function removeNountType() {
  sessionStorage.removeItem(NOUNT_TYPE);
}

/**
 * 设置权限验证token
 * @param token
 */
export function setAuthToken(token) {
  sessionStorage.setItem(AUTH_TOKEN, token);
}

/**
 * 获得全选验证token
 */
export function getAuthToken() {
  return sessionStorage.getItem(AUTH_TOKEN);
}

// 移除
export function removeAuthToken() {
  sessionStorage.removeItem(TOKEN_TIME);
  sessionStorage.removeItem(AUTH_TOKEN);
}

export function getLassTime() {
  return sessionStorage.getItem(ONCLICK_TIME);
}

export function setLassTime() {
  const currentTime = new Date().getTime();
  sessionStorage.setItem(ONCLICK_TIME, currentTime);
}

export function checkUserActionTime() {
  const currentTime = new Date().getTime();
  const lastTime = getLassTime();
  const timeDiffer = currentTime - lastTime;
  return timeDiffer > 60 * CHECK_TIME * 1000;
}
