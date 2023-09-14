import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';

import {
  getChildNode,
  getDropdownData,
  templateQuery,
  getFilePathByCode,
  delTemplate,
  delTagData,
  getCategoryData,
  checkTemplateName,
  getProcedure,
} from '../services/templateSet';
import { message } from 'antd';

export interface templateSetModelType {
  namespace: 'templateSet';
  state: {};
  effects: {
    getChildNode: Effect;
    getDropdownData: Effect;
    templateQuery: Effect;
    getFilePathByCode: Effect;
    delTemplate: Effect;
    delTagData: Effect;
    getCategoryData: Effect;
    checkTemplateName: Effect;
    getProcedure: Effect;
  };
  reducers: {};
}

const operationModel: templateSetModelType = {
  namespace: 'templateSet',
  state: {},

  effects: {
    // 获取下一级节点
    *getChildNode({ payload }, { call }) {
      const response = yield call(getChildNode, payload);
      if (response?.status === 200) {
        return response.data;
      } else {
        return false;
      }
    },
    // 获取下拉列表(文件性质)
    *getDropdownData({ payload }, { call }) {
      const response = yield call(getDropdownData, payload);
      if (response?.status === 200) {
        return response.data;
      } else {
        return false;
      }
    },
    // 模板查询
    *templateQuery({ payload }, { call }) {
      const response = yield call(templateQuery, payload);
      if (response?.status === 200) {
        return response.data;
      } else {
        return false;
      }
    },

    // 获取文件存放路径
    *getFilePathByCode({ payload }, { call }) {
      const response = yield call(getFilePathByCode, payload);
      if (response?.status === 200) {
        return response.data;
      } else {
        return false;
      }
    },

    // 删除模板
    *delTemplate({ payload }, { call }) {
      const response = yield call(delTemplate, payload);
      if (response?.status === 200) {
        return true;
      } else {
        return false;
      }
    },

    // 删除模板时同步删除掉模板中的标签数据
    *delTagData({ payload }, { call }) {
      const response = yield call(delTagData, payload);
      if (response?.status === 200) {
      }
    },

    // 获取类目
    *getCategoryData({ payload }, { call }) {
      const response = yield call(getCategoryData, payload);
      if (response?.status === 200) {
        return response.data;
      } else {
        return false;
      }
    },
    // 校验名件名
    *checkTemplateName({ payload }, { call }) {
      const response = yield call(checkTemplateName, payload);
      return response;
    },
    // 获取流程
    *getProcedure(_, { call }) {
      const response = yield call(getProcedure);
      if (response?.status === 200) {
        return response.data
      } else {
        message.warn(response?.message);
        return false;
      }
    }
  },

  reducers: {},
};

export default operationModel;
