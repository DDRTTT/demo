import React, { Component } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Row,
  Select,
  Spin,
  Switch,
  Tooltip,
  Tree,
  TreeSelect,
  Upload,
} from 'antd';
import styles from './index.less';
import router from 'umi/router';
import { connect } from 'dva';
import contractImg from '@/assets/contract/contract.png';
import { InfoCircleOutlined } from '@ant-design/icons';
import Action from '@/utils/hocUtil';
import request from '@/utils/request';

const { Option } = Select;
const FormItem = Form.Item;
const { TreeNode } = Tree;
const uri = '/ams-file-service';
let timer = null;
let parentArr = [];
let valArr = [];

const valueMap = {};

function loops(list, parent) {
  return (list || []).map(({ children, value }) => {
    const node = (valueMap[value] = {
      parent,
      value,
    });
    node.children = loops(children, node);
    return node;
  });
}

function getPath(value) {
  const path = [];
  let current = valueMap[value];
  while (current) {
    path.unshift(current.value);
    current = current.parent;
  }
  return path;
}

class Index extends Component {
  formRef = React.createRef();
  state = {
    loading: false,
    isReview: true,
    open: false,
    tabsLoading: false,
    activeVal: 'all',
    title: '',
    templateAddVisible: false,
    like: '',
    isUpload: false,
    dropDownObj: [],
    switchStatus: true,
    oftenCurrent: 1,
    oftenTotal: 0,
    allCurrent: 1,
    allTotal: 0,
    myCurrent: 1,
    myTotal: 0,
    oftenData: [],
    allData: [],
    myData: [],
    oftenDataLoading: false,
    allDataLoading: false,
    myDataLoading: false,
    uploadBtnLoading: false,
    contractNatureLoading: false,
    templateDelTip: false,
    delId: '',
    delLoading: false,
    category: [],
    templateNameTip: '',
    goon: false,
    userInfo: {},
    treeVal: undefined,
    IPObject: {},
    cArr: [],
    delKey: '',
    // 目录树的路径
    directoryTreePath: [],
    procedureLoading: false,
    procedureData: [],
  };

  setTreeNode = data => {
    return data.map(item => (
      <TreeNode title={item.title} key={item.key}>
        {item?.children?.length > 0 && this.setTreeNode(item.children)}
      </TreeNode>
    ));
  };

  switchAndGetData = (
    isReview = true,
    // status = 1
  ) => {
    this.resetPaginationData();
    this.setState({
      isReview,
      oftenData: [],
      allData: [],
      myData: [],
    }, () => {
      if (isReview) {
        this.templateQuery(1);
        this.templateQuery(2);
      } else {
        this.templateQuery(2);
      }
    });
  };

  setOpen = () => {
    const { open } = this.state;
    this.setState({ open: !open });
  };

  tabsChangeQuery = val => {
    this.setState({ activeVal: val, oftenData: [], allData: [], myData: [], directoryTreePath: [] }, () => {
      if (this.state.isReview) {
        this.templateQuery(1);
        this.templateQuery(2);
      } else {
        this.templateQuery(2);
      }
    });
  };

  // 获取下一级节点
  getChildNode = id => {
    this.props.dispatch({
      type: 'templateSet/getChildNode',
      payload: { id, purpose: 2 },
    }).then(res => {
      if (res) {
        this.setState({ cArr: res });
      }
    });
  };

  showTabsItem = (val, id) => {
    const { activeVal } = this.state;
    this.setState({ activeVal: activeVal === val ? '' : val }, () => {
      // 加载子节点
      this.getChildNode(id);
    });
  };

  setAddModal = val => {
    this.setState({ templateAddVisible: true, isUpload: val === 'isUpload', contractNatureLoading: true, procedureLoading: true }, () => {
      this.getDropdownData();
      this.getProcedure();
    });
  };

  search = val => {
    this.setState({ like: val }, () => {
      if (this.state.isReview) {
        this.templateQuery(1);
        this.templateQuery(2);
      } else {
        this.templateQuery(2);
      }
    });
  };
  switchChange = checked => {
    this.setState({ switchStatus: checked });
  };

