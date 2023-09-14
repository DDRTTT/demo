import React, { Component } from 'react';
import {message} from "antd";
import styles from "./index.less";
import { getJsonFromSession, getValFromSession } from './utils';

import {cloneDeep} from "lodash";

// 获取流程节点中的参数 来确定编辑器开放的权限
let editAll = false;  // 可编辑全部内容

// 编辑器权限参数  mode为view时，直接只读打开。mode为“edit”时，review为true，并且edit为false，是修订强制开启
let unitParameters = {
  edit: true, // 编辑
  user: {
    id: '',
    name: ''
  }
};

let cx = {};
let contractKey = '';

// getDocumentContent 缺省参数
const OBJECT = {
  object: 'content',
  type: 'text',
  name: '',
  id: '',
}

const simpleHeader = {
  Accept: "application/json",
  "Content-Type": "application/json;charset=UTF-8",
};

const headers = {
  ...simpleHeader,
  Token: getValFromSession('auth_token') || '',
  Data: new Date().getTime(),
  Sys: 1,
  userId: getJsonFromSession('USER_INFO')?.id || null
}

class Index extends Component {
  constructor(props){
    super(props);

  }
  formRef = React.createRef();
  state = {
    userId: 0,
    orgId: 0,
    data: [],
    require: false,
    upLoading: false,
    record: { id: 0 },
    pair: [],
    type: '',
    key: '',
    name: '',
    url: '',

    tags: [],
    tagsCopy:[],
    tagsLoading:false,
    docxTags: [],
    mappingVisible: false,
    shineLoading: false,
    isAll: '',
    checkL: [],
    idArr: [],
    formItemLoading: false,
    formItems: [],
    loading: false,
    indeterminate: false,
  }

  onRequestClose = () => {};

  onDocumentReady = () =>{
    message.success('文档加载完成');
    cx.getDocumentContent(OBJECT);
    const tags = this.state.docxTags;
    console.log(tags, 444);
    tags.forEach((item)=>{
      cx.setDocumentContent({
        object: 'content',
        type: 'replace',
        id: item.directoryNumber,
        value: item.text,
      });
    });
  }
  // 重构结束----------------------------
  onGetDocumentContent = (event) => {
    console.log(event, 666);
  };

  setCxConfig = (baseConfig) =>{
    const userInfo = getJsonFromSession('USER_INFO');
    const { fileType, key, title, url } = baseConfig;
    const config = cloneDeep(this.props.docConfig);
    config.document = {...config.document, fileType, key, title, url};
    config.document.permissions = {
      ...config.document.permissions,
      edit: unitParameters.edit, // 是否可编辑 true 可编辑 false 只读
      setPermissionShow: !!editAll,  // 显示权限配置按钮
      partauth:  {
        canLockStyle: true, // 是否能锁定样式
        canUnLockStyle: false, // 能否解锁样式
        isStyleLock: false, // 是不是样式
      }
    };
    config.editorConfig = {  ...config.editorConfig, user: {id: userInfo.id, name: userInfo.username},};
    config.events = {
      onDocumentReady: this.onDocumentReady,
      onRequestClose: this.onRequestClose,
      onGetDocumentContent: this.onGetDocumentContent,
    };
    return config;
  }

  renderCXEditor = (fileType, key, title, url) => {
      const config = this.setCxConfig({fileType, key, title, url});
      cx = new CXO_API.CXEditor('COX_Editor_SKD', config);
  };

  getContractBaseData = () => {
    const { fileDefaultPath, docInfo } = this.props;
    const { fileSerialNumber } = docInfo;

    if (fileSerialNumber) {
      const { docInfo, serviceCdn } = this.props;
      this.renderCXEditor(docInfo?.fileFormat || 'docx', fileSerialNumber, docInfo?.fileName || '没有文件名', `${serviceCdn.gateWayIp + fileDefaultPath + contractKey}`);
    }
  }

  appendJQCDN = () => {
    const url = this.props.serviceCdn.jsApi;
    const head = document.head || document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.setAttribute('src', url);
    head.appendChild(script);
    // 判断外部js是否加载完成
    const _this = this;
    script.onload = script.onreadystatechange = function () {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        _this.getContractBaseData();
      }
      script.onload = script.onreadystatechange = null;
    }
  }

  messageHandle = (eData) => {
      // 触发监听后 下发的数据(取值为隐藏项中的值---流水号 文件类型 文件名称) 这个值 可能是选择产品后获取的 也可能是上传的 文件列表中的数据 用这些参数加载文档
      //   cx?.destroyEditor && cx.destroyEditor();
    const docInfo = this.props.docInfo;

    contractKey = docInfo?.fileSerialNumber;
      if (!contractKey) {
        message.warn("没有获取到对应的文件流水号")
      }
      this.appendJQCDN();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.nodeInfo  !== this.props.nodeInfo) {
      // cx.destroyEditor && cx.destroyEditor();
      this.messageHandle(this.props.nodeInfo);
    }
  }

  componentDidMount() {
    if(cx?.destroyEditor){
      cx.destroyEditor();
    }
    // 销毁之前的组件，未知是否必要
    if(this.props.nodeInfo){
      this.messageHandle(this.props.nodeInfo);
    }
  }

  componentWillUnmount() {
    cx.destroyEditor && cx.destroyEditor();
  }
  render() {
    return (
      <div className={styles.box}>
        <div id="COX_Editor_SKD" />
      </div>
    )
  }
}
export default Index;
