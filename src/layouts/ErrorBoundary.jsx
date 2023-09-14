import React, { PureComponent } from 'react';
import { Button } from 'antd';
// 引入需要用到的图片
import chatou from '@/assets/ErrorBoundary/chazuo.png'; // 插头图片
import weixing from '@/assets/ErrorBoundary/weixing.png'; // 卫星图片
import wangyuegif from '@/assets/ErrorBoundary/wangyue.GIF'; // 望月动态图
import styles from './ErrorBoundary.less';

/**
 * 异常处理监控
 * 错误收集
 */
export function errorBoundary(WrappedComponent) {
  return class ER extends PureComponent {
    state = { hasError: false };

    componentDidCatch(error, info) {
      this.setState({ hasError: true });

      const BrowserMatch = {
        init() {
          this.browser = this.getBrowser().browser || '未知浏览器'; // 获取浏览器名
          this.version = this.getBrowser().version || '未知浏览器版本号'; // 获取浏览器版本
          this.OS = `${this.getOS()} ${this.getDigits()}` || '未知操作系统'; // 系统版本号
        },
        getOS() {
          // 判断所处操作系统
          const sUserAgent = navigator.userAgent.toLowerCase();

          const isWin =
            navigator.platform === 'Win32' ||
            navigator.platform === 'Win64' ||
            navigator.platform === 'wow64';

          const isMac =
            navigator.platform === 'Mac68K' ||
            navigator.platform === 'MacPPC' ||
            navigator.platform === 'Macintosh' ||
            navigator.platform === 'MacIntel';
          if (isMac) return 'Mac';
          const isUnix = navigator.platform === 'X11' && !isWin && !isMac;
          if (isUnix) return 'Unix';
          const isLinux = String(navigator.platform).indexOf('Linux') > -1;
          const bIsAndroid = sUserAgent.toLowerCase().match(/android/i) === 'android';
          if (isLinux) {
            if (bIsAndroid) return 'Android';
            return 'Linux';
          }
          if (isWin) {
            const isWin2K =
              sUserAgent.indexOf('Windows nt 5.0') > -1 || sUserAgent.indexOf('Windows 2000') > -1;
            if (isWin2K) return 'Win2000';
            const isWinXP =
              sUserAgent.indexOf('Windows nt 5.1') > -1 || sUserAgent.indexOf('Windows XP') > -1;
            sUserAgent.indexOf('Windows XP') > -1;
            if (isWinXP) return 'WinXP';
            const isWin2003 =
              sUserAgent.indexOf('Windows nt 5.2') > -1 || sUserAgent.indexOf('Windows 2003') > -1;
            if (isWin2003) return 'Win2003';
            const isWinVista =
              sUserAgent.indexOf('Windows nt 6.0') > -1 || sUserAgent.indexOf('Windows Vista') > -1;
            if (isWinVista) return 'WinVista';
            const isWin7 =
              sUserAgent.indexOf('Windows nt 6.1') > -1 || sUserAgent.indexOf('Windows 7') > -1;
            if (isWin7) return 'Win7';
            const isWin8 =
              sUserAgent.indexOf('windows nt 6.2') > -1 || sUserAgent.indexOf('Windows 8') > -1;
            if (isWin8) return 'Win8';
            const isWin10 =
              sUserAgent.indexOf('windows nt 10.0') > -1 || sUserAgent.indexOf('Windows 10') > -1;
            if (isWin10) return 'Win10';
          }
          return '其他';
        },
        getDigits() {
          // 判断当前操作系统的版本号
          const sUserAgent = navigator.userAgent.toLowerCase();
          const is64 = sUserAgent.indexOf('win64') > -1 || sUserAgent.indexOf('wow64') > -1;
          if (is64) {
            return '64位';
          }
          return '32位';
        },
        getBrowser() {
          // 获取浏览器名
          const rMsie = /(msie\s|trident\/7)([\w\.]+)/;
          const rTrident = /(trident)\/([\w.]+)/;
          const rEdge = /(chrome)\/([\w.]+)/; // IE

          const rFirefox = /(firefox)\/([\w.]+)/; // 火狐
          const rOpera = /(opera).+version\/([\w.]+)/; // 旧Opera
          const rNewOpera = /(opr)\/(.+)/; // 新Opera 基于谷歌
          const rChrome = /(chrome)\/([\w.]+)/; // 谷歌
          const rUC = /(chrome)\/([\w.]+)/; // UC
          const rMaxthon = /(chrome)\/([\w.]+)/; // 遨游
          const r2345 = /(chrome)\/([\w.]+)/; // 2345
          const rQQ = /(chrome)\/([\w.]+)/; // QQ
          // var rMetasr =  /(metasr)\/([\w.]+)/;//搜狗
          const rSafari = /version\/([\w.]+).*(safari)/;

          const ua = navigator.userAgent.toLowerCase();

          let matchBS;
          let matchBS2;

          // IE 低版
          matchBS = rMsie.exec(ua);
          if (matchBS != null) {
            matchBS2 = rTrident.exec(ua);
            if (matchBS2 != null) {
              switch (matchBS2[2]) {
                case '4.0':
                  return {
                    browser: 'Microsoft IE',
                    version: 'IE: 8', // 内核版本号
                  };

                case '5.0':
                  return {
                    browser: 'Microsoft IE',
                    version: 'IE: 9',
                  };

                case '6.0':
                  return {
                    browser: 'Microsoft IE',
                    version: 'IE: 10',
                  };

                case '7.0':
                  return {
                    browser: 'Microsoft IE',
                    version: 'IE: 11',
                  };

                default:
                  return {
                    browser: 'Microsoft IE',
                    version: 'Undefined',
                  };
              }
            } else {
              return {
                browser: 'Microsoft IE',
                version: `IE:${matchBS[2]}` || '0',
              };
            }
          }
          // IE最新版
          matchBS = rEdge.exec(ua);
          if (matchBS != null && !window.attachEvent) {
            return {
              browser: 'Microsoft Edge',
              version: `Chrome/${matchBS[2]}` || '0',
            };
          }
          // UC浏览器
          matchBS = rUC.exec(ua);
          if (matchBS != null && !window.attachEvent) {
            return {
              browser: 'UC',
              version: `Chrome/${matchBS[2]}` || '0',
            };
          }
          // 火狐浏览器
          matchBS = rFirefox.exec(ua);
          if (matchBS != null && !window.attachEvent) {
            return {
              browser: '火狐',
              version: `Firefox/${matchBS[2]}` || '0',
            };
          }
          // Oper浏览器
          matchBS = rOpera.exec(ua);
          if (matchBS != null && !window.attachEvent) {
            return {
              browser: 'Opera',
              version: `Chrome/${matchBS[2]}` || '0',
            };
          }
          // 遨游
          matchBS = rMaxthon.exec(ua);
          if (matchBS != null && !window.attachEvent) {
            return {
              browser: '遨游',
              version: `Chrome/${matchBS[2]}` || '0',
            };
          }
          // 2345浏览器
          matchBS = r2345.exec(ua);
          if (matchBS != null && !window.attachEvent) {
            return {
              browser: '2345',
              version: `Chrome/ ${matchBS[2]}` || '0',
            };
          }
          // QQ浏览器
          matchBS = rQQ.exec(ua);
          if (matchBS != null && !window.attachEvent) {
            return {
              browser: 'QQ',
              version: `Chrome/${matchBS[2]}` || '0',
            };
          }
          // Safari（苹果）浏览器
          matchBS = rSafari.exec(ua);
          if (matchBS != null && !window.attachEvent && !window.chrome && !window.opera) {
            return {
              browser: 'Safari',
              version: `Safari/${matchBS[1]}` || '0',
            };
          }
          // 谷歌浏览器
          matchBS = rChrome.exec(ua);
          if (matchBS != null && !window.attachEvent) {
            matchBS2 = rNewOpera.exec(ua);
            if (matchBS2 === null) {
              return {
                browser: '谷歌',
                version: `Chrome/${matchBS[2]}` || '0',
              };
            }
            return {
              browser: 'Opera',
              version: `opr/${matchBS2[2]}` || '0',
            };
          }
        },
      };

      BrowserMatch.init();

      const baseinfo = {
        _error: error,
        _info: info,
        _userinfo: BrowserMatch,
      };

      console.log(
        '异常',
        error,
        info,
        `当前浏览器为：${BrowserMatch.browser}\n版本为：${BrowserMatch.version}\n所处操作系统为：${BrowserMatch.OS}`,
      );
      // request(`URL-ERROR`, {
      //   method: 'POST',
      //   body:baseinfo
      // });
    }

    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <ErrorInfo />;
      }
      return <WrappedComponent {...this.props} />;
    }
  };
}

const ErrorInfo = () => {
  return (
    <div className={styles.errorBox}>
      <div className={styles.errorBox_top}>
        <img alt="插头图片" src={chatou} className={styles.errorBox_top_1} />
        <p className={styles.errorBox_top_2}>出错啦o(T~~~T)o 没有找到你要访问的页面~</p>
        <img alt="卫星图片" src={weixing} className={styles.errorBox_top_3} />
      </div>
      <div className={styles.errorBox_mid}>
        <img alt="望月图片" src={wangyuegif} className={styles.errorBox_mid_1} />
      </div>
      <div className={styles.errorBox_bottom}>
        <Button
          type="primary"
          // href="/dashboard/messageReminder/"
          className={styles.errorBox_bottom_1}
        >
          返回首页
        </Button>
      </div>
    </div>
  );
};
