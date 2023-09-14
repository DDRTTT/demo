import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';

import { getNginxIp, getPair, contractAdd } from '../services/operation';

export interface operationModelType {
  namespace: 'operation';
  state: {};
  effects: {
    getNginxIp: Effect;
    getPair: Effect;
    contractAdd: Effect;
  };
  reducers: {};
}

const operationModel: operationModelType = {
  namespace: 'operation',
  state: {},

  effects: {
    *getNginxIp(_, { call }) {
      const res = yield call(getNginxIp);
      if (res?.status === 200) {
        return res.data;
      } else {
        return false;
      }
    },
    *getPair({ payload }, { call }) {
      const res = yield call(getPair, payload);
      if (res?.status === 200) {
        return res.data;
      } else {
        return false;
      }
    },
    *contractAdd({ payload }, { call }) {
      const res = yield call(contractAdd, payload);
    },
  },

  reducers: {},
};

export default operationModel;
