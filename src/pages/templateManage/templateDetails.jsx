import React, { Component } from 'react';
import {
  Popconfirm,
  Transfer,
  Popover,
  Checkbox,
  Radio,
  message,
  Form,
  Select,
  Input,
  Row,
  Col,
  Button,
  Table,
  Tabs,
  Upload,
  Card,
  Spin,
  Empty,
  Divider,
  Modal,
  Switch,
  Pagination,
  Tooltip,
  Breadcrumb,
  Tree,
} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import styles from './index.less';
import request from '@/utils/request';
import { stringify } from 'qs';
import { uuid } from '@/utils/utils';
import router from 'umi/router';
import Base64 from '@/utils/Base64';
import cloneDeep from 'lodash/cloneDeep';
import monment from 'moment';
const { TabPane } = Tabs;
const { TreeNode } = Tree;

let tagsCheckedArr = []; // 文档标签 选中项集合
let itemsCheckedArr = []; // 元素标签 选中项集合
let _id = 0;
// let _docxTags = [{ id: 2, name: '产品tujd称', text: '同时都不设置值则提取当前文档所有内容域的文本，返回值包含内容域的name,id及对应的文本内容，id通过接口查询' }, { id: 3, name: '币种', text: '同时都不设置值则提取当前文档所有内容域的文本，返回值包含内容域的name,id及对应的文本内容，id通过接口查询' }, { id: 4, name: '产品生产日期称', text: '同时都不设置值则提取当前' }];
let _docxTags = [];
let _formItems = [];
let _pair = [];

// 权限参数
let unitParameters = {
  download: true, // 下载
  edit: true, // 编辑
  print: true,
  review: true, // 修订
  copyoutenabled: true, // 是否可以复制编辑器里的内容
  commentFilter: {
    // 批注设置
    type: 'Default', // Default 全部可见 NoDisplay 全部不可见  DisplaySection 部分可见 NoDisplaySection 部分不可见
    userList: [], // 设置可以看见批注人员的id
  },
  chat: true, // 聊天菜单
  comments: true,
  zoom: 100, // 缩放 默认100
  leftMenu: true, // 左侧菜单  主要操作 搜索、文档结构(目录)、批注、聊天
  rightMenu: false, // 右侧菜单  主要操作 行间距、段间距、背景色、标签、边距等
  toolbar: true, // 上边菜单  所有的操作(包含左右菜单的所有功能)
  header: true,
  statusBar: true, // 下边菜单 主要操作 缩放、修订、显示总页数和当前页
  autosave: true,
  forcesave: true, // 强制保存
  mode: 'edit', // view 只读  edit 编辑
  user: {
    id: '',
    name: '',
  },
};
// 页面样式参数
const cssParameters = {
  height: '800px',
  // height: "500px",
  width: '100%',
  type: 'desktop', // desktop PC端 mobile 移动端
};
let cx = {};
const OBJECT = {
  object: 'content',
  type: 'text',
  name: '',
  id: '',
};

let customization = {};

const breadcrumbStatic = { newAdd: '新增', isSee: '查看', isUpdate: '修改' };

const isChecked = (selectedKeys, eventKey) => selectedKeys.indexOf(eventKey) !== -1;

const generateTree = (treeNodes = [], checkedKeys = []) =>
  treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: checkedKeys.includes(props.key),
    children: generateTree(children, checkedKeys),
  }));

const TreeTransfer = ({ dataSource, targetKeys, ...restProps }) => {
  const transferDataSource = [];
  function flatten(list = []) {
    list.forEach(item => {
      transferDataSource.push(item);
      flatten(item.children);
    });
  }
  flatten(dataSource);

  return (
    <Transfer
      {...restProps}
      targetKeys={targetKeys}
      titles={['备选待授权人员', '已选被授权人员']}
      operations={['审批入库', '撤消入库']}
      dataSource={transferDataSource}
      className="tree-transfer"
      render={item => item.title}
      showSelectAll={false}
      listStyle={{
        width: 300,
        height: 400,
      }}
    >
      {({ direction, onItemSelect, selectedKeys }) => {
        if (direction === 'left') {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <Tree
              blockNode
              checkable
              checkStrictly
              defaultExpandAll
              checkedKeys={checkedKeys}
              treeData={generateTree(dataSource, targetKeys)}
              onCheck={(_, { node: { key } }) => {
                onItemSelect(key, !isChecked(checkedKeys, key));
              }}
              onSelect={(_, { node: { key } }) => {
                onItemSelect(key, !isChecked(checkedKeys, key));
              }}
            />
          );
        }
      }}
    </Transfer>
  );
};

