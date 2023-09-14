//招募说明书设置
import React, {Component} from 'react';
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
import {SyncOutlined,QuestionCircleOutlined,SettingOutlined} from '@ant-design/icons';
import styles from './index.less';
import TagsRules from './compontents/tagsRules';
import PermissBox from './compontents/permissBox';
import {callbackUrl, downloadUrl, OBJECT, unitParameters} from './docConfig/cxConfig.js'
import {
  getBusinessData,
  getMapping,
  getNginxIP,
  saveTagContent,
  saveTemplate,
  saveTpltags,
  setAuthorize
} from '@/services/prospectuSet';
import {getDocumentType, uuid} from '@/utils/utils';
import {getSession} from '@/utils/session';
import {groupBy, queryArrByType} from '@/utils/groupby'
import {cloneDeep} from 'lodash';
import { getUrlParam } from '@/pages/investorReview/func';

let cx = {};
const { TabPane } = Tabs;
const { TreeNode } = Tree;
const {Search}=Input

let tagsCheckedArr = []; // 文档标签 选中项集合
let itemsCheckedArr = []; // 元素标签 选中项集合
let _docxTags = [];
let _formItems = [];
let _pair = [];

// 标题
const title = (
  <div style={{ color: '#f39', fontSize: 15, fontWeight:"bold"}}>【使用说明&方法】</div>
);
const content = (<div style={{width: 300, color: '#f39', fontSize: 14}}>
    <div style={{textIndent: '2em', marginBottom: 10}}>为合同模板设置通用标签，是为了更方便的使用这些标签做段落权限授权，您可以为团队自由选择是否设置标签。 方法：</div>
    <div style={{textIndent: '2em'}}>1.在&quot;插入&gt;内容控件&gt;富文本/纯文本&gt;设置标签&quot;，您可以任意增加和修改标签.</div>
    <div style={{textIndent: '2em'}}>2.发起合同时，在段落授权中，使用这些标签，关联某些用户，这些用户将只获得该标签所包含的段落。</div>
  </div>);

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
    dataCopy:[],
    dataLoading:false,
    docxTags: [], // 左侧标签
    docxTagsCopy:[],
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
    _status: '',
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
        render: (text, record) => <a onClick={() => this.selectTags(record.id)}>{text || '--'}</a>
      },
    ]
  };
  tagsRulesRef = React.createRef();
  permissBoxRef = React.createRef();
  renderCXEditor = () => {
    const { IPObject, _status, userInfo, templateDetailsParams, fileType, templateKey, title } = this.state;
    console.time('文档加载时间');
    const cxo_config = {
      // type: 'embedded',
      document: { //文档参数集设置
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
          leftMenu: _status === 'isSee' ? false : unitParameters.leftMenu,
          toolbar: _status === 'isSee' ? false : unitParameters.toolbar,
          statusBar: _status === 'isSee' ? false : unitParameters.statusBar,
          logo: { image: '' },
        },
        mode: 'edit', //_status === 'isSee' ? 'view' : 'edit' 只读模式（view）、编辑模式（edit）
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
      type: 'desktop'
    };
    cx = new CXO_API.CXEditor('_COX_Editor_SKD', cxo_config);
  }; //  在线编辑 模板

  onAppReady = () => { message.success('编辑器加载完成') };

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
    message.warn(`编辑器警告: ${event.data.warningDescription}`,);
  };

  onDocumentStateChange = () => {
    this.setState({
      configFlag: true
    })
  };

  onGetDocumentContent = event => {
    this.setState({docxTagsLoading:true,dataLoading:true})
    let tags = event.data.text, docxTags = [];
    if (tags.length > 0) {
      docxTags = tags.filter(item => item.name); //tags.filter(item => item.name && item.name.includes('填充'))
      _docxTags = docxTags;// ?
      this.setState({ docxTags, tags }, () => {
        let arr = [], templateKey = this.state.templateKey;
        arr = tags.filter(item=>item.name).map(item=>{
          return {
            changxieKey: templateKey,
            directoryName: item.name,
            directoryNumber: item.id,
            text: item.text.substr(0, 30), // 最多只保留长度30的字符串
          }
        })
        if (arr.length === 0) return;
        // saveTags  isTemplate: 1,  // 标识为模板中的标签 2021 12 29
        saveTpltags(arr, `changxieKey=${templateKey}&isTemplate=1`).then(res=>{
          if (res?.status === 200) {
            this.getStaffList();
          }
        })
      });
      this.setState({
        docxTagsCopy:cloneDeep(docxTags),
        docxTagsLoading:false
      })
    }
  };
  iptSearch = (val, position) =>{
    const formItemList = [];
    switch (position) {
      case 'left':
        tagsCheckedArr = [];
        let { docxTags } = this.state;
        if (val === '') {
          docxTags = _docxTags;
        } else {
          docxTags = _docxTags.filter(key => key.name.includes(val));
        }
        this.setState({ docxTags: JSON.parse(JSON.stringify(docxTags)), checkL: [], isAll: '' });
        break;
      case 'center':
        let { pair } = this.state;
        if (val === '') {
          pair = _pair
        } else {
          pair = _pair.filter(
            key => [key.docxTags.name, key.formItems.name, key.docxTags.name + key.formItems.name].indexOf(val) > -1
          );
        }
        this.setState({ pair: JSON.parse(JSON.stringify(pair)) });
        break;
      case 'right':
        let { formItems } = this.state;
        if (val === '') {
          formItems = _formItems
        } else {
          formItems = _formItems.filter(key => key.name.includes(val));
          if (formItems.length == 0) {
            _formItems.forEach(item=>{
              item.child.forEach(element => {
                if(element.name.includes(val)) {
                  formItemList.push({...item,child:[{...element}]});
                }
              });
            })
          }
        }
        this.setState({ formItems: formItems.length != 0 ? JSON.parse(JSON.stringify(formItems)) : groupBy(formItemList)});
        break;
    }
  }
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
  onCheck = (checkedKeys, {checkedNodes}) => {
    itemsCheckedArr = checkedNodes;
    this.setState({ checkedKeys: checkedKeys })
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
      docxTags = docxTags.filter(key => key.id !== item.id);
      _docxTags = _docxTags.filter(key => key.id !== item.id);
      const id = uuid();
      pair.push({
        docxTags: item,
        formItems: itemsCheckedArr[0],
        id: id,
        danger: false,
      });
      _pair.push({
        docxTags: item,
        formItems: itemsCheckedArr[0],
        id: id,
        danger: false,
      });
    });
    tagsCheckedArr = [];
    itemsCheckedArr = [];
    checkL = [];
    this.setState({
      pair: cloneDeep(pair),
      docxTags: JSON.parse(JSON.stringify(docxTags)),
      checkL: [], // 清空左侧标签选项
      checkedKeys: [], // 清空tree中的选项
      isAll: '',
      idArr: [],
    }, ()=>{
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
      checkL: [],
      checkedKeys: [], // 清空tree中的选项
      isAll: '',
      idArr: [],
    });
  };
  // 切换智能撰写开关
  switchChange = checked => {
    this.setState({ switchStatus: checked }, ()=>{
      if (!checked) {
        this.getStaffList();
      }
    });
  };
  // 查询权限设置列表
  getStaffList = () => {
    this.permissBoxRef.current.getList(this.state.templateKey).then(powerData=>{
      const docx = [...this.state.docxTags];
      const powerD = []
      if(powerData.length > 0) {
        if(docx.length > 0) {
          docx.forEach(item=>{
            for(let i = 0; i < powerData.length; i++) {
              if(item.name === powerData[i].directoryName) {
                powerD.push(powerData[i]);
              }
            }
          });
        }
      }
      this.setState({ data: powerD,dataCopy:cloneDeep(powerD),dataLoading:false })
    });
  };

  tabsChange = key => {
    this.reloadSignList();
  };


  moreSet = flag => { this.setState({ more: flag }) };

  setMappingBoxFalse = () => {
    tagsCheckedArr = []
    this.setState({
      docxTags: [],
      formItems: [],
      mappingVisible: false,
      pair: [],
      checkL: [], // 清空左侧标签选项
      checkedKeys: [], // 清空tree中的选项
      idArr: [],
    }, () => {
      this.reloadSignList(); // 获取左侧 文档标签
    });
  };

