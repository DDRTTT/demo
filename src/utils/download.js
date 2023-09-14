/**
 * 文件下载
 * @param url
 * @param options -object
 * {method:'POST'/'PUT', --请求类型
 *  boby:Object          ———请求参数
 *  name:string          ---文件名称
 * }
 * add  xuning 20181012
 */
import { getAuthToken } from '@/utils/session';
import { message } from 'antd';
import { stringify } from 'qs';

export function download(url, options = '') {
  let openurl = url;
  const newOptions = { ...options };
  let fileName = options;
  newOptions.headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Token: getAuthToken(),
    Data: new Date().getTime(),
    Sys: 0,
  };
  if (options.method == 'POST' || options.method == 'PUT') {
    newOptions.method = options.method;
    newOptions.body = JSON.stringify(options.body);
  } else if (options.method == 'GET') {
    openurl = `${url}${stringify(options.body)}`;
    newOptions.body = null;
  } else {
    openurl = `${url}&token=${getAuthToken()}`;
  }

  fetch(openurl, newOptions)
    .then(res => {
      // window.atob()--Base64解码   window.btoa()--Base64编码
      if (options instanceof String) {
        return res.blob();
      }
      if (options.name !== '' && options.name !== undefined) {
        fileName = options.name;
        return res.blob();
      }
      const result = res.headers.get('content-disposition');
      if (result) {
        const para = getParameters(result);
        fileName = decodeURI(window.atob(para.get('fileName')));
      }
      // 切割出文件名
      const fileNameEncode = res.headers.get('content-disposition').split('filename=')[1]
      // 解码
      fileName = decodeURIComponent(fileNameEncode)
      return res.blob();
    })
    .then(blob => {
      try {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a); // --火狐不支持直接点击事件
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        message.success('请求成功 开始下载')
      } catch (e) {
        message.error('下载服务异常，请稍后再试!');
        throw e;
      }
    })
    .catch(error => {
      throw error;
    });
}

export function downloadNoToken(url, options = '') {
  let openurl = url;
  const newOptions = { ...options };
  let fileName = options;
  newOptions.headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Token: getAuthToken(),
    Data: new Date().getTime(),
    Sys: 0,
  };
  if (options.method == 'POST' || options.method == 'PUT') {
    newOptions.method = options.method;
    newOptions.body = JSON.stringify(options.body);
  } else if (options.method == 'GET') {
    openurl = `${url}${stringify(options.body)}`;
    newOptions.body = null;
  }

  fetch(openurl, newOptions)
    .then(res => {
      // window.atob()--Base64解码   window.btoa()--Base64编码
      if (options instanceof String) {
        return res.blob();
      }
      if (options.name !== '' && options.name !== undefined) {
        fileName = options.name;
        return res.blob();
      }
      const para = getParameters(res.headers.get('content-disposition'));
      fileName = decodeURI(window.atob(para.get('fileName')));
      return res.blob();
    })
    .then(blob => {
      try {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a); // --火狐不支持直接点击事件
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (e) {
        message.error('下载服务异常，请稍后再试!');
        throw e;
      }
    })
    .catch(error => {
      throw error;
    });
}

export function getParameters(e) {
  const array = e.split(';');
  const parameter = new Map();
  for (const i of array) {
    if (i.indexOf('=') > 0) {
      parameter.set(i.slice(0, i.indexOf('=')), i.slice(i.indexOf('=') + 1));
    }
  }
  return parameter;
}

/**
 * pdf,jpg...     新页面预览
 * @param url
 * @param options -object
 * {
 *  method:'POST'/'GET', --请求类型
 *  boby:Object          ———请求参数
 * }
 * add  xuning 20181012
 */
export function windowOpenURL(URL, options) {
  if (options !== undefined) {
    if (options.method == 'POST') {
      const temp_form = document.createElement('form');
      // temp_form.token= getAuthToken();
      temp_form.action = URL;
      temp_form.target = '_blank';
      temp_form.method = 'post';
      temp_form.style.display = 'none';

      // 添加参数
      const parameter = options.boby;
      for (const item in parameter) {
        const opt = document.createElement('textarea');
        opt.name = item;
        opt.value = parameter[item];
        temp_form.appendChild(opt);
      }

      // let token = document.createElement("textarea");
      // token.name = 'token';
      // token.value = getAuthToken();
      // temp_form.appendChild(token);

      document.body.appendChild(temp_form);
      // 提交数据
      temp_form.submit();
    } else if (options.method == 'GET') {
      window.open(`${URL}?${stringify(options.body)}` + `&token=${getAuthToken()}`);
    }
  } else {
    window.open(`${URL}&token=${getAuthToken()}`);
  }
}

// 预览
export function filePreview(url, options = '') {
  const newOptions = { ...options };
  let fileName;
  newOptions.headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Token: getAuthToken(),
    Data: new Date().getTime(),
    Sys: 0,
  };

  fetch(url, newOptions)
    .then(res => {
      if (options.name !== '' && options.name !== undefined) {
        fileName = options.name;
        return res.blob();
      }
      const para = getParameters(res.headers.get('content-disposition'));
      fileName = decodeURI(window.atob(para.get('fileName')));
      return res.blob();
    })
    .then(blob => {
      try {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        window.open(url);
        window.URL.revokeObjectURL(url);
      } catch (e) {
        message.error('下载服务异常，请稍后再试!');
        throw e;
      }
    })
    .catch(error => {
      throw error;
    });
}


/**
 * json导出txt
 * @param {any} data JSON结构
 * @param {string} filename  导出的文件名
 */
export function json2txt(data, filename, contentTye = 'text/plain') {
  try {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${contentTye};charset=utf-8,` + JSON.stringify(data, null, 2));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    element.click();
  } catch (e) {
    message.error('下载服务异常，请稍后再试!');
    throw e;
  }
}

// 文件流转blob对象下载
export function downloadFile(data, fileName, type) {
  try {
    let blob = new Blob([data], { type: type });
    // 获取heads中的filename文件名
    let downloadElement = document.createElement('a');
    // 创建下载的链接
    let href = window.URL.createObjectURL(blob);
    downloadElement.href = href;
    // 下载后文件名
    downloadElement.download = fileName;
    document.body.appendChild(downloadElement);
    // 点击下载
    downloadElement.click();
    // 下载完成移除元素
    document.body.removeChild(downloadElement);
    // 释放掉blob对象
    window.URL.revokeObjectURL(href);
  } catch (e) {
    message.error('下载服务异常，请稍后再试!');
    throw e;
  }
}

// 预览
export function filePreviewWithBlobUrl(url, cb) {
  fetch(url)
    .then(res => {
      return res.blob();
    })
    .then(blob => {
      try {
        const blobUrl = window.URL.createObjectURL(blob);
        cb(blobUrl);
        window.URL.revokeObjectURL(blobUrl);
      } catch (e) {
        message.error('下载服务异常，请稍后再试!');
        throw e;
      }
    })
    .catch(error => {
      throw error;
    });
}
export function actionDownload (href, filename) {
  const aLink = document.createElement('a');
  aLink.href = href;
  aLink.style.display = 'none';
  if (filename) {
    aLink.setAttribute('download', filename);
  } else {
    aLink.download = '';
  }

  let event;
  if (window.MouseEvent) {
    event = new MouseEvent('click');
    message.success(`下载成功`)
  } else {
    event = document.createEvent('MouseEvent');
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
  }
  aLink.dispatchEvent(event);
  URL.revokeObjectURL(aLink.href);
  return Promise.resolve()
}
