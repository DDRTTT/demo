import React from 'react';
import { Col, Row, Card } from 'antd';
import classnames from 'classnames';
import styles from './index.less';

type innerDataType = Record<string, string>;

interface dataType {
  data: innerDataType;
  time: string;
}
interface propsType {
  data: dataType[];
  num?: number;
}

const HistoricalComparison: React.FC<propsType> = (props: propsType) => {
  const { data, num } = props;

  const getType = (o: React.ReactNode): string => {
    // 获取目标对象数据类型
    if (Object.prototype.toString.call(o) === '[object Array]') {
      return 'array';
    } else if (Object.prototype.toString.call(o) === '[object Object]') {
      return 'object';
    } else if (Object.prototype.toString.call(o) === '[object String]') {
      return 'string';
    } else if (Object.prototype.toString.call(o) === '[object Number]') {
      return 'number';
    } else {
      return '';
    }
  };

  const handleArray: React.FC<any> = (item: number[] | string[]) => {
    const arr: React.ReactNode[] = [];
    item.forEach(n => arr.push(<div style={{ paddingLeft: 28 }}>{n}</div>));
    return <>{arr}</>;
  };

  const handleObject: React.FC<any> = (item: any, n: number) => {
    const arr: React.ReactNode[] = [];
    for (const itemKey in item) {
      const cls = classnames({
        [styles.leftColor]: itemKey.includes('_$') && n === 1,
        [styles.rightColor]: itemKey.includes('_$') && n === 0,
      });

      arr.push(
        <p style={{ paddingLeft: 28 }} className={cls}>
          {itemKey.replace('_$', '')} : {item[itemKey]}
        </p>,
      );
    }
    return <>{arr}</>;
  };

  const handleEle = (item: any, n: number): any => {
    const el = [];
    for (const itemKey in item) {
      const key = itemKey;
      const value = item[key];
      const cls = classnames({
        [styles.leftColor]: key.includes('_$') && n === 1,
        [styles.rightColor]: key.includes('_$') && n === 0,
      });

      if (getType(value) === 'array') {
        el.push(
          <>
            <p className={cls}>{key.replace('_$', '')} : </p>
            {handleArray(value, n)}
          </>,
        );
      }
      if (getType(value) === 'object') {
        el.push(
          <>
            <p>
              <span className={cls}>{key.replace('_$', '')} : </span>
            </p>
            {handleObject(value, n)}
          </>,
        );
      }
      if (getType(value) === 'string') {
        el.push(
          <>
            <p className={cls}>
              {key.replace('_$', '')} : {value}
            </p>
          </>,
        );
      }
    }
    return el;
  };

  const cls = classnames({
    [styles.tagLeftColor]: num === 1,
    [styles.tagRightColor]: num === 0,
  });

  return (
    <>
      <Card
        className={styles.content}
        title={
          <>
            <span className={styles.time}>{num && data[num].time}</span>
            <span className={cls}>{num && (num == 1 ? '修改后' : '修改前')}</span>
          </>
        }
      >
        {num && handleEle(data[num].data, num)}
      </Card>
    </>
  );
};

const Index: React.FC<propsType> = (props: propsType) => {
  const { data } = props;
  return (
    <Row>
      <Col span={12}>
        <HistoricalComparison data={data} num={1} />
      </Col>
      <Col span={12}>
        <HistoricalComparison data={data} num={0} />
      </Col>
    </Row>
  );
};

export default Index;
