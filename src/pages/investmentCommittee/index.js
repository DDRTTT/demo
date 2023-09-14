//页面-基金业绩
import React, { useEffect, useRef, useState } from 'react';
import { errorBoundary } from '@/layouts/ErrorBoundary';
import { connect } from 'dva';
import { Button, Form, message, Modal } from 'antd';
import { useSetState } from 'ahooks';
import router from 'umi/router';
import { linkHoc } from '@/utils/hocUtil'; //权限
import {
  BatchOperation,
  directionFun,
  getUrlParam,
  listcolor,
  tableRowConfig,
  templateDownload,
} from '@/pages/investorReview/func';
import { Table } from '@/components';
import List from '@/components/List';
import ImportData from '@/components/ImportData';
import ExportData from '@/components/ExportData';
import ExportAll from '@/components/ExportAll';
import request from '@/utils/request';
import Investment from './form/index.jsx';
import Committee from './form/committeeSet.jsx'

const Index = props => {
  const {
    fnLink,
    publicTas, //T001_1
    investmentCommittee: { saveListFetch, saveSearch, selectProName },
    dispatch,
    listLoading,
  } = props;
  let urlParam = useRef(getUrlParam());
  urlParam.current.title = '投委会管理';
  const pageNum = useRef(1);
  const pageSize = useRef(30);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [moreProCode, setMoreProCode] = useState([]);
  const [id, setId] = useState('');
  const [formType, setFormType] = useState(false)
  const [state, setState] = useSetState({
    selectedRows: '',
    selectedRowKeys: '',
    tabData: [], //当前主页tab列表数据
    publicTas: publicTas, //tab切换信息
    field: '', // 排序依据
    direction: '', // 排序方式
    saveListFetchData: [], //获取到的表格数据
    columns: [
      //列表表头
      {
        title: '业务类型',
        key: 'name',
        dataIndex: 'name',
        ...tableRowConfig,
        width: 80,
      },
      {
        title: '投委会信息',
        dataIndex: 'introductions',
        key: 'introductions',
        ...tableRowConfig,
        width: 300,
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        fixed: 'right',
        align: 'center',
        width: 80,
        render: (text, record) => {
          return (
            <>
              <Button type="link" size="small" onClick={() => handleCanCheck(record)}>
                查看
              </Button>
              <Button type="link" size="small" onClick={() => handleCanUpdate(record)}>
                编辑
              </Button>
            </>
          );
        },
      },
    ],
    fundPerformanceColumns: [
      {
        title: '产品名称',
        key: 'proName',
        dataIndex: 'proName',
        ...tableRowConfig,
        width: 256,
      },
      {
        title: '产品代码',
        dataIndex: 'proCode',
        key: 'proCode',
        ...tableRowConfig,
        width: 80,
      },
      {
        title: '类型',
        dataIndex: 'typeName',
        key: 'typeName',
        ...tableRowConfig,
        width: 80,
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        fixed: 'right',
        align: 'center',
        width: 80,
        render: (text, record) => {
          return (
            <>
              <Button type="link" size="small" onClick={() => view(record)}>
                查看
              </Button>
              <Button type="link" size="small" onClick={() => edit(record)}>
                编辑
              </Button>
            </>
          );
        },
      },
    ],
  });
  useEffect(() => {
    //主页面数据
    handleGetListFetch(publicTas,pageSize.current,pageNum.current,state.field,state.direction,{});
    //高级搜索下拉数据
    handleGetSelectOptions('committeeType','committee');
    return () => {};
  }, []);

let formItemData = [
  {
    name: 'proName',
    label: '产品名称',
    type: 'select',
    readSet: { name: 'proName', code: 'proName' },
    config: {mode: 'multiple'},
    option: selectProName,
  },
  {
    name: 'proCode',
    label: '产品代码',
    type: 'select',
    readSet: { name: 'proCode', code: 'proCode' },
    config: {mode: 'multiple'},
    option: selectProName,
  },
  {
    name: 'code',
    label: '业务类型',
    type: 'select',
    readSet: { name: 'name', code: 'code' },
    option: [...saveSearch,{code:'notConfigured', name:'未配置',orgType:"committeeType"}],
  },
]
 const handleCancel = () => {
    setIsModalOpen(false);
    setModalOpen(false);
    setMoreProCode([]);
    setState({selectedRowKeys:[],selectedRows:[]})
 }
  // 查看
  const handleCanCheck = record => {
    setIsModalOpen(true);
    setId(record.id);
    setFormType(true);
  };
  const view = record => {
    setModalOpen(true);
    setId(record.id);
    setFormType(true);
  };
  // 编辑
  const handleCanUpdate = record => {
    setIsModalOpen(true);
    setFormType(false);
    setId(record.id);
  };
  const edit = record => {
    setModalOpen(true);
    setFormType(false);
    setId(record.id);
  };
  //批量设置
  const moreEdit = () => {
    const proCode = []
    // console.log(selectedRowKey);
    if (selectedRows.length > 0) {
      setModalOpen(true)
      selectedRows.forEach(item => {
        proCode.push(item.proCode);
      });
      setMoreProCode(proCode)
    }
  }
  // 删除
  const handleCanDelete = record => {
    let id = [];
    if (Array.isArray(record)) {
      if (
        record.some(item => {
          return item.checked == 'D001_2';
        })
      ) {
        return message.warning('选择产品中含有已审核的产品，请重新选择');
      }
      record.forEach(v => {
        id.push(v.id);
      });
    } else {
      id = [record.id];
    }
    Modal.confirm({
      title: '请确认是否删除?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        request(`/yss-contract-server/RpFund/deleteByIds`, {
          method: 'POST',
          data: { ids: id },
        }).then(r => {
          r.status === 200
            ? (message.success('操作成功'),
              setState({ selectedRows: [], selectedRowKeys: [] }),
              handleGetListFetch(
                state.publicTas,
                pageSize.current,
                pageNum.current,
                state.field,
                state.direction,
                keyWordsValue.current,
              ))
            : message.error(`操作失败${r.status}`);
        });
      },
    });
  };
  //审核
  const checking = async record => {
    let id = [];
    if (Array.isArray(record)) {
      record.forEach(v => {
        id.push(v.id);
      });
    } else {
      id = [record.id];
    }
    request(`/yss-contract-server/RpFund/isCheck`, {
      method: 'POST',
      data: { ids: id, checked: 'D001_2' },
    }).then(r => {
      r.status === 200
        ? (message.success('操作成功'),
          setState({ selectedRows: [], selectedRowKeys: [] }),
          handleGetListFetch(
            state.publicTas,
            pageSize.current,
            pageNum.current,
            state.field,
            state.direction,
            keyWordsValue.current,
          ))
        : message.error(`操作失败${r.status}`);
    });
  };
  //反审核
  const antiChecking = async record => {
    let id = [];
    if (Array.isArray(record)) {
      record.forEach(v => {
        id.push(v.id);
      });
    } else {
      id = [record.id];
    }
    request(`/yss-contract-server/RpFund/isCheck`, {
      method: 'POST',
      data: { ids: id, checked: 'D001_1' },
    }).then(r => {
      r.status === 200
        ? (message.success('操作成功'),
          setState({ selectedRows: [], selectedRowKeys: [] }),
          handleGetListFetch(
            state.publicTas,
            pageSize.current,
            pageNum.current,
            state.field,
            state.direction,
            keyWordsValue.current,
          ))
        : message.error(`操作失败${r.status}`);
    });
  };
  //搜索参数集合
  const keyWordsValue = useRef('');
  /**
   * 发起请求 列表（搜索）
   * @method  handleGetListFetch
   * @return {Object}
   * @param publicTas {任务类型}
   * @param pageSize
   * @param pageNum
   * @param field  {排序字段}
   * @param direction  {排序方式}
   * @param formData {表单项}
   * @param orgId {机构类型ID}
   */
  const handleGetListFetch = (publicTas, Size,Num, field, direction, formData) => {
    //钱加虎要求所有页面跳转存储模糊查询条件
    const reqBody = sessionStorage.getItem('keyValueSearch');
    if (reqBody&&JSON.parse(reqBody).keyWords) {
      formData = JSON.parse(reqBody)
    }
    const sessionPageNum = sessionStorage.getItem('sessionPageNum');
    if (sessionPageNum) {
      Num =JSON.parse(sessionPageNum)
      pageNum.current=JSON.parse(sessionPageNum)
    }else {
      pageNum.current=1
    }
    const val = publicTas == 'T001_2' ? { url: `/yss-contract-server/committee/fund/queryByPage`, method: 'POST' } : { url: `/yss-contract-server/committee/queryByPage`, method: 'POST' };
    dispatch({
      type: 'investmentCommittee/handleListFetch',
      payload: {
        pageSize:Size,
        pageNum:Num,
        field,
        direction,
        ...formData,
      },
      val: val,
      callback: res => {
        if (res && res.status === 200) {
          setState({ saveListFetchData: saveListFetch, selectedRows: [], selectedRowKeys: [] });
        } else {
          message.error(res.message);
        }
      },
    });
  };
  // 请求:获取表单下拉选项
  const handleGetSelectOptions = (value1, value2, value3) => {
    dispatch({
      type: 'investmentCommittee/handleSearch',
      payload: { codeList: value1 || '' },
      val: { url: `/ams-base-parameter/datadict/queryInfoByList`, method: 'GET' },
    });
    dispatch({
      type: 'investmentCommittee/handleProName',
      payload: { coreModule: value2 || '' },
      val: { url: `/yss-contract-server/RpProduct/queryProductInfo`, method: 'GET' },
    });
  };
  //查询
  const blurSearch = formData => {
    setState({ pageNum: 1 });
    keyWordsValue.current = formData;
    handleGetListFetch(state.publicTas, pageSize.current, 1, state.field, state.direction, {
      keyWords: keyWordsValue.current,
    });
  };
  // 高级查询
  function advancSearch(formData) {
    setState({ pageNum: 1 });
    keyWordsValue.current = formData;
    handleGetListFetch(state.publicTas, pageSize.current, 1, state.field, state.direction, formData);
  }

  // 高级重置
  const handleReset = (key) => {
    setState({
      pageNum: 1,
      selectedRows: [],
      selectedRowKeys: [],
    });
    keyWordsValue.current = '';
    handleGetListFetch(key, pageSize.current, 1, '', '', {});
  };
  //* table 回调
  const handleTabsChanges = key => {
    dispatch({ type: 'publicModel/setPublicTas', payload: key });
    setState({ publicTas: key });
    handleReset(key);
  };

  //选中键值
  const handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    setState({ selectedRows: selectedRows, selectedRowKeys: selectedRowKeys });
    console.log(state.selectedRows);
  };
  //分页回调
  const handlePaginationChange = (pagination, filters, sorter, extra) => {
    let direction = directionFun(sorter?.order);
    setState({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      field: sorter.columnKey,
      direction: direction,
    });
    pageSize.current = pagination.pageSize;
    pageNum.current = pagination.current;
    sessionStorage.setItem('sessionPageNum', pagination.current);
    handleGetListFetch(
      state.publicTas,
      pagination.pageSize,
      pagination.current,
      sorter.columnKey,
      direction,
      keyWordsValue.current?.constructor === Object
        ? keyWordsValue.current
        : { keyWords: keyWordsValue.current },
    );
  };


  const callBackHandler = value => {
    setState({ columns: value });
  };
  const { columns, selectedRows, selectedRowKeys, fundPerformanceColumns } = state;
  //table组件
  const tableCom = columns => {
    return (
      <Table
        style={{ marginTop: 12 }}
        rowKey={'id'}
        loading={listLoading}
        dataSource={saveListFetch?.rows}
        columns={columns}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSize: pageSize.current,
          current: pageNum.current,
          total: saveListFetch?.total,
          showTotal: total => `共 ${total} 条数据`,
          pageSizeOptions: ['30', '50', '100', '300'],
        }}
        onChange={handlePaginationChange}
        scroll={{ x: false }}
        rowSelection={{
          //选中键值
          selectedRowKeys: selectedRowKeys,
          onChange: handleRowSelectChange,
        }}
      />
    );
  };

  return (
    <>
      <List
        pageCode="investmentCommittee"
        pageContainerProps={{
          breadcrumb: [{ title: '基本信息管理', url: '' },{ title: '投委会管理', url: '' }]
        }}
        dynamicHeaderCallback={callBackHandler}
        columns={columns}
        taskTypeCode={publicTas}
        formItemData={formItemData}
        advancSearch={advancSearch}
        resetFn={handleReset}
        searchPlaceholder="请输入"
        fuzzySearch={blurSearch}
        loading={listLoading}
        tabs={{
          tabList: [
            { key: 'T001_1', tab: '投委会设置' },
            { key: 'T001_2', tab: '基金类型设置' },
          ],
          activeTabKey: publicTas,
          onTabChange: handleTabsChanges,
        }}
        // title={urlParam.current.title}
        extra={<>
          {state.publicTas === 'T001_2' && <Button disabled={selectedRows.length <= 1} onClick={moreEdit}>批量设置</Button>}
          {/* <SynchType/> */}
          {/* <Button type="primary"  onClick={() => {handleAdd()}}>新增</Button>
          <ImportData data={props} method={'POST'}
                      url={'/ams/yss-contract-server/RpFund/excel/import'}
                      handleGetListFetch={()=>{handleGetListFetch(publicTas,pageSize.current, 1, '', '', {})}}
          />
          <ExportData data={props} selectedRows={selectedRows} method={'POST'}
                      url={'/ams/yss-contract-server/RpFund/export'}
          />
          <ExportAll data={props} url={'/ams/yss-contract-server/RpFund/exportExcelAll'}/>
          {templateDownload('/ams/yss-contract-server/RpOrgInfo/excel/downloadFile?fileName=基金业绩导入模板',
            '基金业绩导入模板.xlsx')} */}
        </>}
        tableList={
          <>
            {/* {tableCom(columns)} */}
            {state.publicTas === 'T001_2' ? tableCom(fundPerformanceColumns) : tableCom(columns)}
            {/*<MoreOperation/>*/}
            {/* {state.publicTas === 'T001_2' ? (
              <BatchOperation
                selectedRows={selectedRows}
                DeleteFun={handleCanDelete}
                checking={checking}
                antiChecking={antiChecking}
              />
            ) : (
              ''
            )} */}
          </>
        }
      />
      <Modal
        title="投委会设置"
        width='80%'
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        destroyOnClose={true}
      >
        <Investment id={id} formType={formType} onClose={handleCancel} handleGetListFetch={handleGetListFetch}></Investment>
      </Modal>
      <Modal
        title="基金类型编辑"
        width='80%'
        open={modalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        destroyOnClose={true}
      >
        <Committee id={id} formType={formType} onClose={handleCancel} handleGetListFetch={handleGetListFetch} pageSize={pageSize.current} setMoreProCode={setMoreProCode} moreProCode={moreProCode}></Committee>
      </Modal>
    </>
  );
};
const WrappedIndexForm = errorBoundary(
  linkHoc()(
    connect(({ investmentCommittee, loading, publicModel: { publicTas } }) => ({
      investmentCommittee,
      publicTas,
      listLoading: loading.effects['investmentCommittee/handleListFetch'],
    }))(Index),
  ),
);
export default WrappedIndexForm;
