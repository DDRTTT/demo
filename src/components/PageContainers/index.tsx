import React from 'react';
import TransButton from 'antd/es/_util/transButton';
import styles from './index.less';
import classNames from 'classnames';
import { Breadcrumb } from '@/components';
import { LeftOutlined  } from '@ant-design/icons';

// 面包屑
export type breadcrumbProps = {
  title: string;
  url: string;
};

export interface PageContainerProps {
  // 标题
  title?: React.ReactNode | false;
  // 返回Icon
  backIcon?: React.ReactNode;
  // 返回方法
  onBack?: (e?: React.MouseEvent<HTMLDivElement>) => void;
  // 样式
  className?: any;
  // 返回操作文字
  backText?: string | boolean;
  // 是否有footer组件
  footer?: React.ReactNode;
  // 查询内容过滤项
  filter?: React.ReactNode;
  // 自定义面包屑（针对子页面无法查找路由情况）
  breadcrumb?: breadcrumbProps[];
  // 面包屑样式
  breadcrumbStyle?: any;
  fuzz?: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = props => {
  const {
    children,
    title,
    backIcon = <LeftOutlined />,
    onBack = () => window.history.back(),
    backText = '返回',
    footer,
    filter,
    breadcrumb = [],
    breadcrumbStyle = {},
    fuzz,
  } = props;

  /**
   *
   * @param {React.ReactNode} backIcon 返回Icon
   * @param {(e?: React.MouseEvent<HTMLDivElement>) => void} onBack 返回函数
   */
  const renderBack = (
    backIcon?: React.ReactNode,
    onBack?: (e?: React.MouseEvent<HTMLDivElement>) => void,
  ) => {
    if (!backIcon || !onBack) {
      return null;
    }

    return (
      <>
        <TransButton
          onClick={(e?: React.MouseEvent<HTMLDivElement>) => {
            onBack?.(e);
          }}
          className={styles.transButton}
        >
          {backIcon}
          <span className={styles.backText}>{backText}</span>
        </TransButton>
      </>
    );
  };

  // 返回组件
  const backIconDom = renderBack(backIcon, onBack);

  /**
   * footer渲染组件
   * @param {React.ReactNode} footerCom
   */
  const renderFooter = (footerCom: React.ReactNode) => {
    if (footerCom) {
      return <div className={styles.contentFooter}>{footerCom}</div>;
    }
    return null;
  };

  const renderFuzz = (fozzCom: React.ReactNode) => {
    if (fozzCom) {
      return <div className={styles.contentSearch}>{fozzCom}</div>;
    }
    return null;
  };


  const renderFilter = (filter: React.ReactNode) => {
    if (filter) {
      return <div className={styles.contentFilter}>{filter}</div>;
    }
    return null;
  };

  // antd类名前缀
  const prefixedClassName = `pageContainer`;
  const className = classNames(prefixedClassName, props.className);

  return (
    <>
      <div className={styles[className]}>
        <div className={styles.contentBreadcrumb} style={breadcrumbStyle}>
          {backIconDom}
          <span className={styles.breadcrumb}>
            <Breadcrumb breadcrumbArray={breadcrumb} />
          </span>
        </div>
        {title && title}
        {renderFooter(footer)}
        {renderFuzz(fuzz)}
        {filter && renderFilter(filter)}
      </div>
      {children}
    </>
  );
};

export default PageContainer;
