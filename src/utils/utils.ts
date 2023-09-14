import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { Route } from '@/models/connect';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends Route>(
  router: T[] = [],
  pathname: string,
): T | undefined => {
  const authority = router.find(
    ({ routes, path = '/' }) =>
      (path && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export const getRouteAuthority = (path: string, routeData: Route[]) => {
  let authorities: string[] | string | undefined;
  routeData.forEach(route => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      }
      // exact match
      if (route.path === path) {
        authorities = route.authority || authorities;
      }
      // get children authority recursively
      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

export function uuid() {
  let s: any = [];
  let hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  return s.join('');
}

// 截取url中指定的参数值
export const getUrlParams = (name: any) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const param = window.location.search.substr(1).match(reg);
  return param && param[2];
};

// 根据文件后缀名返回畅写编辑器 documentType 属性值
export const getDocumentType = (ext: string) => {
  if (
    '.doc.docx.docm.dot.dotx.dotm.odt.fodt.ott.rtf.txt.html.htm.mht.pdf.djvu.fb2.epub.xps'.indexOf(
      ext,
    ) !== -1
  )
    return 'text';
  if ('.xls.xlsx.xlsm.xlt.xltx.xltm.ods.fods.ots.csv'.indexOf(ext) !== -1) return 'spreadsheet';
  if ('.pps.ppsx.ppsm.ppt.pptx.pptm.pot.potx.potm.odp.fodp.otp'.indexOf(ext) !== -1)
    return 'presentation';
  return null;
};

//获得年月日时分秒
//传入日期//例：2020-10-27T14:36:23
export function timeFormatSeconds (time: any) {
  let d = time ? new Date(time) : new Date();
  let year: number|string = d.getFullYear();
  let month: number|string = d.getMonth() + 1;
  let day: number|string = d.getDate();
  let hours: number|string = d.getHours();
  let min:number|string = d.getMinutes();
  let seconds:number|string = d.getSeconds();

  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  if (hours < 0) hours = '0' + hours;
  if (min < 10) min = '0' + min;
  if (seconds < 10) seconds = '0' + seconds;
  return (year + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + seconds);
}

// @ts-ignore
export const arrayFindDeep = (arr = [], key:any, value:any) => {
  if (Array.isArray(arr)) {
    for (let i = arr.length - 1; i >= 0; --i) {
      const item = arr[i];
      if (item[key] === value) {
        return item;
      }
      // @ts-ignore
      if (item.children) {
        // @ts-ignore
        const menu = arrayFindDeep(item.children, key, value);
        if (menu) {
          return menu;
        }
      }
    }
  }
};

/**
 * 删除没用的属性
 *
 * @var  {[object]} obj
 */
export const deletNUllProperty = (obj:any) => {
  for (const key in obj) {
    if (
      String(obj[key]).length <= 0 ||
      JSON.stringify(obj) === '{}' ||
      typeof obj === 'undefined' ||
      obj == null
    ) {
      delete obj[key];
    }
  }
};