// getTreeParents = (treeData) => {
//   treeData.forEach(item => {
//     item.key = item?.id;
//     item.title = item?.name;
//     item.children = item?.child;
//     delete item['id'];
//     delete item['name'];
//     delete item['child'];
//     if (item?.children && item?.children.length > 0) {
//       this.getTreeParents(item.children);
//     }
//   });
//   return treeData
//   }

  setMappingBoxTrue = () => {
    this.setState({
      formItemLoading: true, pairLoading: true, mappingVisible: true,docxTagsLoading: true
    }, () => {
      // 获取右侧 表单项
      getBusinessData().then(res=>{
        if (res?.status === 200) {
          // const treeData = this.getTreeParents(res.data);
          // console.log(treeData);
          // // res.data.forEach(item => {
          // //   treeData.push({key: item?.id, title: item?.name, children: item?.child})
          // // })
          _formItems = JSON.parse(JSON.stringify(res.data));
          this.setState({ formItems: res.data, formItemLoading: false });
        } else {
          message.warn(res.message);
          this.setState({ formItemLoading: false });
        }
      });
      const { templateKey, userInfo, pair, docxTags } = this.state;
      // 获取映射关系 并重新设置左侧文档标签
      getMapping({ changxieKey: templateKey, orgId: userInfo.orgId }).then(res=>{
        if (res?.status === 200) {
          const data = res.data;
          if (data.length > 0) {
            data.forEach((item, i) => {
              let index = docxTags.findIndex(val => +val.id === +item.directoryNumber);
              if (index !== -1) { docxTags.splice(index, 1) }
              pair[i] = {
                docxTags: {
                  id: +item.directoryNumber,
                  name: item.directoryName,
                  title: item.directoryName,
                  contractDirectoryId: item.contractDirectoryId,
                  text: item.text,
                },
                formItems: {
                  id: item.fromId,
                  code: item.fromCode,
                  name: item.fromName,
                },
                rulesForm: {
                  item: item.item,
                  operate: item.operate,
                  value: item.value,
                },
                id: uuid(),
                danger: (item.item && item.operate && item.value),
              };
            });
            _docxTags = docxTags;
            _pair = pair;
          }
          this.setState({
            docxTags: JSON.parse(JSON.stringify(docxTags)),
            pair: JSON.parse(JSON.stringify(pair)),
            pairLoading: false,
            docxTagsLoading: false
          });
        } else {
          message.warn(res.message);
          this.setState({ pairLoading: false, docxTagsLoading: false });
        }
      });
    });
  };

  reSet = () => {
    tagsCheckedArr = [];
    this.setState({
      docxTags: [],
      formItems: [],
      pair: [],
      checkL: [], // 清空左侧标签选项
      checkedKeys: [], // 清空tree中的选项
      idArr: []
    }, () => {
      this.reloadSignList()
      setTimeout(() => {
        this.setMappingBoxTrue();
      }, 3000);
    });
  };

  saveTemplate = () => {
    const { templateDetailsParams, _status, templateKey, userInfo, IPObject } = this.state;
    const fileName = templateDetailsParams?.fileName?.split('.')[0] || templateDetailsParams.templateName || 'template';
    const params = {
      c: 'forcesave',
      key: templateKey,
      userdata: JSON.stringify({
        serialNum: templateDetailsParams.fileNumber || templateKey,
        fileName: templateDetailsParams.fileName || templateDetailsParams.templateName,
        fileNumber: templateDetailsParams.fileNumber||templateKey,
        templateKey,
        fileType: templateDetailsParams.fileType || '',
        archivesClassification: templateDetailsParams.archivesClassification || '',
        documentType: templateDetailsParams.documentType || '',
        type: templateDetailsParams.type,
        orgId: userInfo.orgId,
        dataType: 5, // _status === 'isUpdate' ? 5 : 4, // payload.dateType   0.仅保存 1.保存个人版本  2.行外推送保存个人版本 3 .合同文件保存模板  4.空白文档和导入文档保存模板  5.修改模板
        blankFlag: 0, // _status === 'newAdd' ? 1 : 0, // blankFlag   0.其他情况 1.新增模版
        userId: userInfo.id,
        cover: '',
        fileNameTemp: fileName, // 去掉后缀名-------
        templateName: templateDetailsParams.templateName, //
        busId: templateKey,
        fileForm: 'docx',
        sysCode: 'flow',
        fileKey: templateKey,
        isSmart: templateDetailsParams.isSmart,
        id: templateDetailsParams?.id,
        formName: '',
        templateType: templateDetailsParams?.templateType,
        proType: templateDetailsParams?.proType || '',
      }),
    };
    this.setState({ saveLoading: true }, () => {
      fetch(`${IPObject.jsApiIp}/coauthoring/CommandService.ashx`, {
        method: 'POST',
        body: JSON.stringify(params),
      }).then(res => {
        if (res.status === 200) {
          res.json().then(response => {
            setTimeout(() => {
              saveTemplate({
                fileSerialNumber: templateDetailsParams.fileNumber || templateKey,
                fileName: fileName, // 去掉后缀名
                busId: templateKey,
                fileKey: templateKey,
                fileForm: 'docx',
                sysCode: 'flow',
                archivesClassification: 'template',
                documentType: 'rp',
                id: templateDetailsParams.id,
                ownershipInstitution: templateDetailsParams.ownershipInstitution || '',
                proCode: templateDetailsParams.proCode,
                templateType: templateDetailsParams?.templateType,
                proType: templateDetailsParams?.proType
              }).then(res=>{
                if (res?.status === 200) {
                  message.success('操作成功');
                  cx.destroyEditor && cx.destroyEditor();
                  if(templateDetailsParams?.templateType == 0) {
                    router.push('/contract/standardTemplateProspectus');
                  } else if (templateDetailsParams?.templateType == 1) {
                    router.push('/contract/prospectusConfigIndex');
                  } else {
                    router.push('/prospectus/prospectusProductTypeTemplate');
                  }
                } else {
                  message.warn(`${res.message}`);
                }
                this.setState({ saveLoading: false });
              })
            }, 5000);
          });
        }
      });
    });
  };

  saveMapping = () => {// 保存标签与业务要素的关系
    const { pair, templateKey, userInfo, data } = this.state;
    if (pair.length === 0) {
      message.warn('请设置标签映射关系');
      return;
    }
    let list = [];
    list = pair.map(item=>{
      delete item.id;
      let resItem = {
        directoryNumber: item.docxTags.id,
        contractDirectoryId:item.docxTags.contractDirectoryId,
        directoryName: item.docxTags.name,
        text: item.docxTags.text?.substr(0, 30),  // 内容域中选中的文字最多保留长度30
        fromCode: item.formItems.code,
        fromName: item.formItems.name,
        fromId: item.formItems.id, // 要素id
        orgId: userInfo.orgId,
      }
      if(item.rulesForm) {
        resItem = {
          ...resItem,
          ...item.rulesForm
        }
      }// 这里加上需要保存的字段信息
      return resItem
    });
    data.forEach(removeTag => {
      list.forEach(item=>{
        if (String(removeTag.directoryNumber)===String(item.directoryNumber)) {
          item.contractDirectoryId = String(removeTag.id)
        }
      })
    })
    saveTagContent({
      list, changxieKey: templateKey, orgId: userInfo.orgId
    }).then(res=>{
      if (res?.status === 200) {
        message.success('操作成功');
        this.setState({
          mappingVisible: false,
          docxTags: [],
          formItems: [],
          pair: [],
        }, () => {
          this.reloadSignList(); // 获取左侧 文档标签
        });
      }
    })
  };

  PopconfirmConfirm = e => { router.push('/processCenter/processConfig') };

  PopconfirmCancel = e => { };

  // 选择指定内容域并跳转到内容域所在位置
  selectTags = id => {
    let obj = {
      object: 'content',
      type: 'select',
      id,
    };
    cx.setDocumentContent(obj);
  };
  appendJQCDN = apiSrc => {
    let _this = this;
    let head = document.head || document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.setAttribute('src', apiSrc);
    head.appendChild(script);
    // 判断外部js是否加载完成
    script.onload = script.onreadystatechange = function () {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        _this.renderCXEditor();
      }
      script.onload = script.onreadystatechange = null;
    };
  };
  componentDidMount() {
    cx.destroyEditor && cx.destroyEditor();
    const _status = getSession('_status');
    const userInfo = JSON.parse(getSession('USER_INFO'));
    const templateDetailsParams = JSON.parse(getSession('_templateParams'));
    const titleVisible = getUrlParam();
    getNginxIP().then(res => {
      if (res?.status === 200) {
        this.setState({
          IPObject: res.data,
          _status,
          userInfo,
          templateDetailsParams,
          titleVisible,
          fileType: templateDetailsParams.type || 'docx',
          templateKey: templateDetailsParams.fileNumber || templateDetailsParams.fileSerialNumber,
          title: templateDetailsParams.templateName || templateDetailsParams.fileName,
        }, () => {
          this.appendJQCDN(res.data.jsApi);
        });
      }
    });
  }
  componentWillUnmount() {
    cx.destroyEditor && cx.destroyEditor();
    ['_templateKey', 'templateDetailsParams', '_status'].forEach(sessionKey=>{
      sessionStorage.removeItem(sessionKey);
    })
    // const { templateKey } = this.state
    // // 如果文档没有入库 清理掉文档上的标签信息
    // getCountByChangxieKey({ changxieKey: templateKey }).then(res=>{
    //   if (!res.data) {
    //     //清理
    //   ({ changxieKey: templateKey })
    //   }
    // })
  }
  permissClick = () => {
    this.permissBoxRef.current.showModal(this.state.templateKey);
  }
  ruleClick = (curId, rulesForm = {}) => {
    const formVals = {
      Fitem: rulesForm.item,
      Foperate: rulesForm.operate,
      Fvalue: rulesForm.value,
    }
    this.tagsRulesRef.current.showModal({curId, formVals, _pair});
  }
  getTagsRules = ({rulesForm, curId}) => {
    const curItem = this.state.pair.find(item => item.id === curId);
    curItem.rulesForm = rulesForm
    if (Object.keys(rulesForm).some(key=>rulesForm[key])) {
      curItem.danger = true
    } else {
      curItem.danger = false
    }
    this.setState({
      pair: this.state.pair
    })
  }

  //标签搜索
  tagsSearch=(value,data,filter,key)=>{
    let arr=queryArrByType(
      data,
      [filter],
      value
    )
    key&&key==3?
      this.setState({data:arr})
      :this.setState({ docxTags: arr})
  }

  //重置
  reloadSignList = () => {
    cx.getDocumentContent(OBJECT);
    this.setState({
      configFlag: false
    })
    // this.setState({
    //   selectedRows: [],
    //   selectedRowKeys: [],
    // })
  };

  // onSelectChange = (selectedRowKeys, selectedRows) => {
  //   this.setState({
  //     selectedRowKeys:selectedRowKeys,
  //     selectedRows:selectedRows,
  //   });
  // };

    renderTreeNodes = data =>data.map(item => {
          if (item.child) {
            return (
              <TreeNode title={item.name} key={item.id} dataRef={item}>
                {this.renderTreeNodes(item.child)}
              </TreeNode>
            )
          }
          return <TreeNode title={item.name} key={item.id} dataRef={item} />
    })

    //一键配置权限与映射
    oneClickConfig = () => {
      const { templateKey } = this.state;
      console.log(templateKey);
      this.setState({ configLoading: true });
      setAuthorize({fileSerialNumber:templateKey}).then(res => {
        if (res.status == 200) {
          message.success('配置权限成功！')
          this.setState({ configLoading: false })
        } else {
          message.error(res.message)
          this.setState({ configLoading: false })
        }
      })
    }



  render() {
    const {
      userInfo,
      _status,
      templateDetailsParams,
      isAll,
      checkL,
      idArr,
      saveBtn,
      docxTagsLoading,
      formItemLoading,   // 业务要素加载效果
      pairLoading,
      saveLoading,
      mappingVisible,
      switchStatus,
      more,
      tags,
      data,
      docxTags,
      pair,
      formItems,
      checkedKeys,
      selectedRowKeys,
      columns,
      configLoading,
      titleVisible,
      configFlag
    } = this.state;
    return (
      <div style={{height: 'calc(100vh - 112px)'}}>
        <div style={{ textAlign: 'right', lineHeight: '48px', backgroundColor: '#ffffff', paddingRight: '30px' }}>
          <Switch checkedChildren="智能撰写" unCheckedChildren="智能撰写" checked={switchStatus} onChange={this.switchChange} />
          {!titleVisible?.title?.includes('标准模板') && <Button style={{marginLeft: 10, fontSize: 12}} onClick={this.oneClickConfig} type="primary" size="small" disabled={configFlag} loading={configLoading}>
            一键配置
          </Button>}
          <Button style={{marginLeft: 10, fontSize: 12}} onClick={this.saveTemplate} type="primary" size="small" disabled={saveBtn} loading={saveLoading}>
            保存模板
          </Button>
        </div>
        {
          _status === 'isSee' ?
            <div style={{ width: '100%', float: 'left', height: '100%' }}>
              <div id="_COX_Editor_SKD"></div>
            </div> :
            <div style={{height: '100%', clear: 'both'}}>
              <div style={{ width: 'calc(100vw - 512px)', float: 'left', height: '100%' }}>
                <div id="_COX_Editor_SKD"></div>
              </div>
              <div className={styles.operatorArea}>
                <Card
                  headStyle={{ borderBottom: 'none', padding: '0 10px' }}
                  bodyStyle={{ padding: '10px', minHeight: 800 }}
                >
                  <Tabs defaultActiveKey="1" onChange={this.tabsChange} size="small">
                    <TabPane tab="标签设置" key="1">
                      <div>
                        <div className={styles.labelSetBox}>
                          <div
                            className={styles.syncBtn}
                            style={{cursor:'auto'}}
                          >
                            <Popover style={{ backgroundColor: 'rgba(255,255,255,.3)'}} content={content} title={title}>
                              <QuestionCircleOutlined style={{marginLeft: 10}} />
                            </Popover>
                            <Tooltip title="重载">
                              <SyncOutlined style={{ marginLeft: 15 }} onClick={this.reloadSignList} />
                            </Tooltip>
                          </div>
                          <Search
                            placeholder="请输入标签名称"
                            onSearch={value => this.tagsSearch(value,[...this.state.docxTagsCopy],'name')}
                            style={{ width: 200 }}
                            className={styles.syncBtn}
                            loading={docxTagsLoading}
                          />
                          <div style={{ paddingLeft: 20 }}>
                            {docxTags.map((item, i) => (
                              <p style={{margin: '0 0 7px 0', padding: 0}} key={item.id} title={item.name}>
                                <a onClick={() => this.selectTags(item.id)}>{item.name}</a>
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tab={'标签映射关系设置'} disabled={!switchStatus} key="2">
                      <div
                        className={styles.syncBtn}
                        style={{cursor:'auto'}}
                      >
                        <Tooltip title="重载">
                         <SyncOutlined style={{ paddingLeft: 10 }} onClick={this.reloadSignList} />
                        </Tooltip>
                        <Tooltip title="映射设置列表">
                          <SettingOutlined style={{marginLeft: 15}} onClick={() => this.setMappingBoxTrue()} />
                        </Tooltip>
                      </div>
                      <Search
                        placeholder="请输入标签名称"
                        onSearch={value => this.tagsSearch(value,[...this.state.docxTagsCopy],'name')}
                        style={{ width: 200 }}
                        className={styles.syncBtn}
                        loading={docxTagsLoading}
                      />
                      <div className={more ? styles.tagsBox2 : styles.tagsBox1} style={{marginBottom: '5px',paddingLeft: '20px'}}>
                        {docxTags.length > 0 &&
                          docxTags.map((item, i) => <p  style={{margin: '0 0 7px 0', padding: 0}} key={item.id}>{item.name}</p>)}
                      </div>

                    </TabPane>
                    <TabPane tab={'权限设置'} key="3">
                      <div
                        className={styles.syncBtn}
                        style={{cursor:'auto'}}
                      >
                        <SyncOutlined style={{ paddingLeft: 10 }} onClick={this.reloadSignList} />
                        <Tooltip title="设置">
                          <SettingOutlined  style={{marginLeft: 15}} onClick={() => this.permissClick()}  />
                        </Tooltip>
                      </div>
                      <Search
                        placeholder="请输入标签名称"
                        onSearch={value => this.tagsSearch(value,[...this.state.dataCopy],'directoryName',3)}
                        style={{ width: 200 }}
                        className={styles.syncBtn}
                        loading={this.state.dataLoading}
                      />
                      <div className={more ? styles.tagsBox2+' '+styles.docxtab : styles.tagsBox1+' '+styles.docxtab}>
                        {data.length > 0 ? (
                            <div style={{marginBottom: '5px',paddingLeft: '20px'}}>
                              <p style={{margin: '0 0 7px 0', padding: 0, display: 'flex', color: '#999999'}}>
                                <span style={{flex: 3}}>标签名称</span>
                                <span style={{flex: 1}}>用户数量</span>
                              </p>
                              {data.map((item, idx) => (
                                <p style={{margin: '0 0 7px 0', padding: 0, display: 'flex'}} key={item.id || idx}>
                                  <span style={{flex: 3}}>{item.directoryName}</span>
                                  <span style={{flex: 1}}>{item.userList.length}</span>
                                </p>
                              ))}
                            </div>
                          ) :
                          (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}
                      </div>

                    </TabPane>
                  </Tabs>
                </Card>
              </div>
            </div>
        }
        <Modal visible={mappingVisible} mask={true} destroyOnClose={true} closable={false}
               onCancel={() => this.setMappingBoxFalse()} onOk={() => this.saveMapping()}
               width={1200} style={{ top: 20 }}>
          <Row gutter={12}>
            <Col span={8}>
              <Row>
                <Divider orientation="left">文档标签</Divider>
                <Checkbox checked={isAll === 'isAll'} onClick={() => this.isCheckAll('isAll')}/>
                <Button type="link" onClick={() => this.isCheckAll('isAll')}> 全选 </Button>
                <Checkbox checked={isAll === 'noAll'} onClick={() => this.isCheckAll('isAll')}/>
                <Button type="link"  onClick={() => this.isCheckAll('noAll')}> 全不选 </Button>
              </Row>
              <div style={{ height: 650, border: '1px solid #ddd', padding: '6px' }}>
                <Spin spinning={docxTagsLoading}>
                  <Input.Search placeholder="请输入"  onSearch={ (val)=>this.iptSearch(val, 'left')}/>
                  <div className={styles.itemBox}>
                    {docxTags.length > 0 ?
                      docxTags.map((item, index) => (
                        <Row key={item.id}>
                          <Checkbox
                            checked={checkL.includes(item.id)}
                            value={item.id}
                            style={{ marginRight: 8 }}
                            onChange={e => this.checkBoxChangeL(e, item)}
                          />
                          {item.name}
                          <div className={styles.nameStyle} style={{ color: '#ddd', fontSize: 12 }}>
                            {item.text}
                          </div>
                        </Row>
                      )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                  </div>
                </Spin>
              </div>
            </Col>
            <Col span={8}>
              <Row>
                <Divider orientation="left">标签与要素映射关联</Divider>
                <Button type="link" onClick={this.addPair}>添加</Button>
                <Button type="link" onClick={this.delPair}>删除</Button>
                <Button type="link" onClick={this.reSet}>重置</Button>
              </Row>

              <div style={{ height: 650, border: '1px solid #ddd', padding: '6px' }}>
                <Spin spinning={pairLoading}>
                  <Input.Search placeholder="请输入" onSearch={ (val)=>this.iptSearch(val, 'center')} />
                  <div className={styles.itemBox}>
                    {pair.length > 0 ?
                      pair.map((item, index) => (
                        <Row key={item.id}>
                          <Checkbox
                            checked={idArr.includes(item.id)}
                            value={item.id}
                            style={{ marginRight: 8 }}
                            onClick={e => this.checkBoxChangeM(e, item.id)}
                          />
                          {item.docxTags.name} & {item.formItems.name}
                          <Button type="link" danger={item.danger}
                                  onClick={ () => this.ruleClick(item.id, item.rulesForm)}>设置规则
                          </Button>
                        </Row>
                      )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                  </div>
                </Spin>
              </div>
            </Col>
            <Col span={8}>
              <Row style={{textAlign: 'right'}}>
                <Divider orientation="left">智能模型</Divider>
                <Popconfirm
                  title="将要跳转到流程配置页面，请先确认是否要保存标签映射关系？"
                  onConfirm={this.PopconfirmConfirm}
                  onCancel={this.PopconfirmCancel}
                  okText="跳转" cancelText="取消">
                  <Button type="link">设置</Button>
                </Popconfirm>
              </Row>
              <div style={{ height: 650, border: '1px solid #ddd', padding: '6px' }}>
                <Spin spinning={formItemLoading}>
                  <Input.Search placeholder="请输入" onSearch={ (val)=>this.iptSearch(val, 'right')} />
                  <div className={styles.itemBox}>
                    {formItems.length > 0 ?
                      <Tree checkable
                            checkedKeys={checkedKeys}
                            onCheck={ this.onCheck }
                            treeDefaultExpandAll={true}
                            defaultExpandAll={true}
                            fieldNames = {{
                              title: 'name',
                              key: 'id',
                              children: 'child',
                            }}
                            treeData={formItems}
                      >
                        {/*{this.renderTreeNodes(formItems)}*/}
                      </Tree>
                      :<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }
                  </div>
                </Spin>
              </div>
            </Col>
          </Row>
        </Modal>
        <TagsRules ref={this.tagsRulesRef} getTagsRules={this.getTagsRules}/>
        <PermissBox ref={this.permissBoxRef} IPObject={this.state.IPObject} docxTags={this.state.docxTags}/>
      </div>
    );
  }
}

export default Index;