const treeData = [
  { key: '0-0', title: '0-0' },
  {
    key: '0-1',
    title: '0-1',
    children: [
      { key: '0-1-0', title: '0-1-0' },
      { key: '0-1-1', title: '0-1-1' },
    ],
  },
  { key: '0-2', title: '0-3' },
];

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
    saveBtn: true,
    docxTags: [],
    isWrite: 2,
    mappingVisible: false,
    shineLoading: false,
    pair: [],
    formItems: [],
    formItemLoading: false,
    itemChecked: '',
    idArr: [], // 映射关联 选中项集合
    checkL: [],
    isAll: '',
    saveLoading: false,
    permissionVisible: false,
    staffVisible: false,
    staffLoading: false,
    allKeys: [],
    targetKeys: ['0-1'],
    contractDirectoryId: '',
    directoryNumber: '',
    record: {},
    permissionLoading: false,
    isSee: 0,
    _status: '',
    selectedKeys: [],
    powerList: [],
  };

  switchChange = checked => {
    this.setState({ switchStatus: checked, isWrite: checked ? 2 : 1 });
    if (!checked) {
      this.getStaffList();
    }
  };

  renderCXEditor = (fileType, key, title, url) => {
    console.time('文档加载时间');
    const _status = sessionStorage.getItem('_status');
    const { IPObject, userInfo, templateDetailsParams } = this.state;
    let cxo_config = {
      // type: 'embedded',
      document: {
        fileType, // 指明要打开的文档的类型
        key, // 文档唯一ID
        title, // 文档标题
        url, // 文件存放路径
        permissions: {
          // permissions 文档权限  (permissions.edit和permissions.review 与 mode的值有关
          download: unitParameters.download, // 是否可下载
          edit: unitParameters.edit, // 是否可编辑 true 可编辑 false 只读
          print: unitParameters.print, // 是否可打印
          review: unitParameters.review, // 是否可修订
          copyoutenabled: unitParameters.copyoutenabled, // 是否可复制编辑器里的内容
          commentFilter: unitParameters.commentFilter, // 批注权限
        },
      },
      documentType: this.getDocumentType(fileType), // 指明文档类型 如 word excel
      editorConfig: {
        callbackUrl: `${IPObject.gateWayIp}/ams/ams-file-service/businessArchive/callbackUpdateFile`,
        customization: {
          about: false,
          createUrl:
            _status === 'newAdd'
              ? `${IPObject.gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=12301127050547317982`
              : undefined,
          chat: unitParameters.chat,
          comments: unitParameters.comments,
          zoom: unitParameters.zoom,
          leftMenu: _status === 'isSee' ? false : unitParameters.leftMenu,
          rightMenu: unitParameters.rightMenu,
          toolbar: _status === 'isSee' ? false : unitParameters.toolbar,
          header: unitParameters.header,
          statusBar: _status === 'isSee' ? false : unitParameters.statusBar,
          autosave: unitParameters.autosave,
          forcesave: unitParameters.forcesave,
          logo: {
            image: '',
          },
        },
        mode: _status === 'isSee' ? 'view' : 'edit',
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
        onDownloadAs: this.onDownloadAs,
        onGetDocumentContent: this.onGetDocumentContent,
        // forceSave: this.forceSave,
      },
      height: cssParameters.height,
      width: cssParameters.width,
      type: cssParameters.type,
    };

    cx = new CXO_API.CXEditor('_COX_Editor_SKD', cxo_config);
  }; //  在线编辑 模板

  getDocumentType = ext => {
    if (
      '.doc.docx.docm.dot.dotx.dotm.odt.fodt.ott.rtf.txt.html.htm.mht.pdf.djvu.fb2.epub.xps'.indexOf(
        ext,
      ) !== -1
    )
      return 'text';
    if ('.xls.xlsx.xlsm.xlt.xltx.xltm.ods.fods.ots.csv'.indexOf(ext) !== -1) return 'spreadsheet';
    if ('.pps.ppsx.ppsm.ppt.pptx.pptm.pot.potx.potm.odp.fodp.otp'.indexOf(ext) !== -1)
      return 'presentation';
    return null;
  };

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
    message.error(`编辑器错误: code ${event.data.errorCode}, 描述 ${event.data.errorDescription}`);
  };

  onRequestClose = () => {
    if (window.opener) {
      window.close();
      return;
    }
    cx.destroyEditor();
  };

  onWarning = event => {
    message.warn(`编辑器警告: code ${event.data.warningCode}, 描述 ${event.data.warningDescription}`,);
  };

  onDocumentStateChange = () => { };

  onDownloadAs = event => { };

  setFormItems = (key, value) => { };

  onSearchL = val => {
    let { docxTags } = this.state;
    if (val === '') {
      this.setState({ docxTags: _docxTags, checkL: [], isAll: '' });
    } else {
      docxTags = _docxTags.filter(key => key.name.includes(val));
      this.setState({ docxTags: JSON.parse(JSON.stringify(docxTags)), checkL: [], isAll: '' });
    }
    tagsCheckedArr = [];
  };
  onSearchM = val => {
    let { pair } = this.state;
    if (val === '') {
      this.setState({ pair: _pair });
    } else {
      pair = _pair.filter(
        key => key.docxTags.name.includes(val) || key.formItems.label.includes(val),
      );
      this.setState({ pair: JSON.parse(JSON.stringify(pair)) });
    }
  };

  onSearchR = val => {
    if (val === '') {
      this.setState({ formItems: _formItems });
    } else {
      this.setState({ formItems: JSON.parse(JSON.stringify(_formItems.filter(key => key.label.includes(val)))) });
    }
  };

  checkBoxChangeL = ({ target: { checked } }, item) => {
    let { checkL } = this.state;
    if (checked) {
      tagsCheckedArr.push(item);
      checkL.push(item.id);
    } else {
      tagsCheckedArr = tagsCheckedArr.filter(key => key.id !== item.id);
      checkL = checkL.filter(key => key !== item.id);
    }
    this.setState({ checkL: JSON.parse(JSON.stringify(checkL)), isAll: '' });
  };

  checkBoxChangeM = ({ target: { checked } }, id) => {
    let { idArr } = this.state;
    if (checked) {
      idArr.push(id);
    } else {
      idArr = idArr.filter(key => key !== id);
    }
    this.setState({ idArr: JSON.parse(JSON.stringify(idArr)) });
  };

  checkBoxChangeR = ({ target: { checked } }, item) => {
    if (checked) {
      itemsCheckedArr = [];
      itemsCheckedArr.push(item);
      this.setState({ itemChecked: item.key });
    } else {
      itemsCheckedArr = [];
      this.setState({ itemChecked: '' });
    }
  };

  isCheckAll = str => {
    let { docxTags, checkL } = this.state;
    if (str === 'isAll') {
      docxTags.forEach(item => {
        const ID = checkL.find(key => key === item.id);
        if (!ID) {
          checkL.push(item.id);
        }
        const ITEM = tagsCheckedArr.find(key => key.id === item.id);
        if (!ITEM) {
          tagsCheckedArr.push(item);
        }
      });
    }
    if (str === 'recheck') {
      docxTags.forEach(item => {
        const ID = checkL.find(key => key === item.id);
        if (ID) {
          checkL = checkL.filter(key => key !== item.id);
        } else {
          checkL.push(item.id);
        }
        const ITEM = tagsCheckedArr.find(key => key.id === item.id);
        if (ITEM) {
          tagsCheckedArr = tagsCheckedArr.filter(key => key.id !== item.id);
        } else {
          tagsCheckedArr.push(item);
        }
      });
    }
    if (str === 'noAll') {
      checkL = [];
      tagsCheckedArr = [];
    }
    this.setState({ isAll: str, checkL: JSON.parse(JSON.stringify(checkL)) });
  };

  addPair = () => {
    let { pair, docxTags, checkL } = this.state;
    if (tagsCheckedArr.length === 0) {
      message.warn('请至少选择一个文档标签');
      return;
    }
    if (itemsCheckedArr.length !== 1) {
      message.warn('请选择模型要素且只能选择一个');
      return;
    }
    tagsCheckedArr.forEach(item => {
      ++_id;
      docxTags = docxTags.filter(key => key.id !== item.id);
      _docxTags = _docxTags.filter(key => key.id !== item.id);
      pair.push({
        docxTags: item,
        formItems: itemsCheckedArr[0],
        id: _id,
      });
      _pair.push({
        docxTags: item,
        formItems: itemsCheckedArr[0],
        id: _id,
      });
    });
    tagsCheckedArr = [];
    itemsCheckedArr = [];
    checkL = [];
    this.setState({
      pair: JSON.parse(JSON.stringify(pair)),
      docxTags: JSON.parse(JSON.stringify(docxTags)),
      checkL: JSON.parse(JSON.stringify(checkL)),
      itemChecked: '',
      isAll: '',
    });
  };

  delPair = () => {
    let { pair, docxTags, idArr, checkL } = this.state;
    if (idArr.length === 0) {
      message.warn('请至少选择一个映射关联数据');
      return;
    }
    idArr.forEach(id => {
      _pair.forEach(item => {
        if (item.id === id) {
          _docxTags.push(item.docxTags);
        }
      });
      let _index = _pair.findIndex((currentVal, i, arr) => {
        return currentVal.id === id;
      });
      _pair.splice(_index, 1);
      pair.forEach(item => {
        if (item.id === id) {
          docxTags.push(item.docxTags);
        }
      });
      let index = pair.findIndex((currentVal, i, arr) => {
        return currentVal.id === id;
      });
      pair.splice(index, 1);
    });
    tagsCheckedArr = [];
    itemsCheckedArr = [];
    checkL = [];
    this.setState({
      pair: JSON.parse(JSON.stringify(pair)),
      docxTags: JSON.parse(JSON.stringify(docxTags)),
      checkL: JSON.parse(JSON.stringify(checkL)),
      idArr: [],
    });
  };

  onGetDocumentContent = event => {
    const { templateKey } = this.state;
    let l = 0,
      tags = event.data.text,
      powerList = [],
      docxTags = [];
    if (tags.length > 0 && tags.length > l) {
      l = tags.length;
      tags.forEach(item => {
        if (item.name?.includes('填充')) {
          docxTags.push(item);
        } else {
          powerList.push(item);
        }
      });
      _docxTags = docxTags;

      this.setState({ docxTags, powerList, tags }, () => {
        let arr = [];
        tags.forEach((item, i) => {
          if (item.name) {
            arr.push({
              changxieKey: templateKey,
              directoryName: item.name,
              directoryNumber: item.id,
              text: item.text.substr(0, 30), // 最多只保留长度30的字符串
            });
          }
        });
        if (arr.length > 0) {
          // saveTags  isTemplate: 1,  // 标识为模板中的标签 2021 12 29
          fetch(`/ams/yss-contract-server/directory/add?changxieKey=${templateKey}&isTemplate=1`, {
            headers: {
              Token: sessionStorage.getItem('auth_token'),
              Accept: 'application/json',
              'Content-Type': 'application/json;charset=UTF-8',
              Data: new Date().getTime(),
              Sys: 1,
            },
            method: 'POST',
            body: JSON.stringify(arr),
          }).then(res => {
            if (res?.status === 200) {
              this.getStaffList();
            }
          });
        }
      });
    }
  };

  // 查询权限设置列表
  getStaffList = () => {
    const { templateKey } = this.state;
    this.setState({ permissionLoading: true }, () => {
      request(`/yss-contract-server/directory/selectDirectoryVoListByChangxiekey?changxieKey=${templateKey}`).then(res => {
        if (res?.status === 200) {
          const data = res.data, powerData = [];
          data.forEach(item => {
            if (!item.directoryName.includes('填充')) {
              powerData.push(item);
            }
          });
          this.setState({ data: powerData, permissionLoading: false });
        }
      });
    });
  };

  appendJQCDN = apiSrc => {
    let _this = this;
    let head = document.head || document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.setAttribute('src', apiSrc);
    head.appendChild(script);
    // 判断外部js是否加载完成
    script.onload = script.onreadystatechange = function () {
      if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
        const { IPObject, templateKey, templateDetailsParams } = _this.state;
        _this.renderCXEditor(
          templateDetailsParams?.type,
          templateKey,
          templateDetailsParams?.templateName || templateDetailsParams?.fileName,
          `${IPObject.gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${templateDetailsParams?.fileNumber}`,
        );
      }
      script.onload = script.onreadystatechange = null;
    };
  };

  // 获取地址
  getNginxIP = () => {
    request('/ams-file-service/businessArchive/getnginxip').then(res => {
      if (res?.status === 200) {
        this.appendJQCDN(res.data.jsApi);
        this.setState({ IPObject: res.data });
      }
    });
  };

  callback = key => {
    if (+key === 2) {
      this.reloadSignList();
    }
  };

  reloadSignList = () => {
    cx.getDocumentContent(OBJECT);
  };

  moreSet = flag => {
    this.setState({
      more: flag,
    });
  };

  setMappingBox = sign => {
    const { templateKey, userInfo, pair, docxTags } = this.state;
    this.setState({ mappingVisible: sign }, () => {
      if (sign) {
        this.setState({ shineLoading: true }, () => {
          // 获取右侧 表单项
          this.getFormItems();
          // 获取映射关系 并重新设置左侧文档标签
          request(
            `/yss-contract-server/data/selectByKey?changxieKey=${templateKey}&orgId=${userInfo.orgId}`,
          ).then(res => {
            if (res?.status === 200) {
              const data = res.data;
              if (data.length > 0) {
                _id = data.length;
                data.forEach((item, i) => {
                  let index = docxTags.findIndex(val => +val.id === +item.directoryNumber);
                  if (index !== -1) {
                    docxTags.splice(index, 1);
                  }
                  pair[i] = {
                    docxTags: {
                      id: +item.directoryNumber,
                      name: item.directoryName,
                      title: item.directoryName,
                      text: item.text,
                    },
                    formItems: { fromCode: item.fromCode, fromName: item.fromName },
                    id: i,
                  };
                });
                _docxTags = docxTags;
                _pair = pair;
              }
              this.setState({
                shineLoading: false,
                pair: JSON.parse(JSON.stringify(pair)),
                docxTags: JSON.parse(JSON.stringify(docxTags)),
              });
            } else {
              message.warn(res.message);
              // this.setState({ shineLoading: false })
            }
          });
        });
      } else {
        this.setState({
          shineLoading: false,
          tagsCheckedArr: [],
          itemsCheckedArr: [],
          _docxTags: [],
          docxTags: [],
          _formItems: [],
          formItems: [],
          _pair: [],
          pair: [],
          _id: 0,
        }, () => {
          this.reloadSignList(); // 获取左侧 文档标签
        });
      }
    });
  };

  reSet = () => {
    this.setState({
      shineLoading: true,
      tagsCheckedArr: [],
      itemsCheckedArr: [],
      _docxTags: [],
      docxTags: [],
      _formItems: [],
      formItems: [],
      _pair: [],
      pair: [],
      _id: 0,
    }, () => {
      this.reloadSignList();
      setTimeout(() => {
        this.setMappingBox(true);
      }, 3000);
    });
  };

  setDocxTags = (item, i) => { };

  // 根据流程ID获取右侧智能模型数据(全量数据)
  getFormItems = () => {
    const { templateDetailsParams } = this.state;
    this.setState({ formItemLoading: true }, () => {
      request(`/api/billow-diplomatic/template-id/${templateDetailsParams?.processId}`).then(res => {
        if (res?.status === 200) {
          let arr = [], _arr = [];
          const formItems = JSON.parse(Base64.decode(res?.data?.content)).formList;
          if (formItems.length > 0) {
            formItems.forEach(item => {
              // 子表单  再查一级
              if (item.type === "childFrom") {
                // item.type === "childFrom" vals可能是数组也可能是对象
                const vals = item?.value?.formList;
                if (Array.isArray(vals)) {
                  vals.forEach(v => {
                    if (['text', 'number', 'textarea', 'time', 'datetime', 'datetimerange', 'date', 'select',].includes(v.type)) {
                      arr.push({ key: v.key, label: v.label })
                    }
                  })
                } else {
                  arr.push({ key: vals.key, label: vals.label });
                }
              } else {
                if (item.label === '') {
                  if (item.value?.formList?.length > 0) {
                    const vals = item.value?.formList;
                    vals.forEach(v => {
                      if (['text', 'number', 'textarea', 'time', 'datetime', 'datetimerange', 'date', 'select',].includes(v.type)) {
                        arr.push({ key: v.key, label: v.label })
                      }
                    })
                  }
                } else {
                  arr.push({ key: item.key, label: item.label });
                }
              }
            });
            arr.forEach(item => {
              if (item.type !== 'hidden') {
                _arr.push(item);
              }
            });
          }
          _formItems = _arr;
          this.setState({ formItems: _arr });
        } else {
          message.warn(res.message);
        }
        this.setState({ formItemLoading: false });
      });
    });
  };

  saveTemplate = () => {
    const { templateDetailsParams, templateKey, userInfo, IPObject } = this.state;
    const _status = sessionStorage.getItem('_status');
    const fileName = templateDetailsParams?.fileName?.split('.')[0] || templateDetailsParams.templateName || 'template';
    const payload = {
      fileSerialNumber: templateDetailsParams.fileNumber || templateKey,
      fileName: fileName, // 去掉后缀名
      templateName: templateDetailsParams.templateName, //
      fileType: templateDetailsParams.fileType || '',
      archivesClassification: templateDetailsParams.archivesClassification || '',
      documentType: templateDetailsParams.documentType || '',
      busId: templateKey,
      fileForm: 'docx',
      sysCode: 'flow',
      fileKey: templateKey,
      isSmart: templateDetailsParams.isSmart,
      id: _status === 'isUpdate' ? templateDetailsParams?.id : undefined,
      formName: '',
      processId: templateDetailsParams?.processId,
    };
    let userdata = {
      serialNum: templateDetailsParams.fileNumber || templateKey,
      fileName: templateDetailsParams.fileName || templateDetailsParams.templateName,
      fileNumber: templateDetailsParams.fileNumber,
      templateKey,
      fileType: templateDetailsParams.fileType || '',
      archivesClassification: templateDetailsParams.archivesClassification || '',
      documentType: templateDetailsParams.documentType || '',
      type: templateDetailsParams.type,
      orgId: userInfo.orgId,
      dataType: _status === 'isUpdate' ? 5 : 4, // payload.dateType   0.仅保存 1.保存个人版本  2.行外推送保存个人版本 3 .合同文件保存模板  4.空白文档和导入文档保存模板  5.修改模板
      blankFlag: _status === 'newAdd' ? 1 : 0, // blankFlag   0.其他情况 1.新增模版
      userId: userInfo.id,
      cover: '',
      fileNameTemp: fileName, // 去掉后缀名-------
      templateName: templateDetailsParams.templateName, //
      busId: templateKey,
      fileForm: 'docx',
      sysCode: 'flow',
      fileKey: templateKey,
      isSmart: templateDetailsParams.isSmart,
      id: _status === 'isUpdate' ? templateDetailsParams?.id : undefined,
      formName: '',
    };
    const params = {
      c: 'forcesave',
      key: templateKey,
      userdata: JSON.stringify(userdata),
    };
    this.setState({ saveLoading: true }, () => {
      fetch(`${IPObject.jsApiIp}/coauthoring/CommandService.ashx`, {
        method: 'POST',
        body: JSON.stringify(params),
      }).then(res => {
        if (res.status === 200) {
          res.json().then(response => {
            // if (+response?.error === 0) {
            //   this.setState({ saveLoading: false });
            //   router.push('./templateSet');
            // }
            // if (+response?.error === 4) {
            // 表示文件无改动 强制保存调用templateSave 仅导入模板时
            // message.warn('模板无改动');
            setTimeout(() => {
              fetch('/ams/ams-file-service/template/add', {
                headers: {
                  Token: sessionStorage.getItem('auth_token'),
                  Accept: 'application/json',
                  'Content-Type': 'application/json;charset=UTF-8',
                  Data: new Date().getTime(),
                  Sys: 1,
                },
                method: 'POST',
                body: JSON.stringify(payload),
              }).then(res => {
                if (res?.status === 200) {
                  message.success('操作成功');
                  this.setState({ saveLoading: false });
                  cx.destroyEditor && cx.destroyEditor();
                  router.push('/contract/prospectuSet');
                }
                if (res?.status.toString().length === 8) {
                  message.warn(res.message);
                  this.setState({ saveLoading: false });
                }
              });
            }, 5000);
            // }
          });
        }
      });
    });
  };

  saveMapping = () => {
    const { pair, templateKey, userInfo } = this.state;
    let list = [];
    // if (pair.length === 0) {
    //   message.warn('请设置标签映射关系');
    //   return;
    // }
    this.setState({ shineLoading: true }, () => {
      if (pair.length !== 0) {
        // 内容域中选中的文字最多保留长度30
        pair.forEach(item => {
          delete item.id;
          list.push({
            directoryNumber: item.docxTags.id,
            directoryName: item.docxTags.name,
            text: item.docxTags.text?.substr(0, 30),
            fromCode: item.formItems.key || item.formItems.fromCode,
            fromName: item.formItems.label || item.formItems.fromName,
          });
        });
      }
      const params = { list, changxieKey: templateKey, orgId: userInfo.orgId };
      fetch(`/ams/yss-contract-server/data/add`, {
        headers: {
          Token: sessionStorage.getItem('auth_token'),
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          Data: new Date().getTime(),
          Sys: 1,
        },
        method: 'POST',
        body: JSON.stringify(params),
      }).then(res => {
        if (res?.status === 200) {
          message.success('操作成功');
          this.setState({
            shineLoading: false,
            mappingVisible: false,
            tagsCheckedArr: [],
            itemsCheckedArr: [],
            _docxTags: [],
            docxTags: [],
            _formItems: [],
            formItems: [],
            _pair: [],
            pair: [],
            _id: 0,
          }, () => {
            this.reloadSignList(); // 获取左侧 文档标签
          });
        }
      });
    });
  };

  permissionBoxSet = (flag = false) => {
    if (flag) {
      this.setState({ permissionVisible: flag, }, () => {
        this.getStaffList();
      });
    } else {
      this.setState({ permissionLoading: flag, permissionVisible: flag });
    }
  };

  onChange = targetKeys => {
    this.setState({ targetKeys });
  };

  set = (flag = false, record = {}) => {
    const { templateDetailsParams } = this.state;
    this.setState({
      staffVisible: flag,
      staffLoading: flag,
      directoryNumber: record.directoryNumber ? record.directoryNumber : '',
      contractDirectoryId: record.id ? record.id : '',
      orgId: record.orgId ? record.orgId : '',
      record,
    }, () => {
      if (flag) {
        // request(`/yss-contract-server/contractuser/getbyorgid?orgIds=${record.orgId}`).then(res => {
        request(`/yss-contract-server/user/getUserWithGroupByProcessKey/${templateDetailsParams.processId}`).then(res => {
          if (res?.status === 200) {
            const response = res.data;
            let allKeys = [],
              targetKeys = [];
            response.forEach(item => {
              // 暂时不使用树型结构
              if (item.userInfos) {
                let userInfos = item.userInfos;
                userInfos.forEach(u => {
                  allKeys.push({ key: u.id, title: `${u.username}- ${u.id}` })
                })
              }
              record.directoryControlVos.forEach(item => {
                targetKeys.push(item.userId + '');
              });
              this.setState({
                allKeys: JSON.parse(JSON.stringify(allKeys)),
                targetKeys: JSON.parse(JSON.stringify(targetKeys)),
                staffLoading: false,
              });
            })
            // response.forEach(item => {
            //   allKeys.push({
            //     key: item.code,
            //     title: `${item.name}- ${item.code}`,
            //   });
            // });
            // record.directoryControlVos.forEach(item => {
            //   targetKeys.push(item.userId + '');
            // });
            // this.setState({
            //   allKeys: JSON.parse(JSON.stringify(allKeys)),
            //   targetKeys: JSON.parse(JSON.stringify(targetKeys)),
            //   staffLoading: false,
            // });
          }
        });
      }
    });
  };

  userMap = data => {
    return (
      <span>
        {data.length > 0 &&
          data.map((item, i) => (
            <Popover
              placement="topLeft"
              key={item.mobile}
              content={
                <div>
                  <p>用户类型: {item.typeName}</p>
                  <p>手机号码: {item.mobile}</p>
                  <p>邮箱账号: {item.email}</p>
                </div>
              }
              title={
                <div style={{ height: 60 }}>
                  <div style={{ float: 'left' }}>
                    <img
                      className={styles.headPortrait2}
                      src={`${this.state.IPObject.nginxIp}${item.logo}`}
                      alt="头像"
                    />
                  </div>
                  <div style={{ float: 'left' }}>
                    <p>{item.username}</p>
                    <p>{item.userId}</p>
                  </div>
                </div>
              }
            >
              <span className={styles.userNameBox}>{item.username}</span>
            </Popover>
          ))}
      </span>
    );
  };

  staffChange = (nextTargetKeys, direction, moveKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  };

  staffSave = () => {
    const { targetKeys, contractDirectoryId } = this.state;
    let arr = [];
    targetKeys.forEach(item => {
      arr.push({
        contractDirectoryId,
        userId: item,
      });
    });
    this.setState({ staffLoading: true, }, () => {
      fetch(`/ams/yss-contract-server/directorycontrol/update?contractDirectoryId=${contractDirectoryId}`, {
        headers: {
          Token: sessionStorage.getItem('auth_token'),
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          Data: new Date().getTime(),
          Sys: 1,
        },
        method: 'PUT',
        body: JSON.stringify(arr),
      }).then(res => {
        if (res?.status === 200) {
          message.success('操作成功');
          this.setState({
            staffLoading: false,
            staffVisible: false,
          }, () => {
            // 刷新列表
            this.getStaffList();
          });
        }
      });
    });
  };

  updateTemplate = () => {
    const { templateDetailsParams, templateKey, IPObject } = this.state;
    sessionStorage.setItem('_status', 'isUpdate'); // 刷新后保持状态
    this.setState({ _status: 'isUpdate' }, () => {
      cx.destroyEditor && cx.destroyEditor();
      this.renderCXEditor(
        templateDetailsParams?.type,
        templateKey,
        templateDetailsParams?.templateName || templateDetailsParams?.fileName,
        `${IPObject.gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${templateDetailsParams?.fileNumber}`,
      );
    });
  };

  PopconfirmConfirm = e => {
    router.push('/processCenter/processConfig');
  };

  PopconfirmCancel = e => { };

  selectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({
      selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys],
    });
  };

  useTemplate = () => {
    const { templateDetailsParams, templateKey } = this.state;
    let type = templateDetailsParams?.type,
      name = templateDetailsParams?.templateName || templateDetailsParams?.fileName,
      serialNumber = templateDetailsParams?.fileNumber;
    // templateId = templateDetailsParams.id;
    // 清理脏数据(合同页面没有保存时 会产生脏数据)
    const dirtyData = localStorage.getItem('copyFileNum');
    if (dirtyData) {
      request(`/yss-contract-server/baseContract/delContract/${dirtyData}`, {
        method: 'DELETE',
      }).then(res => {
        if (res?.status === 200) {
          localStorage.removeItem('copyFileNum');
        }
      })
    }
    // 复制模板的数据(文档、标签、权限)
    request(`/yss-contract-server/baseContract/generateContract/${item.id}`).then(res => {
      if (res?.status === 200) {
        const contractId = res?.data?.contractId;
        sessionStorage.setItem('_templateParams', JSON.stringify({ id: contractId, type, name, serialNumber }));
        // 存流水号 做为清理脏数据的code
        localStorage.setItem('copyFileNum', serialNumber)
        // templateDetailsParams.processId 流程ID
        request(`/api/billow-diplomatic/pending-task/list`, {
          method: 'POST',
          data: { "onlyShowMe": 0, "limit": 1000, "page": 1, "processTags": [], "templateIds": [templateDetailsParams.processId] }
        }).then(res => {
          if (res?.status === 200) {
            const publishId = res?.data?.rows[0]?.publishId;
            if (publishId) {
              request(`/api/billow-diplomatic/pending-task/hand-process-list?publishId=${publishId}`).then(res => {
                if (res?.status === 200) {
                  const obj = res?.data[0];
                  const params = {
                    processDefinitionKey: obj.processDefinitionKey || '',
                    publishId: publishId,
                    ruleArray: obj.ruleArray || [],
                    launchingModeName: obj.handName || '',
                    handCode: obj.handCode || '',
                    processSplit: obj.processSplit || 0,
                    timingLaunchIds: obj.timingLaunchIds || '',
                    dataViewId: obj.dataViewId || null
                  };
                  request(`/api/billow-diplomatic/process-start/hand-launch`, {
                    method: 'POST',
                    data: params,
                  }).then(res => {
                    if (res?.status === 200) {
                      const taskId = res?.data?.taskId;
                      const processInstanceId = res?.data?.processInstanceId;
                      // router.push(`/processCenter/taskDeal?taskId=${taskId}&processInstanceId=${processInstanceId}&mode=deal&fileType=${type}&key=${templateKey}&name=${name}&url=/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${fileNumber}&templateId=${templateId}&type=save`)
                      router.push(`/processCenter/taskDeal?taskId=${taskId}&processInstanceId=${processInstanceId}&mode=deal&templateId=${templateId}&type=save`)
                    } else {
                      message.warn(res?.message);
                      return false;
                    }
                  })
                } else {
                  message.warn(res?.message);
                  return false;
                }
              })
            } else {
              message.warn('没有查询到概模板对应的流程信息');
              return false;
            }
          } else {
            message.warn(res?.message);
            return false;
          }
        })
      } else {
        message.warn(res?.message);
        return false;
      }
    })
  };

  backJumpPage = () => {
    router.push('./templateSet');
  };

  // 选择指定内容域并跳转到内容域所在位置
  selectTags = id => {
    let obj = {
      object: 'content',
      type: 'select',
      id,
    };

    cx.setDocumentContent(obj);
  };

  componentDidMount() {
    cx.destroyEditor && cx.destroyEditor();
    const templateDetailsParams = JSON.parse(sessionStorage.getItem('templateDetailsParams'));
    const _status = sessionStorage.getItem('_status');
    this.setState({
      templateDetailsParams,
      userInfo: JSON.parse(sessionStorage.getItem('USER_INFO')),
      switchStatus: +templateDetailsParams?.isSmart === 1,
      isWrite: +templateDetailsParams?.isSmart === 1 ? 2 : 1,
      _status,
    }, () => {
      // 文档key 改为 使用文档的流水号  不再使用uuid生成
      let templateKey = templateDetailsParams.fileNumber;
      console.log(templateDetailsParams)
      this.setState({ templateKey }, () => this.getNginxIP());
    });
  }

  componentWillUnmount() {
    cx.destroyEditor && cx.destroyEditor();
    sessionStorage.removeItem('_templateKey');
    sessionStorage.removeItem('templateDetailsParams');
    sessionStorage.removeItem('_status');
    // 如果文档没有入库 清理掉文档上的标签信息
    request(`/ams-file-service/template/getCountByChangxieKey?changxieKey=${this.state.templateKey}`,).then(res => {
      if (res?.status === 200) {
        if (!res.data) {
          //清理
          request(`/yss-contract-server/directory/deleteByChangxieKey?changxieKey=${this.state.templateKey}`,);
        }
      }
    });
  }

  render() {
    const {
      userInfo,
      selectedKeys,
      _status,
      templateDetailsParams,
      permissionLoading,
      targetKeys,
      allKeys,
      staffLoading,
      staffVisible,
      permissionVisible,
      saveLoading,
      isAll,
      checkL,
      idArr,
      itemChecked,
      formItemLoading,
      switchStatus,
      more,
      tags,
      data,
      saveBtn,
      docxTags,
      isWrite,
      mappingVisible,
      shineLoading,
      pair,
      formItems,
    } = this.state;
    const columns = [
      {
        title: '标签名称',
        dataIndex: 'directoryName',
        width: 120,
      },
      {
        title: '授权用户数',
        dataIndex: 'userNumber',
        width: 120,
      },

      {
        title: '设置',
        dataIndex: 'id',
        width: 120,
        render: (val, record) => <a onClick={() => this.set(true, record)}>设置</a>,
      },
      {
        title: '授权用户',
        dataIndex: 'directoryControlVos',
        render: val => this.userMap(val),
      },
    ];
    return (
      <div >
        <div style={{ backgroundColor: '#fff' }}>
          <Breadcrumb style={{ marginTop: 7 }}>
            <Breadcrumb.Item>电子档案管理</Breadcrumb.Item>
            <Breadcrumb.Item>
              <a onClick={this.backJumpPage}>合同模板</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{breadcrumbStatic[sessionStorage.getItem('_status')]}</Breadcrumb.Item>
          </Breadcrumb>
          <div className={styles.btnArea}>
            是否启用智能撰写
            <Switch
              checkedChildren="开"
              unCheckedChildren="关"
              checked={switchStatus}
              onChange={this.switchChange}
              style={{ marginLeft: 2 }}
            />
            {!(userInfo?.type === '02' && +templateDetailsParams.templateType === 0) &&
              sessionStorage.getItem('_status') === 'isSee' && (
                <Button
                  onClick={this.updateTemplate}
                  disabled={saveBtn}
                  style={{ marginLeft: 18 }}
                  loading={saveLoading}
                >
                  修改模板
                </Button>
              )}
            {sessionStorage.getItem('_status') === 'isSee' ? (
              <Button
                style={{ marginLeft: 18 }}
                loading={saveLoading}
                disabled={saveBtn}
                onClick={this.useTemplate}
              >
                使用模板
              </Button>
            ) : (
              <Button
                onClick={this.saveTemplate}
                type="primary"
                disabled={saveBtn}
                style={{ marginLeft: 18, marginRight: 20 }}
                loading={saveLoading}
              >
                保存模板
              </Button>
            )}
          </div>
        </div>
        {/* <div className={styles.editArea}> */}
        <div style={{ width: '77%', float: 'left', minHeight: '800px' }}>
          <div id="_COX_Editor_SKD"></div>
        </div>
        <div className={styles.operatorArea}>
          <Card
            title=""
            style={{ marginTop: 20 }}
            headStyle={{ borderBottom: 'none', padding: '0 10px' }}
            bodyStyle={{ padding: '10px', minHeight: 800 }}
          >
            <Tabs defaultActiveKey="1" onChange={this.callback} size="small">
              <TabPane tab="标签设置" key="1">
                <div>
                  <div className={styles.method} style={{ display: more ? 'none' : 'block' }}>
                    <div>【使用说明&方法】</div>
                    {`为合同为模板设置通用标签，是为了更方便的使用这些标签做段落权限授权，您可以为团队自由选...`}
                    <div style={{ marginTop: 10 }}>
                      <a onClick={() => this.moreSet(true)}>查看更多</a>
                    </div>
                  </div>

                  <div className={styles.method} style={{ display: more ? 'block' : 'none' }}>
                    <div>【使用说明&方法】</div>
                    {`为合同模板设置通用标签，是为了更方便的使用这些标签做段落权限授权，您可以为团队自由选择是否设置标签。`}
                    <br />
                    方法：
                    <br />
                    &nbsp;&nbsp;
                    {`1.在"插入>内容控件>富文本/纯文本>设置标签"，您可以任意增加和修改标签.`}
                    <br />
                    &nbsp;&nbsp;
                    {`2.发起合同时，在段落授权中，使用这些标签，关联某些用户，这些用户将只获得该标签所包含的段落。`}
                    <div style={{ marginTop: 10 }}>
                      <a onClick={() => this.moreSet(false)}>收起</a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={styles.labelSetBox}>
                    <div
                      className={styles.syncBtn}
                      style={{ color: '#2450A5' }}
                      onClick={this.reloadSignList}
                    >
                      标签列表
                      <SyncOutlined style={{ marginLeft: 10 }} />
                    </div>
                    <div className={more ? styles.tagsBox2 : styles.tagsBox1}>
                      {tags.map((item, i) => (
                        <p key={item.id}>
                          标签：<a onClick={() => this.selectTags(item.id)}>{item.name}</a>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane tab={'标签映射关系设置'} disabled={+isWrite !== 2} key="2">
                <div className={styles.mappingBox}>
                  {docxTags.length > 0 &&
                    docxTags.map((item, i) => <p key={item.id}>{item.name}</p>)}
                </div>
                <Button
                  style={{ margin: '10px 0 0 110px' }}
                  onClick={() => this.setMappingBox(true)}
                >
                  映射设置
                </Button>
              </TabPane>
              <TabPane tab={'权限设置'} key="3">
                <span>
                  {data.length > 0 ? (
                    <div className={styles.mappingBox}>
                      <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '5px 0' }}>
                        <Col md={16} sm={24} style={{ paddingRight: 0 }}>
                          <span>标签名称</span>
                        </Col>
                        <Col md={8} sm={24} style={{ paddingRight: 0 }}>
                          <span>用户数量</span>
                        </Col>
                      </Row>
                      {data.map((item, idx) => (
                        <Row key={item.id || idx} gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '5px 0' }}>
                          <Col md={16} sm={24} style={{ paddingRight: 0 }}>
                            <div className={styles.signName} title={item.directoryName}>
                              {item.directoryName}
                            </div>
                          </Col>
                          <Col md={8} sm={24} style={{ paddingRight: 0, paddingLeft: 0 }}>
                            <div style={{ textAlign: 'center', color: '#4e78ee' }}>
                              {item.userNumber}
                            </div>
                          </Col>
                        </Row>
                      ))}
                    </div>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                  {/* {
                        (isSee && !isUpdate) ? '' :
                          <Button type={'primary'} style={{ margin: 20, float: 'right' }} onClick={() => this.permissionBoxSet(true)} >设置</Button>
                      } */}

                  <Button
                    type={'primary'}
                    style={{ margin: '10px 0 0 130px' }}
                    onClick={() => this.permissionBoxSet(true)}
                  >
                    设置
                  </Button>
                </span>
              </TabPane>
            </Tabs>
          </Card>
        </div>
        <Modal
          // title="标签映射关系设置"
          visible={mappingVisible}
          mask={true}
          // onOk={() => this.saveMapping()}
          onCancel={() => this.setMappingBox(false)}
          footer={null}
          closable={false}
          destroyOnClose={true}
          width={1200}
          style={{ top: 20 }}
          headStyle={{ borderBottom: 'none' }}
        >
          <Spin spinning={shineLoading}>
            <div className={styles.container}>
              <div style={{ width: 300, height: 700 }}>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '5px 0' }}>
                  <Col md={24} sm={24} style={{ paddingRight: 0 }}>
                    <div style={{ marginBottom: 5 }}>文档标签</div>
                    <Checkbox
                      checked={isAll === 'isAll'}
                      style={{ marginRight: 2 }}
                      onClick={() => this.isCheckAll('isAll')}
                    />
                    全选
                    <Checkbox
                      checked={isAll === 'noAll'}
                      style={{ marginLeft: 8, marginRight: 2 }}
                      onClick={() => this.isCheckAll('noAll')}
                    />
                    全不选
                    {/* <Checkbox checked={isAll === 'recheck'} style={{ marginLeft: 8, marginRight: 2 }} onClick={() => this.isCheckAll('recheck')} />反选 */}
                  </Col>
                </Row>
                <div
                  style={{
                    height: 650,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                  }}
                >
                  <Input.Search
                    placeholder="请输入"
                    onSearch={this.onSearchL}
                    style={{ width: 280, margin: '5px 8px', height: 34 }}
                  />
                  <div className={styles.itemBox}>
                    {docxTags.length > 0 ?
                      docxTags.map((item, index) => (
                        <Row
                          key={item.id}
                          className={styles.docxTags}
                          gutter={{ md: 8, lg: 24, xl: 48 }}
                          style={{ marginLeft: 0, marginRight: 0 }}
                          onClick={() => this.setDocxTags(item, index)}
                        >
                          <Col md={18} sm={24} style={{ paddingRight: 0, paddingLeft: 8 }}>
                            <Checkbox
                              checked={checkL.includes(item.id)}
                              value={item.id}
                              style={{ marginRight: 8 }}
                              onChange={e => this.checkBoxChangeL(e, item)}
                            />
                            {item.name}
                            {/* <Tooltip placement="topLeft" title={item.text}> */}
                            <div className={styles.nameStyle} style={{ color: '#ddd', fontSize: 12 }}>
                              {item.text}
                            </div>
                            {/* </Tooltip> */}
                          </Col>
                        </Row>
                      )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                  </div>
                </div>
              </div>
              <div style={{ width: 500, height: 700 }}>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '5px 0' }}>
                  <Col md={24} sm={24} style={{ paddingRight: 0 }}>
                    <div style={{ marginBottom: 5 }}>标签与要素映射关联</div>
                    <a onClick={this.addPair}>添加</a>
                    <a onClick={this.delPair} style={{ marginLeft: 8 }}>
                      删除
                    </a>
                    <a style={{ marginLeft: 350 }} onClick={this.reSet}>
                      重置
                    </a>
                  </Col>
                </Row>
                <div
                  style={{
                    height: 650,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxShadow: '0 0 10px #ddd',
                    position: 'relative',
                  }}
                >
                  <div style={{ height: 590 }}>
                    <Input.Search
                      placeholder="请输入"
                      onSearch={this.onSearchM}
                      style={{ width: 280, margin: '5px 8px', height: 34 }}
                    />
                    <div className={styles.itemBox}>
                      {pair.length > 0 ?
                        pair.map((item, index) => (
                          <Row
                            key={item.key}
                            className={styles.docxTags}
                            gutter={{ md: 8, lg: 24, xl: 48 }}
                            style={{ marginLeft: 0, marginRight: 0 }}
                          >
                            <Col
                              md={8}
                              sm={24}
                              style={{ paddingRight: 0, paddingLeft: 8 }}
                              className={styles.pairM}
                            >
                              <Checkbox
                                checked={idArr.includes(item.id)}
                                value={item.id}
                                style={{ marginRight: 8 }}
                                onClick={e => this.checkBoxChangeM(e, item.id)}
                              />
                              {item.docxTags.name}
                            </Col>
                            <Col md={2} sm={24}>
                              &
                            </Col>
                            <Col md={10} sm={24} style={{ paddingLeft: 0 }} className={styles.pairM}>
                              {item.formItems.label || item.formItems.fromName}
                            </Col>
                          </Row>
                        )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ width: 300, height: 700 }}>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '5px 0' }}>
                  <Col md={24} sm={24} style={{ paddingRight: 0 }}>
                    <div style={{ marginBottom: 5 }}>智能模型</div>
                  </Col>
                  <Col md={24} sm={24} style={{ textAlign: 'right' }}>
                    <Popconfirm
                      title="将要跳转到流程配置页面，请先确认是否要保存标签映射关系？"
                      onConfirm={this.PopconfirmConfirm}
                      onCancel={this.PopconfirmCancel}
                      okText="跳转"
                      cancelText="取消"
                    >
                      <a style={{ marginRight: 5 }} href="#">
                        设置
                      </a>
                    </Popconfirm>
                  </Col>
                </Row>
                <Spin spinning={formItemLoading} size="small">
                  <div
                    style={{
                      height: 650,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                    }}
                  >
                    <Input.Search
                      placeholder="请输入"
                      onSearch={this.onSearchR}
                      style={{ width: 280, margin: '5px 8px', height: 34 }}
                    />
                    <div className={styles.itemBox}>
                      {formItems.length > 0 ?
                        formItems.map(item => (
                          <Row
                            key={item.key}
                            className={styles.docxTags}
                            gutter={{ md: 8, lg: 24, xl: 48 }}
                            style={{ marginLeft: 0, marginRight: 0 }}
                          >
                            <Col md={18} sm={24} style={{ paddingRight: 0, paddingLeft: 8 }}>
                              <Checkbox
                                checked={itemChecked === item.key}
                                value={item.key}
                                style={{ marginRight: 8 }}
                                onChange={e => this.checkBoxChangeR(e, item)}
                              />
                              {item.label}
                            </Col>
                          </Row>
                        )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    </div>
                  </div>
                </Spin>
              </div>
            </div>
          </Spin>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '15px 0' }}>
            <Col md={24} sm={24} style={{ textAlign: 'right' }}>
              <span style={{ marginRight: 10 }}>共{formItems.length}个表单项</span>
              <Button key="back" onClick={() => this.setMappingBox(false)}>
                取消
              </Button>
              <Button
                key="submit"
                type="primary"
                loading={shineLoading}
                onClick={() => this.saveMapping()}
                style={{ marginLeft: 8 }}
              >
                确认
              </Button>
            </Col>
          </Row>
        </Modal>

        <Modal
          title="权限设置"
          onCancel={() => this.permissionBoxSet(false)}
          visible={permissionVisible}
          destroyOnClose={true}
          width={900}
          // closable={false}
          footer={null}
          headStyle={{ borderBottom: 'none' }}
        >
          <Table
            columns={columns}
            bordered={true}
            dataSource={data}
            pagination={false}
            loading={permissionLoading}
            rowKey={(record)=>record.id}
          />
        </Modal>

        <Modal
          // title="段落权限授权"
          visible={staffVisible}
          onOk={() => this.set(false)}
          onCancel={() => this.set(false)}
          footer={null}
          zIndex={1001}
          width={800}
        >
          <Spin spinning={staffLoading}>
            <Transfer
              dataSource={allKeys}
              titles={['备选待授权人员', '已选被授权人员']}
              operations={['审批入库', '撤消入库']}
              showSearch
              targetKeys={targetKeys}
              selectedKeys={selectedKeys}
              onChange={this.staffChange}
              onSelectChange={this.selectChange}
              render={item => item.title}
              listStyle={{
                width: 300,
                height: 400,
              }}
            />
            {/* <TreeTransfer dataSource={treeData} targetKeys={targetKeys} onChange={this.onChange} /> */}
            <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ marginLeft: 0, marginRight: 0 }}>
              <Col md={24} sm={24} style={{ marginTop: 20 }}>
                <div className={styles.openQueryBtn}>
                  <Button onClick={() => this.set(false, '')}>关闭</Button>
                  <Button style={{ marginLeft: 8 }} type="primary" onClick={this.staffSave}>
                    保存
                  </Button>
                </div>
              </Col>
            </Row>
          </Spin>
        </Modal>
      </div>
    );
  }
}

export default Index;
