import {
  handleGetTreeAPI,
  handleGetListAPI,
  handleGetRecordListAPI,
  handleGetVersionListAPI,
  handleGetPersonalTreeAPI,
  handlesaveTagsListAPI,
  handleGetDocumentBigTypeAPI,
  handleGetDocumentTypeAPI,
  handleBreakdownAPI,
  handleGetPersonalListAPI,
  handleAddTreeAPI,
  handleDeleteTreeAPI,
  handleDeletePersonalListAPI,
  handleGetPersonAPI,
  handleGetProductTreeAPI,
  handleUpdatePersonalTagAPI,
  handleTagsAPI,
  handleGetProductTreeNodesAPI,
  handleGetChildListAPI,
  handleGetFileTypeByDocAPI,
} from '@/services/lifeCyclePRD';
import { message } from 'antd';
import cloneDeep from 'lodash/cloneDeep';

/**
 *处理接口返回的树数据，符合树结构
 *
 * @param {*} data 接口数据
 * @param {*} code
 * @param {*} label
 * @returns
 */
function handleNewTreeData(data, code, label) {
  data.forEach(item => {
    let tempCode = item[code],
      tempLabel = item[label];
    item.key = tempCode;
    item.value = tempCode;
    item.title = tempLabel;
    if (item.children) {
      handleNewTreeData(item.children, code, label);
    }
  });
  return data;
}
export default {
  namespace: 'lifeCyclePRD',
  state: {
    saveListFetch: {
      total: 0,
      fileInfoList: [],
    },
    savePersonalListFetch: {
      total: 0,
      fileInfoList: [],
    },
    saveTreeData: [],
    savePersonalTreeData: [],
    saveProductTreeData: [],
    saveRecordList: [],
    saveVersionData: [],
    documentBigType: [], // 档案大类
    documentType: [], // 文档类型
    breakdown: [], // 明细分类
    documentTags: [], // 标签
    saveUploadPersonFetch: [], //上传人
  },

  effects: {
    // 生命周期列表信息
    *handleGetListMsg({ payload }, { call, put }) {
      const response = yield call(handleGetListAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'saveListFetch',
          payload: response.data,
        });
      } else {
        message.warn(response.message);
      }
    },

    // 文档版本列表信息
    *handleGetVersionListMsg({ payload }, { call, put }) {
      const response = yield call(handleGetVersionListAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'saveVersionData',
          payload: response.data,
        });
      } else {
        message.warn(response.message);
      }
    },
    // 流转历史信息
    *handleGetRecordListMsg({ payload }, { call, put }) {
      const response = yield call(handleGetRecordListAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'saveRecordList',
          payload: response.data,
        });
      } else {
        message.warn(response.message);
      }
    },
    // 生命周期树形
    *handleGetTreeInfo({ payload }, { call, put }) {
      const response = yield call(handleGetTreeAPI, payload);
      let newData = [];
      if (response && response.status === 200) {
        if (response.data) {
          const data = cloneDeep(response.data);
          newData = handleNewTreeData(data, 'key', 'value');
        }
        yield put({
          type: 'saveTreeData',
          payload: newData,
        });
      } else {
        message.warn(response.message);
      }
    },
    // 同步个人管理--保存
    *handleSaveTagsListMsg({ payload }, { call, put }) {
      const response = yield call(handlesaveTagsListAPI, payload);
      let flag = false;
      if (response && response.status === 200) {
        flag = true;
        message.success('操作成功');
      } else {
        message.warn(response.message);
      }
      return flag;
    },
    // 档案大类
    *handleGetDocumentBigTypeReq({ payload }, { call, put }) {
      const response = yield call(handleGetDocumentBigTypeAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'updateDocumentBigType',
          payload: {
            documentBigType: response.data ? response.data : [],
          },
        });
      } else {
        message.warn(response.message);
      }
    },
    // 高级搜索，查询子目录
    *handleGetChildList({ payload }, { call, put }) {
      const response = yield call(handleGetChildListAPI, payload);
      if (response && response.status === 200) {
        if (payload.type === 'one') {
          yield put({
            type: 'updateDocumentType',
            payload: {
              documentType: response.data ? response.data : [],
            },
          });
        } else {
          yield put({
            type: 'updateBreakdown',
            payload: {
              breakdown: response.data ? response.data : [],
            },
          });
        }
      } else {
        message.warn(response.message);
      }
    },
    // 标签
    *handleGetDocumentTags({ payload }, { call, put }) {
      const response = yield call(handleTagsAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'documentTags',
          payload: {
            documentTags: response.data ? response.data : [],
          },
        });
      } else {
        message.warn(response.message);
      }
    },
    // 文档类型
    *handleGetDocumentTypeReq({ payload }, { call, put }) {
      const response = yield call(handleGetDocumentTypeAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'updateDocumentType',
          payload: {
            documentType: response.data ? response.data : [],
          },
        });
      } else {
        message.error(response.message);
      }
    },
    // 明细分类
    *handleBreakdownReq({ payload }, { call, put }) {
      const response = yield call(handleBreakdownAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'updateBreakdown',
          payload: {
            breakdown: response.data ? response.data : [],
          },
        });
      } else {
        message.error(response.message);
      }
    },
    // 根据档案大类查询明细分类
    *handleGetFileTypeByDoc({ payload }, { call, put }) {
      const response = yield call(handleGetFileTypeByDocAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'updateBreakdown',
          payload: {
            breakdown: response.data ? response.data : [],
          },
        });
      } else {
        message.error(response.message);
      }
    },
    /************************************************** */
    // 个人文档列表信息
    *handleGetPersonalListMsg({ payload }, { call, put }) {
      const response = yield call(handleGetPersonalListAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'savePersonalListFetch',
          payload: response.data,
        });
      } else {
        message.warn(response.message);
      }
    },
    // 个人文档列表--批量删除
    *handleDeletePersonalListMsg({ payload }, { call, put }) {
      const response = yield call(handleDeletePersonalListAPI, payload);
      let flag = false;
      if (response && response.status === 200) {
        message.success('删除成功');
        flag = true;
      } else {
        message.warn(response.message);
      }
      return flag;
    },
    // 个性化树形
    *handleGetPersonalTreeInfo({ payload }, { call, put }) {
      const response = yield call(handleGetPersonalTreeAPI, payload);
      let newData = [];
      if (response && response.status === 200) {
        if (response.data) {
          const data = cloneDeep(response.data);
          newData = handleNewTreeData(data, 'id', 'name');
        }
        yield put({
          type: 'savePersonalTreeData',
          payload: newData,
        });
      } else {
        message.warn(response.message);
      }
    },
    // 个性化树，添加修改
    *handleAddTreeInfo({ payload }, { call, put }) {
      const response = yield call(handleAddTreeAPI, payload);
      let flag = false;
      if (response && response.status === 200) {
        message.success('操作成功');
        flag = true;
      } else {
        message.warn(response.message);
        flag = false;
      }
      return flag;
    },
    // 个性化树，删除
    *handleDeleteTreeInfo({ payload }, { call, put }) {
      const response = yield call(handleDeleteTreeAPI, payload);
      let flag = false;
      if (response && response.status === 200) {
        flag = true;
        message.success('删除成功');
      } else {
        message.warn(response.message);
        flag = false;
      }
      return flag;
    },
    // 列表修改标签
    *handleUpdatePersonalTag({ payload }, { call, put }) {
      const response = yield call(handleUpdatePersonalTagAPI, payload);
      let flag = false;
      if (response && response.status === 200) {
        flag = true;
        message.success('操作成功');
      } else {
        message.warn(response.message);
        flag = false;
      }
      return flag;
    },
    // 上传人
    *handleGetUploadPersonInfo({ payload }, { call, put }) {
      const response = yield call(handleGetPersonAPI, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'saveUploadPersonFetch',
          payload: response.data,
        });
      } else {
        message.warn(response.message);
      }
    },
    /*************************************** */
    // 产品树
    *handleGetProductTreeInfo({ payload }, { call, put }) {
      const response = yield call(handleGetProductTreeAPI, payload);
      let newData = [];
      if (response && response.status === 200) {
        if (response.data) {
          const data = cloneDeep(response.data);
          newData = handleNewTreeData(data, 'key', 'value');
        }
        yield put({
          type: 'saveProductTreeData',
          payload: newData,
        });
      } else {
        message.warn(response.message);
      }
    },
    // 产品树子节点查询
    *handleGetProductTreeNodesInfo({ payload }, { call, put }) {
      const response = yield call(handleGetProductTreeNodesAPI, payload);
      let newData = [];
      if (response && response.status === 200) {
        if (response.data) {
          const data = cloneDeep(response.data);
          newData = handleNewTreeData(data, 'key', 'value');
        }
      }
      return newData;
    },
  },

  reducers: {
    saveTreeData(state, { payload }) {
      return {
        ...state,
        saveTreeData: payload,
      };
    },
    savePersonalTreeData(state, { payload }) {
      return {
        ...state,
        savePersonalTreeData: payload,
      };
    },
    saveProductTreeData(state, { payload }) {
      return {
        ...state,
        saveProductTreeData: payload,
      };
    },
    saveListFetch(state, { payload }) {
      return {
        ...state,
        saveListFetch: payload,
      };
    },
    savePersonalListFetch(state, { payload }) {
      return {
        ...state,
        savePersonalListFetch: payload,
      };
    },
    saveVersionData(state, { payload }) {
      return {
        ...state,
        saveVersionData: payload,
      };
    },
    saveRecordList(state, { payload }) {
      return {
        ...state,
        saveRecordList: payload,
      };
    },
    documentTags(state, { payload }) {
      return {
        ...state,
        documentTags: payload.documentTags,
      };
    },
    // 档案大类action
    updateDocumentBigType(state, { payload }) {
      return {
        ...state,
        documentBigType: payload.documentBigType,
      };
    },
    // 文档类型action
    updateDocumentType(state, { payload }) {
      return {
        ...state,
        documentType: payload.documentType,
      };
    },
    // 明细分类
    updateBreakdown(state, { payload }) {
      return {
        ...state,
        breakdown: payload.breakdown,
      };
    },
    // 上传人
    saveUploadPersonFetch(state, { payload }) {
      return {
        ...state,
        saveUploadPersonFetch: payload,
      };
    },
  },
};
