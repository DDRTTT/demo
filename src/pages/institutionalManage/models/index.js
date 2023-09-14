import {handIndexAPI, handSearchAPI} from "../services";
import { message } from 'antd';
import { cloneDeep } from 'lodash';

export default {
  namespace: 'institutionalManage',
  state: {
    saveListFetch: {// 机构管理 列表查询
      total: '',
      taskList: [],
    },
    saveSearch:[],//下拉
    getOrgNameInfo:[],

    orgSaveListFetch: {// 机构信息 列表查询
      total: '',
      taskList: [],
    },
    orgSaveSearch:[],
    orgUrlParam:{}

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
        message.warn(response.message ? response.message : `查询下拉值机构类型失败${response?.path}`);
      }
    },
    *getOrgNameInfoV({payload, val, callback}, {call, put}) {
      const response = yield call(handSearchAPI, payload, val);
      if (response && response.status === 200) {
        yield put({
          type: 'getOrgNameInfo',
          payload: response.data
        });
        if (callback) callback(response);
      } else {
        message.warn(response.message ? response.message : `查询下拉值机构类型失败${response?.path}`);
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

    //机构信息
    *handleListFetchOrg({payload, val, callback}, {call, put}) {
      const response = yield call(handIndexAPI, payload, val);
      if (response && response.status === 200) {
        yield put({
          type: 'orgSaveListFetch',
          payload: response.data,
        });
        if (callback) callback(response);
      } else {
        message.warn(response.message ? response.message : `查询失败${response?.path}`);
      }
    },
    //下拉
    *handleSearchOrg({payload, val, callback}, {call, put}) {
      const response = yield call(handSearchAPI, payload, val);
      if (response && response.status === 200) {
        yield put({
          type: 'orgSaveSearch',
          payload: response.data
        });
        if (callback) callback(response);
      } else {
        message.warn(response.message ? response.message : `查询下拉值失败${response?.path}`);
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
    getOrgNameInfo(state, { payload }) {
      return {
        ...state,
        getOrgNameInfo: payload,
      };
    },
    saveWordDictionaryFetch(state, { payload }) {
      return {
        ...state,
        saveWordDictionaryFetch: payload,
      };
    },

    orgSaveListFetch(state, { payload }) {
      return {
        ...state,
        orgSaveListFetch: payload,
      };
    },
    orgSaveSearch(state, { payload }) {
      return {
        ...state,
        orgSaveSearch: payload,
      };
    },
  },
};
