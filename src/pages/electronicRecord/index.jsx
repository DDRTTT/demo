import React, { useEffect, useState, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
// import { errorBoundary } from '@/layouts/ErrorBoundary';
import { connect } from 'dva';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Menu,
  Row,
  Select,
  Table,
  message,
  Modal,
  Checkbox,
  DatePicker,
  Tabs,
  TreeSelect,
  Tooltip,
  Layout,
  Breadcrumb,
} from 'antd';
import { routerRedux } from 'dva/router';
// import SelfTree from '@/pages/lifeCyclePRD/compoments/SelfTree';
// import SyncToPersonal from '@/pages/lifeCyclePRD/compoments/SyncToPersonalManage';
// import SingleCustomerEvents from '@/utils/SingleCustomerEvents';
import { getUrlParams } from '@/utils/utils';
import { getPath } from '@/pages/lifeCyclePRD/func';
// import { downloadNoToken, filePreview } from '@/utils/download';
import LifeCyclePRD from '@/pages/lifeCyclePRD';
import ProductPRD from '@/pages/productPRD';
import PersonalPRD from '@/pages/personalPRD';
import styles from './index.less';
import cloneDeep from 'lodash/cloneDeep';
import staticInstance from '@/utils/staticInstance';

const { Search } = Input;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Sider, Content } = Layout;
const { Option } = Select;
const { Meta } = Card;

const Index = ({ dispatch }) => {
  // 侧边栏伸缩
  const [collapsed, setCollapsed] = useState(false);
  // 左侧菜单默认选中
  const [type, setType] = useState('E1');
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [keywordValue, setKeywordValue] = useState('');

  const productRef = useRef();
  const lifeRef = useRef();
  const personRef = useRef();
  // 生命周期文档 列表
  useEffect(() => {
    const type = getUrlParams('type');

    if (type) {
      setType([type + '']);
      handleTabsChanges(type + '');
    }
  }, []);

  // 切换左侧菜单栏
  const handleMenuClick = e => {
    handleMenuFunc(e.key);
    setType(e.key);
  };

  // 切换tabs
  const handleTabsChanges = data => {
    switch (data) {
      case 'E1':
        setShow1(true);
        setShow2(false);
        setShow3(false);
        break;
      case 'E2':
        setShow1(false);
        setShow2(true);
        setShow3(false);
        break;
      case 'E3':
        setShow1(false);
        setShow2(false);
        setShow3(true);
        break;
    }
    setType(data);
    // 每次切换，清空左侧树信息
    staticInstance.getInstance().treeClickData = {};
  };

  // 模糊搜索
  const blurSearch = value => {
    let leftTreeClickData = staticInstance.getInstance().treeClickData;
    staticInstance.getInstance().keyWords = value;
    switch (type) {
      case 'E1':
        handleBlurSearchOfProduct(leftTreeClickData, value);
        productRef.current.handleFormReset();
        break;
      case 'E2':
        handleBlurSearchOfLifecycle(leftTreeClickData, value);
        lifeRef.current.handleFormReset();
        break;
      case 'E3':
        handleBlurSearchOfPerson(value);
        personRef.current.handleFormReset();
        break;
    }
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
      type:
        type === 'E3' ? 'lifeCyclePRD/handleGetPersonalListMsg' : 'lifeCyclePRD/handleGetListMsg',
      payload: {
        pageSize,
        pageNum,
        field,
        direction,
        ...formData,
      },
    });
  };

  // 产品电子档案模糊搜索
  const handleBlurSearchOfProduct = (leftTreeClickData, value) => {
    value = { keyWords: value };
    // 点击左侧树，此目录下的所有文件
    let newTree = staticInstance.getInstance().tree;
    if ('code' in leftTreeClickData && newTree.length) {
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
      value.archivesClassification = label1;
      value.itemKey = label2;
      value.documentType = label3;
    }
    handleGetListFetch(10, 1, '', '', value);
  };

  // 生命周期文档模糊搜索
  const handleBlurSearchOfLifecycle = (leftTreeClickData, value) => {
    value = { keyWords: value };
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
      value.documentType = documentType;
      value.proCode = proCode;
    }
    handleGetListFetch(10, 1, '', '', value);
  };

  // 个人文档模糊搜索
  const handleBlurSearchOfPerson = value => {
    value = { keyWords: value };
    handleGetListFetch(10, 1, '', '', value);
  };

  return (
    <Card
      title={
        <Breadcrumb>
          <Breadcrumb.Item>电子档案管理</Breadcrumb.Item>
          <Breadcrumb.Item>文档管理</Breadcrumb.Item>
        </Breadcrumb>
      }
      extra={
        <Search
          placeholder="请输入文档名称"
          onSearch={value => blurSearch(value)}
          onChange={e => {
            setKeywordValue(e.target.value);
          }}
          style={{
            width: 300,
            height: 32,
          }}
          value={keywordValue}
          enterButton="搜索"
        />
      }
    >
      <Tabs defaultActiveKey="E1" activeKey={type} onChange={handleTabsChanges} animated={false}>
        <TabPane tab="产品电子档案" key="E1">
          {show1 && <ProductPRD productRef={productRef} />}
        </TabPane>
        <TabPane tab="生命周期文档" key="E2">
          {show2 && <LifeCyclePRD lifeRef={lifeRef} />}
        </TabPane>
        <TabPane tab="个人文档" key="E3">
          {show3 && <PersonalPRD personRef={personRef} />}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default connect(lifeCyclePRD => {
  lifeCyclePRD;
})(Index);
