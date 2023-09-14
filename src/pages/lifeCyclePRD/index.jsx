import React, { useEffect, useImperativeHandle, useState } from 'react';
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
} from 'antd';
import { routerRedux } from 'dva/router';
import SelfTree from '@/pages/lifeCyclePRD/compoments/SelfTree';
import SyncToPersonal from './compoments/SyncToPersonalManage';
import SingleCustomerEvents from '@/utils/SingleCustomerEvents';
import { getPath } from './func';
import { downloadNoToken, filePreview } from '@/utils/download';
import styles from './index.less';
import cloneDeep from 'lodash/cloneDeep';
import staticInstance from '@/utils/staticInstance';
import png from '@/assets/electronic/picture.png';
import file from '@/assets/electronic/file.png';
import pdf from '@/assets/electronic/pdf.png';
import ppt from '@/assets/electronic/ppt.png';
import txt from '@/assets/electronic/txt.png';
import { AppstoreOutlined, FilterOutlined, UnorderedListOutlined } from '@ant-design/icons';

// const { Search } = Input;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Sider, Content } = Layout;
// const { Option } = Select;
const { Meta } = Card;
// const selectTreeValue = [];
const routerPath = {
  linkAd: '/electronic/record',
  linkConfig: '/fileTypeConfig',
};

