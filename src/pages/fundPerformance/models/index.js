import {handIndexAPI, handSearchAPI} from "../services.js";
import { message } from 'antd';
import { cloneDeep } from 'lodash';

export default {
  namespace: 'fundPerformance',
  state: {
    saveListFetch: {// 产品相关服务机构 列表查询
      total: '',
      taskList: [],
    },
    saveSearch:[],//下拉
  },
  effects: {
    // 机构管理
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
    //
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
  },
};
