import React, { Component } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  message,
  Modal,
  Popconfirm,
  Popover,
  Row,
  Select,
  Spin,
  Table,
  Transfer,
  Upload,
} from 'antd';
import styles from './index.modules.less';
import { ColumnsType } from 'antd/es/table';
import { uuid } from '@/utils/utils';
import { FormInstance } from 'antd/lib/form';
import { connect } from 'dva';
// import { response } from 'express';
const { Option } = Select;

// 编辑器权限参数
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
  forcesave: false, // 强制保存
  mode: 'edit', // view 只读  edit 编辑
  user: {
    id: '',
    mane: '',
  },
};
// 编辑器页面样式参数
const cssParameters = {
  height: '800px',
  // height: "500px",
  width: '100%',
  type: 'desktop', // desktop PC端 mobile 移动端
};
let cx: any = {};
const uri = '/ams/yss-contract-server';
let contractID = '';
let templateKey = '';
let contractBaseId = 0;
let gateWayIp = '';
let jsApiIp = '';
let authToken = '';
let contractNumber = '';
let newContractKey = '';
let templateId = '';
// 模板保存时  获取表单项
let _data = {
  contractNumber: '',
  fileName: '',
  fileNumber: '',
  contractName: '',
  contractNature: '',
  contractType: '',
  parentId: '',
  parentNumber: '',
  parentType: '',
  feedbackTime: '',
  signingTime: '',
  emergency: '',
  effectTime: '',
  endTime: '',
  term: '',
  marketingBankList: '',
  operateBackList: '',
  signingBackList: '',
  assetBank: '',
  trustee: '',
  assetSize: '',
  subTrustee: '',
  contractSize: '',
  contractCount: '',
  templateName: '',
  archiveState: '',
  remark: '',
};
let isPower = false;
// let _contractNumber = '';
const OBJECT = {
  object: 'content',
  type: 'property',
  name: '',
  id: '',
};

interface IColumn {
  title: string;
  dataIndex: string;
  align?: string;
  width?: number;
  fixed?: string;
  render?: () => React.ReactElement;
}

let replaceData: {}[] = []; // 智能撰写要替换的数据

