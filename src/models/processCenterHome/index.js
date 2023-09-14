import { getProcessTree, getStatistics } from '@/services/processCenterHome';
import { getProductEnum } from '@/services/investorReview';
import { message } from 'antd';

export default {
  namespace: 'processCenterHome',
  state: {
    // 流程连线图的数据
    stageList: [],
    // 产品名称下拉列表
    productEnum: [],
    // 获取统计数据
    statistics: [],
  },
  reducers: {
    setStageList(state, { payload }) {
      return {
        ...state,
        stageList: payload,
        isLoading: false,
      };
    },
    setProductEnum(state, { payload }) {
      return {
        ...state,
        productEnum: payload,
      };
    },
    setStatistics(state, { payload }) {
      return {
        ...state,
        statistics: payload,
      };
    },
  },
  effects: {
    /**
     * 获取表格的数据
     */
    *getStageList({ payload }, { put, call }) {
      const res = yield call(getProcessTree, payload);
      if (res && res.status === 200 && res.data && res.data.stageList) {
        yield put({
          type: 'setStageList',
          payload: res.data.stageList,
        });
      } else {
        yield put({
          type: 'setStageList',
          payload: null,
        });
      }
    },
    /**
     * 获取产品下拉列表
     */
    *getProductEnum({ payload }, { put, call }) {
      const res = yield call(getProductEnum, payload);
      if (res && res.status === 200) {
        yield put({
          type: 'setProductEnum',
          payload: res.data,
        });
      } else {
        message.error(res.message);
      }
    },
    /**
     * 获取统计数据
     */
    *getStatistics({ payload }, { put, call }) {
      const res = yield call(getStatistics, payload);
      if (res && res.status === 200) {
        yield put({
          type: 'setStatistics',
          payload: res.data,
        });
      }
      // else {
      //   message.error(res.message);
      // }
    },
  },
};
