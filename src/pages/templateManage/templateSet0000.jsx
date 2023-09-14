import React, { useEffect, useState } from 'react';
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
  Tabs,
  Tooltip,
  Tree,
  TreeSelect,
  Upload,
} from 'antd';
import styles from './index.less';
import { connect } from 'dva';
import router from 'umi/router';
import contractImg from '@/assets/contract/contract.png';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const { TreeNode } = Tree;

const authToken = '';
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

const Index = props => {
  const [form] = Form.useForm();
  // console.log(props);
  const [loading, setLoading] = useState(false);
  const [isReview, setIsReview] = useState(true);
  const [open, setOpen] = useState(false);
  const [tabsLoading, setTabsLoading] = useState(false);
  const [activeVal, setActiveVal] = useState('all');
  const [title, setTitle] = useState('');
  const [templateAddVisible, setTemplateAddVisible] = useState(false);
  const [like, setLike] = useState('');
  const [isUpload, setIsUpload] = useState(false);
  const [dropDownObj, setDropDownObj] = useState([]);
  const [switchStatus, setSwitchStatus] = useState(true);
  const [oftenCurrent, setOftenCurrent] = useState(1);
  const [oftenTotal, setOftenTotal] = useState(0);
  const [allCurrent, setAllCurrent] = useState(1);
  const [allTotal, setAllTotal] = useState(0);
  const [myCurrent, setMyCurrent] = useState(1);
  const [myTotal, setMyTotal] = useState(0);
  const [oftenData, setOftenData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [myData, setMyData] = useState([]);
  const [oftenDataLoading, setOftenDataLoading] = useState(false);
  const [allDataLoading, setAllDataLoading] = useState(false);
  const [myDataLoading, setMyDataLoading] = useState(false);
  const [uploadBtnLoading, setUploadBtnLoading] = useState(false);
  const [contractNatureLoading, setContractNatureLoading] = useState(false);
  const [templateDelTip, setTemplateDelTip] = useState(false);
  const [delId, setDelId] = useState('');
  const [delLoading, setDelLoading] = useState(false);
  const [category, setCategory] = useState([]);
  const [templateNameTip, setTemplateNameTip] = useState('');
  const [goon, setGoon] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [treeVal, setTreeVal] = useState(undefined);
  const [IPObject, setIPObject] = useState({});
  const [cArr, setCArr] = useState([]);
  const [delKey, setDelKey] = useState('');
  const [directoryTreePath, setDirectoryTreePath] = useState([]);

  const setTreeNode = data => {
    return data.map(item => (
      <TreeNode title={item.title} key={item.key}>
        {item?.children?.length > 0 && setTreeNode(item.children)}
      </TreeNode>
    ));
  };

  const switchAndGetData = (isReview = true, status = 1) => {
    resetPaginationData();
    setIsReview(isReview);
    setOftenData([]);
    setAllData([]);
    setMyData([]);
    if (isReview) {
      templateQuery(1);
      templateQuery(2);
    } else {
      templateQuery(2);
    }
  };

  const tabsChangeQuery = val => {
    setActiveVal(val);
    setOftenData([]);
    setAllData([]);
    setMyData([]);
    setDirectoryTreePath([]);
    if (isReview) {
      templateQuery(1);
      templateQuery(2);
    } else {
      templateQuery(2);
    }
  };

  // 获取下一节点
  const getChildNode = id => {
    props
      .dispatch({
        type: 'templateSet/getChildNode',
        payload: { id, purpose: 2 },
      })
      .then(res => {
        if (res) {
          setCArr(res);
        }
      });
  };

  const showTabsItem = (val, id) => {
    setActiveVal(activeVal === val ? '' : val);
    getChildNode(id);
  };

  const setAddModal = val => {
    setTemplateAddVisible(true);
    setIsUpload(val === 'isUpload');
    setContractNatureLoading(true);
    getDropdownData();
  };

  const search = val => {
    setLike(val);
    if (isReview) {
      templateQuery(1);
      templateQuery(2);
    } else {
      templateQuery(2);
    }
  };

  const switchChange = checked => {
    setSwitchStatus(checked);
  };

  const getDropdownData = () => {
    props.dispatch({
      type: 'templateSet/getDropdownData',
      payload: { purpose: 2 },
    });
  };

  // 模板查询
  const templateQuery = (flag = 0, current = 1, pageSize = 6) => {
    if (+flag === 1) {
      setOftenDataLoading(true);
    }
    if (+flag === 2) {
      setAllDataLoading(true);
    }
    const [arch, documentType, fileType] = directoryTreePath;
    const payload = {
      templateType: isReview ? 0 : 1,
      archivesClassification: activeVal === 'all' ? '' : arch,
      documentType: documentType || '',
      fileType: fileType || '',
      like,
      flag,
    };

    props
      .dispatch({
        type: 'templateSet/templateQuery',
        payload: {
          par: { current: +flag === 1 ? 1 : current, pageSize: +flag === 1 ? 6 : pageSize },
          body: payload,
        },
      })
      .then(res => {
        if (res) {
          if (+flag === 1) {
            setOftenData(res.rows);
            setOftenTotal(res.total);
            setOftenDataLoading(false);
          }
          if (+flag === 2) {
            setAllData(res.rows);
            setAllTotal(res.total);
            setAllDataLoading(false);
          }
        }
      });
  };

  const pageChange = (e, flag) => {
    if (+flag === 1) {
      setOftenCurrent(e);
      templateQuery(flag, e);
    }
  };

  // 获取文件存放路径
  const getFilePathByCode = params => {
    props
      .dispatch({
        type: 'templateSet/getFilePathByCode',
        payload: { code: params },
      })
      .then(res => {
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
          let formVals = props.form.getFieldsValue();
          formVals = {
            ...formVals,
            ...res,
            ...category,
            isSmart: switchStatus ? 1 : 0,
          };
          jumpPage(formVals, 'upload');
        }
      });
  };

  // 删除模板时同步删除掉模板中的标签数据
  const delTagData = delKey => {
    props.dispatch({
      type: 'templateSet/delTagData',
      payload: { changxieKey: delKey },
    });
  };

  // 删除模板
  const delTemplate = () => {
    setDelLoading(true);
    props
      .dispatch({
        type: 'templateSet/delTemplate',
        payload: [delId],
      })
      .then(res => {
        message.success('操作成功');
        delTagData(delKey);
        setDelLoading(false);
        setTemplateDelTip(false);
        if (allData.length === 1) {
          allCurrent--;
        }
        if (isReview) {
          templateQuery(1);
          templateQuery(2, allCurrent);
        } else {
          templateQuery(2, allCurrent);
        }
      });
  };

  const before = () => {
    if (templateNameTip) {
      message.warn(templateNameTip);
    }
  };

  const beforeUpload = file => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.warn('文件不能大于100M!');
    }
    return isLt100M;
  };

  const uploadChange = info => {
    if (info.file.status === 'uploading') {
      setUploadBtnLoading(true);
    }
    if (info.file.status === 'done') {
      if (info?.file?.response?.status === 200) {
        message.success(`${info.file.nmae} 导入成功`);
        getFilePathByCode(info?.file?.response?.data);
        setUploadBtnLoading(false);
      } else {
        message.warn(`${info.file.name} 导入失败，请稍后再试`);
        setUploadBtnLoading(false);
      }
    }
    if (info.file.status === 'error') {
      message.warn(`${info.file.name} 导入失败，请稍后再试`);
      setUploadBtnLoading(false);
    }
  };

  const newTemplate = () => {
    props.form.validateFields((err, values) => {
      if (err) return;
      values.isSmart = switchStatus ? 1 : 0;
      let category = {};
      if (valArr.length == 1) {
        category = {
          archivesClassification: valArr[0],
          documentType: '',
          fileType: '',
        };
      }
      if (valArr.length == 2) {
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
      jumpPage(values, 'newAdd');
    });
  };

  // 获取类目
  const getCategoryData = () => {
    props
      .dispatch({
        type: 'templateSet/getCategoryData',
        payload: { purpose: 2, id: 1 },
      })
      .then(res => {
        if (res) setCategory(res);
      });
  };

  const getTemplateName = e => {
    let val = e.target.value;
    if (val) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        checkTemplateName(val);
      }, 1500);
    }
  };

  const uploadCheckUp = arr => {
    props.from.validateFields(arr, (err, values) => {
      if (err) {
        setGoon(false);
        return false;
      }
      setGoon(true);
    });
  };

  // 校验文件名
  const checkTemplateName = val => {
    props
      .dispatch({
        type: 'templateSet/checkTemplateName',
        payload: { fileName: val },
      })
      .then(res => {
        uploadCheckUp(['type', 'contractNature']);
        if (res?.status === 200) {
          setTemplateNameTip('');
        }
        if (res?.status.toString().length === 8) {
          message.warn(res.message);
          setTemplateDelTip(res.message);
          setGoon(false);
        }
      });
  };

  const jumpPage = (item, status) => {
    item.status = status;
    sessionStorage.setItem('_status', status);
    sessionStorage.setItem('templateDetailsParams', JSON.stringify(item));
    router.push('./templateDetails');
  };

  const useTemplate = item => {
    router.push(
      `/dynamicPage/pages/合同审批/4028e7b6782a111001785878da6e000a/提交?fileType=${item.type}&key=${item.templateKey}&name=${item.fileName}&url=/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${item.fileNumber}&templateId=${item.id}&type=save`,
    );
  };

  const treeSelectOnChange = treeVal => {
    setTreeVal(treeVal);
    getCategoryData(dropDownObj, treeVal);
    uploadCheckUp(['templateName', 'type']);
  };

  const getParentID = (arr, val) => {
    let id = '';
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].value === val) {
        id = arr[i].parentId;
        getCategory();
        break;
      } else {
        if (arr[i]?.children.length > 0) {
          getParentID(arr[i].children, val);
        }
      }
    }
    return id;
  };

  const getCategory = (arr, val) => {
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
          getCategory(arr[i].children, val);
        }
      }
    }
  };

  useEffect(() => {
    const userInfo = sessionStorage.getItem('USER_INFO');
    setUserInfo(JSON.parse(userInfo));
    getDropdownData();
    templateQuery(1); // 获取常用模板
    templateQuery(2); // 获取全部模板
  }, []);

  const resetPaginationData = () => {
    setOftenData([]);
    setAllData([]);
    setMyData([]);
    setOftenCurrent(1);
    setOftenTotal(0);
    setAllCurrent(1);
    setAllTotal(0);
    setMyCurrent(1);
    setMyTotal(0);
  };

  const onTreeSelect = selectedKeys => {
    resetPaginationData();
    setActiveVal(selectedKeys[0]);
    setOftenData([]);
    setAllData([]);
    setMyData([]);
    setDirectoryTreePath(getPath(selectedKeys));
    if (isReview) {
      templateQuery(1);
      templateQuery(2);
    } else {
      templateQuery(2);
    }
  };

  const use = () => {
    setTemplateDelTip(true);
    setDelId(item.id);
    setDelKey(item.templateKey);
  };

  const uploadCancel = () => {
    setTemplateAddVisible(false);
    setContractNatureLoading(false);
  };

  const delCancel = () => {
    setTemplateDelTip(false);
    setDelLoading(false);
  };

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
              onClick={() => switchAndGetData(true, 1)}
            >
              在线模板
            </div>
            <div
              style={{
                display: userInfo?.type === '01' ? 'none' : 'inline-block',
                cursor: 'pointer',
              }}
              className={[styles.reviewR, !isReview ? styles.active : ''].join(' ')}
              onClick={() => switchAndGetData(false, 0)}
            >
              我的模板
            </div>
          </Spin>
          <div className={styles.search}>
            <Input.Search
              placeholder="请输入"
              onSearch={val => search(val)}
              style={{ width: 242, marginRight: 20, height: 34 }}
            />
            <Button style={{ marginLeft: 8 }} onClick={() => setAddModal('isUpload')}>
              导入模板
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setAddModal('isAdd')} type="primary">
              新增模板
            </Button>
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
              <Tree onSelect={onTreeSelect}>
                {[{ title: '全部', key: 'all' }, ...dropDownObj].length > 0 &&
                  setTreeNode([{ title: '全部', key: 'all' }, ...dropDownObj])}
              </Tree>
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
                          {oftenData.length > 0 ? (
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
                                      <a onClick={() => jumpPage(item, 'isSee')}>查看</a>
                                      {userInfo.type === '01' && (
                                        <a
                                          onClick={() => jumpPage(item, 'isUpdate')}
                                          style={{ marginLeft: 8 }}
                                        >
                                          修改
                                        </a>
                                      )}
                                      <a
                                        onClick={() => useTemplate(item)}
                                        style={{ marginLeft: 8 }}
                                      >
                                        使用
                                      </a>
                                      {userInfo.type === '01' && (
                                        <a onClick={() => use} style={{ marginLeft: 8 }}>
                                          删除
                                        </a>
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
                            onChange={e => pageChange(e, 1)}
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
                          {allData.length > 0 ? (
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
                                      <a onClick={() => jumpPage(item, 'isSee')}>查看</a>
                                      {userInfo.type === '01' && (
                                        <a
                                          onClick={() => jumpPage(item, 'isUpdate')}
                                          style={{ marginLeft: 8 }}
                                        >
                                          修改
                                        </a>
                                      )}
                                      <a
                                        onClick={() => useTemplate(item)}
                                        style={{ marginLeft: 8 }}
                                      >
                                        使用
                                      </a>
                                      {userInfo.type === '01' && (
                                        <a onClick={() => use} style={{ marginLeft: 8 }}>
                                          删除
                                        </a>
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
                            onChange={e => pageChange(e, 2)}
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
                          {allData.length > 0 ? (
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
                                      <a onClick={() => jumpPage(item, 'isSee')}>查看</a>
                                      <a
                                        onClick={() => jumpPage(item, 'isUpdate')}
                                        style={{ marginLeft: 8 }}
                                      >
                                        修改
                                      </a>
                                      <a
                                        onClick={() => this.useTemplate(item)}
                                        style={{ marginLeft: 8 }}
                                      >
                                        使用
                                      </a>
                                      <a onClick={() => use} style={{ marginLeft: 8 }}>
                                        删除
                                      </a>
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
                            onChange={e => pageChange(e, 2)}
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
        onCancel={() => setTemplateAddVisible(false)}
        destroyOnClose={true}
        footer={null}
        width={550}
      >
        <div className={styles.tableListForm}>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ marginLeft: 0, marginRight: 0 }}>
            <Col md={24} sm={24}>
              <FormItem
                label="文件名称"
                name="templateName"
                rules={[{ required: true, message: '模板文件名称不能为空' }]}
              >
                <Input placeholder="请输入" onChange={getTemplateName} />
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
                rules={[{ required: true, message: '模板文件类型不能为空' }]}
              >
                <Select
                  style={{ width: '100%' }}
                  onChange={() => uploadCheckUp(['templateName', 'contractNature'])}
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
                    onChange={treeSelectOnChange}
                    treeData={dropDownObj}
                  />
                </FormItem>
              </Spin>
            </Col>
            <Col md={24} sm={24}>
              <FormItem label="智能模型" name="isSmart">
                <Switch
                  checkedChildren="开"
                  unCheckedChildren="关"
                  checked={switchStatus}
                  onChange={switchChange}
                />
              </FormItem>
            </Col>
          </Row>
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
              onChange={e => uploadChange(e)}
              beforeUpload={beforeUpload}
              showUploadList={false}
            >
              <Button
                onClick={before}
                loading={uploadBtnLoading}
                type="primary"
                // disabled={formListLoaging}
              >
                导入模板
              </Button>
            </Upload>
          ) : (
            <Button type="primary" style={{ marginLeft: 10 }} onClick={() => newTemplate()}>
              确定
            </Button>
          )}
          <Button onClick={uploadCancel} style={{ marginLeft: 8 }}>
            取消
          </Button>
        </div>
      </Modal>
      <Modal
        title="提示"
        visible={templateDelTip}
        onCancel={() => setTemplateDelTip(false)}
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
            <Button loading={delLoading} type="primary" onClick={delTemplate}>
              确定
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={delCancel}>
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const TemplateSet = connect(({ templateSet }) => templateSet)(Index);
export default TemplateSet;
