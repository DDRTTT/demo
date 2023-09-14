import React from 'react';
import { Card } from 'antd';
import Title from './components/title';
import styles from './index.less';
import { getSession, USER_MENU } from '@/utils/session';

// 获取当前页面的title
export function currentMenuTitle(paramTitle:any) {
  try {
    // @ts-ignore
    const menu = JSON.parse(getSession(USER_MENU));
    const currentPath = window.location.pathname.replace(/^\//, '');
    const { title } = arrayFindDeep(menu, 'path', currentPath);
    return title;
  } catch (e) {
    return paramTitle;
  }
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

// 未设置title的时候，使用菜单名称
// 设置false的时候不显示title
// 设置title的时候，为设置的值
const CardProvider: React.FC<{
  title?: any;
  default?: any;
  defaultTitle?: any;
  border?:any;
}> = ({border, title,defaultTitle, ...ret }) => {
  let props;
  if (title || title === undefined) {
    props = {
      ...ret,
      title: title ?
        (defaultTitle ?
          <Title currentTitle={title}/>
          : <Title currentTitle={currentMenuTitle(title)}/>)
        : "",
      // title: <Title currentTitle={currentMenuTitle(title)}/>,
    };
  }

  if (title === false) {
    props = { ...ret };
  }

  return (
    <div className={ret.default ? '' : styles.customizeCard}>
      <Card {...props} />
    </div>
  );
};

export default CardProvider;
