//招募说明书办理 查看
import React, { Component } from 'react';
import router from 'umi/router';
import {
  Popconfirm,
  Checkbox,
  Input,
  Row,
  Col,
  Button,
  Table,
  Tabs,
  Card,
  Spin,
  Empty,
  Divider,
  Modal,
  Switch,
  Breadcrumb,
  Tree,
  Space,
  Tag,
  message,
  Tooltip,
} from 'antd';
import { SyncOutlined, TagsOutlined, LeftOutlined,ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import TagsRules from './compontents/tagsRules';
import PermissBox from './compontents/permissBox';
import { unitParameters, cssParameters, OBJECT, downloadUrl, callbackUrl } from './cxConfig.js';
import {
  getBusinessData,
  getMapping,
  getNginxIP,
  saveTpltags,
  saveTemplate,
  saveTagContent,
  getStaffList,
  getTask,
} from '@/services/prospectuSet';
import { getDocumentType, uuid } from '@/utils/utils';
import { getSession, setSession } from '@/utils/session';
import { groupBy,queryArrByType } from '@/utils/groupby';
import { cloneDeep } from 'lodash';
let cx = {};
const { TabPane } = Tabs;
const { TreeNode } = Tree;
const {Search}=Input

let tagsCheckedArr = []; // 文档标签 选中项集合
let itemsCheckedArr = []; // 元素标签 选中项集合
let _docxTags = [];
let _formItems = [];
let _pair = [];

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
    docxTags: [], // 左侧标签
    pair: [], // 标签与业务要素关系
    formItems: [], // 右侧业务要素
    saveBtn: true,
    docxTagsLoading: false, // 标签加载效果
    formItemLoading: false, // 业务要素加载效果
    pairLoading: false, // 业务要素关联关系加载效果
    mappingVisible: false, // 保存标签与业务要素关联信息加载圈效果
    saveLoading: false, // 保存模版加载圈效果
    idArr: [], // 映射关联 选中项集合
    checkL: [],
    isAll: '',
    _status: '',
    checkedKeys: [],
    mineTags: [],
    mineTagsCopy: [],
    mineTagsLoading:false,
    selectedRows: [],
    selectedRowKeys: [],
    columns: [
      {
        title: '标签',
        dataIndex: 'directoryName',
        key: 'id',
        sorter: false,
        ellipsis: true,
        render: (text,record) =><a onClick={() => this.selectTags(record.directoryNumber)}>{text||'--'}</a>
      },
    ]
  };
  tagsRulesRef = React.createRef();
  permissBoxRef = React.createRef();
  renderCXEditor = () => {
    const {
      IPObject,
      _status,
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
          edit: false, // 是否可编辑 true 可编辑 false 只读
          print: unitParameters.print, // 是否可打印
          review: false, // 是否可修订
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
      height: cssParameters.height,
      width: cssParameters.width,
      type: cssParameters.type,
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
    // console.log(`编辑器错误: code ${event.data.errorCode}, 描述 ${event.data.errorDescription}`)
    message.error(`编辑器错误: ${event.data.errorDescription}`);
  };

  onRequestClose = () => {
    if (window.opener) {
      window.close();
      return;
    }
    cx.destroyEditor();
  };

  onWarning = event => {
    // console.log(`编辑器错误: code ${event.data.warningCode}, 描述 ${event.data.errorDescription}`)
    message.warn(`编辑器警告: ${event.data.warningDescription}`);
  };

  onDocumentStateChange = () => {};

  onGetDocumentContent = event => {
    let tags = event.data.text,
      docxTags = [];
    if (tags.length > 0) {
      docxTags = tags.filter(item => item.name); //tags.filter(item => item.name && item.name.includes('填充'))
      _docxTags = docxTags; // ?
      this.setState({ docxTags, tags }, () => {
        this.getTags();
        let arr = [],
          templateKey = this.state.templateKey;
        arr = tags
          .filter(item => item.name)
          .map(item => {
            return {
              changxieKey: templateKey,
              directoryName: item.name,
              directoryNumber: item.id,
              text: item.text.substr(0, 30), // 最多只保留长度30的字符串
            };
          });
        if (arr.length === 0) return;
        // saveTags  isTemplate: 1,  // 标识为模板中的标签 2021 12 29
        saveTpltags(arr, `changxieKey=${templateKey}&isTemplate=1`).then(res => {
          if (res?.status === 200) {
            // this.getStaffList();
          }
        });
      });
    }
  };
  iptSearch = (val, position) => {
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
          pair = _pair;
        } else {
          pair = _pair.filter(
            key =>
              [
                key.docxTags.name,
                key.formItems.name,
                key.docxTags.name + key.formItems.name,
              ].indexOf(val) > -1,
          );
        }
        this.setState({ pair: JSON.parse(JSON.stringify(pair)) });
        break;
      case 'right':
        let { formItems } = this.state;
        if (val === '') {
          formItems = _formItems;
        } else {
          formItems = _formItems.filter(key => key.name.includes(val));
          if (formItems.length == 0) {
            _formItems.forEach(item => {
              item.child.forEach(element => {
                if (element.name.includes(val)) {
                  formItemList.push({ ...item, child: [{ ...element }] });
                }
              });
            });
          }
        }
        this.setState({
          formItems:
            formItems.length != 0 ? JSON.parse(JSON.stringify(formItems)) : groupBy(formItemList),
        });
        break;
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
  onCheck = (checkedKeys, { checkedNodes }) => {
    itemsCheckedArr = checkedNodes;
    this.setState({ checkedKeys: checkedKeys });
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
    this.setState(
      {
        pair: JSON.parse(JSON.stringify(pair)),
        docxTags: JSON.parse(JSON.stringify(docxTags)),
        checkL: [], // 清空左侧标签选项
        checkedKeys: [], // 清空tree中的选项
        isAll: '',
        idArr: [],
      },
    );
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
    this.setState({ switchStatus: checked }, () => {
      if (!checked) {
        // this.getStaffList();
      }
    });
  };
  // 查询权限设置列表
  getStaffList = () => {
    this.permissBoxRef.current.getList(this.state.templateKey).then(powerData => {
      const docx = [...this.state.docxTags];
      const powerD = [];
      if (powerData.length > 0) {
        if (docx.length > 0) {
          docx.forEach(item => {
            for (let i = 0; i < powerData.length; i++) {
              if (item.name == powerData[i].directoryName) {
                powerD.push(powerData[i]);
              }
            }
          });
        }
      }
      this.setState({ data: powerD });
    });
  };

  tabsChange = key => {
    if (+key === 2) {
      this.reloadSignList();
    }
  };

  moreSet = flag => {
    this.setState({ more: flag });
  };

  setMappingBoxFalse = () => {
    tagsCheckedArr = [];
    this.setState(
      {
        docxTags: [],
        formItems: [],
        mappingVisible: false,
        pair: [],
        checkL: [], // 清空左侧标签选项
        checkedKeys: [], // 清空tree中的选项
        idArr: [],
      },
      () => {
        this.reloadSignList(); // 获取左侧 文档标签
      },
    );
  };

  setMappingBoxTrue = () => {
    this.setState(
      {
        formItemLoading: true,
        pairLoading: true,
        mappingVisible: true,
        docxTagsLoading: true,
      },
      () => {
        // 获取右侧 表单项
        getBusinessData().then(res => {
          if (res?.status === 200) {
            _formItems = JSON.parse(JSON.stringify(res.data));
            this.setState({ formItems: res.data, formItemLoading: false });
          } else {
            message.warn(res.message);
            this.setState({ formItemLoading: false });
          }
        });
        const { templateKey, userInfo, pair, docxTags } = this.state;
        // 获取映射关系 并重新设置左侧文档标签
        getMapping({ changxieKey: templateKey, orgId: userInfo.orgId }).then(res => {
          if (res?.status === 200) {
            const data = res.data;
            if (data.length > 0) {
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
                  danger: item.item && item.operate && item.value,
                };
              });
              _docxTags = docxTags;
              _pair = pair;
            }
            this.setState({
              docxTags: JSON.parse(JSON.stringify(docxTags)),
              pair: JSON.parse(JSON.stringify(pair)),
              pairLoading: false,
              docxTagsLoading: false,
            });
          } else {
            message.warn(res.message);
            this.setState({ pairLoading: false, docxTagsLoading: false });
          }
        });
      },
    );
  };

  reSet = () => {
    tagsCheckedArr = [];
    this.setState(
      {
        docxTags: [],
        formItems: [],
        pair: [],
        checkL: [], // 清空左侧标签选项
        checkedKeys: [], // 清空tree中的选项
        idArr: [],
      },
      () => {
        this.reloadSignList();
        setTimeout(() => {
          this.setMappingBoxTrue();
        }, 3000);
      },
    );
  };

  // saveTemplate = () => {
  //   const { templateDetailsParams, _status, templateKey, userInfo, IPObject } = this.state;
  //   const fileName = templateDetailsParams?.fileName?.split('.')[0] || templateDetailsParams.templateName || 'template';
  //   const params = {
  //     c: 'forcesave',
  //     key: templateKey,
  //     userdata: JSON.stringify({
  //       serialNum: templateDetailsParams.fileNumber || templateKey,
  //       fileName: templateDetailsParams.fileName || templateDetailsParams.templateName,
  //       fileNumber: templateDetailsParams.fileNumber||templateKey,
  //       templateKey,
  //       fileType: templateDetailsParams.fileType || '',
  //       archivesClassification: templateDetailsParams.archivesClassification || '',
  //       documentType: templateDetailsParams.documentType || '',
  //       type: templateDetailsParams.type,
  //       orgId: userInfo.orgId,
  //       dataType: 5, // _status === 'isUpdate' ? 5 : 4, // payload.dateType   0.仅保存 1.保存个人版本  2.行外推送保存个人版本 3 .合同文件保存模板  4.空白文档和导入文档保存模板  5.修改模板
  //       blankFlag: 0, // _status === 'newAdd' ? 1 : 0, // blankFlag   0.其他情况 1.新增模版
  //       userId: userInfo.id,
  //       cover: '',
  //       fileNameTemp: fileName, // 去掉后缀名-------
  //       templateName: templateDetailsParams.templateName, //
  //       busId: templateKey,
  //       fileForm: 'docx',
  //       sysCode: 'flow',
  //       fileKey: templateKey,
  //       isSmart: templateDetailsParams.isSmart,
  //       id: templateDetailsParams?.id,
  //       formName: '',
  //       templateType: templateDetailsParams?.templateType,
  //       proType: templateDetailsParams?.proType || '',
  //     }),
  //   };
  //   this.setState({ saveLoading: true }, () => {
  //     fetch(`${IPObject.jsApiIp}/coauthoring/CommandService.ashx`, {
  //       method: 'POST',
  //       body: JSON.stringify(params),
  //     }).then(res => {
  //       if (res.status === 200) {
  //         res.json().then(response => {
  //           setTimeout(() => {
  //             saveTemplate({
  //               fileSerialNumber: templateDetailsParams.fileNumber || templateKey,
  //               fileName: fileName, // 去掉后缀名
  //               busId: templateKey,
  //               fileKey: templateKey,
  //               fileForm: 'docx',
  //               sysCode: 'flow',
  //               archivesClassification: 'template',
  //               documentType: 'rp',
  //               id: templateDetailsParams.id,
  //               ownershipInstitution: templateDetailsParams.ownershipInstitution || '',
  //               proCode: templateDetailsParams.proCode,
  //               templateType: templateDetailsParams?.templateType,
  //             }).then(res=>{
  //               if (res?.status === 200) {
  //                 message.success('操作成功');
  //                 cx.destroyEditor && cx.destroyEditor();
  //                 if(templateDetailsParams?.templateType == 0) {
  //                   router.push('/contract/standardTpl');
  //                 } else {
  //                   router.push('/contract/prospectuSet');
  //                 }
  //               } else {
  //                 message.warn(`${res.message}`);
  //               }
  //               this.setState({ saveLoading: false });
  //             })
  //           }, 5000);
  //         });
  //       }
  //     });
  //   });
  // };

  saveMapping = () => {
    // 保存标签与业务要素的关系
    const { pair, templateKey, userInfo, data } = this.state;
    if (pair.length === 0) {
      message.warn('请设置标签映射关系');
      return;
    }
    let list = [];
    list = pair.map(item => {
      delete item.id;
      let resItem = {
        directoryNumber: item.docxTags.id,
        contractDirectoryId: item.docxTags.contractDirectoryId,
        directoryName: item.docxTags.name,
        text: item.docxTags.text?.substr(0, 30), // 内容域中选中的文字最多保留长度30
        fromCode: item.formItems.code,
        fromName: item.formItems.name,
        fromId: item.formItems.id, // 要素id
        orgId: userInfo.orgId,
      };
      if (item.rulesForm) {
        resItem = {
          ...resItem,
          ...item.rulesForm,
        };
      } // 这里加上需要保存的字段信息
      return resItem;
    });
    data.forEach(removeTag => {
      list.forEach(item => {
        if (String(removeTag.directoryNumber) === String(item.directoryNumber)) {
          item.contractDirectoryId = String(removeTag.id);
        }
      });
    });
    saveTagContent({
      list,
      changxieKey: templateKey,
      orgId: userInfo.orgId,
    }).then(res => {
      if (res?.status === 200) {
        message.success('操作成功');
        this.setState(
          {
            mappingVisible: false,
            docxTags: [],
            formItems: [],
            pair: [],
          },
          () => {
            this.reloadSignList(); // 获取左侧 文档标签
          },
        );
      }
    });
  };

  PopconfirmConfirm = e => {
    router.push('/processCenter/processConfig');
  };

  PopconfirmCancel = e => {};

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
    script.onload = script.onreadystatechange = function() {
      if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
        _this.renderCXEditor();
      }
      script.onload = script.onreadystatechange = null;
    };
  };
  getTags = () => {
    this.setState({mineTagsLoading:true})
    let { location } = this.props;
    let id = location.query.id;
    let type = location.query.type;
    let fileSerialNumber = location.query.fileSerialNumber;
    const fileName = location.query?.fileName?.split('.')[0] || 'template';
    const BanliData = JSON.parse(sessionStorage.getItem('BanLiData'));
    const userInfo = JSON.parse(getSession('USER_INFO'));
    let isTransacting = true;
    let directoryNames = [];
    let procinsId = '';
    const mineDatas = [];
    const getTag = [];
    if (BanliData) {
      BanliData.forEach(item => {
        if (item.fileSerialNumber == fileSerialNumber) {
          if (item.taskName.includes('统稿人') || item.taskName.includes('审核')) {
            isTransacting = false;
          }
        }
      });
    }
    fetch(
      `/ams/yss-contract-server/directory/selectDirectoryVoListByChangxiekeyInFlow?changxieKey=${fileSerialNumber}&isTransacting=${isTransacting}`,
      {
        headers: {
          Token: sessionStorage.getItem('auth_token') || '',
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          Data: new Date().getTime(),
          Sys: 1,
          userId: JSON.parse(sessionStorage.getItem('USER_INFO'))?.id || null,
        },
      },
    ).then(res => {
      if (res.status == 200) {
        res.json().then(succ => {
          if (succ.status == 200) {
            if (BanliData) {
              BanliData.forEach(item => {
                if (item.fileSerialNumber == fileSerialNumber) {
                  procinsId = item.procinsId;
                }
              });
              getTask(procinsId).then(ele => {
                directoryNames = JSON.parse(
                  JSON.stringify(ele?.data?.variables?.directoryNamesParam?.value || []),
                );
                if (directoryNames) {
                  directoryNames.forEach(item => {
                    succ?.data.forEach(elem => {
                      if (elem.directoryName == item) {
                        mineDatas.push(elem);
                      }
                    });
                  });
                }
                if(mineDatas.length > 0){
                  this.state.tags.forEach(item=>{
                    mineDatas.forEach(elem => {
                      if(item.name == elem.directoryName) {
                        getTag.push(elem);
                      }
                    })
                  })
                }else{
                  this.state.tags.forEach(item=>{
                    succ?.data.forEach(elem => {
                      if(item.name == elem.directoryName) {
                        getTag.push(elem);
                      }
                    })
                  })
                }
                this.setState({
                  mineTags: getTag,
                  mineTagsCopy:cloneDeep(getTag)
                });
                console.log('标签',getTag)
                this.setState({mineTagsLoading:false})
              });
            }
          }
        });
      }
    }).finally(() => {

    });
  };
  componentDidMount() {
    cx.destroyEditor && cx.destroyEditor();
    let { location } = this.props;
    let id = location.query.id;
    let type = location.query.type;
    let fileSerialNumber = location.query.fileSerialNumber;
    const fileName = location.query?.fileName?.split('.')[0] || 'template';
    const BanliData = JSON.parse(sessionStorage.getItem('BanLiData'));
    const userInfo = JSON.parse(getSession('USER_INFO'));
    let isTransacting = true;
    let directoryNames = [];
    let procinsId = '';
    const mineDatas = [];
    // const templateDetailsParams = JSON.parse(getSession('templateDetailsParams'));
    getNginxIP().then(res => {
      if (res?.status === 200) {
        this.setState(
          {
            IPObject: res.data,
            userInfo,
            // templateDetailsParams,
            fileType: type,
            templateKey: fileSerialNumber,
            title: fileName,
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
    ['_templateKey', 'templateDetailsParams', '_status'].forEach(sessionKey => {
      sessionStorage.removeItem(sessionKey);
    });
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
  };
  ruleClick = (curId, rulesForm = {}) => {
    const formVals = {
      Fitem: rulesForm.item,
      Foperate: rulesForm.operate,
      Fvalue: rulesForm.value,
    };
    this.tagsRulesRef.current.showModal({ curId, formVals, _pair });
  };
  getTagsRules = ({ rulesForm, curId }) => {
    const curItem = this.state.pair.find(item => item.id === curId);
    curItem.rulesForm = rulesForm;
    if (Object.keys(rulesForm).some(key => rulesForm[key])) {
      curItem.danger = true;
    } else {
      curItem.danger = false;
    }
    this.setState({
      pair: this.state.pair,
    });
  };
  //标签搜索
  tagsSearch=(value)=>{
    let arr=queryArrByType(
      [...this.state.mineTagsCopy],
      ['directoryName'],
      value
    )
    this.setState({
      mineTags: arr,
    })
  }

  //重置
  reloadSignList = () => {
    cx.getDocumentContent(OBJECT);
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    })
  };
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys:selectedRowKeys,
      selectedRows:selectedRows,
    });
    console.log(selectedRowKeys,selectedRows)
  };
  goBack(event) {
    event.preventDefault();
    history.go(-1);
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
      formItemLoading, // 业务要素加载效果
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
      mineTags,
      mineTagsCopy,
      columns,
      selectedRowKeys,
      mineTagsLoading
    } = this.state;
    return (
      <div>
        <Row>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space size={20}>
                <a href="#" onClick={this.goBack}>
                  {' '}
                  <LeftOutlined /> 返回{' '}
                </a>
                <a href="/base/prospectuSetHome"> 首页 </a>
              </Space>
            </Breadcrumb.Item>
            <Breadcrumb.Item>招募说明书</Breadcrumb.Item>
            <Breadcrumb.Item>招募说明书办理</Breadcrumb.Item>
          </Breadcrumb>
        </Row>
        <div>
          {/* <div style={{ backgroundColor: '#fff' }}>
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Switch checkedChildren="智能撰写" unCheckedChildren="智能撰写" checked={switchStatus} onChange={this.switchChange} />
                  <Button onClick={this.saveTemplate} type="primary" disabled={saveBtn} loading={saveLoading}>
                    保存模板
                  </Button>
                </Space>
              </div>
            </div> */}
          <div style={{ width: '77%', float: 'left', minHeight: '800px' }}>
            <div id="_COX_Editor_SKD"></div>
          </div>
          <div className={styles.operatorArea}>
            <Card
              style={{ marginTop: 20 }}
              headStyle={{ borderBottom: 'none', padding: '0 10px' }}
              bodyStyle={{ padding: '10px', minHeight: 800 }}
            >
              <Tabs defaultActiveKey="1" onChange={this.tabsChange} size="small">
                <TabPane tab="标签设置" key="1">
                  <div>
                    <div className={styles.labelSetBox}>
                      <div
                        className={styles.syncBtn}
                        style={{ color: '#2450A5' ,cursor:'auto'}}
                      >标签列表
                        <SyncOutlined style={{ marginLeft: 10 }} onClick={this.reloadSignList} />
                        <Tooltip style={{ marginLeft: 10 }} title='标签方法:1.在"插入>内容控件>富文本/纯文本>设置标签"，您可以任意增加和修改标签.2发起合同时，在段落授权中，使用这些标签，关联某些用户，这些用户将只获得该标签所包含的段落。'>
                          <ExclamationCircleOutlined style={{ marginLeft: 10 }}/>
                        </Tooltip>
                      </div>
                      <Search
                        placeholder="请输入标签名称"
                        onSearch={value => this.tagsSearch(value)}
                        style={{ width: 200 }}
                        className={styles.syncBtn}
                        loading={mineTagsLoading}
                      />
                      {/*<Table*/}
                      {/*  columns={columns}*/}
                      {/*  dataSource={mineTags}*/}
                      {/*  rowKey={'id'}*/}
                      {/*  pagination={false}*/}
                      {/*  showHeader={true}//表头*/}
                      {/*  loading={docxTagsLoading}*/}
                      {/*  rowSelection={{*/}
                      {/*    selectedRowKeys,*/}
                      {/*    onChange: this.onSelectChange,*/}
                      {/*  }}*/}
                      {/*/>*/}
                      <div className={more ? styles.tagsBox2 : styles.tagsBox1}>
                        {mineTags.map((item, i) => (
                          <p key={item.directoryNumber}>
                            标签：
                            <a onClick={() => this.selectTags(item.directoryNumber)}>
                              {item.directoryName}
                            </a>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabPane>
                {/* <TabPane tab={'标签映射关系设置'} disabled={!switchStatus} key="2">
                    <div style={{marginBottom: '12px', textAlign: 'center'}}>
                      {docxTags.length > 0 &&
                        docxTags.map((item, i) => <p key={item.id}>{item.name}</p>)}
                    </div>
                    <Row style={{ textAlign: 'center' }}>
                      <Button onClick={() => this.setMappingBoxTrue()}>
                        映射设置
                      </Button>
                    </Row>
                  </TabPane>
                  <TabPane tab={'权限设置'} key="3">
                    <div>
                      {data.length > 0 ? (
                        <div>
                          <Row style={{marginBottom: '12px'}}>
                            <Col offset={2} span={14}> 标签名称 </Col>
                            <Col span={8}> 用户数量 </Col>
                          </Row>
                          {data.map((item, idx) => (
                            <Row key={item.id || idx}  style={{marginBottom: '12px'}}>
                              <Col offset={2} span={14}> {item.directoryName}</Col>
                              <Col span={8}> {item.userList.length} </Col>
                            </Row>
                          ))}
                        </div>
                      ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                      <Row style={{ textAlign: 'center' }}>
                        <Button type='primary' onClick={() => this.permissClick()}>
                          设置
                        </Button>
                      </Row>
                    </div>
                  </TabPane> */}
              </Tabs>
            </Card>
          </div>
        </div>
        {/* <Modal visible={mappingVisible} mask={true} destroyOnClose={true} closable={false}
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
                        fieldNames = {{
                          title: 'name',
                          key: 'id',
                          children: 'child',
                        }}
                        treeData={formItems}
                      /> :<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }
                  </div>
                </Spin>
              </div>
            </Col>
          </Row>
        </Modal>
        <TagsRules ref={this.tagsRulesRef} getTagsRules={this.getTagsRules}/>
        <PermissBox ref={this.permissBoxRef} IPObject={this.state.IPObject} docxTags={this.state.docxTags}/> */}
      </div>
    );
  }
}
export default Index;
