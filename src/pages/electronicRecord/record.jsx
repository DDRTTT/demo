import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { errorBoundary } from '@/layouts/ErrorBoundary';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Breadcrumb, Card, Col, Form, Row, message, Layout, Timeline } from 'antd';
import styles from './index.less';

const { Content } = Layout;
const routerPath = {
  linkAd: '/electronicRecord',
};

const Index = props => {
  const { dispatch, saveRecordList } = props;

  useEffect(() => {
    const { fileSerialNumber } = props.location.query;
    if (fileSerialNumber) handleGetRecord(fileSerialNumber);
  }, []);

  // 流转历史
  const handleGetRecord = fileSerialNumber => {
    dispatch({
      type: 'lifeCyclePRD/handleGetRecordListMsg',
      payload: { fileSerialNumber },
    });
  };

  const timeLine = () => {
    return (
      <Timeline>
        {saveRecordList.map(item => {
          return (
            <Timeline.Item key={item.startTime}>
              {item.startTime + ' '}&nbsp;&nbsp;&nbsp;
              {item.name + ' '}&nbsp;&nbsp;&nbsp;
              {'操作人：' + item.startUserName}
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  };

  // 返回上一页
  // 取消
  const handleBackPage = () => {
    window.history.go(-1);
  };

  return (
    <PageHeaderWrapper className={styles.parentBox}>
      <Layout>
        <Content>
          <Card>
            {/* <Col md={12} sm={24} style={{ width: '100%', marginBottom: '20px' }}>
              <span style={{ color: 'rgba(149, 163, 187, 1)', marginLeft: '16px' }}>
                电子档案管理
              </span>{' '}
              / <span style={{ color: 'rgba(71,75,91,1)' }}>生命周期文档</span>
            </Col> */}
            <Row gutter={24} type={'flex'} justify={'center'}>
              <Col span={12}>
                <Breadcrumb>
                  <Breadcrumb.Item>电子档案管理</Breadcrumb.Item>
                  <Breadcrumb.Item>流转记录</Breadcrumb.Item>
                </Breadcrumb>
              </Col>
              <Col span={12} style={{ textAlign: 'end' }}>
                <Button onClick={handleBackPage}>取消</Button>
              </Col>
            </Row>
          </Card>
          <Card className={styles.searchForm}>
            <div>{timeLine()}</div>
          </Card>
        </Content>
      </Layout>
    </PageHeaderWrapper>
  );
};

const WrappedIndexForm = state => {
  const {
    dispatch,
    lifeCyclePRD: { saveRecordList },
  } = state;
  return {
    dispatch,
    saveRecordList,
  };
};

export default errorBoundary(connect(WrappedIndexForm)(Index));
