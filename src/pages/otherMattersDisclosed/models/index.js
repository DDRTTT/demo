import {handIndexAPI, handSearchAPI} from "../services.js";
import { message } from 'antd';
import { cloneDeep } from 'lodash';

export default {
  namespace: 'otherMattersDisclosed',
  state: {
    saveListFetch: {// 列表查询
      total: '',
      taskList: [],
    },
    saveSearch:[],//下拉
    queryInfoByList:[]
  },
  effects: {
    *handleListFetch({payload, val, callback}, {call, put}) {
      const response = yield call(handIndexAPI, payload, val);
      if (response && response.status === 200) {
        yield put({
          type: 'saveListFetch',
          payload: response.data,
        });
        if (callback) callback(response);
      } else {
        message.warn(response.message ? response.message : `查询失败${response?.path}`);
      }
    },
    // 下拉查询
    *handleSearch({payload, val, callback}, {call, put}) {
      const response = yield call(handSearchAPI, payload, val);
      if (response && response.status === 200) {
        yield put({
          type: 'saveSearch',
          payload: response.data
        });
        if (callback) callback(response);
      } else {
        message.warn(response.message ? response.message : `查询下拉值类型失败${response?.path}`);
      }
    },
    *handleQuery({payload, val, callback}, {call, put}) {
      const response = yield call(handSearchAPI, payload, val);
      if (response && response.status === 200) {
        yield put({
          type: 'queryInfoByList',
          payload: response.data
        });
        if (callback) callback(response);
      } else {
        message.warn(response.message ? response.message : `查询下拉值类型失败${response?.path}`);
      }
    },
    // 删除
    *handleDelete({payload, val, callback}, {call, put}) {
      const response = yield call(handSearchAPI, payload, val);
      if (response && response.status === 200) {
        message.success('操作成功');
        return response;
      } else {
        message.error('操作失败!');
      }
    },
  },

  reducers: {
    saveListFetch(state, { payload }) {
      return {
        ...state,
        saveListFetch: payload,
      };
    },
    saveSearch(state, { payload }) {
      return {
        ...state,
        saveSearch: payload,
      };
    },
    queryInfoByList(state, { payload }) {
      return {
        ...state,
        queryInfoByList: payload,
      };
    },
  },
};