  // 获取流程
  getProcedure = () => {
    this.props.dispatch({
      type: 'templateSet/getProcedure',
    }).then(res => {
      if (res) {
        this.setState({ procedureData: res })
      }
      this.setState({ procedureLoading: false })
    })
  }

  // 获取下拉列表(文件性质)
  getDropdownData = () => {
    this.props.dispatch({
      type: 'templateSet/getDropdownData',
      payload: { purpose: 2 },
    }).then(res => {
      if (res) {
        this.setState({ dropDownObj: res });
        this.setTreeNode(res);
        loops(res);
      }
      this.setState({ contractNatureLoading: false })
    });
  };

  // 模板查询
  templateQuery = (flag = 0, current = 1, pageSize = 6) => {
    if (+flag === 1) {
      this.setState({ oftenDataLoading: true });
    }
    if (+flag === 2) {
      this.setState({ allDataLoading: true });
    }
    // if (+flag === 0) {
    //   this.setState({ myDataLoading: true })
    // }
    const { isReview, activeVal, like, directoryTreePath } = this.state;

    const [arch, documentType, fileType] = directoryTreePath;
    const payload = {
      templateType: isReview ? 0 : 1,
      archivesClassification: activeVal === 'all' ? '' : arch,
      documentType: documentType || '',
      fileType: fileType || '',
      like,
      flag,
    };
    fetch(`/ams${uri}/template/oftentemplate?currentPage=${+flag === 1 ? 1 : current}&pageSize=${+flag === 1 ? 6 : pageSize}`, {
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
        res.json().then(res => {
          if (+flag === 1) {
            this.setState({
              oftenData: res?.data?.rows,
              oftenTotal: res?.data?.total,
              oftenDataLoading: false,
            });
          }
          if (+flag === 2) {
            this.setState({
              allData: res?.data?.rows,
              allTotal: res?.data?.total,
              allDataLoading: false,
            });
          }
        });
        // if (+flag === 0) {
        //   this.setState({ myData: res.data.rows, myTotal: res.data.total, myDataLoading: false })
        // }
      }
    });
  };

  pageChange = (e, flag) => {
    if (+flag === 1) {
      this.setState({ oftenCurrent: e }, () => {
        this.templateQuery(flag, e);
      });
    }
    if (+flag === 2) {
      this.setState({ allCurrent: e }, () => {
        this.templateQuery(flag, e);
      });
    }
    // if (+flag === 0) {
    //   this.setState({ myCurrent: e }, () => {
    //     this.templateQuery(flag, e);
    //   })
    // }
  };

  // 获取文件存放路径
  getFilePathByCode = params => {
    this.props.dispatch({
      type: 'templateSet/getFilePathByCode',
      payload: { code: params },
    }).then(res => {
      if (res) {
        let category = {};
        if (valArr.length === 1) {
          category = {
            archivesClassification: valArr[0],
            documentType: '',
            fileType: '',
          };
        }
        if (valArr.length === 2) {
          category = {
            archivesClassification: valArr[0],
            documentType: valArr[1] || '',
            fileType: '',
          };
        }
        if (valArr.length > 2) {
          category = {
            archivesClassification: valArr[0],
            documentType: valArr[1] || '',
            fileType: valArr[valArr.length - 1],
          };
        }
        let formVals = this.formRef.current?.getFieldsValue();
        formVals = {
          ...formVals,
          ...res,
          ...category,
          isSmart: this.state.switchStatus ? 1 : 0,
        };
        this.jumpPage(formVals, 'upload');
      }
    });
  };

  // 删除模板时同步删除掉模板中的标签数据
  delTagData = delKey => {
    this.props.dispatch({
      type: 'templateSet/delTagData',
      payload: { changxieKey: delKey },
    });
  };

  // 删除模板
  delTemplate = () => {
    let { isReview, allCurrent, allData, delId, delKey } = this.state;
    this.setState({ delLoading: true }, () => {
      this.props.dispatch({
        type: 'templateSet/delTemplate',
        payload: [delId],
      }).then(res => {
        if (res) {
          message.success('操作成功');
          this.delTagData(delKey);
          this.setState({ delLoading: false, templateDelTip: false }, () => {
            if (allData.length === 1) {
              allCurrent--;
            }
            if (isReview) {
              this.templateQuery(1);
              this.templateQuery(2, allCurrent);
            } else {
              this.templateQuery(2, allCurrent);
            }
          });
        }
      });
    });
  };

  before = () => {
    const { templateNameTip } = this.state;
    if (templateNameTip) {
      message.warn(templateNameTip);
    }
  };

  beforeUpload = file => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.warn('文件不能大于100M!');
    }
    return isLt100M;
  };

  uploadChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({
        uploadBtnLoading: true,
      });
    }
    if (info.file.status === 'done') {
      if (info?.file?.response?.status === 200) {
        message.success(`${info.file.name} 导入成功`);
        this.getFilePathByCode(info?.file?.response?.data);
        this.setState({ uploadBtnLoading: false });
      } else {
        message.warn(`${info.file.name} 导入失败，请稍后再试`);
        this.setState({
          upLoading: false,
        });
      }
    }
    if (info.file.status === 'error') {
      message.warn(`${info.file.name} 导入失败，请稍后再试`);
      this.setState({
        upLoading: false,
      });
    }
  };

  newTemplate = () => {
    this.formRef.current?.validateFields().then(values => {
      values.isSmart = this.state.switchStatus ? 1 : 0;
      let category = {};
      if (valArr.length === 1) {
        category = {
          archivesClassification: valArr[0],
          documentType: '',
          fileType: '',
        };
      }
      if (valArr.length === 2) {
        category = {
          archivesClassification: valArr[0],
          documentType: valArr[1] || '',
          fileType: '',
        };
      }
      if (valArr.length > 2) {
        category = {
          archivesClassification: valArr[0],
          documentType: valArr[1] || '',
          fileType: valArr[valArr.length - 1],
        };
      }
      values = {
        ...values,
        ...category,
      };
      this.jumpPage(values, 'newAdd');
    }).catch(() => {
      return
    })
  };

  // 获取类目
  getCategoryData = () => {
    this.props.dispatch({
      type: 'templateSet/getCategoryData',
      payload: { purpose: 2, id: 1 },
    }).then(res => {
      if (res) this.setState({ category: res });
    });
  };

  getTemplateName = e => {
    let val = e.target.value;
    if (val) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        this.checkTemplateName(val);
      }, 1500);
    }
  };

  uploadCheckUp = arr => {
    this.formRef.current?.validateFields(arr).then(() => {
      this.setState({ goon: true });
    }).catch(() => {
      this.setState({ goon: false });
    });
  };

  // 校验文件名
  checkTemplateName = val => {
    this.props.dispatch({
      type: 'templateSet/checkTemplateName',
      payload: { fileName: val },
    }).then(res => {
      this.uploadCheckUp(['type', 'contractNature', 'processId']);
      if (res?.status === 200) {
        this.setState({ templateNameTip: '' });
      }
      if (res?.status.toString().length === 8) {
        message.warn(res.message);
        this.setState({ templateNameTip: res.message, goon: false });
      }
    });
  };

  jumpPage = (item, status) => {
    item.status = status;
    sessionStorage.setItem('_status', status);
    sessionStorage.setItem('templateDetailsParams', JSON.stringify(item));
    router.push('/contract/templateDetails');
  };

  useTemplate = item => {
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
        // 返回 复制模板的数据(流水号、文件名、文件类型) 存sessionStorage中
        const copyData = res?.data;
        const contractId = copyData?.contractId;
        sessionStorage.setItem('_templateParams', JSON.stringify({ id: contractId, type: copyData?.fileFormat, name: copyData?.fileName, serialNumber: copyData?.serialNumber }))
        // 存流水号 做为清理脏数据的code
        localStorage.setItem('copyFileNum', copyData?.serialNumber)
        // item.processId 流程ID
        request(`/api/billow-diplomatic/pending-task/list`, {
          method: 'POST',
          data: { "onlyShowMe": 0, "limit": 1000, "page": 1, "processTags": [], "templateIds": [item.processId] }
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
                      // router.push(`/processCenter/taskDeal?taskId=${taskId}&processInstanceId=${processInstanceId}&mode=deal&fileType=${item.type}&key=${item.templateKey}&name=${item.fileName}&url=/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${item.fileNumber}&templateId=${item.id}&type=save`)
                      router.push(`/processCenter/taskDeal?taskId=${taskId}&processInstanceId=${processInstanceId}&mode=deal&contractId=${contractId}&type=save`)
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

  treeSelectOnChange = treeVal => {
    this.setState({ treeVal }, () => {
      this.getCategory(this.state.dropDownObj, treeVal);
    });
    this.uploadCheckUp(['templateName', 'type', 'processId']);
  };

  getParentID = (arr, val) => {
    let id = '';
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].value === val) {
        id = arr[i].parentId;
        this.getCategory();
        break;
      } else {
        if (arr[i]?.children.length > 0) {
          this.getParentID(arr[i].children, val);
        }
      }
    }
    return id;
  };

  getCategory = (arr, val) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].parentId === '-1') {
        parentArr = [];
      }
      if (arr[i].value === val) {
        parentArr.push(arr[i].value);
        valArr = parentArr;
        break;
      } else {
        if (arr[i]?.children.length > 0) {
          parentArr.push(arr[i].value);
          this.getCategory(arr[i].children, val);
        }
      }
    }
  };

  componentDidMount() {
    const userInfo = sessionStorage.getItem('USER_INFO');
    this.setState({ userInfo: JSON.parse(userInfo) });
    this.getDropdownData();
    this.templateQuery(1); // 获取常用模板
    this.templateQuery(2); // 获取全部模板
  }

  /**
   *重置分页器的数据
   */
  resetPaginationData = () => {
    this.setState({
      oftenData: [],
      allData: [],
      myData: [],
      oftenCurrent: 1,
      oftenTotal: 0,
      allCurrent: 1,
      allTotal: 0,
      myCurrent: 1,
      myTotal: 0,
    });
  };

  onTreeSelect = selectedKeys => {
    this.resetPaginationData();
    this.setState({
      activeVal: selectedKeys[0],
      oftenData: [],
      allData: [],
      myData: [],
      directoryTreePath: getPath(selectedKeys),
    }, () => {
      if (this.state.isReview) {
        this.templateQuery(1);
        this.templateQuery(2);
      } else {
        this.templateQuery(2);
      }
    });
  };

  render() {
    const {
      treeVal,
      userInfo,
      templateNameTip,
      delLoading,
      templateDelTip,
      contractNatureLoading,
      loading,
      isReview,
      tabsLoading,
      title,
      templateAddVisible,
      isUpload,
      switchStatus,
      dropDownObj,
      oftenData,
      allData,
      oftenDataLoading,
      allDataLoading,
      oftenCurrent,
      allCurrent,
      oftenTotal,
      allTotal,
      uploadBtnLoading,
      goon,
      procedureLoading,
      procedureData,
    } = this.state;
    const uploadContractProps = {
      action: '/ams/ams-file-service/fileServer/uploadFile',
      name: 'file',
      headers: {
        // Token: getAuthToken(),
      },
    };
    return (
      <div className={styles.box}>
        <Breadcrumb style={{ marginTop: 7 }}>
          <Breadcrumb.Item>电子档案管理</Breadcrumb.Item>
          <Breadcrumb.Item>合同模板</Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.searchBox} style={{ marginTop: 7 }}>
          <div className={styles.reviewBox}>
            <Spin spinning={loading} size="small">
              <div
                style={{
                  display: userInfo?.type === '01' ? 'none' : 'inline-block',
                  cursor: 'pointer',
                }}
                className={[styles.reviewL, isReview ? styles.active : ''].join(' ')}
                onClick={() => this.switchAndGetData(true, 1)}
              >
                在线模板
              </div>
              <div
                style={{
                  display: userInfo?.type === '01' ? 'none' : 'inline-block',
                  cursor: 'pointer',
                }}
                className={[styles.reviewR, !isReview ? styles.active : ''].join(' ')}
                onClick={() => this.switchAndGetData(false, 0)}
              >
                我的模板
              </div>
            </Spin>
            <div className={styles.search}>
              <Action key="templateSet:query1" code="templateSet:query">
                <Input.Search
                  placeholder="请输入"
                  onSearch={val => this.search(val)}
                  style={{ width: 242, marginRight: 20, height: 34 }}
                />
              </Action>
              <Action code="templateSet:save">
                <Button style={{ marginLeft: 8 }} onClick={() => this.setAddModal('isUpload')}>
                  导入模板
                </Button>

                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => this.setAddModal('isAdd')}
                  type="primary"
                >
                  新增模板
                </Button>
              </Action>
            </div>
          </div>
        </div>
        <div>
          <Spin spinning={tabsLoading}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ marginLeft: 0, marginRight: 0 }}>
              <Col md={4} sm={24}>
                <div style={{ color: '#000', fontWeight: 600, marginTop: 80 }} key="sslm">
                  所属类目：
                </div>
                <Action key="templateSet:query2" code="templateSet:query">
                  <Tree onSelect={this.onTreeSelect}>
                    {[{ title: '全部', key: 'all' }, ...dropDownObj].length > 0 &&
                      this.setTreeNode([{ title: '全部', key: 'all' }, ...dropDownObj])}
                  </Tree>
                </Action>
              </Col>
              <Col md={20} sm={24}>
                <div className={styles.tabContent}>
                  {isReview ? (
                    <div>
                      <Spin spinning={oftenDataLoading}>
                        <div className={styles.titleBox}>常用模板</div>
                        <div>
                          <Row
                            gutter={{ md: 8, lg: 24, xl: 48 }}
                            style={{ marginLeft: 0, marginRight: 0 }}
                          >
                            {oftenData?.length > 0 ? (
                              oftenData.map(item => (
                                <Col xxl={8} md={12} sm={24} key={item.id} style={{ marginTop: 20 }}>
                                  <Card className={styles.oftenCard} bodyStyle={{ padding: 10 }}>
                                    <div className={styles.imgBox}>
                                      <img src={contractImg} alt="模板封面" />
                                    </div>
                                    <div className={styles.doBox}>
                                      <Tooltip placement="topLeft" title={item.templateName}>
                                        <p>{item.templateName}</p>
                                      </Tooltip>
                                      <p>{item.createTime}</p>
                                      <p style={{ textAlign: 'right' }}>
                                        <a onClick={() => this.jumpPage(item, 'isSee')}>查看</a>
                                        {userInfo?.type === '01' && (
                                          <a onClick={() => this.jumpPage(item, 'isUpdate')} style={{ marginLeft: 8 }}>修改</a>
                                        )}
                                        <a onClick={() => this.useTemplate(item)} style={{ marginLeft: 8 }}>使用</a>
                                        {userInfo?.type === '01' && (
                                          <a
                                            onClick={() =>
                                              this.setState({
                                                templateDelTip: true,
                                                delId: item.id,
                                                delKey: item.templateKey,
                                              })
                                            }
                                            style={{ marginLeft: 8 }}
                                          >删除</a>
                                        )}
                                      </p>
                                    </div>
                                  </Card>
                                </Col>
                              ))
                            ) : (
                              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                          </Row>
                          <Row gutter={{ md: 8, lg: 24, xl: 48 }} className={styles.page}>
                            <Pagination
                              size="small"
                              current={oftenCurrent}
                              total={oftenTotal}
                              pageSize={6}
                              onChange={e => this.pageChange(e, 1)}
                              style={{ display: 'none' }}
                            />
                          </Row>
                        </div>
                      </Spin>
                      <Spin spinning={allDataLoading}>
                        <div className={styles.titleBox} style={{ marginTop: 40 }}>
                          全部模板
                        </div>
                        <div>
                          <Row
                            gutter={{ md: 8, lg: 24, xl: 48 }}
                            style={{ marginLeft: 0, marginRight: 0 }}
                          >
                            {allData?.length > 0 ? (
                              allData.map(item => (
                                <Col xxl={8} md={12} sm={24} key={item.id} style={{ marginTop: 20 }}>
                                  <Card className={styles.oftenCard} bodyStyle={{ padding: 10 }}>
                                    <div className={styles.imgBox}>
                                      <img src={contractImg} alt="模板封面" />
                                    </div>
                                    <div className={styles.doBox}>
                                      <Tooltip placement="topLeft" title={item.templateName}>
                                        <p>{item.templateName}</p>
                                      </Tooltip>
                                      <p>{item.createTime}</p>
                                      <p style={{ textAlign: 'right' }}>
                                        <a onClick={() => this.jumpPage(item, 'isSee')}>查看</a>
                                        {userInfo?.type === '01' && (
                                          <a onClick={() => this.jumpPage(item, 'isUpdate')} style={{ marginLeft: 8 }}>修改</a>
                                        )}
                                        <a onClick={() => this.useTemplate(item)} style={{ marginLeft: 8 }}>使用</a>
                                        {userInfo?.type === '01' && (
                                          <a
                                            onClick={() =>
                                              this.setState({
                                                templateDelTip: true,
                                                delId: item.id,
                                                delKey: item.templateKey,
                                              })
                                            }
                                            style={{ marginLeft: 8 }}
                                          >删除</a>
                                        )}
                                      </p>
                                    </div>
                                  </Card>
                                </Col>
                              ))
                            ) : (
                              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                          </Row>
                          <Row gutter={{ md: 8, lg: 24, xl: 48 }} className={styles.page}>
                            <Pagination
                              size="small"
                              current={allCurrent}
                              total={allTotal}
                              pageSize={6}
                              onChange={e => this.pageChange(e, 2)}
                              style={{ display: +allTotal === 0 ? 'none' : '' }}
                            />
                          </Row>
                        </div>
                      </Spin>
                    </div>
                  ) : (
                    <div>
                      <Spin spinning={allDataLoading}>
                        <div>
                          <Row
                            gutter={{ md: 8, lg: 24, xl: 48 }}
                            style={{ marginLeft: 0, marginRight: 0 }}
                          >
                            {allData?.length > 0 ? (
                              allData.map(item => (
                                <Col xxl={8} md={12} sm={24} key={item.id} style={{ marginTop: 20 }}>
                                  <Card className={styles.oftenCard} bodyStyle={{ padding: 10 }}>
                                    <div className={styles.imgBox}>
                                      <img src={contractImg} alt="模板封面" />
                                    </div>
                                    <div className={styles.doBox}>
                                      <Tooltip placement="topLeft" title={item.templateName}>
                                        <p>{item.templateName}</p>
                                      </Tooltip>
                                      <p>{item.createTime}</p>
                                      <p style={{ textAlign: 'right' }}>
                                        <a onClick={() => this.jumpPage(item, 'isSee')}>查看</a>
                                        <a onClick={() => this.jumpPage(item, 'isUpdate')} style={{ marginLeft: 8 }}>修改</a>
                                        <a onClick={() => this.useTemplate(item)} style={{ marginLeft: 8 }}>使用</a>
                                        <a
                                          onClick={() =>
                                            this.setState({
                                              templateDelTip: true,
                                              delId: item.id,
                                              delKey: item.templateKey,
                                            })
                                          }
                                          style={{ marginLeft: 8 }}
                                        >删除</a>
                                      </p>
                                    </div>
                                  </Card>
                                </Col>
                              ))
                            ) : (
                              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                          </Row>
                          <Row gutter={{ md: 8, lg: 24, xl: 48 }} className={styles.page}>
                            <Pagination
                              size="small"
                              current={allCurrent}
                              total={allTotal}
                              pageSize={6}
                              onChange={e => this.pageChange(e, 2)}
                              style={{ display: +allTotal === 0 ? 'none' : '' }}
                            />
                          </Row>
                        </div>
                      </Spin>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Spin>
        </div>
        <Modal
          title={title}
          visible={templateAddVisible}
          onCancel={() => this.setState({ templateAddVisible: false, contractNatureLoading: false, templateNameTip: '' })}
          destroyOnClose={true}
          footer={null}
          width={550}
        >
          <div className={styles.tableListForm}>
            <Form ref={this.formRef}>
              <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ marginLeft: 0, marginRight: 0 }}>
                <Col md={24} sm={24}>
                  <FormItem
                    label="文件名称"
                    name="templateName"
                    rules={[{ required: true, message: '模板文件不能为空' }]}
                  >
                    <Input placeholder="请输入" onChange={this.getTemplateName} />
                  </FormItem>
                  <div
                    style={{
                      display: templateNameTip ? 'block' : 'none',
                      color: '#f5222d',
                      margin: '-10px 0 10px 90px',
                    }}
                  >
                    {templateNameTip}
                  </div>
                </Col>
                <Col md={24} sm={24}>
                  <FormItem
                    label="文件类型"
                    name="type"
                    rules={[{ required: true, message: '模板类型不能为空' }]}
                  >
                    <Select
                      style={{ width: '100%' }}
                      onChange={() => this.uploadCheckUp(['templateName', 'contractNature', 'processId'])}
                    >
                      {'.docx'.split(',').map((item, i) => (
                        <Option key={i} value={item.replace('.', '')}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </FormItem>
                </Col>

                <Col md={24} sm={24}>
                  <Spin spinning={contractNatureLoading} size="small">
                    <FormItem
                      label={`文件性质`}
                      name="contractNature"
                      rules={[{ required: true, message: '模板文件性质不能为空' }]}
                    >
                      <TreeSelect
                        style={{ width: '100%' }}
                        value={treeVal}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        placeholder="请选择"
                        allowClear
                        treeDefaultExpandAll
                        onChange={this.treeSelectOnChange}
                        treeData={dropDownObj}
                      />
                    </FormItem>
                  </Spin>
                </Col>
                <Col md={24} sm={24}>
                  <Spin spinning={procedureLoading} size="small">
                    <FormItem
                      label="关联流程"
                      name="processId"
                      rules={[{ required: true, message: '模板关联流程不能为空' }]}
                    >
                      <Select
                        style={{ width: '100%' }}
                        onChange={() => this.uploadCheckUp(['templateName', 'contractNature', 'type'])}
                        showSearch
                        optionFilterProp="children"
                      >
                        {procedureData.length > 0 && procedureData.map(item => (
                          <Option key={item.id} value={item.id}>{item.processName}</Option>
                        ))}
                      </Select>
                    </FormItem>
                  </Spin>
                </Col>
                <Col md={24} sm={24}>
                  <FormItem label="智能模型" name="isSmart">
                    <Switch
                      checkedChildren="开"
                      unCheckedChildren="关"
                      checked={switchStatus}
                      onChange={this.switchChange}
                    />
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
          <div className={styles.tipBtnBox} style={{ marginTop: 20, textAlign: 'right' }}>
            {isUpload ? (
              <Upload
                {...uploadContractProps}
                data={{
                  uploadFilePath: isReview
                    ? `contractfile/onlineTemplate`
                    : `contractfile/orgTemplate`,
                }}
                openFileDialogOnClick={goon}
                accept=".docx"
                onChange={e => this.uploadChange(e)}
                beforeUpload={this.beforeUpload}
                showUploadList={false}
              >
                <Button
                  onClick={this.before}
                  loading={uploadBtnLoading}
                  type="primary"
                // disabled={formListLoaging}
                >
                  导入模板
                </Button>
              </Upload>
            ) : (
              <Button type="primary" style={{ marginLeft: 10 }} onClick={() => this.newTemplate()}>
                确定
              </Button>
            )}
            <Button
              onClick={() =>
                this.setState({ templateAddVisible: false, contractNatureLoading: false, templateNameTip: '' })
              }
              style={{ marginLeft: 8 }}
            >
              取消
            </Button>
          </div>
        </Modal>
        <Modal
          title="提示"
          visible={templateDelTip}
          // onOk={() => this.setTemplateDel()}
          onCancel={() => this.setState({ templateDelTip: false })}
          destroyOnClose={true}
          footer={null}
          width={450}
        >
          <div>
            <p className={styles.tipText}>
              <InfoCircleOutlined style={{ color: '#3384D5', marginRight: 10 }} theme="filled" />
              确定删除当前选中的模板么？
            </p>
            <div style={{ textAlign: 'right' }}>
              <Button loading={delLoading} type="primary" onClick={() => this.delTemplate()}>
                确定
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => this.setState({ templateDelTip: false, delLoading: false })}
              >
                取消
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect(({ templateSet }) => templateSet)(Index);
