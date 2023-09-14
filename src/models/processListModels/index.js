/*
流程节点数据存储项
2022-12-1 日重构流程内容
*/

import {getDataList} from '@/services/processRelate'

import {message} from 'antd';

export default {
  namespace: 'processListModels',
  state: {
    // 流程数据
    pageInfo: {
      ids: '020686d9-96d9-4fe1-bff9-76361e4be026', // 原菜单列表
      pageCode: '020686d9-96d9-4fe1-bff9-76361e4be026_T001_1', // 原菜单列表
      contentType: 2, // 未知
      linkId:'a878187fa60744f895b58fd979194864',
      coreModule:'TContractBusinessArchive',
    },
    processInfo: {
      processId: "c054d6d3b36b4dfc84965064169f59c5"
    },
    listData: {
      rows: [],
      pageSize: 10,
      pageNum: 1,
      total: 0
    },
    nodeData: {
      //
    },

  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname.includes('/prospectus/processFlow')) {
          // 列表页
          dispatch({
            type: 'defaultGetListData'
          });

          dispatch({
              type: 'processNode/getCdnInfo',
              payload: null
            }
          );
        }
      });
    },
  },
  reducers: {
    // 设置流程数据
    setListData(state, { payload }) {
      return {
        ...state,
        listData: payload,
      };
    },
    setPageData(state, { payload }) {
      return {
        ...state,
        nodeInfo: {...payload},
      };
    },
  },
  effects: {
    // 获取列表
    *defaultGetListData({ payload}, { put, call }){
      const data = {
        path: '/ams/yss-contract-server/businessArchive/getBusinessArchiveListProcessInfo?coreModule=TContractBusinessArchive',
        linkId: 'a878187fa60744f895b58fd979194864',
        contentType: 2,
        methodName: "POST",
        queryParams: [
          {
            code: "taskType",
            value: "T001_1"
          },
          {
            code: "processId",
            value: "c054d6d3b36b4dfc84965064169f59c5"
          },
          {
            code: "pageNum",
            value: 1
          },
          {
            code: "pageSize",
            value: 10
          }
        ]
      };
      const res = yield call(getDataList, data);
      if (res && res.status === 200) {
        yield put({
          type: 'setListData',
          payload: res.data,
        });
      } else {
        message.error(res.message);
      }

      // 预先获取cdn信息，为详情页面需要的是数据
      yield put({
        type: 'processNode/getCdnInfo',
        payload: {},
      });

    },
    *getListData({ payload }, { put, call }) {
      const res = yield call(getDataList, payload);
      if (res && res.status === 200) {
        yield put({
          type: 'setListData',
          payload: res.data,
        });
      } else {
        message.error(res.message);
      }
    },
    // 删除
    *deleteListData({ payload, cb }, { put, call }) {
      const res = yield call(getDataList, payload);
      if (res && res.status === 200) {
        cb(res.data);
      } else {
        message.error(res.message);
      }
    },
  },
};
