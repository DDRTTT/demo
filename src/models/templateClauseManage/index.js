import { message } from 'antd';
import request from '@/utils/request';
import {
  getListApi,
  getTableListApi,
  getLabelListApi,
  getTempListApi,
  deleteItemApi,
} from '@/services/templateClauseManage';

export default {
  namespace: 'tempClauseManage',
  state: {
    dataSource: [],
    labelList: [],
    tempList: [],
    total: 0,
    dataSource2: [], // 查看页
    total2: 0, // 查看页
  },
  reducers: {
    initTempList(state, { payload }) {
      return {
        ...state,
        tempList: payload,
      };
    },
    updateList(state, { payload }) {
      return {
        ...state,
        dataSource: payload.dataSource,
        total: payload.total,
      };
    },
    updateTableList(state, { payload }) {
      return {
        ...state,
        dataSource2: payload.dataSource,
        total2: payload.total,
      };
    },
    updateLabelList(state, { payload }) {
      // { payload } 为解构取得 effects 中 put 传递来的参数
      return {
        ...state,
        labelList: payload,
      };
    },
    updateTempList(state, { payload }) {
      return {
        ...state,
        tempList: payload,
      };
    },
  },
  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(getListApi, payload);
      if (response && response.status === 200) {
        const data = response.data;
        const total = data.total;
        const dataSource = data.rows && data.rows.length > 0 ? data.rows : [];
        dataSource.forEach((item, index, arr) => {
          if (item.tempName.length > 1) {
            arr[index].tempName = item.tempName.join('、');
          }
        });
        yield put({
          type: 'updateList',
          payload: { dataSource, total },
        });
        return true;
      } else {
        message.warn(response.message);
        return false;
      }
    },
    *getTableList({ payload }, { call, put }) {
      const response = yield call(getTableListApi, payload);
      if (response && response.status === 200) {
        const data = response.data;
        const total = data.total;
        const dataSource = data.rows && data.rows.length > 0 ? data.rows : [];
        dataSource.forEach((item, index, arr) => {
          if (item.tempName.length > 1) {
            arr[index].tempName = item.tempName.join('、');
          }
        });
        yield put({
          type: 'updateTableList',
          payload: { dataSource, total },
        });
      }
    },
    *getLabelList({ payload }, { call, put }) {
      const response = yield call(getLabelListApi, payload);
      if (response && response.status === 200) {
        yield put({
          // 此对象会传到  reducers/updateLabelList， 作为第二个参数
          type: 'updateLabelList',
          payload: response.data,
        });
        return true;
      } else {
        message.warn(response.message);
        return false;
      }
    },
    *getTempList({ payload }, { call, put }) {
      const response = yield call(getTempListApi, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'updateTempList',
          payload: response.data,
        });
        return true;
      } else {
        message.warn(response.message);
        return false;
      }
    },
    *deletItem({ payload, callback }, { call, put }) {
      const response = yield call(deleteItemApi, payload);
      if (response && response.status === 200) {
        message.success('删除成功');
        callback ? callback() : '';
      } else {
        message.warning('删除失败');
      }
    },
  },
};
