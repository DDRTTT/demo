import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'antd';
import { getSession, USER_MENU } from '@/utils/session';
import { arrayFindDeep } from '@/utils/utils';
import router from 'umi/router';

const Index = ({ breadcrumbArray }) => {
  const indexRouter = {
    title: '首页',
    url: '/base/prospectuSetHome',
  };
  const [breadcrumb, setBreadcrumb] = useState([]);
  const menu = JSON.parse(getSession(USER_MENU));
  const currentPath = window.location.pathname.replace(/^\//, '');
  const getBreadcrumb = () => {
    const currentMenu = arrayFindDeep(menu, 'path', currentPath);
    const parentMenu = arrayFindDeep(menu, 'id', currentMenu?.parent);
    const currentMenuItem = {
      title: currentMenu?.title,
      // url: currentMenu?`/${currentMenu.path}`:'',
      url:''
    };
    const parentMenuItem = {
      title: parentMenu?.title,
      // url: parentMenu?parentMenu.path?`/${parentMenu.path}`:'':'',
      url:''
    };
    if (breadcrumbArray.length !== 0) {
      setBreadcrumb([indexRouter].concat(breadcrumbArray));
    } else {
      setBreadcrumb([indexRouter].concat(parentMenuItem, currentMenuItem));
    }
  };

  useEffect(() => getBreadcrumb(), [breadcrumbArray]);

  return (
    <Breadcrumb>
      {breadcrumb.map((item, index) => {
        if (item.url) {
          return (
            <Breadcrumb.Item onClick={() => router.push(item.url)} key={item.title || index}>
              <a>{item.title}</a>
            </Breadcrumb.Item>
          );
        }
        return (
          <Breadcrumb.Item key={item.title}>
            <span>{item.title}</span>
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default Index;
