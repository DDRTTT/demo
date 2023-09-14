import React from 'react';
import { connect } from 'dva';
import { getSession, setSession } from '@/utils/session';
import router from 'umi/router';

const obj = {};
let cache = {};

const delay = (fn = () => {}, timer = void 0) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
      fn();
    }, timer);
  });
};

/**
 * 通用权限封装器 <br/>
 * 必设属性：code 功能点唯一标识【menuCode:actionCode】 <br/>
 * 被 Action 包裹的组件只有在当前登录用户拥有 code 功能点权限时才会被渲染
 */
export default authorizeHoc(props => props.children);

/**
 * 权限验证器
 * @param {ReactDOM} WrappedComponent
 * @returns {ReactDOM}
 */
export function authorizeHoc(WrappedComponent) {
  return connect(({ user }) => ({
    authorizes: user.authorizes,
  }))(({ authorizes, code, children }) => {
    let visible;
    const currentMenu = getCurrentMenu(authorizes, 'code', code.split(':')[0]);
    if (currentMenu) {
      let actions = currentMenu.actions;
      actions && (visible = actions.some(item => item.code === code));
    }
    return visible ? <WrappedComponent key={code} children={children} /> : <></>;
  });
}

export function ActionBool(code) {
  let authorizes = JSON.parse(getSession('USER_MENU'));
  let visible = false;
  const currentMenu = getCurrentMenu(authorizes, 'code', code.split(':')[0]);
  if (currentMenu) {
    visible = currentMenu.actions;
    visible ? (visible = visible.some(item => item.code === code)) : '';
  }
  return visible;
}

/**
 * 方法说明
 * @method  getCurrentMenu
 * @return  {object}
 * @param authorizes {object[]}
 * @param key        {string}
 * @param value      {string}
 */
export function getCurrentMenu(authorizes, key, value) {
  const str = `${value}_$`;
  if (getSession(str)) {
    const o = JSON.parse(getSession(str));
    const { actions } = o;
    for (const item of actions) {
      obj[item.code] = `${item.uriFlag}${item.tabUri}`;
    }
    return o;
  }
  if (authorizes && Array.isArray(authorizes)) {
    for (let i = 0; i < authorizes.length; i++) {
      const item = authorizes[i];
      if (item.children) {
        const menu = getCurrentMenu(item.children, key, value);
        if (menu) return menu;
      } else if (authorizes[i][key] === value) {
        setSession(str, JSON.stringify(authorizes[i]));
        return authorizes[i];
      }
    }
  }
}

export function nsHoc(params) {
  return WrappedComponent => {
    return class NS extends React.PureComponent {
      render() {
        return <WrappedComponent {...params} />;
      }
    };
  };
}

export const fnLink = (code, parameter = '') => {
  let linkUri = `${obj[code]}${parameter}`;
  router.push(linkUri);
};

export function linkHoc() {
  return WrappedComponent => {
    return class NS extends React.PureComponent {
      render() {
        return <WrappedComponent fnLink={fnLink} {...this.props} />;
      }
    };
  };
}

const getKey = () => location.pathname;
/**
 * 缓存state
 * @param parameter {Object} 当前state
 */
const cacheState = parameter => {
  let key = getKey();
  cache = { [key]: parameter };
};

/**
 * 读取缓存的state
 * @param keep {boolean} 读取完成后是否销毁 true 缓存 false 销毁
 * @returns state {Object}
 */
const recoveryState = keep => {
  let key = getKey();
  // 读取后是否销毁
  !keep && delay(() => (cache = {}));
  return cache[key];
};

/**
 * 缓存高阶组件
 * @returns {Comment}
 */
export function cacheHoc() {
  return WrappedComponent => {
    return class NS extends React.PureComponent {
      render() {
        return (
          <WrappedComponent cacheState={cacheState} recoveryState={recoveryState} {...this.props} />
        );
      }
    };
  };
}
