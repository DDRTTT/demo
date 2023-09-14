import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { errorBoundary } from '@/layouts/ErrorBoundary';
import { connect } from 'dva';
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Pagination,
  Row,
  Select,
  Table,
  Tooltip,
  TreeSelect,
} from 'antd';
import SelfTree from '../lifeCyclePRD/compoments/SyncToPersonalManage';
import { getPath } from '@/pages/lifeCyclePRD/func';
import { downloadNoToken, filePreview } from '@/utils/download';
import cloneDeep from 'lodash/cloneDeep';
import values from 'lodash/values';
import styles from './index.less';
import staticInstance from '@/utils/staticInstance';
import png from '@/assets/electronic/picture.png';
import file from '@/assets/electronic/file.png';
import pdf from '@/assets/electronic/pdf.png';
import ppt from '@/assets/electronic/ppt.png';
import txt from '@/assets/electronic/txt.png';
import { AppstoreOutlined, FilterOutlined, UnorderedListOutlined } from '@ant-design/icons';

// const { Search } = Input;
const FormItem = Form.Item;
// const { RangePicker } = DatePicker;
const { Sider, Content } = Layout;
// const { Option } = Select;
const { Meta } = Card;
const { confirm } = Modal;
// const selectTreeValue = [];
const routerPath = {
  linkAd: '/electronic',
  linkConfig: '/fileTypeConfig',
};

