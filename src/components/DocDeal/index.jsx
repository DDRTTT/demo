import React, {Component} from 'react';
import {Card, Checkbox, Col, Form, Input, message, Modal, Popover, Row, Select, Spin, Tabs, Tooltip} from "antd";
import styles from "./index.less";
import {ExclamationCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {queryArrByType} from './groupby';
import {getJsonFromSession, getValFromSession} from './utils';

import cx_edit_config from "@/components/DocDeal/docConfig/edit";
import {cloneDeep} from "lodash";

const { TabPane } = Tabs;
const {Search}=Input
// 获取流程节点中的参数 来确定编辑器开放的权限
let editAll = false;  // 可编辑全部内容
let editTags = false;  // 可编辑内容域内容
let setUpMapping = false;  // 可设置映射关系
let setUpPower = false;  // 可设置标签权限

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
let gateWayIp = '';
let jsApiIp = '';
let currentNode = '';
let tagsCheckedArr = []; // 文档标签 选中项集合
let itemsCheckedArr = []; // 元素标签 选中项集合
let _id = 0;
let _docxTags = [];
let _formItems = [];
let _pair = [];

let taskId = '';
let updateType = '';
let procinsId = '';

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

let returnedTags = [];

class Index extends Component {
  constructor(props){
    super(props);

  }
  formRef = React.createRef();
  state = {
    userId: 0,
    orgId: 0,
    switchStatus: false,
    switchLoading: false,
    permissionVisible: false,
    permissionLoading: false,
    signVisible: false,
    data: [],
    staffVisible: false,
    staffLoading: false,
    targetKeys: [],
    contractDirectoryId: '',
    allKeys: [],
    selectedKeys: [],
    // isReplace: false,
    annexVisible: false,
    annexLoading: false,
    annexData: [],
    visible: false,
    annexType: '',
    require: false,
    dropDownObj: { contractFileType: [] },
    parameter: {},
    upLoading: false,
    record: { id: 0 },
    baseFormData: { contractNumber: '' },
    contractBaseData: { fileSerialNumber: '', contractNumber: '', contractName: '', contractType: '', contractNature: '', fileNumber: '', contractStatus: '', fileName: '', fileKey: '' },
    pair: [],
    type: '',
    key: '',
    name: '',
    url: '',

    tags: [],
    tagsCopy:[],
    tagsLoading:false,
    fileData: { fileFormat: '', fileName: '', fileSerialNumber: '' },
    checkedValues: [],
    docxTags: [],
    mappingVisible: false,
    shineLoading: false,
    isAll: '',
    checkL: [],
    idArr: [],
    formItemLoading: false,
    formItems: [],
    itemChecked: '',
    checkedKeys: [],
    goBackVisible: false,
    backLoading: false,
    backTaskOptions: [],
    activityId: '',
    loading: false,
    indeterminate: false,
    checkAll: false,
    checkedList: []
  }


  mapLimit = (list, limit, asyncHandle, type) => {
    let recursion = (arr) => {
      return asyncHandle(arr.shift()).then(() => {
        if (arr.length !== 0) return recursion(arr);
        else return '';
      });
    };

    let listCopy = [].concat(list);
    let asyncList = []; // 正在进行的所有并发异步操作
    let length = limit;
    while (length--) {
      asyncList.push(recursion(listCopy));
    }
    return Promise.all(asyncList).then(() => {
      window.parent.postMessage({
        code: "200",
        type: type,
        data: {
          iframItemKey: "onlineEdit",
        }
      }, '*');
    }); // 所有并发异步操作都完成后，本次并发控制迭代完成 给主项目发消息 继续流程
  };

  magic = (data, type) => {
    if (data?.length > 0) {
      if (Object.values(data[0]).length > 0) {
        let count = 0;
        let _limit = data.length > 1 ? 1 : data.length; // 设置最大并发数为1  替换标签内容的接口必须一个一个的调用,不然会出现文档错误替换,
        this.mapLimit(data, _limit, (item) => {
          let jsonArr = [];
          if (Object.values(item)[0]?.length > 0) {
            Object.values(item)[0].forEach(k => {
              jsonArr.push({
                name: "",
                id: Object.keys(k)[0],
                clear: true,
                content: { body: [{ span: [{ '@value': Object.values(k)[0] }] }] }
              })
            })
            return new Promise(resolve => {
              count++;
              fetch(`${jsApiIp}/addtocontentcontrol`, {
                headers: simpleHeader,
                method: 'POST',
                body: JSON.stringify({
                  jsonArr: JSON.stringify(jsonArr),
                  fileUrl: `${gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${Object.keys(item)[0]}`,
                }),
              }).then(res => {
                if (res.status === 200) {
                  res.json().then(response => {
                    if (response?.end === true) {
                      // 替换后的文档 保存
                      fetch('/ams-file-service/template/updateTemplateByBusId', {
                        headers: simpleHeader,
                        method: 'POST',
                        body: JSON.stringify({
                          busId: Object.keys(item)[0],
                          url: response?.urls['result.docx'],
                        }),
                      }).then(res => {
                        if (res?.status === 200) {
                          // 清除文档缓存
                          fetch(`${jsApiIp}/remove?key=${Object.keys(item)[0]}`).then(res => {
                            if (res?.status === 200) {
                              resolve();
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            });
          }
        }, type).then(() => { });
      }
    }
  }

  // 更新招募书状态
  updateContractBusiness = () => {
    const id = getJsonFromSession("_templateParams")?.id;
    fetch(`/ams/yss-contract-server/businessArchive/updateContractBusiness?id=${id}`, {
      headers,
      method: 'POST',
    })
  }

  onRequestClose = () => {};

  // 重构开始----------------------------
  // 获取标签和要素值的对应关系
  // 获取当前用户文档对应标签
  getRelateOfTagAndEle = ()=>{
    const userInfo = getJsonFromSession('USER_INFO'); // 当前用户信息
    return new Promise((resolve, reject)=>fetch(`/ams/yss-contract-server/data/selectByKey?changxieKey=${contractKey}&orgId=${userInfo.orgId}`,{
      headers,
    }).then((suc) => {
      suc.json().then((succ) => {
        if(succ?.data) {
          const ysTags = succ?.data;
          resolve(ysTags);
        }});
    }).catch(()=> message.error('获取当前用户标签列表失败')));
  }
  // 通过当前表单参数、用户所属组织id获取标签
  getTagByParams = ()=> {
    const { orgId } = this.state;
    const templateParams = getJsonFromSession('_templateParams'); // 所有模板参数
    const { expiryDate, financialDate, disclosureDate, batchNumber } = templateParams;
    return new Promise((resolve, reject)=>fetch(`/ams/yss-contract-server/RpTemplate/getAllTagValue?changxieKey=${contractKey}&orgId=${orgId}&expiryDate=${expiryDate}&financialDate=${financialDate}&disclosureDate=${disclosureDate}&batchNumber=${batchNumber}`, {
      headers,
    }).then((res) => {
      if (res?.status === 200) {
        res.json().then((ele) => {
          const tagsValue = ele.data;
          resolve(tagsValue);
        })
      }
    }).catch(()=> message.error('获取表单标签列表失败')));
  }
  // 通过是否有办理人获取数据
  getDataByDealer = () => {
    const taskName = getJsonFromSession('_templateParams')?.taskName;
    let isTransacting = !!taskName.includes('办理人');// 办理人权限
    return new Promise((resolve, reject)=>fetch(`/ams/yss-contract-server/directory/selectDirectoryVoListByChangxiekeyInFlow?changxieKey=${contractKey}&isTransacting=${isTransacting}`, {
      headers,
    }).then(resp => {
      resp.json().then((response) => {
        const data = response.data;
        resolve(data);
      });
    }).catch(()=> message.error('获取办理人标签列表失败')));
  }

  setTagsWhenGetDocTags = () => {

    const returnedTags = getValFromSession('returnedTags'); // 退回标签
    const taskName = getJsonFromSession('_templateParams')?.taskName;

    const tagsValues = [];
    const showTags = [];

    if (taskName.includes('办理人') &&
      (returnedTags === undefined || returnedTags === 'undefined' || returnedTags == null || returnedTags === 'null')
    ) {
      Promise.all([this.getRelateOfTagAndEle(), this.getTagByParams(), this.getDataByDealer()]).then((res) => {
        const ysTags = res[0], tagsValue = res[1], data = res[2];
        ysTags.forEach(item => {
          //     // 如果通过当前表单获取的标签数据中有的，拿到用户对应标签
          const tag = tagsValue.find(element=>item['directoryNumber'] === Object.getOwnPropertyNames(element)[0]);
          if(tagsValue){
            tagsValues.push(tag);
          }
        });
        tagsValues.forEach((item, index) => {
          const flag = !!data.find(element =>Object.getOwnPropertyNames(item)[0] === element['directoryNumber']);
          // 当前任务名是办理人，办理人标签中包含（当前表单获取标签列表）放入showTags
          if(flag){
            showTags.push(item);
          }
        });


        showTags.forEach(item => {
          if (typeof (Object.values(item)[0]) == 'string' || Object.values(item)[0] === '') {
            cx.setDocumentContent({
              object: 'content',
              type: 'replace',
              id: Object.keys(item)[0],
              value: Object.values(item)[0],
            });
          } else {
            cx.setDocumentContent({
              object: 'content',
              type: 'html',
              id: Object.keys(item)[0],
              jsonStr: Object.values(item)[0],
              bClear: true
            });
          }
        });
      });
    } else {
      _docxTags.forEach(item => {
        if (item.text) {
          cx.setDocumentContent({
            object: 'content',
            type: 'replace',
            id: item.id,
            value: item.text,
          });
        }
      });
    }
  }

  onDocumentReady = () =>{
    message.success('文档加载完成');
    cx.getDocumentContent(OBJECT); // 此内容用于触发 getStaffList 用来加载可用标签

  }
  // 重构结束----------------------------

  onGetDocumentContent = (event) => {
    let tags = event?.data?.list || event?.data?.text;
    tags = tags.filter((item) => item.name);
    let powerList = tags;
    let docxTags = tags;
    if (tags.length > 0) {
      _docxTags = docxTags;

      // // 统稿人节点，直接从文档拿标签
      // const taskName = getJsonFromSession('_templateParams')?.taskName;
      // const isTransacting = !!(taskName.includes('办理人'));
      // if(!isTransacting){
      //  const arr = tags.map((item, i) => {
      //       return {
      //         id: item.id,
      //         directoryName: item.name,
      //         directoryNumber: item.id
      //       };
      //   });
      //   this.setState({
      //     tags: [...arr],
      //     tagsCopy:  JSON.parse(JSON.stringify(tags))
      //   });
      // }

      this.setState({ docxTags, powerList }, () => {

        let arr = [];
        tags.forEach((item, i) => {
          if (item.name) {
            arr.push({
              changxieKey: contractKey,
              directoryName: item.name,
              directoryNumber: item.id,
              text: item?.text?.substr(0, 30), // 最多只保留长度30的字符串
            });
          }
        });
        if (arr.length > 0) {
          // this.getStaffList();
        }
        this.setTagsWhenGetDocTags();
      });
    }
  };

  // 获取每个标签的编辑权限
  getEditorAuth = ()  => {
    const taskName = getJsonFromSession('_templateParams')?.taskName;
    let isTransacting = taskName ? !!taskName.includes('办理人') : true;
    let authlist = [];
    let directoryNames = [];
    if(getValFromSession('directoryNames') !== 'undefined'){
      directoryNames = getJsonFromSession('directoryNames');
    }
    return new Promise((resolve, reject)=>fetch(`/ams/yss-contract-server/directory/selectDirectoryVoListByChangxiekeyInFlow?changxieKey=${contractKey}&isTransacting=${isTransacting}`, {
      headers,
    }).then(res => {
      res.json().then(response => {
        const data = response?.data
        if (directoryNames !== null && directoryNames !== 'undefined'  && directoryNames.length > 0) {
          data.forEach((item) => {
            for (let m = 0; m < directoryNames.length; m++) {
              if (item['directoryName'] === directoryNames[m]) {
                authlist.push({
                  partId: item['directoryNumber'], //内容域id
                  canEdit: true, //是否可以编辑
                  canView: true, //是否隐藏
                  canSetting: false,//能否设置内容域
                  canSetPermission: false,//是否有内容域设置权限
                  canComment: true,//能否批注
                })
              }
            }
          });
        } else {
          data && data.forEach(item => {
            authlist.push({
              partId: item['directoryNumber'], // 内容域id
              canEdit: true, // 是否可以编辑
              canView: true, // 是否隐藏
              canSetting: false, // 能否设置内容域
              canSetPermission: false, // 是否有内容域设置权限
              canComment: true, // 能否批注
            });
          });
        }
        if (taskName && taskName.includes('统稿')) {
          authlist?.forEach(item => {
            item.canEdit = true;
            item.canView = true;
          });
        }
        resolve(authlist);
      }).catch((e)=>{
        message.error('无法获取标签权限');
      })}));
  }

  setCxConfig = (baseConfig) =>{
    const templateForms = !!this.props.templateForms.find((item)=>item.formItem === 'returnButton'); // 最后一个节点不显示修订模式
    const userInfo = getJsonFromSession('USER_INFO');
    const { fileType, key, title, url, authlist } = baseConfig;
    const config = cloneDeep(cx_edit_config);
    config.document = {...config.document, fileType, key, title, url};
    config.document.permissions = {
      ...config.document.permissions,
      edit: unitParameters.edit, // 是否可编辑 true 可编辑 false 只读
      setPermissionShow: !!editAll,  // 显示权限配置按钮
      partauth:  {
        canLockStyle: true, // 是否能锁定样式
        canUnLockStyle: false, // 能否解锁样式
        isStyleLock: false, // 是不是样式锁
        authlist
      }
    };
    config.editorConfig = {  ...config.editorConfig, user: {id: userInfo.id, name: userInfo.username},};
    if(!templateForms){
      config.document.permissions.edit = false;
      config.editorConfig.reviewDisplay = 'markup';
    }
    config.events = {
      onDocumentReady: this.onDocumentReady,
      onRequestClose: this.onRequestClose,
      onGetDocumentContent: this.onGetDocumentContent,
    };
    return config;
  }

  renderCXEditor = (fileType, key, title, url) => {
    this.getEditorAuth().then((authlist)=>{
      const config = this.setCxConfig({fileType, key, title, url, authlist});
      // console.log('cxo_config', cxo_config);
      // console.log('config', config);
      cx = new CXO_API.CXEditor('COX_Editor_SKD', config);
      this.reloadSignList();
    });
    // 这里需要把获取到可改动的标签设置上
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
    let _this = this;
    let head = document.head || document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.setAttribute('src', url);
    head.appendChild(script);
    // 判断外部js是否加载完成
    script.onload = script.onreadystatechange = function () {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        _this.getContractBaseData();
      }
      script.onload = script.onreadystatechange = null;
    }
  }

  save = () => {
    const { userId, orgId } = this.state;
    const params = {
      c: 'forcesave',
      key: contractKey,
      userdata: JSON.stringify({
        orgId,
        userOrgName: '',
        dataType: 5, // 0.仅保存 1.保存个人版本  2.行外推送保存个人版本 3 .合同文件保存模板  4.空白文档和导入文档保存模板  5.修改模板
        status: '6',
        userId,
        serialNum: contractKey,
        fileNumber: contractKey,
        templateKey: contractKey,
        busId: contractKey,
        fileForm: 'docx',
        sysCode: 'flow',
        fileKey: contractKey,
        id: contractKey,
      }),
    }
    fetch(`${jsApiIp}/coauthoring/CommandService.ashx`, {
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
        cx.destroyEditor && cx.destroyEditor();
      }
    })
  }

  delDirtyData = (fileSerialNumber) => {
    fetch(`/ams/yss-contract-server/baseContract/delContract/${fileSerialNumber}`, {
      headers,
      method: 'DELETE'
    })
  }

  messageHandle = (eData) => {
    let fileData = {};
    if (this.props.isProcess) {
      const formData = eData?.formData || '';
      currentNode = formData?.currentNode;
      if (formData?.returnedTags?.length > 0) {
        returnedTags = formData.returnedTags;
      }
      fileData = formData.fileData;

      contractKey = fileData?.fileSerialNumber;
      // this.appendJQCDN();
      if(JSON.stringify(fileData) !== JSON.stringify(this.state.fileData) && JSON.stringify(formData) !== JSON.stringify(this.state.formData)){
        this.setState({ fileData, formData }, () => {
          contractKey = fileData?.fileSerialNumber;
          this.appendJQCDN();
        })
      }
    } else {
      // 触发监听后 下发的数据(取值为隐藏项中的值---流水号 文件类型 文件名称) 这个值 可能是选择产品后获取的 也可能是上传的 文件列表中的数据 用这些参数加载文档
      //   cx?.destroyEditor && cx.destroyEditor();
        const data = JSON.parse(eData?.data.formData); // 需要修改
        data.forEach((item) => {
          // 选择产品后获取对应文档参数
          if (item.key === 'fileData') {
            fileData = JSON.parse(item.value);
          }
          if (item.key === 'currentNode') {
            currentNode = item.value
          }
          if (item.key === 'returnedTags') {
            returnedTags = item.value;
          }
        })
        const dirtyData = localStorage.getItem('dirtyData');
        // 清理掉复制但没发起流程的脏数据
        if (dirtyData) {
          this.delDirtyData(dirtyData);
        }
        // if (!(+updateType === 1 && currentNode === 'chief')) {
        //   this.setState({ fileData }, () => {
        //     contractKey = fileData?.fileSerialNumber;
        //     if (!contractKey) {
        //       message.warn("没有获取到对应的文件流水号")
        //     }
        //     this.appendJQCDN();
        //   })
        // }
      contractKey = fileData?.fileSerialNumber;
      if (!contractKey) {
        message.warn("没有获取到对应的文件流水号")
      }
      this.appendJQCDN();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.nodeInfo  !== this.props.nodeInfo) {
      // cx.destroyEditor && cx.destroyEditor();
      this.messageHandle(this.props.nodeInfo);
    }
    if (prevProps.tagsList  !== this.props.tagsList) {
      // cx.destroyEditor && cx.destroyEditor();
      this.setState({
        tags: [...this.props.tagsList],
        tagsCopy:  JSON.parse(JSON.stringify(this.props.tagsList))
      });
    }
  }

  componentDidMount() {
    if(this.props.tagsList.length){
      this.setState({
        tags: [...this.props.tagsList],
        tagsCopy:  JSON.parse(JSON.stringify(this.props.tagsList))
      });
    }

    if(cx?.destroyEditor){
      cx.destroyEditor();
    }
    // 销毁之前的组件，未知是否必要
    if(this.props.nodeInfo && this.props.nodeInfo.formData){
      this.messageHandle(this.props.nodeInfo);
    }

    const USER_INFO = getJsonFromSession('USER_INFO');
    unitParameters.user.id = USER_INFO?.id;
    unitParameters.user.name = USER_INFO?.userName;
    this.setState({ userId: USER_INFO?.id, orgId: USER_INFO?.orgId })
  }

  componentWillUnmount() {
    window.onmessage = null;
    cx.destroyEditor && cx.destroyEditor();
  }

  // 选择指定内容域并跳转到内容域所在位置
  selectTags = (id) => {
    let obj = {
      object: 'content',
      type: 'select',
      id,
    };
    cx.setDocumentContent(obj);
  };

  reloadSignList = () => {
    cx.getDocumentContent(OBJECT);
    this.setState({
      checkedList: [],
      indeterminate: false,
      checkAll: false,
    });
  };

  checkboxHandle = (checkedValues) => {
    const positionInfo = [];

    if (checkedValues.length > 0) {
      checkedValues.forEach((item) => {
        for(let i = 0; i < _docxTags.length; i++){
          if(item.directoryNumber + '' === _docxTags[i]?.id + ''){
            positionInfo.push(_docxTags[i])
          }
        }
      })
    }
    this.props.checkedTagsCallBack(positionInfo);
    this.setState({
      checkedValues,
      checkedList: checkedValues,
      indeterminate: !!checkedValues.length && (checkedValues.length < _docxTags.length),
      checkAll: checkedValues.length === _docxTags.length
     });
    sessionStorage.setItem('tagsBack', JSON.stringify(positionInfo));
  }

  goBack = () => {
    // 选中的标签
    // const {checkedValues} = this.state;
    this.setState({ goBackVisible: true, backLoading: true }, () => {
      fetch(`/api/billow-diplomatic/todo-task/reject-nodes/${taskId}`, {
        headers,
      }).then(res => {
        if (res?.status === 200) {
          this.setState({ backLoading: false }, () => {
            res.json().then(response => {
              if (response?.data?.length > 0) {
                this.setState({ backTaskOptions: response.data })
              }
            })
          })
        } else {
          this.setState({ backLoading: false })
        }
      })
    })
  }
  back = () => {
    const { checkedValues } = this.state;
    this.formRef.current?.validateFields(['activityId']).then((vals) => {
      this.setState({ loading: true }, () => {
        fetch(`/api/billow-diplomatic/todo-task/reject-task/with-form`, {
          headers,
          method: 'POST',
          body: JSON.stringify({
            formData: {
              // 退回的标签 添加到formData中
              returnedTags: JSON.stringify(checkedValues)
            },
            activityId: vals.activityId,
            taskId,
          }),
        }).then(res => {
          this.updateContractBusiness();
          res.json().then(response => {
            if (response.status === 200) {
              fetch(`/ams/yss-contract-server/businessArchive/setProcessVarible`, {
                headers,
                method: 'POST',
                body: JSON.stringify({ taskId, "varibles": { returnedTags: JSON.stringify(checkedValues) }, procinsId })
              }).then(res => {
                res.json().then(response => {
                  if (response.status === 200) {
                    this.setState({ loading: false, goBackVisible: false }, () => {
                      // 跳转到上一页
                      window.parent.postMessage({
                        "code": "200",
                        "type": "back",
                        "data": {
                          "iframItemKey": "onlineEdit",
                        }
                      }, '*');
                      cx.destroyEditor();
                    })
                  }
                })
              })
            }
          })
        })
      })
    }).catch(() => {

    });
  }

  backChange = (val) => {
    this.setState({ activityId: val })
  }


  set = (flag = false, record = { directoryNumber: '', id: '', orgId: '' }) => {
    this.setState({
      staffVisible: flag,
      staffLoading: flag,
      directoryNumber: record.directoryNumber ? record.directoryNumber : "",
      contractDirectoryId: record.id ? record.id : "",
      orgId: record.orgId ? record.orgId : "",
      record
    }, () => {
      if (flag) {
        fetch(`/ams/yss-contract-server/contractuser/getbyorgid?orgIds=${record.orgId}`, {
          headers,
        }).then(res => {
          if (res?.status === 200) {
            res.json().then((response) => {
              const data = response.data;
              let allKeys = [], targetKeys = [];
              data.forEach((item) => {
                allKeys.push({
                  key: item.code,
                  title: `${item.name}- ${item.code}`,
                });
              });
              record.directoryControlVos.forEach(item => {
                targetKeys.push(item.userId + "");
              });
              this.setState({
                allKeys: JSON.parse(JSON.stringify(allKeys)),
                targetKeys: JSON.parse(JSON.stringify(targetKeys)),
                staffLoading: false
              });
            })
          }
        })
      }
    })
  };

  userMap = (data) => {
    return (
      <span>
        {data.length > 0 && data.map((item, i) => (
          <Popover placement="topLeft" content={
            <div>
              <p>用户类型: {item.typeName}</p>
              <p>手机号码: {item.mobile}</p>
              <p>邮箱账号: {item.email}</p>
            </div>
          } title={
            <div style={{ height: 60 }}>
              <div style={{ float: 'left' }}>
                <img style={{ width: 60, height: 60, borderRadius: 20, marginRight: 10 }} src={`${gateWayIp}${item.logo}`} alt="头像" />
              </div>
              <div style={{ float: 'left' }}>
                <p>{item.username}</p>
                <p>{item.userId}</p>
              </div>
            </div>
          }>
            <span className={styles.userNameBox}>{item.username}</span>
          </Popover>
        ))}
      </span>
    )
  };


  getFormItems = () => {
    fetch(`/ams/yss-contract-server/RpTemplate/findAllRecruitmentBusiness`, {
      headers,
    }).then((res) => {
      if (res?.status === 200) {
        res.json().then((response) => {
          _formItems = JSON.parse(JSON.stringify(response.data));
          this.setState({ formItems: response.data, formItemLoading: false });
        })
      } else {
        message.warn(res.message);
        this.setState({ formItemLoading: false });
      }
    })
  }

  onCheck = (checkedKeys, { checkedNodes }) => {
    itemsCheckedArr = checkedNodes;
    this.setState({ checkedKeys: checkedKeys })
  };
  onCheckAllChange=(e)=>{
    const dataList = []
    this.state.tags.forEach((item)=>{
      dataList.push(item.id);
    });
    const positionInfo = [];
    if (dataList.length > 0) {
      dataList.forEach((item) => {
        for(let i = 0; i < this.state.tags.length; i++){
          if(item === this.state.tags[i]?.id){
            positionInfo.push(this.state.tags[i])
          }
        }
      })
    }
    this.setState({
      checkedList: e.target.checked ? dataList : [],
      indeterminate: false,
      checkAll: e.target.checked
    });
    // 退回时，将退回列表发送到redux，然后退回时从redux获取数据
    sessionStorage.setItem('tagsBack', JSON.stringify(positionInfo));
  }

  onCheckAllChange_item = (e) => {
    const checkedList = e.target.checked ? this.state.tags : [];
    this.props.checkedTagsCallBack([...checkedList]);
    this.setState({
      checkedList: checkedList,
      indeterminate: false,
      checkAll: e.target.checked,
      checked:false
    });
  }
//标签搜索
  tagsSearch = (value) => {
    let arr = queryArrByType(
        [...this.state.tagsCopy],
        ['directoryName'],
        value
    )
    if(!value){
      this.setState({
        tags: [...this.state.tagsCopy],
      })
    } else {
      this.setState({
        tags: arr,
      })
    }
  }
  handleCheckClick = () => {
    if(this.state.checkedList?.length < 1)return message.warn('手工同步必须勾选标签');
    this.setState({tagsLoading: true })
    const { orgId } = this.state;
    const formData = this.props.nodeInfo.formData;
    // const getAllTagsValueDate = JSON.parse(sessionStorage.getItem('getAllTagsValueDate') || '');
    const coreModule = formData['coreModule'];
    const getAllTagsValueDate = formData[coreModule];

    const templateParams = JSON.parse(sessionStorage.getItem('_templateParams') || '');
    fetch(`/ams/yss-contract-server/RpTemplate/getAllTagValue?changxieKey=${contractKey}&orgId=${orgId}&expiryDate=${getAllTagsValueDate?.expiryDate}&financialDate=${getAllTagsValueDate?.financialDate}&disclosureDate=${getAllTagsValueDate?.disclosureDate}&batchNumber=${templateParams?.batchNumber}`, {
      headers,
    }).then((res) => {
      if (res?.status === 200) {res.json().then((ele) => {
        let objId = []
        let directoryName = []
        //过滤非填充
        this.state.checkedList.forEach((v)=>{
          if(v.directoryName?.includes('填充')){
            directoryName.push(v)
          }
        })
        ele.data.forEach((item) => {
          if(directoryName.find(it => it.directoryNumber === Object.keys(item))){
            // 从畅写里读取该条数据
            objId.push(item)
          }
        })
        objId.forEach((item) => {
          const value = Object.values(item)[0];
          const key = Object.keys(item)[0];
          if(typeof value === 'string' || value === '') {
            cx.setDocumentContent({
              object: 'content',
              type: 'replace',
              id: key,
              value: value,
            });
          } else {
            cx.setDocumentContent({
              object: 'content',
              type: 'html',
              id: key,
              jsonStr: value,
              bClear: true
            });
          }
        });
        message.success('更新成功')
        this.setState({
          checkedList:[],
          checkAll:false,
          indeterminate:false,
          tagsLoading:false
        })
      })
      }}).catch(err=>message.error(err))
  }

  render() {
    const { tagsLoading,loading,
      backTaskOptions, backLoading,
      goBackVisible, checkedKeys, formItems,
      formItemLoading, idArr, pair, checkL, isAll,
      shineLoading, mappingVisible, docxTags, selectedKeys,
      targetKeys, allKeys, tags, checkedValues, data,
      permissionVisible, permissionLoading, staffVisible,
      staffLoading } = this.state;
    const { showMode }= this.props;

    const hasDealer = getJsonFromSession('_templateParams')?.taskName?.includes('办理人') || '';
    const returnButton = !this.props.templateForms.filter((node)=>node.formItem === 'returnButton');
    // const hasDealer = true;
    return (
        <div className={styles.box}>
          {/* 是第一个节点并且是发起临时更新流程时 不加载页面 */}
          {!(+updateType === 1 && !taskId) &&
              <div className={styles.boxChildContainer}>
                <div className={styles.editArea}>
                  <div id="COX_Editor_SKD" />
                </div>
                <div className={styles.operatorArea}>
                  <Card
                      title=""
                      headStyle={{ borderBottom: 'none', padding: '0 10px' }}
                      bodyStyle={{ padding: '0 10px 0 20px', height: 'calc(100% - 300px) !important'}}
                      bordered={false}
                  >
                    <Tabs defaultActiveKey="1" size="small" style={{height: 'calc(100% - 300px)', overflow: "hidden"}}>
                      <TabPane tab="标签设置" key="1" style={{height: '100%'}}>
                          <div className={styles.tagsBox}
                          >
                            <Tooltip title='标签方法:1.在"插入>内容控件>富文本/纯文本>设置标签"，您可以任意增加和修改标签.2发起合同时，在段落授权中，使用这些标签，关联某些用户，这些用户将只获得该标签所包含的段落。'>
                              <ExclamationCircleOutlined style={{ marginLeft: 10 }}/>
                            </Tooltip>
                            <Tooltip title='重载'>
                              <SyncOutlined style={{ marginLeft: 20 }} onClick={this.reloadSignList} />
                            </Tooltip>
                          </div>
                          {/*<Button style={{marginBottom:20}} onClick={this.manualRefresh()}>手动刷新</Button>*/}
                          <Search
                              placeholder="请输入标签名称"
                              onSearch={value => this.tagsSearch(value)}
                              className={styles.syncBtn}
                              loading={tagsLoading}
                          />
                          {!hasDealer ? <div className={styles.tagsContainer} >
                              {showMode && <Checkbox indeterminate={this.state.indeterminate}
                                      style={{marginBottom:'1em', color: '#666666'}}
                                      onChange={this.onCheckAllChange_item}
                                      checked={this.state.checkAll}>全选
                            </Checkbox>}
                            {/*手工同步需要在第二节点显示，其他隐藏*/}
                            {returnButton && <Tooltip title='手工同步'>
                              {/*<Icon type="retweet" className={styles.changeColor} style={{ marginLeft: 10, fontSize: 14 }} onClick={this.handleCheckClick} />*/}
                            </Tooltip>}
                            <Checkbox.Group style={{ width: '100%', height: "auto", overflow: 'auto' }}
                                            onChange={this.checkboxHandle} value={this.state.checkedList}>
                              {tags?.map((item) => {
                                return (
                                  item.directoryName ? <p  style={{marginBottom: 7}} key={item.directoryNumber}>
                                    {item.directoryName?.includes('填充')?<Checkbox style={{paddingRight:'6px'}} value={item}/>:<span style={{width:'22px',display:'inline-block'}}/>}
                                    <span className={styles.tagClass} onClick={() => this.selectTags(item.directoryNumber)}>{item.directoryName}</span>
                                    {returnedTags.includes(item.directoryNumber) ? <span style={{ color: 'red' }}>{'(被退回)'}</span>:''}
                                  </p>: ''
                                )})}
                            </Checkbox.Group>
                          </div> : <>
                          {tags.length ? (<Checkbox indeterminate={this.state.indeterminate}
                                      style={{marginBottom:'1em'}}
                                      onChange={this.onCheckAllChange}
                                      checked={this.state.checkAll}>全选
                            </Checkbox>): '' }
                            <Checkbox.Group
                              style={{ width: '100%', height: 380, overflow: 'auto' }}
                              onChange={this.checkboxHandle} value={this.state.checkedList}>
                              {tags.map((item) => (
                                  <p key={item.directoryNumber}>
                                    <Checkbox value={item.id}></Checkbox><span style={{marginLeft: 10}} className={styles.tagClass} onClick={() => this.selectTags(item.directoryNumber)}>{item.directoryName}</span>{returnedTags.includes(item.directoryNumber) && <span style={{ color: 'red' }}>{'(被退回)'}</span>}
                                  </p>
                              ))}
                            </Checkbox.Group>
                          </>}
                          {/* {!editTags && <Button style={{ position: 'absolute', bottom: 40, left: 150 }} disabled={checkedValues.length === 0} onClick={this.goBack}>退回</Button>} */}
                      </TabPane>
                </Tabs>
              </Card>
            </div>
            <Modal
              title="任务退回"
              onCancel={() => this.setState({ goBackVisible: false, backLoading: false })}
              onOk={this.back}
              visible={goBackVisible}
              destroyOnClose={true}
              width={600}
              closable={false}
              headStyle={{ borderBottom: 'none' }}
              confirmLoading={loading}
            >
              <Form ref={this.formRef}>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={24} sm={24}>
                    <Spin spinning={backLoading} size="small">
                      <Form.Item
                        label="节点"
                        name="activityId"
                        rules={[{ required: true, message: '任务退回的节点不能为空' }]}
                      >
                        <Select style={{ width: '100%' }} onChange={this.backChange}>
                          {backTaskOptions.length > 0 && backTaskOptions.map((item) => (
                            <Select.Option key={item.nodeId} value={item.nodeId}>{item.nodeName}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Spin>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </div>
        }
      </div>
    )
  }
}
export default Index;
