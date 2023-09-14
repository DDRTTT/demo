//招募说明书设置
import React, { Component } from 'react';
import router from 'umi/router';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Input,
  message,
  Modal,
  Popconfirm,
  Popover,
  Row,
  Spin,
  Switch,
  Tabs,
  Tooltip,
  Tree,
} from 'antd';
import { SyncOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import styles from '@/components/DocDeal/index.less'
import { callbackUrl, downloadUrl, OBJECT, unitParameters } from '@/components/DocDeal/docConfig/cxConfig.js';
import {
  getBusinessData,
  getMapping,
  getNginxIP,
  saveTagContent,
  saveTemplate,
  saveTpltags,
  setAuthorize,
} from '@/services/prospectuSet';
import { getDocumentType, uuid } from '@/utils/utils';
import { getSession } from '@/utils/session';
import { groupBy, queryArrByType } from '@/utils/groupby';
import { cloneDeep } from 'lodash';
import {Breadcrumb, PageContainers} from '@/components';
let cx = {};
const { TabPane } = Tabs;
const { TreeNode } = Tree;
const { Search } = Input;

class Index extends Component {
  state = {
    IPObject: {},
    templateDetailsParams: {},
    userInfo: {},
    templateKey: '',
    switchStatus: true,
    more: false,
    tags: [],
    data: [],
    dataCopy: [],
    dataLoading: false,
    docxTags: [], // 左侧标签
    docxTagsCopy: [],
    pair: [], // 标签与业务要素关系
    formItems: [], // 右侧业务要素
    saveBtn: true,
    docxTagsLoading: false, // 标签加载效果
    formItemLoading: false, // 业务要素加载效果
    pairLoading: false, // 业务要素关联关系加载效果
    mappingVisible: false, // 保存标签与业务要素关联信息加载圈效果
    saveLoading: false, // 保存模版加载圈效果
    configLoading: false, //一键配置按钮加载效果
    idArr: [], // 映射关联 选中项集合
    checkL: [],
    isAll: '',
    checkedKeys: [],
    selectedRowKeys: [],
    selectedRows: [],
    configFlag: true,
    titleVisible: {}, //一键配置按钮的显示与隐藏（在标准模板中隐藏）
    columns: [
      {
        title: '标签',
        dataIndex: 'name',
        key: 'id',
        sorter: false,
        ellipsis: true,
        render: (text, record) => <a onClick={() => this.selectTags(record.id)}>{text || '--'}</a>,
      },
    ],
  };
  tagsRulesRef = React.createRef();
  permissBoxRef = React.createRef();
  renderCXEditor = () => {
    const {
      IPObject,
      userInfo,
      templateDetailsParams,
      fileType,
      templateKey,
      title,
    } = this.state;
    console.time('文档加载时间');
    const cxo_config = {
      // type: 'embedded',
      document: {
        //文档参数集设置
        fileType, // 指明要打开的文档的类型 docx
        key: templateKey, // 文档唯一ID 123456
        title: title.length > 20 ? `${title.substr(0, 20)}...` : title, // 文档标题 document.docx
        url: `${IPObject.gateWayIp}/${downloadUrl}?getFile=${templateKey}`, // 文件存放路径 http://documentserver.com/example-document.docx
        permissions: {
          // permissions 文档权限  (permissions.edit和permissions.review 与 mode的值有关
          download: unitParameters.download, // 指定是否开启下载功能，默认 true
          edit: true, // 是否可编辑 true 可编辑 false 只读
          print: unitParameters.print, // 是否可打印
          review: true, // 是否可修订
          copyoutenabled: unitParameters.copyoutenabled, // 是否可复制编辑器里的内容
          // commentFilter: unitParameters.commentFilter, // 批注权限
          comment: true,
        },
      },
      documentType: getDocumentType(fileType), // 指明文档类型 如 text(word) spreadsheet(excel) presentation(ppt)
      editorConfig: {
        callbackUrl: `${IPObject.gateWayIp}/${callbackUrl}`,
        customization: {
          about: false,
          autosave: unitParameters.autosave,
          forcesave: unitParameters.forcesave,
          chat: unitParameters.chat,
          comments: unitParameters.comments, // 指定是否开启批注功能，仅限 mode 参数设置为”edit”,默认值与edit 项一致
          zoom: unitParameters.zoom,
          rightMenu: unitParameters.rightMenu,
          header: unitParameters.header,
          leftMenu: unitParameters.leftMenu,
          toolbar: unitParameters.toolbar,
          statusBar: unitParameters.statusBar,
          logo: { image: '' },
        },
        mode: 'edit', 
        user: {
          id: userInfo?.id + '', //  id 一定要string类型
          name: userInfo?.username,
        },
      },
      events: {
        onAppReady: this.onAppReady,
        onDocumentReady: this.onDocumentReady,
        onError: this.onError,
        onRequestClose: this.onRequestClose,
        onWarning: this.onWarning,
        onDocumentStateChange: this.onDocumentStateChange,
        onGetDocumentContent: this.onGetDocumentContent,
      },
      height: '100%',
      width: '100%',
      type: 'desktop',
    };
    cx = new CXO_API.CXEditor('_COX_Editor_SKD', cxo_config);
  }; //  在线编辑 模板

  onAppReady = () => {
    message.success('编辑器加载完成');
  };

  onDocumentReady = () => {
    message.success('文档加载完成');
    console.timeEnd('文档加载时间');
    this.setState({ saveBtn: false });
    cx.getDocumentContent(OBJECT);
  };

  onError = event => {
    if (event.data.errorCode == 'forcesave') {
      JSON.parse(event.data.errorDescription).error == 0 && message.success('保存成功');
    } else {
      message.error(`编辑器错误: ${event.data.errorDescription}`);
    }
  };

  onRequestClose = () => {
    if (window.opener) {
      window.close();
      return;
    }
    cx.destroyEditor();
  };

  onWarning = event => {
    message.warn(`编辑器警告: ${event.data.warningDescription}`);
  };

  onDocumentStateChange = () => {};

  onGetDocumentContent = event => {};

  appendJQCDN = apiSrc => {
    let _this = this;
    let head = document.head || document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.setAttribute('src', apiSrc);
    head.appendChild(script);
    // 判断外部js是否加载完成
    script.onload = script.onreadystatechange = function() {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        _this.renderCXEditor();
      }
      script.onload = script.onreadystatechange = null;
    };
  };
  componentDidMount() {
    cx.destroyEditor && cx.destroyEditor();
    const userInfo = JSON.parse(getSession('USER_INFO'));
    const templateDetailsParams = JSON.parse(getSession('_templateParams'));
    getNginxIP().then(res => {
      if (res?.status === 200) {
        this.setState(
          {
            IPObject: res.data,
            userInfo,
            templateDetailsParams,
            fileType: templateDetailsParams.type || 'docx',
            templateKey: templateDetailsParams.fileNumber || templateDetailsParams.fileSerialNumber,
            title: templateDetailsParams.templateName || templateDetailsParams.fileName,
          },
          () => {
            this.appendJQCDN(res.data.jsApi);
          },
        );
      }
    });
  }
  componentWillUnmount() {
    cx.destroyEditor && cx.destroyEditor();
    ['_templateKey', 'templateDetailsParams'].forEach(sessionKey => {
      sessionStorage.removeItem(sessionKey);
    });
  }
  save = () => {
    const { userInfo, templateKey, IPObject } = this.state;
    const params = {
      c: 'forcesave',
      key: templateKey,
      userdata: JSON.stringify({
        orgId:userInfo.orgId,
        userOrgName: '',
        dataType: 5, // 0.仅保存 1.保存个人版本  2.行外推送保存个人版本 3 .合同文件保存模板  4.空白文档和导入文档保存模板  5.修改模板
        status: '6',
        userId: userInfo.id,
        serialNum: templateKey,
        fileNumber: templateKey,
        templateKey: templateKey,
        busId: templateKey,
        fileForm: 'docx',
        sysCode: 'flow',
        fileKey: templateKey,
        id: templateKey,
      }),
    }
    fetch(`${IPObject.jsApiIp}/coauthoring/CommandService.ashx`, {
      method: 'POST',
      body: JSON.stringify(params)
    }).then(res => {
      if (res?.status === 200) {
        res.json().then(response => {
          if (+response?.error === 4) {
            // 文档没有改动的时候 调用historicalVersionAdd()保存
            // this.historicalVersionAdd();
          }
        })
        window.history.back()
        cx.destroyEditor && cx.destroyEditor();
      }
    })
  }
  back = () => {
    window.history.back()
    cx.destroyEditor && cx.destroyEditor();
  }

  render() {
    const {} = this.state;
    return (
      <div style={{ height: 'calc(100vh - 112px)' }}>
        <div>
          <PageContainers breadcrumb={
            [
              { title: '招募说明书', url: '' },
              { title: '招募说明书干预', url: '' },
            ]
          }
          />
        </div>
        <div
          style={{
            textAlign: 'right',
            lineHeight: '48px',
            backgroundColor: '#ffffff',
            paddingRight: '30px',
          }}
        >
          <Button type='primary' onClick={this.save} style={{marginLeft: 10, fontSize: 12}}>保存</Button>
          <Button onClick={this.back} style={{marginLeft: 10, fontSize: 12}}>返回</Button>
        </div>
        <div style={{ width: '100%', float: 'left', height: '100%' }}>
          <div id="_COX_Editor_SKD"></div>
        </div>
      </div>
    );
  }
}

export default Index;
