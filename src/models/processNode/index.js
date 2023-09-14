/*
流程节点数据存储项
2022-12-1 日重构流程内容
*/

import {message} from 'antd';
import {
  getDirectoryVoListByChangxiekeyInFlow,
  getServiceCdn,
  getTaskData,
  multitaskingReject,
  submitNewProcess
} from "@/services/processRelate";
import {router} from 'umi';

export default {
  namespace: 'processNode',
  state: {
    selectTags: [],
    coreModule: '',
    fileDefaultPath: '/ams/ams-file-service/fileServer/downloadUploadFile?getFile=', // 文件服务器默认路径
    showMode: 'view',
    createStatus: 'tmp', // tmp 添加临时更新， all添加全部更新
    tagsList: [], // 右侧标签列表
    templateForms: [], // 表单数据列表

    processData: {// 流程基本信息，从列表中获取
      taskId: '',
      nodeId: '',
      processId: '', // 流程id
      processInstanceId: '',
      templateId: '',
    },
    nodeInfo: { // 节点基本信息，点击办理后获取
      formData: {},
      templateForms: [],
      readFlag: 1,
      taskDefinitionKey: '',
      taskName: '',
      processedForms: '', // base64转化后的表单数据，不需要存储
    },

    docInfo: { // 文档信息，点击列表后获得的数据和文档相关内容
      fileFormat: "",
      fileName: ""
    },

    viewStatus: 'view',

    //文件服务器cdn列表
    serviceCdn: {
      gateWayIp: '',
      jsApi: '',
      jsApiIp: '',
      nginxIp:'',
    }
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const pathname = location.pathname;
        if(pathname.includes('/processFlow/addAll')){
          // 编辑页面
          dispatch({
            type: 'setCreateStatus',
            payload: {creatStatus : 'all'}
          });
        } else if(pathname.includes('/processFlow/addTmp')){
          // 添加页面
          dispatch({
            type: 'setCreateStatus',
            payload: {creatStatus : 'tmp'}
          });
        }  else if(pathname.includes('/processFlow/process')){
          // 编辑页面
          // 获取额外数据
          dispatch({
              type: 'getCdnInfo',
              payload: null
            }
          );

          const status =   sessionStorage.getItem('viewStatus') || 'view';
          dispatch({
              type: 'configViewStatus',
              payload: status
            }
          );

          const  nodeData = JSON.parse(sessionStorage.getItem('_templateParams'));
          dispatch({
              type: 'getNodeData',
              payload: nodeData
            }
          );
        }
      });
    },
  },

  effects: {
    *configViewStatus({ payload }, { put, call}){
      yield put({
        type: 'setViewStatus',
        payload: payload,
      });
    },
    *setSelectTagsList({ payload }, { put, call}){
      yield put({
        type: 'setSelectTags',
        payload: [ ...payload ],
      });
    },
    *returnProcess({ payload, cb }, { put, call}){
      const res = yield call(multitaskingReject, payload);
      if(res?.status === 200){
        cb();
      } else {
        message.error(res.message);
      }
    },
    *createProcess({ payload, cb }, { put, call}) {
      const res = yield call(submitNewProcess, payload);
      if(res?.status === 200){
        // setCdn
        router.goBack();
      } else {
        message.error(res.message);
      }
      cb();
    },
    // 获取cdn信息
    *getCdnInfo({ payload }, { put, call}) {
      const cdn = yield call(getServiceCdn, { });
      if(cdn?.status === 200){
        // setCdn
        yield put({
          type: 'setCdn',
          payload: { ...cdn.data },
        });
      } else {
        message.error(cdn.message);
      }
    },
    // 获取流程节点数据
    *getNodeData({ payload }, { put, call }) {
      // 流程列表中的数据缓存，流程定义key，实例id，任务id等
      yield put({
        type: 'setProcessData',
        payload: { ...payload },
      });

      // 获取节点数据
      const taskId =  payload.processList[0]?.taskList[0]?.id;
      if(!taskId){
        message.error('查找不到当前流程任务id.');
        return
      }
      const res = yield call(getTaskData, { taskId});
      if (res && res.status === 200) {
        // 核心模块代码
        yield put({
          type: 'setCoreModule',
          payload: {
            coreModule: res.data.formData.coreModule
          }
        });
        // 缓存所有数据
        yield put({
          type: 'setNodeData',
          payload: {
            ...res.data,
            // 原有表单渲染数据不再保留
            processedForms: '',
            inputParameters: [],
            templateForms: [],
          }
        });
        // 缓存按钮
        yield put({
          type: 'setInputParameters',
          payload: [
            ...res.data.inputParameters
          ]
        });
        // 未知什么用，原有标签列表
        sessionStorage.setItem(
          'directoryNames',
          JSON.stringify(res.data.formData.directoryNamesParam)
        );
        sessionStorage.setItem('returnedTags', res.data.formData.returnedTags);

        // 分发显示数据
        yield put({
          type: 'setNodeShow',
          payload: [...res.data.templateForms]
        });

        // 分发文档数据
        const fileData = res.data.formData.fileData;
        yield put({
          type: 'setDocData',
          payload: {
            ...fileData,
          }
        });

        // // 获取标签列表，标签列表有几种获取方式，这里不再获取
        const tagsRes = yield call(getDirectoryVoListByChangxiekeyInFlow, {
          changxieKey: fileData.fileSerialNumber,
          isTransacting: true });
        if(tagsRes.status === 200){
          yield put({
            type: 'setTags',
            payload: [
              ...tagsRes.data,
            ]
          });
        }
      } else {
        message.error(res.message);
      }
    },
    // 创建模式：临时更新/全部更新
    *setCreateStatus({ payload }, { put, call}) {
      // actionChannel:ƒ actionChannel(pattern, buffer)
      // all:ƒ all(effects)
      // apply:ƒ apply(context, fn)
      // call:ƒ call(fn)
      // cancel:ƒ cancel()
      // cancelled:ƒ cancelled()
      // cps:ƒ cps(fn)
      // flush:ƒ flush(channel)
      // fork:ƒ fork(fn)
      // getContext:ƒ getContext(prop)
      // join:ƒ join()
      // put:ƒ put(action)
      // race:ƒ race(effects)
      // select:ƒ select(selector)
      // setContext:ƒ setContext(props)
      // spawn:ƒ spawn(fn)
      // take:ƒ take(type)
      // takeEvery:ƒ takeEvery(patternOrChannel, worker)
      // takeLatest:ƒ takeLatest(patternOrChannel, worker)
      // takem:ƒ ()
      // throttle:ƒ throttle(ms, pattern, worker)
      yield put({
          type: 'setStatus',
          payload: { ...payload },
        });
    },
  },
  reducers: {
    setViewStatus(state, { payload }){
      return {
        ...state,
        viewStatus: payload
      };
    },
    // 设置cdn内容
    setCdn(state, { payload }){
      return {
        ...state,
        serviceCdn: { ...payload },
      };
    },
    // 设置流程数据
    setProcessData(state, { payload }) {
      return {
        ...state,
        processData: {...payload},
      };
    },
    // 设置节点数据
    setNodeData(state, { payload }) {
      return {
        ...state,
        nodeInfo: {...payload  },
      };
    },
    // 设置显示数据和流程节点数据
    setNodeShow(state, { payload }) {
      return {
        ...state,
        templateForms: [...payload ],
      };
    },
    // 设置文档数据
    setDocData(state, { payload }) {
      return {
        ...state,
        docInfo: { ...payload },
      };
    },
    setStatus(state, { payload }) {
      return {
        ...state,
        createStatus: payload.creatStatus,
      };
    },
    setTags(state, { payload }){
      return {
        ...state,
        tagsList: [ ...payload ],
      };
    },
    setCoreModule(state, { payload }){
      return {
        ...state,
        coreModule: payload.coreModule,
      };
    },
    setInputParameters(state, { payload }){
      return {
        ...state,
        inputParameters: [ ...payload ],
      };
    },
    setSelectTags(state, { payload }){
      return {
        ...state,
        selectTags: [ ...payload ],
      };
    },
  },
};
