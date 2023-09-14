import {handIndexAPI, handSearchAPI} from "../services.js";
import { message } from 'antd';
import { cloneDeep } from 'lodash';

export default {
  namespace: 'portfolioReport',
  state: {
    saveListFetch: {//列表查询
      total: '',
      taskList: [],
    },
    saveSearch:[],//下拉

    saveTotal:[]
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
    // 机构类型下拉查询
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

    *handleListFetchTotal({payload, val, callback}, {call, put}) {
      const response = yield call(handIndexAPI, payload, val);
      if (response && response.status === 200) {
        yield put({
          type: 'saveTotal',
          payload: response.data,
        });
        if (callback) callback(response);
      } else {
        message.warn(response.message ? response.message : `查询失败${response?.path}`);
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

    saveTotal(state, { payload }) {
      return {
        ...state,
        saveTotal: payload,
      };
    },
  },
};