const Index = ({
  lifeRef,
  // form: { getFieldsValue, resetFields, validateFields },
  dispatch,
  listLoading,
  lifeCyclePRD: {
    saveTreeData,
    saveListFetch,
    saveVersionData,
    savePersonalTreeData,
    documentBigType,
    documentType,
    breakdown,
    documentTags,
  },
}) => {
  const [form] = Form.useForm();

  // tabs code
  const [tabs, setTabs] = useState('list');
  // 展开/收起
  // const [seniorType, setSeniorType] = useState(false);
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
  // 同步管理弹出框
  // const [syncManageVisible, setSyncManageVisible] = useState(false);
  // 子组件传回点击信息
  // const [clickData, setClickData] = useState({});
  // 左侧目录树节点信息
  const [leftTreeClickData, setLeftTreeClickData] = useState({});
  // const [keywordValue, setKeywordValue] = useState('');
  // 高级搜索框里，目录路径
  const [nameList, setNameList] = useState([]);
  // 高级搜索抽屉
  const [visibleDrawer, setVisibleDrawer] = useState(false);

  useImperativeHandle(lifeRef, () => ({
    handleFormReset: () => {
      setPageNum(1);
      setPageSize(10);
      form.resetFields();
    },
  }));

  // 生命周期文档 列表
  useEffect(() => {
    // 获得树形结构数据
    handleGetTreeData();
    handleGetPersonalTreeData();
    handleGetListFetch(10, 1);
    documentBigTypeReq();
    documentTypeReq();
    breakdownReq();
    documentTagsReq();
  }, []);

  // 展开搜索表单创建
  // const searchFrom = () => {
  //   return (
  //     <Form {...formItemLayout} form={form}>
  //       <Row style={{ marginBottom: 10 }}>
  //         <Col>
  //           <Breadcrumb>
  //             {nameList.length ? (
  //               nameList.map(item => {
  //                 return <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>;
  //               })
  //             ) : (
  //               <Breadcrumb.Item>{'生命周期文档'}</Breadcrumb.Item>
  //             )}
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
  //         {leftTreeClickData && leftTreeClickData.code ? null : (
  //           <Col md={8} sm={24}>
  //             <FormItem label="档案大类" className={styles.commonItemCss} name="classificationList">
  //               {handleMapList(documentBigType, 'code', 'name', 'multiple')}
  //             </FormItem>
  //           </Col>
  //         )}
  //         {leftTreeClickData && leftTreeClickData.label === '3' ? null : (
  //           <Col md={8} sm={24}>
  //             <FormItem label="文档类型" name="documentTypeList">
  //               {handleMapList(documentType, 'FCODE', 'FNAME', 'multiple')}
  //             </FormItem>
  //           </Col>
  //         )}
  //         <Col md={8} sm={24}>
  //           <FormItem
  //             label="明细分类"
  //             style={{
  //               display: 'flex',
  //               justifyContent: 'flex-end',
  //               alignItems: 'center',
  //             }}
  //             name="fileTypeList"
  //           >
  //             {handleMapList(breakdown, 'code', 'name', 'multiple')}
  //           </FormItem>
  //         </Col>
  //         {/* 注:此字段需求已去 */}
  //         {/* <Col md={8} sm={24}>
  //           <FormItem label="主体信息" name='investmentManager'>
  //             {handleMapList([], 'code', 'name', 'multiple')}
  //           </FormItem>
  //         </Col> */}
  //         <Col md={8} sm={24}>
  //           <FormItem label="文档名称" className={styles.commonItemCss} name="fileName">
  //             <Input placeholder="请输入" />
  //           </FormItem>
  //         </Col>
  //         <Col md={8} sm={24} className={styles.rangePickerCss}>
  //           <FormItem label="归档时间" className={styles.commonItemCss} name="archivedTime">
  //             <RangePicker
  //               showTime={{ format: 'YYYY-MM-DD' }}
  //               format="YYYY-MM-DD"
  //               placeholder={['开始时间', '结束时间']}
  //               onChange={onChangeRangeTime}
  //               onOk={onOk}
  //             />
  //           </FormItem>
  //         </Col>
  //         {/* <Col md={8} sm={24}>
  //           <FormItem label="用印文档" name='flag' valuePropName= 'checked'>
  //             {<Checkbox onChange={onChangeSeal}>用印文档</Checkbox>}
  //           </FormItem>
  //         </Col> */}
  //         {leftTreeClickData && leftTreeClickData.code ? <Col md={8} sm={24} /> : null}
  //         {leftTreeClickData && leftTreeClickData.label === '3' ? <Col md={8} sm={24} /> : null}
  //         <Col
  //           md={8}
  //           sm={24}
  //           style={{
  //             display: 'flex',
  //             justifyContent: 'flex-end',
  //             alignItems: 'center',
  //           }}
  //         >
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
  //               handleFormReset;
  //             }}
  //           >
  //             收起
  //             <UpOutlined />
  //           </span>
  //         </Col>
  //       </Row>
  //       {/* <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
  //         <Col
  //           md={24}
  //           sm={24}
  //           style={{
  //             display: 'flex',
  //             justifyContent: 'flex-end',
  //             alignItems: 'center',
  //           }}
  //         >
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
  //               handleFormReset;
  //             }}
  //           >
  //             收起
  //             <Icon type="up" />
  //           </span>
  //         </Col>
  //       </Row> */}
  //     </Form>
  //   );
  // };

  const handleGetTreeData = () => {
    dispatch({
      type: 'lifeCyclePRD/handleGetTreeInfo',
      payload: '',
    });
  };
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
  const documentTagsReq = () => {
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
    total: saveListFetch.total,
    showTotal: total => `共 ${total} 条数据`,
  };

  /**
   * 分页回调
   * @method  handlePaginationChange
   */
  const handlePaginationChange = (pagination, filters, sorter) => {
    const field = sorter.columnKey;
    console.log('sorter::', sorter);
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
    form.validateFields().then(values => {
      setPageSize(pagination.pageSize);
      setPageNum(pagination.current);
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
      if ('code' in leftTreeClickData) {
        const { code, parentId, label } = leftTreeClickData;
        // 2，3级目录才查询
        let proCode = '',
          documentType = '';
        if (label === '1') {
          return;
        } else if (label === '2') {
          proCode = code;
        } else if (label === '3') {
          proCode = parentId;
          documentType = code.split('-')[1];
        }
        obj.documentType = documentType;
        obj.proCode = proCode;
      }
      //values = beforeFormFata(values);
      obj.keyWords = staticInstance.getInstance().keyWords;
      handleGetListFetch(pagination.pageSize, pagination.current, field, direction, obj);
    })
  };

  // 卡片--分页回调
  const handleCardPaginationChange = (current, pageSize) => {
    form.validateFields().then(values => {
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
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
        rowKey={'id'}
        loading={listLoading}
        dataSource={saveListFetch.fileInfoList}
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
      title: '文档名称',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
    {
      title: '档案大类',
      dataIndex: 'archivesClassification',
      key: 'archivesClassification',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
    {
      title: '文档类型',
      dataIndex: 'documentType',
      key: 'documentType',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
    {
      title: '明细分类',
      dataIndex: 'fileType',
      key: 'fileType',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
    {
      title: '所属流程',
      dataIndex: 'processId',
      key: 'processId',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
    {
      title: '文档来源',
      dataIndex: 'fileSource',
      key: 'fileSource',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
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
    {
      title: '归档时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: true,
      render: text => {
        return handleTableCss(text);
      },
    },
    {
      title: '文档版本',
      dataIndex: 'stateName',
      key: 'stateName',
      sorter: true,
    },

    {
      title: '版本号',
      dataIndex: 'fileVersion',
      key: 'fileVersion',
      sorter: true,
    },
    {
      title: '更新用户',
      dataIndex: 'lastEditorPeople',
      key: 'lastEditorPeople',
      sorter: true,
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
    setCheckAll(arr.length === saveListFetch.fileInfoList.length);
    console.log(arr);
    setSelectData(arr);
  };

  // 卡片组件
  const cardCom = () => {
    const data = saveListFetch.fileInfoList;
    const child = data.map(item => {
      return (
        <Col
          offset={1}
          sm={5}
          xxl={4}
          key={item.id}
          style={{
            height: '164px',
            border: '1px solid #EBECF0',
            borderRadius: '4px',
            marginBottom: '15px',
            padding: '5px',
            boxShadow: '0px 0px 10px 0px rgba(66, 124, 229, 0.17)',
          }}
        >
          <Checkbox style={{ width: '100%' }} value={item}>
            {/* 注:此处样式优化 */}
            <Card
              // hoverable
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
      child = <img src={file} alt={'file'} />;
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
      type: 'lifeCyclePRD/handleGetListMsg',
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

  // 日期选择
  const onChangeRangeTime = (value, dateString) => {
    console.log(value, dateString);
  };
  const onOk = value => {
    console.log('1111111111', value);
  };

  /**
   * 查询按钮
   * @method  handleGetSearchFetch
   */
  const handleGetSearchFetch = () => {
    setVisibleDrawer(false);
    const values = form.getFieldsValue();
    let obj = cloneDeep(values);
    obj.flag = obj.flag ? true : '';
    if (obj.archivedTime) {
      obj.archivedTime[0] = obj.archivedTime[0].format('YYYY-MM-DD');
      obj.archivedTime[1] = obj.archivedTime[1].format('YYYY-MM-DD');
    }
    // 点击左侧树，此目录下的所有文件
    if ('code' in leftTreeClickData) {
      const { code, parentId, label } = leftTreeClickData;
      // 2,3级目录才查询
      let proCode = '',
        documentType = '';
      if (label === '1') {
        return;
      } else if (label === '2') {
        proCode = code;
      } else if (label === '3') {
        proCode = parentId;
        documentType = code.split('-')[1];
      }
      obj.documentType = documentType;
      obj.proCode = proCode;
    }
    setPageSize(10);
    setPageNum(1);
    handleGetListFetch(10, 1, '', '', obj);
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

  // 用印文档改变触发事件
  // const onChangeSeal = e => {
  //   console.log(e.target.checked);
  // };

  // 模糊搜索
  // const blurSearch = value => {
  //   value = { keyWords: value };
  //   // 点击左侧树，此目录下的所有文件
  //   if ('code' in leftTreeClickData) {
  //     const { code, parentId, label } = leftTreeClickData;
  //     // 2,3级目录才查询
  //     let proCode = '',
  //       documentType = '';
  //     if (label === '1') {
  //       return;
  //     } else if (label === '2') {
  //       proCode = code;
  //     } else if (label === '3') {
  //       proCode = parentId;
  //       documentType = code.split('-')[1];
  //     }
  //     value.documentType = documentType;
  //     value.proCode = proCode;
  //   }
  //   setKeywordValue('');
  //   handleGetListFetch(10, 1, '', '', value);
  // };

  // tabs切换
  // const handleTabsChanges = key => {
  //   console.log(key);
  //   setTabs(key);
  // };

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
        fileType: selectData[0].type,
        fileFormat: selectData[0].fileForm,
        busId,
      },
    });
    setVersionVisible(true);
  };
  const handleRecord = () => {
    if (!selectData.length || selectData.length > 1) {
      message.warn('请选择单个文件');
      return;
    }
    dispatch(
      routerRedux.push({
        pathname: routerPath.linkAd,
        query: { fileSerialNumber: selectData[0].fileSerialNumber },
      }),
    );
  };
  const handleSyncManage = () => {
    console.log('selectData::', selectData);
    if (!selectData.length) {
      message.warn('请选择文件');
      return;
    }
    //setSyncManageVisible(true);
    SingleCustomerEvents.getInstance().dispatchEvent('syncEvent');
  };

  // 全选
  const onCheckAllChange = e => {
    setCheckAll(e.target.checked);
    const newArr = [];
    saveListFetch.fileInfoList.forEach(item => {
      newArr.push(item);
    });
    setCheckedList(e.target.checked ? newArr : []);
    setSelectData(newArr);
  };

  // 初始化默认值
  const handleInitDefaultValue = () => {
    setTabs('list');
    // setSeniorType(false);
    setPageSize(10);
    setPageNum(1);
    setSelectData([]);
    setSelectedRowKeys([]);
    setCheckAll(false);
    setCheckedList([]);
    // setKeywordValue('');
    handleFormReset();
  };

  // 筛选条件增加用户选择的左侧目录树节点
  const getLeftTreeClickMsg = (result, msg) => {
    console.log('msg::', msg);
    const { code, parentId, label } = msg;
    // 找出父目录名称
    const nameList = getPath(saveTreeData, msg.code, '', 'key', 'title');
    nameList ? setNameList(nameList) : setNameList([]);
    setLeftTreeClickData(msg);
    handleInitDefaultValue();
    if ('code' in msg) {
      // 增加一级查询
      let proType = '';
      // 2,3级目录才查询
      let proCode = '',
        documentType = '';
      if (label === '1') {
        // return;
        proType = code;
      } else if (label === '2') {
        proCode = code;
      } else if (label === '3') {
        proCode = parentId;
        documentType = code.split('-')[1];
      }
      handleGetListFetch(10, 1, '', '', {
        proType,
        proCode: proCode,
        documentType: documentType,
      });
    } else {
      handleGetListFetch(10, 1, '', '');
    }
  };
  const getLeftTreeCheckMsg = (result, msg) => {
    console.log(result, msg);
  };

  // 同步至个人文旦，回调
  const syncBack = () => {
    handleGetPersonalTreeData();
  };

  // const goConfig = () => {
  //   dispatch(
  //     routerRedux.push({
  //       pathname: routerPath.linkConfig,
  //       query: { type: 'E2' },
  //     }),
  //   );
  // };

  return (
    <Layout style={{ background: '#fff' }}>
      <Sider
        width={250}
        style={{
          background: '#fff',
          marginTop: '12px',
          overflow: 'auto',
        }}
      >
        <SelfTree
          treeData={saveTreeData}
          draggableFlag
          checkable
          getClickMsg={getLeftTreeClickMsg}
          getCheckMsg={getLeftTreeCheckMsg}
        />
      </Sider>
      <Content style={{ marginTop: '12px' }}>
        <Card>
          <Row type="flex" justify="space-between" align="middle">
            <Col>
              <Breadcrumb>
                {nameList.length ? (
                  nameList.map(item => {
                    return <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>;
                  })
                ) : (
                  <Breadcrumb.Item>{'生命周期文档'}</Breadcrumb.Item>
                )}
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
              <Button type="primary" className={styles.listButtons} onClick={handleRecord}>
                流转记录
              </Button>
              <Button type="primary" className={styles.listButtons} onClick={handleSyncManage}>
                同步至个人文档
              </Button>
            </div>
            <div className={styles.tabsStyle}>
              <span
                style={{ display: tabs === 'list' ? '' : 'none' }}
                onClick={() => {
                  setTabs('thumb');
                  setSelectData([]);
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
              total={saveListFetch.total}
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
            rowKey={'id'}
            dataSource={saveVersionData}
            columns={versionColumns}
            pagination={false}
          />
        </Modal>
        <SyncToPersonal
          savePersonalTreeData={savePersonalTreeData}
          tagData={documentTags}
          selectData={selectData}
          handleSyncBack={syncBack}
        />
        <Drawer
          title="生命周期文档"
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
              {leftTreeClickData && leftTreeClickData.code ? null : (
                <Col md={24} sm={24}>
                  <FormItem
                    label="档案大类"
                    className={styles.commonItemCss}
                    name="classificationList"
                  >
                    {handleMapList(documentBigType, 'code', 'name', 'multiple')}
                  </FormItem>
                </Col>
              )}
              {leftTreeClickData && leftTreeClickData.label === '3' ? null : (
                <Col md={24} sm={24}>
                  <FormItem
                    label="文档类型"
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                    name="documentTypeList"
                  >
                    {handleMapList(documentType, 'FCODE', 'FNAME', 'multiple')}
                  </FormItem>
                </Col>
              )}
              <Col md={24} sm={24}>
                <FormItem
                  label="明细分类"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                  name="fileTypeList"
                >
                  {handleMapList(breakdown, 'code', 'name', 'multiple')}
                </FormItem>
              </Col>
              {/* 注:此字段需求已去 */}
              {/* <Col md={8} sm={24}>
            <FormItem label="主体信息" name='investmentManager'>
              {handleMapList([], 'code', 'name', 'multiple')}
            </FormItem>
          </Col> */}
              <Col md={24} sm={24}>
                <FormItem label="文档名称" className={styles.commonItemCss} name="fileName">
                  <Input placeholder="请输入" />
                </FormItem>
              </Col>
              <Col md={24} sm={24} className={styles.rangePickerCss}>
                <FormItem label="归档时间" className={styles.commonItemCss} name="archivedTime">
                  <RangePicker
                    showTime={{ format: 'YYYY-MM-DD' }}
                    format="YYYY-MM-DD"
                    placeholder={['开始时间', '结束时间']}
                    onChange={onChangeRangeTime}
                    onOk={onOk}
                  />
                </FormItem>
              </Col>
              {/* <Col md={8} sm={24}>
            <FormItem label="用印文档" name='flag' valuePropName='checked'>
              {<Checkbox onChange={onChangeSeal}>用印文档</Checkbox>}
            </FormItem>
          </Col> */}
              {leftTreeClickData && leftTreeClickData.code ? <Col md={24} sm={24} /> : null}
              {leftTreeClickData && leftTreeClickData.label === '3' ? (
                <Col md={24} sm={24} />
              ) : null}
              <Col
                md={24}
                sm={24}
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
              </Col>
            </Row>
          </Form>
        </Drawer>
      </Content>
    </Layout>
  );
};

export default errorBoundary(
  // Form.create()(
  connect(({ lifeCyclePRD, loading }) => ({
    lifeCyclePRD,
    listLoading: loading.effects['lifeCyclePRD/handleGetListMsg'],
  }))(Index),
  // ),
);
