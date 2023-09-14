/*
流程节点数据存储项
2022-12-1 日重构流程内容
*/

import { queryAllSettingTemplate } from '@/services/prospectusPageTpl'

import { message } from 'antd';

export default {
  namespace: 'prospectusPageTpl',
  state: {
    fileDefaultPath: '/ams/ams-file-service/fileServer/downloadUploadFile?getFile=', // 文件服务器默认路径
    // 流程数据
    pageInfo: {
      ids: '020686d9-96d9-4fe1-bff9-76361e4be026', // 原菜单列表
      pageCode: '020686d9-96d9-4fe1-bff9-76361e4be026_T001_1', // 原菜单列表
      contentType: 2, // 未知
      linkId:'a878187fa60744f895b58fd979194864',
      coreModule:'TContractBusinessArchive',
    },
    listData: {
      rows: [],
      pageSize: 10,
      pageNum: 1,
      total: 0
    },
    pageData: {
      //
    },

  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname.includes('/contract/prospectusConfig/view')) {
          const pageData = JSON.parse(sessionStorage.getItem('_templateParams'));
          dispatch({
              type: 'getPageData',
              payload: pageData
            }
          );

          dispatch({
              type: 'processNode/getCdnInfo',
              payload: null
            }
          );
        } else if (location.pathname.includes('/contract/prospectusConfig')) {
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
        pageData: {...payload},
      };
    },
  },
  effects: {
    // 获取列表
    *defaultGetListData({ payload}, { put, call }){
      const data = {
        pageSize: 10,
        currentPage: 1,
        proCode: '',
        templateType: 1,
        ...payload
      };
      const res = yield call(queryAllSettingTemplate, data);
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
      const res = yield call(queryAllSettingTemplate, payload);
      if (res && res.status === 200) {
        yield put({
          type: 'setListData',
          payload: res.data,
        });
      } else {
        message.error(res.message);
      }
    },
    *getPageData({ payload }, { put, call }) {
        yield put({
          type: 'setPageData',
          payload: {...payload},
        });
    },
    // 删除
    *deleteListData({ payload, cb }, { put, call }) {
      const res = yield call(queryAllSettingTemplate, payload);
      if (res && res.status === 200) {
        cb(res.data);
      } else {
        message.error(res.message);
      }
    },
  },
};