class Index extends Component {
  formRef = React.createRef<FormInstance>();
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
    operatorDisable: true,
    targetKeys: [],
    contractDirectoryId: '',
    allKeys: [],
    selectedKeys: [],
    isReplace: false,
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
    contractBaseData: {
      contractNumber: '',
      contractName: '',
      contractType: '',
      contractNature: '',
      fileNumber: '',
      contractStatus: '',
      fileName: '',
      fileKey: '',
    },
    pair: [],
    type: '',
    key: '',
    name: '',
    url: '',
  };

  // 保存权限信息
  // savePower = () => {
  //   fetch(`${uri}/directory/directoryChange`, {
  //     //@ts-ignore
  //     headers: {
  //       Token: authToken,
  //       Accept: "application/json",
  //       "Content-Type": "application/json;charset=UTF-8",
  //       Data: new Date().getTime(),
  //       Sys: 1,
  //     },
  //     method: 'POST',
  //     body: JSON.stringify({
  //       oldChangxieKey: templateKey,
  //       newChangxieKey: newContractKey,
  //     })
  //   })
  // }

  getParameters(e: string) {
    const array = e.split(';');
    const parameter = new Map();
    for (const i of array) {
      if (i.indexOf('=') > 0) {
        parameter.set(i.slice(0, i.indexOf('=')), i.slice(i.indexOf('=') + 1));
      }
    }
    return parameter;
  }

  onRequestClose = () => {
    if (window.opener) {
      window.close();
      return;
    }
    cx.destroyEditor();
  };

  replaceTest = () => {
    const { contractBaseData, type, name, url } = this.state;
    this.setState({ isReplace: true }, () => {
      cx.destroyEditor();
      this.renderCXEditor(
        type,
        contractID ? contractBaseData.fileKey : newContractKey,
        name,
        `${gateWayIp}${url}`,
      );
    });
  };

  onDocumentReady = () => {
    const { isReplace, orgId, contractBaseData } = this.state;
    message.success('文档加载完成');
    console.timeEnd('文档加载时间');

    cx.getDocumentContent(OBJECT);
    fetch(
      `${uri}/directory/selectUserbychangxiekey?changxieKey=${contractID ? contractBaseData.fileKey : templateKey
      }`,
      {
        //@ts-ignore
        headers: {
          Token: authToken,
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          Data: new Date().getTime(),
          Sys: 1,
        },
      },
    ).then((res: { status: number; json: () => Promise<any> }) => {
      if (res?.status === 200) {
        res.json().then(response => {
          if (response?.data) {
            const data = response.data;
            // @ts-ignore
            if (data?.authoritys?.length > 0) {
              // @ts-ignore
              data.authoritys.forEach(item => {
                cx.setDocumentContent({
                  object: 'content',
                  type: 'property',
                  name: item,
                  value: 'edit',
                });
              });
            }
            // @ts-ignore
            // if (data?.limitedAuthoritys?.length > 0) {
            //   // @ts-ignore
            //   data.limitedAuthoritys.forEach(item => {
            //     cx.setDocumentContent({
            //       object: 'content',
            //       type: 'property',
            //       name: item,
            //       value: 'readonly',
            //     });
            //   });
            // }
          }
        });
      }
    });

    this.setState({ operatorDisable: false });
    if (isReplace) {
      // 获取映射关系
      fetch(
        `${uri}/data/selectByKey?changxieKey=${contractID ? contractBaseData.fileKey : templateKey
        }&orgId=${orgId}`,
        {
          //@ts-ignore
          headers: {
            Token: authToken,
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            Data: new Date().getTime(),
            Sys: 1,
          },
        },
      ).then((res: { status: number }) => {
        if (res?.status === 200) {
          //@ts-ignore
          res.json().then(response => {
            if (response?.data?.length > 0) {
              const data = response.data;
              if (!contractID) {
                // 记录映射关系
                this.setState({ pair: data });
              }
              data.forEach((item: any) => {
                replaceData.forEach(t => {
                  //@ts-ignore
                  if (item.fromCode === t.code) {
                    cx.setDocumentContent({
                      object: 'content',
                      type: 'replace',
                      id: item.directoryNumber,
                      //@ts-ignore
                      value: t.value,
                    });
                  }
                });
              });
            }
          });
        }
      });
      this.setState({ isReplace: false });
    }
  };

  onGetDocumentContent = (event: { data: { list: any } }) => {
    let l = 0,
      tags = event.data.list;
    if (tags.length > 0 && tags.length > l) {
      l = tags.length;
      const { contractBaseData } = this.state;
      let arr: { changxieKey: any; directoryName: any; directoryNumber: any }[] = [];
      tags.forEach((item: { name: any; id: any }) => {
        if (item.name) {
          cx.setDocumentContent({
            object: 'content',
            type: 'property',
            name: item.name,
            value: isPower ? 'edit' : 'readonly',
          });
          arr.push({
            changxieKey: contractID ? contractBaseData.fileKey : newContractKey,
            directoryName: item.name,
            directoryNumber: item.id,
          });
        }
      });
      if (arr.length > 0) {
        // saveTags
        fetch(
          `${uri}/directory/add?changxieKey=${contractID ? contractBaseData.fileKey : newContractKey
          }`,
          {
            // @ts-ignore
            headers: {
              Token: authToken,
              Accept: 'application/json',
              'Content-Type': 'application/json;charset=UTF-8',
              Data: new Date().getTime(),
              Sys: 1,
            },
            method: 'POST',
            body: JSON.stringify(arr),
          },
        ).then((res: { status: number }) => {
          if (res?.status === 200) {
            this.getStaffList();
          }
        });
      }
    }
  };

  // 查询权限设置列表
  getStaffList = () => {
    const { contractBaseData } = this.state;
    this.setState({ permissionLoading: true }, () => {
      fetch(
        `${uri}/directory/selectDirectoryVoListByChangxiekey?changxieKey=${contractID ? contractBaseData.fileKey : newContractKey
        }`,
        {
          //@ts-ignore
          headers: {
            Token: authToken,
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            Data: new Date().getTime(),
            Sys: 1,
          },
        },
      ).then((res: any) => {
        if (res?.status === 200) {
          //@ts-ignore
          res.json().then(response => {
            this.setState({ data: response.data, permissionLoading: false });
          });
        }
      });
    });
  };

  renderCXEditor = (fileType: any, key: any, title: any, url: any) => {
    let menuData = [],
      children: string | any[] = [],
      actions: string | any[] = [];
    //  获取用户权限
    fetch(`/ams/yss-base-admin/user/menutree?needAction=true&sysId=1`, {
      //@ts-ignore
      headers: {
        Token: authToken,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Data: new Date().getTime(),
        Sys: 1,
      },
    }).then((res: { status: number; json: () => Promise<any> }) => {
      if (res?.status === 200) {
        res.json().then((response: { status: number; data: any }) => {
          if (response?.status === 200) {
            menuData = response.data;
            if (menuData.length > 0) {
              for (let i = 0; i < menuData.length; i++) {
                if (menuData[i].code === 'electronic') {
                  children = menuData[i].children;
                  break;
                }
              }
              for (let i = 0; i < children.length; i++) {
                if (children[i].code === 'contractList') {
                  actions = children[i].actions;
                  break;
                }
              }
              for (let i = 0; i < actions.length; i++) {
                if (actions[i].code === 'contractList:power') {
                  isPower = true;
                  break;
                }
              }
            }
          }
          this.setState({ operatorDisable: true });
          console.time('文档加载时间');
          let cxo_config = {
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
            documentType: 'text', // 指明文档类型 如 word excel
            editorConfig: {
              callbackUrl: `${gateWayIp}/ams/ams-file-service/businessArchive/callbackUpdateFile`,
              customization: {
                about: false,
                chat: unitParameters.chat,
                comments: unitParameters.comments,
                zoom: unitParameters.zoom,
                leftMenu: unitParameters.leftMenu,
                rightMenu: unitParameters.rightMenu,
                toolbar: unitParameters.toolbar,
                header: unitParameters.header,
                statusBar: unitParameters.statusBar,
                autosave: unitParameters.autosave,
                forcesave: unitParameters.forcesave,
                logo: {
                  image: '',
                },
              },
              mode: unitParameters.mode,
              user: unitParameters.user,
              templates: [],
              // limitEditMode: "ctctrl",
              limitEditMode: isPower ? 'nolimit' : 'ctctrl',
            },
            events: {
              onDocumentReady: this.onDocumentReady,
              onRequestClose: this.onRequestClose,
              onGetDocumentContent: this.onGetDocumentContent,
            },
            height: cssParameters.height,
            width: cssParameters.width,
            type: cssParameters.type,
          };

          // @ts-ignore
          cx = new CXO_API.CXEditor('COX_Editor_SKD', cxo_config);
        });
      }
    });
  };

  // 根据合同ID 获取合同基本信息
  getContractBaseData = () => {
    this.renderCXEditor(
      'docx',
      '5111d4c0b7b249c98cac5db7d06fe765',
      '资管合同',
      'http://180.167.198.186:19003/ams/ams-file-service/fileServer/downloadUploadFile?getFile=05311333187738439115',
    );
    /**
     * @param {{ status: number; json: () => Promise<any>; }} res
     */
    // 列表跳转或导入合同
    // if (contractID) {
    //   fetch(`${uri}/contractfile/selectBycontractID?contractID=${contractID}&contractBaseId=${contractBaseId}`, {
    //     // @ts-ignore
    //     headers: {
    //       Token: authToken,
    //       Accept: "application/json",
    //       "Content-Type": "application/json;charset=UTF-8",
    //       Data: new Date().getTime(),
    //       Sys: 1,
    //     }
    //     // @ts-ignore
    //   }).then((res) => {
    //     if (res.status === 200) {
    //       // @ts-ignore
    //       res.json().then((response) => {
    //         const contractData = response?.data?.baseFormData;
    //         this.setState({ contractBaseData: contractData, type: contractData.type, key: contractData.fileKey, name: this.disposeContractName(contractData.contractName), url: `${gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${contractData.fileNumber}`, operatorDisable: true }, () => {
    //           this.renderCXEditor(contractData.type, contractData.fileKey, contractData.contractName, `${gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${contractData.fileNumber}`);
    //         })
    //       })
    //     }
    //   })
    // }
    // // 模板跳转 需要模板的数据 type key name url
    // else {
    //   const { type, name, url } = this.state;
    //   this.setState({ operatorDisable: true }, () => {
    //     this.renderCXEditor(type, newContractKey, name, `${gateWayIp}${url}`);
    //   })
    // }
  };

  // @ts-ignore
  appendJQCDN = apiSrc => {
    let _this = this;
    let head = document.head || document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.setAttribute('src', apiSrc);
    head.appendChild(script);
    // 判断外部js是否加载完成
    // @ts-ignore
    script.onload = script.onreadystatechange = function () {
      // @ts-ignore
      if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
        _this.getContractBaseData();
      }
      // @ts-ignore
      script.onload = script.onreadystatechange = null;
    };
  };

  // 处理合同名字,有后缀的不修改,没后缀的添加后缀
  disposeContractName = (_name: string) => {
    let tempName: string[] = _name.split('.');
    if (tempName[tempName.length - 1] && tempName[tempName.length - 1] == 'docx') {
      return tempName;
    } else {
      return _name + '.docx';
    }
  };

  // getNginxIP = () => {
  //   fetch(`${uri}/contractfile/getnginxip`, {
  //     // @ts-ignore
  //     headers: {
  //       // Token: authToken,
  //       Token: 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOTYiLCJpZCI6IjE5NiIsImNvZGUiOiJUZXN0MDEiLCJuYW1lIjoiVFRlc3QwMSIsIm1vYmlsZSI6IjE3Njk5OTIzMDM4IiwiY2FyZHR5cGUiOiIiLCJjYXJkbnVtIjoiIiwib3JnSWQiOiI3IiwiZGVwdElkIjoiNDUiLCJvcGVuaWQiOiIiLCJvdGhlcklkIjoiIiwibWVudU1hbmFnZXIiOmZhbHNlLCJmc3lzSWQiOiIxIiwiZXhwIjoxNjM0Njk2NzA1fQ.LnBOR2hhOOLzvLS-_-mRAKxAUlzBXAZl_nUN56_XsHdHk6tmA0vfozCQk6O-umAVIxXeTZbHao14a8ZKXBLWGfehc5IBs5fW6VUXfabzHc64Ms1OctGPPHrcxPXk27dvJJz5stQW8bBoEC8A26q_TAVX1nFdkJmqazt7wQuazkc',
  //       Accept: "application/json",
  //       "Content-Type": "application/json;charset=UTF-8",
  //       Data: new Date().getTime(),
  //       Sys: 1,
  //     }
  //     // @ts-ignore
  //   }).then((res) => {
  //     if (res.status === 200) {
  //       // @ts-ignore
  //       res.json().then((response) => {
  //         gateWayIp = response.data.gateWayIp;
  //         jsApiIp = response.data.jsApiIp;
  //         this.appendJQCDN(response.data.jsApi);
  //       })
  //     }
  //   })
  // }

  getNginxIP = () => {
    //@ts-ignore
    this.props
      .dispatch({
        type: 'operation/getNginxIp',
      })
      .then((res: any) => {
        if (res) {
          gateWayIp = res.gateWayIp;
          jsApiIp = res.jsApiIp;
          this.appendJQCDN(res.jsApi);
        }
      });
  };

  // getPair = () => {
  //   const { contractBaseData, orgId } = this.state;
  //   fetch(`${uri}/data/selectByKey?changxieKey=${contractID ? contractBaseData.fileKey : templateKey}&orgId=${orgId}`, {
  //     //@ts-ignore
  //     headers: {
  //       Token: authToken,
  //       Accept: "application/json",
  //       "Content-Type": "application/json;charset=UTF-8",
  //       Data: new Date().getTime(),
  //       Sys: 1,
  //     },
  //   }).then((res: { status: number; }) => {
  //     if (res?.status === 200) {
  //       //@ts-ignore
  //       res.json().then(response => {
  //         if (response?.data?.length > 0) {
  //           const data = response.data;
  //           if (!contractID && data.length > 0) {
  //             let list: { directoryName: string; directoryNumber: string; fromCode: string; fromName: string; text: string; }[] = [];
  //             data.forEach((item: { directoryName: string; directoryNumber: string; fromCode: string; fromName: string; text: string }) => {
  //               list.push({ directoryName: item.directoryName, directoryNumber: item.directoryNumber, fromCode: item.fromCode, fromName: item.fromName, text: item.text })
  //             });
  //             fetch(`${uri}/data/add`, {
  //               // @ts-ignore
  //               headers: {
  //                 Token: authToken,
  //                 Accept: "application/json",
  //                 "Content-Type": "application/json;charset=UTF-8",
  //                 Data: new Date().getTime(),
  //                 Sys: 1,
  //               },
  //               method: 'POST',
  //               body: JSON.stringify({ list, changxieKey: newContractKey, orgId })
  //             }).then((res: { status: number; json: () => Promise<any>; }) => {
  //               if (res?.status === 200) {
  //                 res.json().then((response: any) => {

  //                 })
  //               }
  //             })
  //           }
  //         }
  //       })
  //     }
  //   })
  // }

  getPair = () => {
    const { contractBaseData, orgId } = this.state;
    // @ts-ignore
    this.props
      .dispatch({
        type: 'operation/getPair',
        payload: {
          changxieKey: contractID ? contractBaseData.fileKey : templateKey,
          orgId,
        },
      })
      .then((res: any) => {
        if (!contractID && res.length > 0) {
          let list: {
            directoryName: string;
            directoryNumber: string;
            fromCode: string;
            fromName: string;
            text: string;
          }[] = [];
          res.forEach(
            (item: {
              directoryName: string;
              directoryNumber: string;
              fromCode: string;
              fromName: string;
              text: string;
            }) => {
              list.push({
                directoryName: item.directoryName,
                directoryNumber: item.directoryNumber,
                fromCode: item.fromCode,
                fromName: item.fromName,
                text: item.text,
              });
            },
          );
          // @ts-ignore
          this.props.dispatch({
            type: 'operation/contractAdd',
            payload: {
              list,
              changxieKey: newContractKey,
              orgId,
            },
          });
        }
      });
  };

  savePair = () => {
    const { orgId, pair } = this.state;
    let list: {
      directoryName: string;
      directoryNumber: string;
      fromCode: string;
      fromName: string;
      text: string;
    }[] = [];
    pair.forEach(
      (item: {
        directoryName: string;
        directoryNumber: string;
        fromCode: string;
        fromName: string;
        text: string;
      }) => {
        list.push({
          directoryName: item.directoryName,
          directoryNumber: item.directoryNumber,
          fromCode: item.fromCode,
          fromName: item.fromName,
          text: item.text,
        });
      },
    );
    fetch(`${uri}/data/add`, {
      // @ts-ignore
      headers: {
        Token: authToken,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Data: new Date().getTime(),
        Sys: 1,
      },
      method: 'POST',
      body: JSON.stringify({ list, changxieKey: newContractKey, orgId }),
    });
  };

  historicalVersionAdd = () => {
    const { url, contractBaseData } = this.state;
    const payload = {
      contractNumber: contractNumber,
      fileNumber: contractID ? _data.fileNumber : url?.substring(url.lastIndexOf('=') + 1),
      fileName: this.disposeContractName(contractID ? _data.contractName : _data.contractName),
      statusType: '',
      status: contractID ? contractBaseData.contractStatus : '',
    };
    fetch(`${uri}/personalversion/add`, {
      // @ts-ignore
      headers: {
        Token: authToken,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Data: new Date().getTime(),
        Sys: 1,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((res: { status: number; json: () => Promise<any> }) => {
      if (res?.status === 200) {
        res.json().then(() => { });
      }
    });
  };

  save = () => {
    const { userId, contractBaseData, orgId } = this.state;
    const params = {
      c: 'forcesave',
      key: contractID ? contractBaseData.fileKey : newContractKey,
      userdata: JSON.stringify({
        orgId: orgId,
        userOrgName: '',
        dataType: contractID ? '1' : '0', // 0.仅保存 1.保存个人版本  2.行外推送保存个人版本 3 .合同文件保存模板  4.空白文档和导入文档保存模板  5.修改模板
        status: contractBaseData.contractStatus,
        userId,
      }),
    };
    fetch(`${jsApiIp}/coauthoring/CommandService.ashx`, {
      method: 'POST',
      body: JSON.stringify(params),
    }).then(res => {
      if (res?.status === 200) {
        res.json().then(response => {
          if (+response?.error === 4) {
            // 文档没有改动的时候 调用historicalVersionAdd()保存
            this.historicalVersionAdd();
          }
        });
      }
    });
  };

  saveConTract = (eventData: { data: { type: any } }) => {
    const { pair } = this.state;
    //@ts-ignore
    const formData = JSON.parse(eventData.data.formData)[0].value.formList;
    formData.forEach((item: { key: string; value: string }) => {
      //@ts-ignore
      _data[item.key] = item.value;
    });
    const { name, url } = this.state;
    // 设置默认值（值 暂定）
    let contractNature = '3',
      contractType = '2',
      parentId = -1;
    const payload = {
      fileKey: newContractKey,
      contractOrigin: '1', //0:文件导入;1:新建;
      contractBase: {
        contractStatus: '',
      },
      fileName: this.disposeContractName(_data.contractName),
      fileNumber: url?.substring(url.lastIndexOf('=') + 1),
      contractName: this.disposeContractName(_data.contractName || name), //  这里 取表单值
      contractNature: Array.isArray(_data.contractNature)
        ? ''
        : _data.contractNature || contractNature, //  这里 取表单值
      contractType: Array.isArray(_data.contractType) ? '' : _data.contractType || contractType, //  这里 取表单值
      parentId: Array.isArray(_data.parentId) ? '' : _data.parentId || parentId,
      contractNumber: _data.contractNumber,
      contractStatus: '',
      parentNumber: _data.parentNumber,
      parentType: Array.isArray(_data.parentType) ? '' : _data.parentType,
      feedbackTime: _data.feedbackTime,
      signingTime: _data.signingTime,
      emergency: Array.isArray(_data.emergency) ? '' : _data.emergency,
      effectTime: _data.effectTime,
      endTime: _data.endTime,
      term: _data.term,
      marketingBankList: Array.isArray(_data.marketingBankList) ? '' : _data.marketingBankList,
      operateBackList: Array.isArray(_data.operateBackList) ? '' : _data.operateBackList,
      signingBackList: Array.isArray(_data.signingBackList) ? '' : _data.signingBackList,
      assetBank: _data.assetBank,
      trustee: +_data.trustee,
      subTrustee: +_data.subTrustee,
      assetSize: +_data.assetSize,
      contractSize: +_data.contractSize,
      contractCount: +_data.contractCount,
      templateName: _data.templateName,
      archiveState: Array.isArray(_data.archiveState) ? '' : _data.archiveState,
      remark: _data.remark,
      templateId,
    };
    fetch(`${uri}/contractfile/add`, {
      // @ts-ignore
      headers: {
        Token: authToken,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Data: new Date().getTime(),
        Sys: 1,
      },
      method: 'POST',
      body: JSON.stringify(payload),
      // @ts-ignore
    }).then(res => {
      if (res.status === 200) {
        // @ts-ignore
        res.json().then(response => {
          if (response?.status === 200) {
            // 添加映射关系到新创建的合同上
            if (pair.length > 0) {
              this.savePair();
            } else {
              this.getPair();
            }
            // 添加权限数据到新创建的合同上
            // this.savePower();

            // 保存文档
            this.save();
            window.parent.postMessage(
              {
                code: '200',
                type: eventData?.data?.type,
                data: {
                  iframItemKey: 'onlineEdit',
                },
              },
              '*',
            );
            // router.push('contractManage/index');
            cx.destroyEditor && cx.destroyEditor();
          }
        });
      }
    });
  };

  signModalSet = (flag = false) => {
    this.setState({ signVisible: flag, permissionLoading: true }, () => {
      if (flag) {
        cx.getDocumentContent(OBJECT);
      }
    });
  };

  permissionBoxSet = (flag = false) => {
    this.setState({ permissionVisible: flag }, () => {
      if (flag) {
        this.setState({ permissionLoading: true }, () => {
          cx.getDocumentContent(OBJECT);
        });
      }
    });
  };

  getAnnexList = () => {
    fetch(`${uri}/annex/query?contractBaseId=${contractBaseId}`, {
      //@ts-ignore
      headers: {
        Token: authToken,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Data: new Date().getTime(),
        Sys: 1,
      },
    }).then((res: { status: number; json: () => Promise<any> }) => {
      if (res?.status === 200) {
        res.json().then((response: any) => {
          this.setState({ annexData: response.data, annexLoading: false });
        });
      }
    });
  };

  annexSet = (flag = false) => {
    this.setState({ annexVisible: flag }, () => {
      if (flag) {
        this.setState({ annexLoading: true }, () => {
          this.getAnnexList();
        });
      } else {
        this.setState({
          annexLoading: false,
        });
      }
    });
  };

  set = (flag = false, record = {}) => {
    this.setState(
      {
        staffVisible: flag,
        staffLoading: flag,
        //@ts-ignore
        directoryNumber: record.directoryNumber ? record.directoryNumber : '',
        //@ts-ignore
        contractDirectoryId: record.id ? record.id : '',
        //@ts-ignore
        orgId: record.orgId ? record.orgId : '',
        record,
      },
      () => {
        if (flag) {
          //@ts-ignore
          fetch(`${uri}/contractuser/getbyorgid?orgIds=${record.orgId}`).then(res => {
            if (res?.status === 200) {
              //@ts-ignore
              res.json().then(res => {
                //@ts-ignore
                const response = res.data;
                let allKeys: { key: any; title: string }[] = [],
                  targetKeys: string[] = [];
                response.forEach((item: { code: any; name: any }) => {
                  allKeys.push({
                    key: item.code,
                    title: `${item.name}- ${item.code}`,
                  });
                });
                //@ts-ignore
                record.directoryControlVos.forEach(item => {
                  targetKeys.push(item.userId + '');
                });
                this.setState({
                  allKeys: JSON.parse(JSON.stringify(allKeys)),
                  targetKeys: JSON.parse(JSON.stringify(targetKeys)),
                  staffLoading: false,
                });
              });
            }
          });
        }
      },
    );
  };

  userMap = (data: any[]) => {
    return (
      <span>
        {data.length > 0 &&
          data.map(
            (item: {
              typeName: React.ReactNode;
              mobile: React.ReactNode;
              email: React.ReactNode;
              logo: any;
              username: {} | null | undefined;
              userId: React.ReactNode;
            }) => (
              <Popover
                placement="topLeft"
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
                        src={`${gateWayIp}${item.logo}`}
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
            ),
          )}
      </span>
    );
  };

  staffSave = () => {
    const { targetKeys, contractDirectoryId } = this.state;
    let arr: { contractDirectoryId: string; userId: never }[] = [];
    targetKeys.forEach(item => {
      arr.push({
        contractDirectoryId,
        userId: item,
      });
    });
    this.setState(
      {
        staffLoading: true,
      },
      () => {
        fetch(`${uri}/directorycontrol/update?contractDirectoryId=${contractDirectoryId}`, {
          //@ts-ignore
          headers: {
            Token: authToken,
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            Data: new Date().getTime(),
            Sys: 1,
          },
          method: 'PUT',
          body: JSON.stringify(arr),
        }).then((res: { status: number }) => {
          if (res?.status === 200) {
            message.success('操作成功');
            //@ts-ignore
            res.json().then(() => {
              this.setState(
                {
                  staffLoading: false,
                  staffVisible: false,
                },
                () => {
                  // 刷新列表
                  this.getStaffList();
                },
              );
            });
          }
        });
      },
    );
  };

  staffChange = (nextTargetKeys: any) => {
    this.setState({ targetKeys: nextTargetKeys });
  };

  selectChange = (sourceSelectedKeys: any, targetSelectedKeys: any) => {
    this.setState({
      selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys],
    });
  };

  downLoadFile = (record: any) => {
    let urlArr: string[] = [];
    record.forEach((item: { fileNumber: string; fileName: string }) => {
      urlArr.push(item.fileNumber + '@' + item.fileName);
    });
    let fileName = record[0].fileName;
    fetch(`/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${urlArr.join(',')}`, {
      //@ts-ignore
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Token: authToken,
        Data: new Date().getTime(),
        Sys: 0,
      },
    })
      .then(
        (res: {
          blob: () => Blob | PromiseLike<Blob>;
          headers: { get: (arg0: string) => any };
        }) => {
          // window.atob()--Base64解码   window.btoa()--Base64编码
          //@ts-ignore
          if (options instanceof String) {
            return res.blob();
          }
          //@ts-ignore
          if (options.name !== '' && options.name !== undefined) {
            //@ts-ignore
            fileName = options.name;
            return res.blob();
          }
          const result = res.headers.get('content-disposition');
          if (result) {
            const para = this.getParameters(result);
            fileName = decodeURI(window.atob(para.get('fileName')));
          }
          return res.blob();
        },
      )
      .then((blob: any) => {
        try {
          const a = document.createElement('a');
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a); // --火狐不支持直接点击事件
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (e) {
          message.error('下载服务异常，请稍后再试!');
          throw e;
        }
      })
      .catch((error: any) => {
        throw error;
      });
  };
  setAnnexDel = () => { };

  PopconfirmConfirm = () => {
    const { record } = this.state;
    this.setState({ annexLoading: true }, () => {
      fetch(`${uri}/annex/deletebyid?id=${record.id}`, {
        //@ts-ignore
        headers: {
          Token: authToken,
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          Data: new Date().getTime(),
          Sys: 1,
        },
        method: 'DELETE',
      }).then((res: { status: number; json: () => Promise<any> }) => {
        if (res.status === 200) {
          res.json().then((response: any) => {
            if (response.status === 200) {
              message.success('操作成功');
              this.getAnnexList();
            } else {
            }
          });
        }
      });
    });
  };

  PopconfirmCancel = () => { };

  operationBtn = (record: { uploader: React.Key; id: any; fileType: any }) => {
    return (
      <span className={styles.operationSpan}>
        {/* <a onClick={() => this.use_CX_see(record)}>查看</a> */}

        <a onClick={() => this.downLoadFile([record])}>下载</a>
        {+record.uploader === 1 && (
          <Popconfirm
            title="是否确认删除相关附件？"
            onConfirm={this.PopconfirmConfirm}
            onCancel={this.PopconfirmCancel}
            okText="确信"
            cancelText="取消"
          >
            <a
              style={{ marginLeft: 8, color: '#f5222d' }}
              onClick={() => this.setState({ record })}
            >
              {' '}
              删除{' '}
            </a>
          </Popconfirm>
        )}
      </span>
    );
  };

  setUpload = (flag: boolean) => {
    this.setState({ visible: flag });
  };

  uploadAnnexBoxSet = () => {
    this.setState({ visible: false });
  };

  before = () => {
    const { annexType } = this.state;
    if (annexType) {
      let parameter = { fileType: '', uploadFilePath: 'contractfile/annex' };
      parameter.fileType = annexType;
      this.setState({ parameter });
    } else {
      message.warn('请选择附件类型');
    }
  };

  beforeUpload = (file: { size: number }) => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.warn('文件不能大于100M!');
    }
    return isLt100M;
  };

  uploadChange = (info: { file: { status: string; name: any; response: { data: any } } }) => {
    const { annexType } = this.state;
    if (info.file.status === 'uploading') {
      this.setState({
        upLoading: true,
      });
    }
    if (info.file.status === 'done') {
      //@ts-ignore
      if (info?.file?.response?.status === 200) {
        fetch(`${uri}/annex/add`, {
          //@ts-ignore
          headers: {
            Token: authToken,
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            Data: new Date().getTime(),
            Sys: 1,
          },
          method: 'POST',
          body: JSON.stringify({
            contractBaseId,
            fileName: info.file.name,
            fileNumber: info.file.response.data,
            fileType: annexType,
          }),
        }).then((res: { status: number; json: () => Promise<any> }) => {
          if (res?.status === 200)
            res.json().then(() => {
              this.setState(
                {
                  visible: false,
                  upLoading: false,
                  annexLoading: true,
                },
                () => {
                  this.getAnnexList();
                },
              );
            });
        });
      } else {
        message.warn(`${info.file.name} 导入失败，请稍后再试`);
        this.setState({ upLoading: false });
      }
    }
    if (info.file.status === 'error') {
      message.warn(`${info.file.name} 导入失败，请稍后再试`);
      this.setState({ upLoading: false });
    }
  };

  componentDidMount() {
    if (cx?.destroyEditor) {
      cx.destroyEditor();
    }
    // window.parent.postMessage({
    //   "code": "200",
    //   "type": "onReady",
    //   "data": {
    //     "iframItemKey": "onlineEdit",
    //   }
    // }, '*');
    // window.addEventListener('message', event => {
    //   const { contractBaseData } = this.state;
    //   console.log('最外层', event);
    //   const eventData = event.data;
    //   if (eventData?.code === '200' && eventData?.type === 'dataDispatched') {
    //     console.log('合同外部控件接收分发数据', eventData);
    //     sessionStorage.setItem('auth_token', eventData.data.token);
    //     authToken = eventData.data.token;
    //     let baseFormData = eventData?.data?.formData?.baseFormData;
    //     contractID = baseFormData?.contractID;
    //     templateKey = baseFormData?.key;
    //     templateId = baseFormData?.templateId;
    //     contractBaseId = baseFormData?.contractBaseId;
    //     contractNumber = baseFormData?.contractNumber;
    //     unitParameters.user.id = eventData.data.uesrId;
    //     //@ts-ignore
    //     unitParameters.user.name = eventData.data.uesrName;
    //     this.setState({ userId: eventData?.data?.uesrId, orgId: eventData?.data?.orgId, baseFormData, })
    //     if (contractID) {
    //       this.getNginxIP();
    //     } else {
    //       newContractKey = uuid().replace(/-/g, '');
    //       this.setState({ type: baseFormData.fileType, name: baseFormData.name, url: baseFormData.url }, () => {
    //         this.getNginxIP();
    //       })
    //     }
    //   }
    //   if (eventData?.code === '200' && eventData.type === 'completed') {
    //     if (eventData?.data?.type === "dataDispatched") {  //替换文档时的通信
    //       const formData = JSON.parse(eventData.data.formData)[0].value.formList;
    //       formData.forEach((item: { type: string; optionsList: any[]; options: any[]; value: any; key: any; }) => {
    //         if (item.type === 'select') {
    //           // 数据视图
    //           if (item?.optionsList.length > 0) {
    //             item.optionsList.forEach((k: { value: any; label: any; }) => {
    //               if (k.value === item.value) {
    //                 replaceData.push({ code: item.key, value: k.label });
    //               }
    //             })
    //           }
    //           if (item?.options.length > 0) {
    //             item.options.forEach((k: { value: any; label: any; }) => {
    //               if (k.value === item.value) {
    //                 replaceData.push({ code: item.key, value: k.label });
    //               }
    //             })
    //           }

    //         } else {
    //           //@ts-ignore
    //           replaceData.push({ code: item.key, value: item.value });
    //         }
    //       });
    //       this.replaceTest();
    //     } else {
    //       if (contractID) {   // /yss-contract-server/contractfile/update   需确认数据格式
    //         this.save();
    //         if (+contractBaseData.contractStatus <= 4 || contractBaseData.contractStatus === '') {
    //           const formData = JSON.parse(eventData.data.formData)[0].value.formList;
    //           let data = { contractStatus: '', contractNumber: '', fileName: '', fileNumber: '', contractName: '', contractNature: '', contractType: '', parentId: '', parentNumber: '', parentType: '', feedbackTime: '', signingTime: '', emergency: '', effectTime: '', endTime: '', term: '', marketingBankList: '', operateBackList: '', signingBackList: '', assetBank: '', trustee: '', assetSize: '', subTrustee: '', contractSize: '', contractCount: '', templateName: '', archiveState: '', remark: '' };
    //           formData.forEach((item: { key: string; value: string; }) => {
    //             //@ts-ignore
    //             data[item.key] = item.value
    //           })
    //           fetch(`${uri}/contractfile/update`, {
    //             //@ts-ignore
    //             headers: {
    //               Token: authToken,
    //               Accept: "application/json",
    //               "Content-Type": "application/json;charset=UTF-8",
    //               Data: new Date().getTime(),
    //               Sys: 1,
    //             },
    //             method: 'POST',
    //             body: JSON.stringify({
    //               baseFormData: {

    //                 fileKey: newContractKey,
    //                 contractOrigin: '1',//0:文件导入;1:新建;
    //                 contractBase: {
    //                   contractStatus: '',
    //                 },
    //                 fileName: data.fileName,
    //                 fileNumber: data.fileNumber,
    //                 contractName: this.disposeContractName(data.contractName),
    //                 contractNature: Array.isArray(data.contractNature) ? '' : data.contractNature,
    //                 contractType: Array.isArray(data.contractType) ? '' : data.contractType,
    //                 parentId: Array.isArray(data.parentId) ? '' : data.parentId,
    //                 contractNumber: data.contractNumber,
    //                 contractStatus: data.contractStatus,
    //                 parentNumber: data.parentNumber,
    //                 parentType: Array.isArray(data.parentType) ? '' : data.parentType,
    //                 feedbackTime: data.feedbackTime,
    //                 signingTime: data.signingTime,
    //                 emergency: Array.isArray(data.emergency) ? '' : data.emergency,
    //                 effectTime: data.effectTime,
    //                 endTime: data.endTime,
    //                 term: data.term,
    //                 marketingBankList: Array.isArray(data.marketingBankList) ? '' : data.marketingBankList,
    //                 operateBackList: Array.isArray(data.operateBackList) ? '' : data.operateBackList,
    //                 signingBackList: Array.isArray(data.signingBackList) ? '' : data.signingBackList,
    //                 assetBank: data.assetBank,
    //                 trustee: +data.trustee,
    //                 subTrustee: +data.subTrustee,
    //                 assetSize: +data.assetSize,
    //                 contractSize: +data.contractSize,
    //                 contractCount: +data.contractCount,
    //                 templateName: data.templateName,
    //                 archiveState: Array.isArray(data.archiveState) ? '' : data.archiveState,
    //                 remark: data.remark,

    //                 // ...data,
    //                 // "onlineEdit": {},
    //                 "contractID": contractID,
    //                 "contractBaseId": contractBaseId
    //               }
    //             })
    //           }).then((res: { status: number; }) => {
    //             if (res?.status === 200) {
    //               //@ts-ignore
    //               res.json().then(response => {
    //                 if (response.status === 200) {
    //                   window.parent.postMessage({
    //                     "code": "200",
    //                     "type": eventData?.data?.type,
    //                     "data": {
    //                       "iframItemKey": "onlineEdit",
    //                     }
    //                   }, '*');
    //                   cx.destroyEditor && cx.destroyEditor();
    //                 }
    //               })
    //             }
    //           })
    //         } else {
    //           window.parent.postMessage({
    //             "code": "200",
    //             "type": eventData?.data?.type,
    //             "data": {
    //               "iframItemKey": "onlineEdit",
    //             }
    //           }, '*');
    //           cx.destroyEditor && cx.destroyEditor();
    //         }
    //       } else {
    //         this.saveConTract(eventData);
    //       }
    //     }
    //   }
    // })

    newContractKey = uuid().replace(/-/g, '');

    this.getNginxIP();

    fetch('/ams/ams-base-parameter/datadict/queryInfoByList?codeList=contractFileType', {
      //@ts-ignore
      headers: {
        Token: authToken,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Data: new Date().getTime(),
        Sys: 1,
      },
    }).then((res: { status: number; json: () => Promise<{ data: any }> }) => {
      if (res?.status === 200) {
        res.json().then((response: { data: any }) => {
          this.setState({ dropDownObj: response.data });
        });
      }
    });
  }

  componentWillUnmount() {
    cx.destroyEditor && cx.destroyEditor();
  }

  // 内容域替换
  replaceHandler = () => {
    window.parent.postMessage(
      {
        code: '200',
        type: 'replaceContent',
        data: {
          iframItemKey: 'onlineEdit',
        },
      },
      '*',
    );
  };

  render() {
    const {
      upLoading,
      parameter,
      dropDownObj,
      require,
      visible,
      annexVisible,
      annexLoading,
      annexData,
      selectedKeys,
      targetKeys,
      allKeys,
      staffVisible,
      staffLoading,
      signVisible,
      permissionLoading,
      permissionVisible,
      data,
      operatorDisable,
    } = this.state;
    const columns: ColumnsType<IColumn> = [
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
        render: (val: any, record: any) => <a onClick={() => this.set(true, record)}>设置</a>,
      },
      {
        title: '授权用户',
        dataIndex: 'directoryControlVos',
        render: (val: any) => this.userMap(val),
      },
    ];
    const annexColumns: ColumnsType<IColumn> = [
      {
        title: '文件名称',
        dataIndex: 'fileName',
      },
      {
        title: '文件类型',
        dataIndex: 'fileTypeName',
      },

      {
        title: '上传人',
        dataIndex: 'userName',
      },
      {
        title: '状态更新时间',
        dataIndex: 'lastEditTime',
      },
      {
        title: '操作',
        dataIndex: 'id',
        //@ts-ignore
        render: (val, record) => this.operationBtn(record),
      },
    ];

    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const uploadContractProps = {
      action: '/ams/ams-file-service/fileServer/uploadFile',
      name: 'file',
      headers: {
        Token: authToken,
      },
    };
    return (
      <div className={styles.box}>
        <div className={styles.editArea}>
          <div id="COX_Editor_SKD" />
        </div>
        <div className={styles.operatorArea}>
          <Card
            title=""
            style={{ marginTop: 20 }}
            headStyle={{ borderBottom: 'none', padding: '0 10px' }}
            bodyStyle={{ padding: '10px', minHeight: 800 }}
          >
            <div style={{ marginTop: 20 }}>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '5px 0' }}>
                <Col md={10} sm={24} style={{ paddingRight: 0 }}>
                  <span>段落权限</span>
                </Col>
                <Col md={2} sm={24} />
                <Col md={8} sm={24}>
                  {/* <Switch
                    size="small"
                    // disabled={!disabled}
                    checked={switchStatus}
                    loading={switchLoading}
                    onChange={this.paragraphAuthorityControlSwitch}
                  /> */}
                </Col>
              </Row>
              <div>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '5px 0' }}>
                  <Col md={12} sm={24} style={{ paddingRight: 0 }}>
                    <span style={{ marginLeft: 20 }}>全部标签</span>
                  </Col>
                  <Col md={2} sm={24} />
                  <Col md={8} sm={24}>
                    <a
                      className={styles.setBtn}
                      onClick={() => this.signModalSet(true)}
                      //@ts-ignore
                      disabled={operatorDisable || !contractID}
                    >
                      查看
                    </a>
                  </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '5px 0' }}>
                  <Col md={12} sm={24} style={{ paddingRight: 0 }}>
                    <span style={{ marginLeft: 20 }}>权限设置</span>
                  </Col>
                  <Col md={2} sm={24} />
                  <Col md={8} sm={24}>
                    <a
                      className={styles.setBtn}
                      onClick={() => this.permissionBoxSet(true)}
                      //@ts-ignore
                      disabled={operatorDisable || !contractID || !isPower}
                    >
                      设置
                    </a>
                  </Col>
                </Row>
              </div>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '15px 0' }}>
                <Col md={12} sm={24} style={{ paddingRight: 0 }}>
                  <span>相关附件</span>
                </Col>
                <Col md={2} sm={24} />
                <Col md={8} sm={24}>
                  <a
                    className={styles.setBtn}
                    onClick={() => this.annexSet(true)}
                    //@ts-ignore
                    disabled={operatorDisable || !contractID}
                  // disabled={false}
                  >
                    设置
                  </a>
                </Col>
              </Row>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ margin: '15px 0' }}>
                <Col md={12} sm={24} style={{ paddingRight: 0 }}>
                  <Button
                    onClick={this.replaceHandler}
                    style={{ marginLeft: 90 }}
                  // type="primary"
                  >
                    内容域替换
                  </Button>
                </Col>
              </Row>
            </div>
          </Card>
        </div>

        <Modal
          title="全部段落标签"
          wrapClassName="vertical-center-modal"
          visible={signVisible}
          onOk={() => this.signModalSet()}
          onCancel={() => this.signModalSet()}
          destroyOnClose={true}
          closable={false}
          footer={null}
          width={600}
        >
          <Spin spinning={permissionLoading}>
            <div className={styles.signNameBox}>
              {data?.length > 0 ? (
                //@ts-ignore
                data.map(item => <span>{item.directoryName}</span>)
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </Spin>
        </Modal>

        <Modal
          title="权限设置"
          onCancel={() => this.permissionBoxSet(false)}
          visible={permissionVisible}
          destroyOnClose={true}
          width={900}
          closable={false}
          footer={null}
          //@ts-ignore
          headStyle={{ borderBottom: 'none' }}
        >
          <Table
            columns={columns}
            bordered={true}
            //@ts-ignore
            dataSource={data}
            pagination={false}
            loading={permissionLoading}
            size="small"
          />
        </Modal>
        <Modal
          // title="段落权限授权"
          visible={staffVisible}
          onOk={() => this.set(false)}
          onCancel={() => this.set(false)}
          footer={null}
          closable={false}
          width={800}
        >
          <Spin spinning={staffLoading}>
            <Transfer
              dataSource={allKeys}
              titles={['备选待授权人员', '已选被授权人员']}
              operations={['审批入库', '撤消入库']}
              // showSearch
              targetKeys={targetKeys}
              selectedKeys={selectedKeys}
              onChange={this.staffChange}
              onSelectChange={this.selectChange}
              //@ts-ignore
              render={item => item.title}
              listStyle={{
                width: 300,
                height: 400,
              }}
            />
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
        <Modal
          title="相关附件"
          onCancel={() => this.setState({ annexVisible: false, annexLoading: false })}
          visible={annexVisible}
          destroyOnClose={true}
          width={1100}
          closable={false}
          footer={null}
          //@ts-ignore
          headStyle={{ borderBottom: 'none' }}
        >
          <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ marginLeft: 0, marginRight: 0 }}>
            <Col md={22} sm={24}>
              <Table
                columns={annexColumns}
                bordered={true}
                //@ts-ignore
                dataSource={annexData}
                pagination={false}
                loading={annexLoading}
                size="small"
              />
            </Col>
            <Col md={2} sm={24}>
              <Button onClick={() => this.setUpload(true)}>新增</Button>
            </Col>
          </Row>
        </Modal>

        <Modal
          title="上传附件"
          visible={visible}
          onCancel={() => this.uploadAnnexBoxSet()}
          destroyOnClose={true}
          closable={false}
          footer={null}
          width={650}
          zIndex={1001}
        >
          <Form {...layout} ref={this.formRef} name="control-ref">
            <Form.Item
              name="annexType"
              label="附件类型"
              rules={[{ required: true, message: '请选择附件类型' }]}
            >
              <Select
                placeholder="请选择附件类型"
                onChange={val => {
                  this.setState({
                    annexType: val,
                    require: true,
                  });
                }}
              >
                {dropDownObj.contractFileType &&
                  dropDownObj.contractFileType.map(
                    (item: { code: string | number | undefined; name: React.ReactNode }) => (
                      <Option
                        //@ts-ignore
                        value={item.code}
                        key={item.code}
                      // disabled={
                      //   +item.code === 4 &&
                      //   (+contractStatus < 5 ? true : isSign)
                      // }
                      >
                        {item.name}
                      </Option>
                    ),
                  )}
              </Select>
            </Form.Item>
          </Form>
          <div style={{ textAlign: 'right' }}>
            <Upload
              {...uploadContractProps}
              data={parameter}
              openFileDialogOnClick={require}
              accept=".docx"
              // @ts-ignore
              onChange={e => this.uploadChange(e)}
              beforeUpload={this.beforeUpload}
            >
              <Button
                onClick={this.before}
                loading={upLoading}
                style={{ marginLeft: 90 }}
                type="primary"
              >
                上传附件
              </Button>
            </Upload>
          </div>
        </Modal>
      </div>
    );
  }
}

//@ts-ignore
const ContractManage = connect(({ operation }) => operation)(Index);
export default ContractManage;