const Index = ({
  personRef,
  // form: { getFieldsValue, resetFields, validateFields, setFieldsValue },
  dispatch,
  listLoading,
  lifeCyclePRD: {
    savePersonalListFetch,
    saveVersionData,
    savePersonalTreeData,
    saveUploadPersonFetch,
    documentTags,
  },
}) => {
  const [form] = Form.useForm();
  // tabs code
  const [tabs, setTabs] = useState('list');
  // 展开/收起
  const [seniorType, setSeniorType] = useState(false);
  // 每页数据条数
  const [pageSize, setPageSize] = useState(10);
  // 页码
  const [pageNum, setPageNum] = useState(1);
  // 批量选中数据
  const [selectData, setSelectData] = useState([]);
  // 表格选中的keys
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 全选
  const [checkAll, setCheckAll] = useState(false);
  // 缩略图选中数据
  const [checkedList, setCheckedList] = useState([]);
  // 文档版本弹出框
  const [versionVisible, setVersionVisible] = useState(false);
  // 移动弹出框
  const [syncManageVisible, setSyncManageVisible] = useState(false);
  const [tagVisible, setTagVisible] = useState(false);
  // 子组件传回点击信息
  const [clickData, setClickData] = useState({});
  // 子组件传回check信息
  // const [checkData, setCheckData] = useState({});
  // 左侧目录树节点点击信息
  const [leftTreeClickData, setLeftTreeClickData] = useState({});
  // 左侧目录树节点勾选信息
  const [leftTreeCheckData, setLeftTreeCheckData] = useState({});
  // 同步管理弹出框--选中标签
  const [syncTags, setSyncTags] = useState([]);
  const [keywordValue, setKeywordValue] = useState('');
  // 操作按钮
  // const [actionBtns, setActionBtns] = useState([
  //   { label: '添加', code: 'personalPRD:treeAdd' },
  //   { label: '修改', code: 'personalPRD:treeUpdate' },
  //   { label: '删除', code: 'personalPRD:treeDel' },
  // ]);
  // 父级目录是否显示
  const [parentFlag, setParentFlag] = useState(true);
  // 弹出框title
  const [opType, setOpType] = useState('add');
  // 添加弹出框
  const [addVisible, setAddVisible] = useState(false);
  // 是否禁止父级目录操作
  const [disableFlag, setDisableFlag] = useState(false);
  // 请求控制阀
  const [flag, setFlag] = useState(true);
  // 修改时选中的id
  const [id, setId] = useState('');
  // 高级搜索框里，目录路径
  const [nameList, setNameList] = useState([]);
  // 高级搜索抽屉
  const [visibleDrawer, setVisibleDrawer] = useState(false);

  const personalTreeRef = useRef();
  const leftTreeRef = useRef();

  useImperativeHandle(personRef, () => ({
    handleFormReset: () => {
      setPageNum(1);
      setPageSize(10);
      form.resetFields();
    },
  }));

  // 生命周期文档 列表
  useEffect(() => {
    handleGetPersonalTreeData();
    handleGetListFetch(10, 1);
    documentBigTypeReq();
    documentTypeReq();
    breakdownReq();
    handleGetUploadPersonFetch();
    handleGetDocumentTagsFetch();
  }, []);

  // 展开搜索表单创建
  // const searchFrom = () => {
  //   return (
  //     <Form {...formItemLayout}>
  //       <Row style={{ marginBottom: 10 }}>
  //         <Col>
  //           <Breadcrumb>
  //             <Breadcrumb.Item>{'个人文档'}</Breadcrumb.Item>
  //             {nameList
  //               ? nameList.map(item => {
  //                   return <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>;
  //                 })
  //               : ''}
  //           </Breadcrumb>
  //         </Col>
  //       </Row>
  //       <Row
  //         gutter={{
  //           md: 8,
  //           lg: 24,
  //           xl: 48,
  //         }}
  //       >
  //         <Col md={8} sm={24}>
  //           <FormItem label="大小" name="fileTotalSize">
  //             {<Input placeholder="请输入" />}
  //           </FormItem>
  //         </Col>
  //
  //         <Col md={8} sm={24}>
  //           <FormItem label="标签" name="label">
  //             {
  //               <Select mode={'multiple'} showArrow style={{ width: '100%' }} placeholder="请选择">
  //                 {(documentTags || []).map(item => {
  //                   return (
  //                     <Select.Option key={item} value={item}>
  //                       {item}
  //                     </Select.Option>
  //                   );
  //                 })}
  //               </Select>
  //             }
  //           </FormItem>
  //         </Col>
  //         <Col md={8} sm={24}>
  //           <FormItem label="上传人" name="uploadPeoleList">
  //             {handleMapList(
  //               saveUploadPersonFetch || [],
  //               'id',
  //               'username',
  //               'multiple',
  //               false,
  //               false,
  //               '上传人',
  //             )}
  //           </FormItem>
  //         </Col>
  //         <Col md={8} sm={24}>
  //           <Form.Item label="上传时间：" name="uploadFileTime">
  //             {<DatePicker format="YYYY-MM-DD" />}
  //           </Form.Item>
  //         </Col>
  //         <Col md={8} sm={24} offset={8} style={{ paddingRight: 40, textAlign: 'end' }}>
  //           <Button type="primary" onClick={handleGetSearchFetch}>
  //             查询
  //           </Button>
  //           <Button style={{ marginLeft: '18px' }} onClick={handleFormReset}>
  //             重置
  //           </Button>
  //           <span
  //             className={styles.searchLabel}
  //             onClick={() => {
  //               setSeniorType();
  //               handleFormReset();
  //             }}
  //           >
  //             收起
  //             <UpOutlined />
  //           </span>
  //         </Col>
  //       </Row>
  //     </Form>
  //   );
  // };

  // 个性化树
  const handleGetPersonalTreeData = () => {
    dispatch({
      type: 'lifeCyclePRD/handleGetPersonalTreeInfo',
      payload: '',
    });
  };
  // 档案大类
  const documentBigTypeReq = () => {
    dispatch({
      type: 'lifeCyclePRD/handleGetDocumentBigTypeReq',
      payload: null,
    });
  };
  // 上传人
  const handleGetUploadPersonFetch = () => {
    dispatch({
      type: 'lifeCyclePRD/handleGetUploadPersonInfo',
      payload: null,
    });
  };
  // 文档类别
  const documentTypeReq = () => {
    dispatch({
      type: 'lifeCyclePRD/handleGetDocumentTypeReq',
      payload: null,
    });
  };
  // 明细分类
  const breakdownReq = () => {
    dispatch({
      type: 'lifeCyclePRD/handleBreakdownReq',
      payload: null,
    });
  };
  // 标签
  const handleGetDocumentTagsFetch = () => {
    dispatch({
      type: 'lifeCyclePRD/handleGetDocumentTags',
      payload: null,
    });
  };

  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    current: pageNum,
    pageSize: pageSize,
    total: savePersonalListFetch.total,
    showTotal: total => `共 ${total} 条数据`,
  };

  /**
   * 分页回调
   * @method  handlePaginationChange
   */
  const handlePaginationChange = (pagination, filters, sorter) => {
    const field = sorter.columnKey;
    let direction;
    switch (sorter.order) {
      case 'ascend':
        direction = 'asc';
        break;
      case 'descend':
        direction = 'desc';
        break;
      default:
        direction = '';
        break;
    }
    form.validateFields().then(values=>{
      setPageSize(pagination.pageSize);
      setPageNum(pagination.current);

      if (!values) {
        values = form.getFieldsValue();
      }
      values.folderName ? delete values.folderName : '';
      // 点击左侧树，此目录下的所有文件
      if (leftTreeCheckData.checkedKeys) {
        values.attachedId = leftTreeCheckData.checkedKeys;
      }
      //values = beforeFormFata(values);
      values.keyWords = staticInstance.getInstance().keyWords;
      handleGetListFetch(pagination.pageSize, pagination.current, field, direction, values);
    })
  };

  // 卡片--分页回调
  const handleCardPaginationChange = (current, pageSize) => {
    form.validateFields().then(values=> {
      setPageSize(pageSize);
      setPageNum(current);

      if (!values) {
        values = form.getFieldsValue();
      }
      let obj = cloneDeep(values);
      obj.flag = obj.flag ? true : '';
      if (obj.archivedTime) {
        obj.archivedTime[0] = obj.archivedTime[0].format('YYYY-MM-DD');
        obj.archivedTime[1] = obj.archivedTime[1].format('YYYY-MM-DD');
      }
      // 点击左侧树，此目录下的所有文件
      if ('code' in leftTreeClickData && newTree) {
        const keyList = getPath(newTree, leftTreeClickData.code, '', 'key', 'key');
        const { code, parentId } = leftTreeClickData;
        let label1 = '',
          label2 = '',
          label3 = '';
        if (leftTreeClickData.label === '1') {
          label1 = code ? code : '';
        }
        if (leftTreeClickData.label === '2') {
          label1 = parentId;
          label2 = code;
        }
        if (leftTreeClickData.label === '3') {
          label1 = keyList[0];
          label2 = parentId;
          label3 = leftTreeClickData.code.split('-')[1];
        }
        obj.archivesClassification = label1;
        obj.itemKey = label2;
        obj.documentType = label3;
      }
      //values = beforeFormFata(values);
      obj.keyWords = staticInstance.getInstance().keyWords;
      handleGetListFetch(pageSize, current, '', '', obj);
    })
  };

  /**
   * rowSelection 回调
   */
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectData(selectedRows);
    },
  };

  /**
   * table组件
   */
  const tableCom = () => {
    return (
      <Table
        rowKey={'groupId'}
        loading={listLoading}
        dataSource={savePersonalListFetch.fileInfoList}
        columns={columns}
        pagination={paginationProps}
        onChange={handlePaginationChange}
        scroll={{ x: columns.length * 200 }}
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
      />
    );
  };

  // 处理table列样式
  const handleTableCss = text => {
    return (
      <Tooltip title={text} placement="topLeft">
        <span
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            width: '180px',
            paddingTop: '5px',
          }}
        >
          {text}
        </span>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
    {
      title: '大小',
      dataIndex: 'fileTotalSize',
      key: 'fileTotalSize',
      sorter: true,
      render: text => {
        return handleTableCss(text + 'B');
      },
    },
    {
      title: '标签',
      dataIndex: 'label',
      key: 'label',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
    {
      title: '上传人',
      dataIndex: 'uploadPeole',
      key: 'uploadPeole',
      sorter: true,
    },

    {
      title: '上传时间',
      dataIndex: 'uploadFileTime',
      key: 'uploadFileTime',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
  ];

  // 文档版本columns
  const versionColumns = [
    {
      title: '文档名称',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: '版本',
      dataIndex: 'fileVersion',
      key: 'fileVersion',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <a
            onClick={() => {
              handleVersionDownload(record);
            }}
          >
            下载
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              handleVersionCheck(record);
            }}
          >
            查看
          </a>
        </span>
      ),
    },
  ];

  // 缩略图选中
  const onSelectChange = arr => {
    setCheckedList(arr);
    setCheckAll(arr.length === savePersonalListFetch.fileInfoList.length);
    setSelectData(arr);
  };

  // 卡片组件
  const cardCom = () => {
    const data = savePersonalListFetch.fileInfoList;
    const child = data.map(item => {
      return (
        <Col
          offset={1}
          sm={5}
          xxl={4}
          key={item.groupId}
          style={{
            height: '164px',
            border: '1px solid #EBECF0',
            borderRadius: '4px',
            marginBottom: '15px',
            padding: '5px',
            boxShadow: '0px 0px 3px 0px rgba(66, 124, 229, 0.17)',
          }}
        >
          <Checkbox value={item} style={{ width: '100%' }}>
            {/* 注:此处样式优化 */}
            <Card
              // hoverable
              className={styles.cardCss}
              cover={cardFileType(item)}
              bordered={false}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 17,
              }}
            >
              <Tooltip placement="top" title={item.fileName}>
                <Meta title={item.fileName} className={styles.cradMetaCss} />
              </Tooltip>
              <div style={{ textAlign: 'center' }}>
                <span className={styles.listButtons} onClick={() => handleDownLoad(item)}>
                  下载
                </span>
                <span
                  style={{ marginLeft: 10 }}
                  className={styles.listButtons}
                  onClick={() => handleCanCheck(item)}
                >
                  查看
                </span>
              </div>
            </Card>
          </Checkbox>
        </Col>
      );
    });
    return (
      <Checkbox.Group
        style={{ width: '100%' }}
        className={styles.checkboxCss}
        value={checkedList}
        onChange={onSelectChange}
      >
        <Row>{child}</Row>
      </Checkbox.Group>
    );
  };

  // 卡片内文件类型
  const cardFileType = form => {
    let child;
    const listType1 = ['img', 'png', 'jpeg'];
    const listType2 = ['ppt', 'pdf', 'file', 'txt'];
    // if (listType1.indexOf(form.fileForm) !== -1) {
    //   child = <Icon type={`file-${form.fileForm}`} className={styles.iconCss} />;
    // } else if (listType2.indexOf(form.fileForm) !== -1) {
    //   child = <Icon type="picture" className={styles.iconCss} />;
    // } else {
    //   child = <Icon type="file" className={styles.iconCss} />;
    // }
    const OBJ = { ppt: ppt, txt: txt, pdf: pdf };
    if (listType1.indexOf(form.fileForm) !== -1) {
      child = <img src={png} alt={'png'} />;
    } else if (listType2.indexOf(form.fileForm) !== -1) {
      child = <img src={OBJ[form.fileForm]} alt={'OBJ'} />;
    } else {
      child = <img src={file} alt={'OBJ'} />;
    }
    return child;
  };

  /**
   * 方法说明 列表（搜索）
   * @method  handleGetListFetch
   * @return {Object}
   * @param pageSize {number} 每页大小
   * @param pageNum  {number} 页数/当前页
   * @param field  {string} 排序字段
   * @param direction  {string} 排序方式
   * @param formData {Object} 表单项
   */
  const handleGetListFetch = (
    pageSize = pageSize,
    pageNum = pageNum,
    field,
    direction,
    formData,
  ) => {
    dispatch({
      type: 'lifeCyclePRD/handleGetPersonalListMsg',
      payload: {
        pageSize,
        pageNum,
        field,
        direction,
        ...formData,
      },
    });
  };

  /**
   * 方法说明 循环生成select
   * @method  handleMapList
   * @return {void}
   * @param  {Object[]}       data 数据源
   * @param  {string}         name   select的name
   * @param  {string}         code  select的code
   * @param  {boolean|string} mode  是否可以多选(设置 Select 的模式为多选或标签)
   * @param  {boolean}        fnBoole 选择时函数控制
   * @param  {function}       fn 控制函数
   */
  const handleMapList = (data, code, name, mode = false, fnBoole = false, fn) => {
    if (!data) {
      data = {};
      data.data = [];
    }
    const e = data;
    if (e) {
      const children = [];
      for (const key of e) {
        const keys = key[code];
        const values = key[name];
        children.push(
          <Select.Option key={keys} value={keys}>
            {values}
          </Select.Option>,
        );
      }
      return (
        <Select
          mode={mode}
          showArrow
          style={{ width: '100%' }}
          placeholder="请选择"
          optionFilterProp="children"
          onChange={fnBoole ? fn : ''}
        >
          {children}
        </Select>
      );
    }
  };

  /**
   * 查询按钮
   * @method  handleGetSearchFetch
   */
  const handleGetSearchFetch = () => {
    setVisibleDrawer(false);
    let values;
    values = form.getFieldsValue();
    if (values.uploadFileTime) values.uploadFileTime = values.uploadFileTime.format('YYYY-MM-DD');
    // 点击左侧树，此目录下的所有文件
    if (leftTreeCheckData.checkedKeys) {
      values.attachedId = leftTreeCheckData.checkedKeys;
    }
    if (!values.label) {
      values.label = [];
      values.labelNull = '1';
    }
    handleGetListFetch(10, 1, '', '', values);
  };

  /**
   * 重置表单按钮
   * @method  handleFormReset
   */
  const handleFormReset = () => {
    setPageNum(1);
    form.resetFields();
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  /**
   * 批量操作下载请求
   */
  const handleCanBatchToDo1 = data => {
    if (JSON.stringify(data) !== '[]') {
      message.success('多文件压缩包正在下载中 . . . 请稍后');
      downloadNoToken(`/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${data}`);
    } else {
      message.warn('请选择需要下载的文件');
    }
  };

  // 查看
  const handleCanCheck = record => {
    message.success('查看预览准备中 . . .');
    // let obj = {
    //   method: 'GET',
    //   boby: `${record.fileSerialNumber}@${record.fileName}.${record.fileForm}`,
    //   name: record.fileName,
    // };
    filePreview(
      `/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${record.fileSerialNumber}@${record.fileName}.${record.fileForm}`,
    );
  };

  // 文档版本下载
  const handleVersionDownload = record => {
    let arr = [];
    arr.push(`${record.fileSerialNumber}@${record.fileName}.${record.fileForm}`);
    handleCanBatchToDo1(arr);
  };

  // 文档版本查看
  const handleVersionCheck = record => {
    handleCanCheck(record);
  };

  // 下载
  const handleDownLoad = data => {
    let arr = [];
    const record = data && data.id ? [data] : selectData;
    for (let key in record) {
      arr.push(`${record[key].fileSerialNumber}@${record[key].fileName}.${record[key].fileForm}`);
    }
    handleCanBatchToDo1(arr);
  };
  const handleCheck = () => {
    if (!selectData.length || selectData.length > 1) {
      message.warn('请选择单个文件');
      return;
    }
    handleCanCheck(selectData[0]);
  };
  const handleVersion = () => {
    if (!selectData.length || selectData.length > 1) {
      message.warn('请选择单个文件');
      return;
    }
    const { fileName, busId } = selectData[0];
    dispatch({
      type: 'lifeCyclePRD/handleGetVersionListMsg',
      payload: {
        fileName,
        fileType: selectData[0].fileType,
        fileFormat: selectData[0].fileForm,
        busId,
      },
    });
    setVersionVisible(true);
  };
  // const handleRecord = () => {
  //   if (!selectData.length || selectData.length > 1) {
  //     message.warn('请选择单个文件');
  //     return;
  //   }
  //   dispatch(
  //     routerRedux.push({
  //       pathname: routerPath.linkAd,
  //       query: { fileSerialNumber: selectData[0].fileSerialNumber },
  //     }),
  //   );
  // };
  const handleMoveToTree = () => {
    if (!selectData.length) {
      message.warn('请选择文件');
      return;
    }
    setSyncManageVisible(true);
  };

  // 删除列表文件
  const handleDelete = () => {
    if (!selectData.length) {
      message.warn('请选择文件');
      return;
    }
    let groupIds = [];
    selectData.forEach(item => {
      groupIds.push(+item.groupId);
    });
    confirm({
      title: '确定删除所选文件吗?',
      content: '',
      onOk() {
        dispatch({
          type: 'lifeCyclePRD/handleDeletePersonalListMsg',
          payload: groupIds,
        }).then(data => {
          if (data) {
            // 点击左侧树，此目录下的所有文件
            let values = {};
            if (leftTreeCheckData.checkedKeys) {
              values.attachedId = leftTreeCheckData.checkedKeys;
            }
            handleGetListFetch(10, 1, '', '', values);
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  // 移动弹出框--确认
  const handleSyncManageOk = () => {
    if (!selectData.length) {
      message.warn('请选择文件');
      return;
    }
    let tempArr = [];
    for (let item of selectData) {
      let temp = {};
      temp.achiveId = item.id;
      temp.id = clickData.code;
      temp.label = item.label;
      temp.groupId = item.groupId;
      temp.fileName = item.fileName;
      tempArr.push(temp);
    }
    dispatch({
      type: 'lifeCyclePRD/handleSaveTagsListMsg',
      payload: tempArr,
    }).then(data => {
      if (data) {
        setSyncManageVisible(false);
        setSyncTags([]);
        personalTreeRef.current.handleReset();
        handleGetPersonalTreeData();
        handleGetSearchFetch();
      }
    });
  };

  // 修改标签
  const handleChangeTag = () => {
    if (!selectData.length) {
      message.warn('请选择文件');
      return;
    }
    if (selectData.length > 1) {
      message.warn('请选择单个文件');
      return;
    }
    setTagVisible(true);
    const tags = selectData[0].label ? selectData[0].label.split(',') : [];
    setSyncTags(tags);
  };

  // 全选
  const onCheckAllChange = e => {
    setCheckAll(e.target.checked);
    const newArr = [];
    savePersonalListFetch.fileInfoList.forEach(item => {
      newArr.push(item);
    });
    setCheckedList(e.target.checked ? newArr : []);
    setSelectData(newArr);
  };

  // 获取子组件点击信息
  const getClickMsg = (result, msg) => {
    setClickData(msg);
  };
  // 获取子组件check信息
  const getCheckMsg = (result, msg) => {
    console.log(result, msg);
  };

  // 初始化默认值
  const handleInitDefaultValue = () => {
    setTabs('list');
    setSeniorType(false);
    setPageSize(10);
    setPageNum(1);
    setSelectData([]);
    setSelectedRowKeys([]);
    setCheckAll(false);
    setCheckedList([]);
    setKeywordValue('');
    handleFormReset();
  };

  // 筛选条件增加用户选择的左侧目录树节点
  const getLeftTreeClickMsg = (result, msg) => {
    // 找出父目录名称
    const nameList = getPath(savePersonalTreeData, msg.code, '', 'id', 'name');
    nameList ? setNameList(nameList) : setNameList([]);
    setLeftTreeClickData(msg);
    handleInitDefaultValue();
  };
  const getLeftTreeCheckMsg = (result, msg) => {
    setLeftTreeCheckData(msg);
    if (msg.checkedKeys && msg.checkedKeys.length) {
      handleGetListFetch(10, 1, '', '', {
        attachedId: msg.checkedKeys,
      });
    } else {
      handleGetListFetch(10, 1, '', '');
    }
  };

  // 选择标签change事件
  const handleTagsChange = value => {
    setSyncTags(value);
    // 判断有没有新增的值
    let flag = false;
    values.forEach(item => {
      if (documentTags.indexOf(item) === '-1') {
        flag = true;
      }
    });
    if (flag) {
      handleGetDocumentTagsFetch();
    }
  };

  // 操作按钮
  const ActionButton = props => {
    const { buttonList } = props;
    return buttonList.map(item => {
      return (
        <Button
          key={item.code}
          type={item.label === '删除' ? 'danger' : 'default'}
          style={{ marginRight: 8, width: 57 }}
          onClick={() => {
            props.handlerBack(item.label);
          }}
        >
          {item.label}
        </Button>
      );
    });
  };

  /**
   * 为操作列表按钮，绑定事件
   * @param value
   */
  const handleEdit = value => {
    // const { parentId } = clickData;
    // let status;
    switch (value) {
      case '删除':
        if (!leftTreeCheckData.checkedKeys || !leftTreeCheckData.checkedKeys.length) {
          message.warn('请勾选要删除的节点');
          return;
        }
        confirm({
          title: '确定删除所选节点吗?',
          content: '',
          onOk() {
            // 删除点击确定后，清空下勾选数据和点选数据
            leftTreeRef.current.handleReset();
            dispatch({
              type: 'lifeCyclePRD/handleDeleteTreeInfo',
              payload: leftTreeCheckData.checkedKeys,
            }).then(data => {
              if (data) {
                handleGetPersonalTreeData();
              }
            });
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        break;
      case '修改':
        if (!leftTreeClickData.code) {
          message.warn('请选择1个修改的节点');
          return;
        }
        setOpType('edit');
        setDisableFlag(true);

        setId(leftTreeClickData.code);

        if (leftTreeClickData.parentId == 0) {
          setParentFlag(false);
        } else {
          setParentFlag(true);
        }
        setAddVisible(true);
        form.setFieldsValue({
          parentId: leftTreeClickData.parentId,
          folderName: leftTreeClickData.name,
        });
        break;
      case '添加':
        setOpType('add');
        setId('');
        setParentFlag(true);
        setAddVisible(true);
        setDisableFlag(false);
        if (leftTreeClickData) {
          form.setFieldsValue({ parentId: leftTreeClickData.code, folderName: '' });
        } else {
          form.setFieldsValue({ parentId: '', folderName: '' });
        }
        break;
    }
  };

  // 左侧树，弹出框
  const FormAttrbuite = () => {
    return (
      <div>
        <FormItem label="父级目录" style={{ display: parentFlag ? '' : 'none' }} name="parentId">
          {
            <TreeSelect
              style={{ width: '100%' }}
              // defaultValue={treeSelectValue}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={savePersonalTreeData}
              placeholder="请选择父级目录"
              treeDefaultExpandAll
              onChange={treeSelectChange}
              disabled={disableFlag}
            />
          }
        </FormItem>
        <FormItem
          label="文件夹名称"
          name="folderName"
          rules={[
            {
              required: true,
              message: '文件夹名称不能为空',
            },
          ]}
          getValueFromEvent={event => {
            return event.target.value.replace(/\s+/g, '');
          }}
        >
          {<Input placeholder="请输入" />}
        </FormItem>
        {/* <FormItem label="目录顺序" name="orderNum">
          {<Input placeholder="请输入目录顺序" />}
        </FormItem> */}
      </div>
    );
  };

  // 添加-确认
  const handleAdd = () => {
    if (flag) {
      form.validateFields().then(values=> {
        if (!values) {
          values = form.getFieldsValue();
        }
        if (!values.parentId) {
          values.parentId = '0';
        }
        // pathCode:20,folderName:50;
        if (values.folderName.length > 50) {
          message.warn('文件夹名称长度不可超过50');
          return;
        }
        if (!values.folderName.errors) {
          setAddVisible(false);
          setFlag(false);
          if (id) {
            handleAddNodeFetch({ ...values, id: id });
          } else {
            handleAddNodeFetch({ ...values });
          }
        }
      })
    }
  };

  // 添加树节点
  const handleAddNodeFetch = params => {
    dispatch({
      type: 'lifeCyclePRD/handleAddTreeInfo',
      payload: { ...params },
    }).then(data => {
      setFlag(true);
      if (data) {
        setAddVisible(false);
        setDisableFlag(false);
        setParentFlag(true);
        // 修改form信息
        let newMsg = cloneDeep(clickData);
        newMsg.name = params.pathCode + ' ' + params.pathName;
        setClickData(newMsg);
        handleGetPersonalTreeData();
        form.setFieldsValue({
          parentId: '',
          folderName: '',
        });
      }
    });
  };

  // 树选择器，值改变
  const treeSelectChange = value => {
    // setTreeSelectValue(value);
    form.setFieldsValue({ parentId: value, pathCode: '', pathName: '' });
  };

  // 修改标签弹框--确认
  const handleChangeTagOk = () => {
    dispatch({
      type: 'lifeCyclePRD/handleUpdatePersonalTag',
      payload: { bid: selectData[0].id, subId: selectData[0].subId, label: syncTags },
    }).then(data => {
      if (data) {
        setTagVisible(false);
        setSelectedRowKeys([]);
        setSelectData([]);
        handleGetDocumentTagsFetch();
        // 点击左侧树，此目录下的所有文件
        let values = {};
        if (leftTreeCheckData.checkedKeys) {
          values.attachedId = leftTreeCheckData.checkedKeys;
        }
        handleGetListFetch(10, 1, '', '', values);
      }
    });
  };
  // const goConfig = () => {
  //   dispatch(
  //     routerRedux.push({
  //       pathname: routerPath.linkConfig,
  //       query: { type: 'E3' },
  //     }),
  //   );
  // };
  return (
    <Layout style={{ background: '#fff' }}>
      <Sider width={250} style={{ background: '#fff', marginTop: '12px', overflow: 'auto' }}>
        <div style={{ marginBottom: 10 }}>
          <ActionButton buttonList={actionBtns} handlerBack={handleEdit} />
        </div>
        <SelfTree
          treeData={savePersonalTreeData}
          draggableFlag={false}
          checkableFlag={false}
          checkStrictly={false}
          multipleFlag={false}
          dragTree={false}
          ref={leftTreeRef}
          getClickMsg={getLeftTreeClickMsg}
          getCheckMsg={getLeftTreeCheckMsg}
        />
      </Sider>
      <Content style={{ marginTop: '12px' }}>
        <Card>
          <Row type="flex" justify="space-between" align="middle">
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item>{'个人文档'}</Breadcrumb.Item>
                {nameList.length
                  ? nameList.map(item => {
                      return <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>;
                    })
                  : ''}
              </Breadcrumb>
            </Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.wrapButton}>
              <Button type="primary" className={styles.listButtons} onClick={handleDownLoad}>
                下载
              </Button>
              <Button type="primary" className={styles.listButtons} onClick={handleCheck}>
                查看
              </Button>
              <Button type="primary" className={styles.listButtons} onClick={handleVersion}>
                文档版本
              </Button>
              <Button type="primary" className={styles.listButtons} onClick={handleChangeTag}>
                修改标签
              </Button>
              <Button type="primary" className={styles.listButtons} onClick={handleMoveToTree}>
                移动
              </Button>
              <Button type="primary" className={styles.listButtons} onClick={handleDelete}>
                删除
              </Button>
            </div>
            <div className={styles.tabsStyle}>
              <span
                style={{ display: tabs === 'list' ? '' : 'none' }}
                onClick={() => {
                  setTabs('thumb');
                  setSelectData([]);
                  setSelectedRowKeys([]);
                  // setPageNum(1);
                  // setPageSize(10);
                }}
              >
                <AppstoreOutlined />
              </span>
              <span
                style={{ display: tabs === 'list' ? 'none' : '' }}
                onClick={() => {
                  setTabs('list');
                  setSelectData([]);
                  setSelectedRowKeys([]);
                  // setPageNum(1);
                  // setPageSize(10);
                }}
              >
                <UnorderedListOutlined />
              </span>
              <span
                style={{ marginLeft: 10 }}
                onClick={() => {
                  setVisibleDrawer(true);
                  handleFormReset();
                }}
              >
                <FilterOutlined />
                筛选
              </span>
            </div>
          </div>

          <div style={{ display: tabs === 'list' ? '' : 'none' }}>{tableCom()}</div>
          <div style={{ display: tabs === 'thumb' ? '' : 'none' }}>
            <Checkbox onChange={onCheckAllChange} checked={checkAll}>
              全选
            </Checkbox>
            {cardCom()}
            <Pagination
              style={{ float: 'right', margin: '20px 0' }}
              showQuickJumper
              showSizeChanger
              current={pageNum}
              pageSize={pageSize}
              total={savePersonalListFetch.total}
              onChange={handleCardPaginationChange}
              showTotal={total => `共 ${total} 条数据`}
            />
          </div>
        </Card>
        <Modal
          title="文档版本"
          visible={versionVisible}
          onCancel={() => {
            setVersionVisible(false);
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setVersionVisible(false);
              }}
            >
              关闭
            </Button>,
          ]}
        >
          <Table
            rowKey="id"
            dataSource={saveVersionData}
            columns={versionColumns}
            pagination={false}
          />
        </Modal>
        <Modal
          title={'移动'}
          visible={syncManageVisible}
          onOk={handleSyncManageOk}
          onCancel={() => {
            setSyncManageVisible(false);
            personalTreeRef.current.handleReset();
          }}
        >
          <div>选择文件夹</div>
          <SelfTree
            treeData={savePersonalTreeData}
            searchFlag={true}
            draggableFlag={false}
            checkableFlag={false}
            multipleFlag={false}
            getClickMsg={getClickMsg}
            getCheckMsg={getCheckMsg}
            dragTree={false}
            ref={personalTreeRef}
          />
          {/* <div>选择标签</div>
            <Input value={syncTags} placeholder="请输入标签" onChange={handleTagsChange} /> */}
        </Modal>
        <Modal
          title={'修改标签'}
          visible={tagVisible}
          onOk={handleChangeTagOk}
          onCancel={() => {
            setTagVisible(false);
          }}
        >
          <div>选择标签</div>
          {/* <Input value={syncTags} placeholder="请输入" onChange={handleTagsChange} /> */}
          <Select
            mode={'tags'}
            showArrow
            style={{ width: '100%' }}
            placeholder="请选择"
            onChange={handleTagsChange}
            value={syncTags}
          >
            {(documentTags || []).map(item => {
              return (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
        </Modal>
      </Content>
      <Modal
        title={opType === 'add' ? '添加' : '修改'}
        visible={addVisible}
        onOk={handleAdd}
        onCancel={() => {
          setAddVisible(false);
        }}
      >
        <Form {...formItemLayout}>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>{FormAttrbuite()}</Row>
        </Form>
      </Modal>
      <Drawer
        title="个人文档"
        placement="right"
        closable={false}
        onClose={() => {
          setVisibleDrawer(false);
        }}
        visible={visibleDrawer}
        width={500}
      >
        <Form {...formItemLayout}>
          <Row
            gutter={{
              md: 8,
              lg: 24,
              xl: 48,
            }}
          >
            <Col md={24} sm={24}>
              <FormItem label="大小" name="fileTotalSize">
                {<Input placeholder="请输入" />}
              </FormItem>
            </Col>

            <Col md={24} sm={24}>
              <FormItem label="标签" name="multiple">
                {
                  <Select
                    mode={'multiple'}
                    showArrow
                    style={{ width: '100%' }}
                    placeholder="请选择"
                  >
                    {(documentTags || []).map(item => {
                      return (
                        <Select.Option key={item} value={item}>
                          {item}
                        </Select.Option>
                      );
                    })}
                  </Select>
                }
              </FormItem>
            </Col>
            <Col md={24} sm={24}>
              <FormItem label="上传人" name="uploadPeoleList">
                {handleMapList(
                  saveUploadPersonFetch || [],
                  'id',
                  'username',
                  'multiple',
                  false,
                  false,
                  '上传人',
                )}
              </FormItem>
            </Col>
            <Col md={24} sm={24} className={styles.uploadTime}>
              <Form.Item label="上传时间：" name="uploadFileTime">
                {<DatePicker format="YYYY-MM-DD" />}
              </Form.Item>
            </Col>
            <div
              style={{
                textAlign: 'right',
                paddingRight: '22px',
                position: 'fixed',
                right: 0,
                bottom: 0,
              }}
            >
              <Button type="primary" onClick={handleGetSearchFetch}>
                查询
              </Button>
              <Button
                style={{ marginLeft: '18px' }}
                onClick={() => {
                  handleFormReset();
                  handleGetListFetch(10, 1);
                }}
              >
                重置
              </Button>
            </div>
          </Row>
        </Form>
      </Drawer>
    </Layout>
  );
};

export default errorBoundary(
  // Form.create()(
  connect(({ lifeCyclePRD, loading }) => ({
    lifeCyclePRD,
    listLoading: loading.effects['lifeCyclePRD/handleGetPersonalListMsg'],
  }))(Index),
  // ),
);
