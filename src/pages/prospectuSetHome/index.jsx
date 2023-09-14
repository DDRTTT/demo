import React, { useEffect, useRef, useState } from 'react';
import { Card, Divider, Empty, Form, message, Select, Spin } from 'antd';
import { connect } from 'dva';
import processLineMap from '@/utils/processLineMap';
import router from 'umi/router';
import { commonRequest } from '@/services/processCenterHome';
import styles from './index.less';
import flatMap from 'lodash/flatMap';
import { getMenu } from '@/utils/session';
import { recursiveGetData } from '@/utils/utilsFun';

const { Option } = Select;

// 产品中心首页
const Index = props => {
  const canvas = useRef();
  const {
    dispatch,
    stageList,
    codeList: { TG004: proTypeList = [] },
    statistics,
    statisLoading,
    stageLoading,
    menuLoading = false,
  } = props;
  // 当前的code
  const [currentCode, setCurrentCode] = useState('');
  // mapline的实例
  const [mapInstance, setMapInstance] = useState(null);
  // 是否正在加载
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    dispatch({
      type: 'investorReview/getDicsByTypes',
      payload: ['TG004'],
    });
    canvas.current.addEventListener('circleClick', e => {
      // 如果在初始化的时候获取菜单树会拿到空的,所以只能在点击的时候去获取菜单树
      // 用户菜单树
      let menuTree;
      // 获取用户权限
      menuTree = ((getMenu() && JSON.parse(getMenu())) || []).find(item => {
        return item.code === 'productLifecycle';
      });
      menuTree = flatMap(recursiveGetData(menuTree, 'children'));
      menuTree =
        (menuTree &&
          menuTree.map(item => {
            return '/' + item.path;
          })) ||
        [];
      const { nodeActionType, nodeActionUri } = e.detail;
      if (nodeActionType !== '//') {
        // 跳转到本地路由
        if (nodeActionType === 'uri') {
          // 判断跳转权限
          if (menuTree.includes(nodeActionUri) || menuTree.includes(nodeActionUri + '/index')) {
            router.push(nodeActionUri);
          } else {
            message.error('您没有该流程的权限,请联系管理员');
          }
        } else {
          // 如果是resource的话,调接口,但是不用做处理
          commonRequest(nodeActionUri);
        }
      }
    });
  }, []);
  useEffect(() => {
    if (proTypeList.length > 0) {
      setCurrentCode(proTypeList[0].code);
    }
  }, [proTypeList]);
  useEffect(() => {
    if (stageList && stageList.length > 0) {
      const special = ['start', 'end', 'parallel'];
      let codeList = stageList.map(item => {
        return item.nextCells
          .filter(i => !special.includes(i.code))
          .map(sonItem => {
            return sonItem.code;
          });
      });
      codeList = flatMap(codeList);

      dispatch({
        // d
        type: 'processCenterHome/getStatistics',
        payload: {
          proType: currentCode,
          codes: codeList,
        },
      });
    }
  }, [stageList]);
  useEffect(() => {
    if (!currentCode) return;
    dispatch({
      type: 'processCenterHome/getStageList',
      payload: {
        proCode: currentCode,
      },
    });
  }, [currentCode]);

  useEffect(() => {
    if (!stageList || stageList.length <= 0) return;
    const tempStageList = JSON.parse(JSON.stringify(stageList));
    tempStageList.forEach(item => {
      item.nextCells.forEach(secItem => {
        const tempItem = statistics.find(sonItem => sonItem.code == secItem.code);
        secItem.count = (tempItem && tempItem.count) || 0;
      });
    });
    if (!mapInstance) {
      setMapInstance(new processLineMap(canvas.current, tempStageList, false, currentCode));
    } else {
      mapInstance.update(tempStageList, currentCode);
    }
  }, [statistics]);
  useEffect(() => {
    setLoading(statisLoading || stageLoading);
  }, [stageLoading, statisLoading]);
  // 切换下拉框的时候
  const handlerChange = code => {
    setCurrentCode(code);
    if (mapInstance) {
      mapInstance.clear();
    }
  };
  return (
    <Card>
      <Spin spinning={menuLoading}>
        <div className={styles.headerLayout}>
          <p>招募说明书主流程</p>
          {/* <div className="rightSide">
            <Select style={{ width: 200 }} showSearch value={currentCode} onChange={handlerChange}>
              {proTypeList.map(item => {
                return (
                  <Option key={item.code} value={item.code}>
                    {item.name}
                  </Option>
                );
              })}
            </Select>
          </div> */}
        </div>
        <Divider dashed />
        <div className={styles.content}>
          <Spin spinning={isLoading}>
            <Empty
              style={{ display: stageList ? 'none' : 'block', height: 190 }}
              description="暂无流程配置数据"
            />
            <canvas
              className="leftCanvas"
              ref={canvas}
              style={{ display: !stageList ? 'none' : 'block' }}
            />
          </Spin>
        </div>
      </Spin>
    </Card>
  );
};
const processCenterHome = state => {
  const {
    dispatch,
    loading,
    processCenterHome: { stageList, statistics },
    investorReview: { codeList },
  } = state;

  return {
    dispatch,
    stageList,
    codeList,
    statistics,
    stageLoading: loading.effects['processCenterHome/getStageList'],
    statisLoading: loading.effects['processCenterHome/getStatistics'],
    menuLoading: loading.effects['user/handleGetMenu'],
  };
};
export default connect(processCenterHome)(Index);
