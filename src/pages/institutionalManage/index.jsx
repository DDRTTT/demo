//页面-机构管理
import React, {useEffect, useRef} from 'react';
import {errorBoundary} from '@/layouts/ErrorBoundary';
import {connect, routerRedux} from 'dva';
import router from 'umi/router';
import {Button, Form, message, Modal} from 'antd';
import {linkHoc} from '@/utils/hocUtil'; //权限
import {
  BatchOperation,
  directionFun, getUrlParam,
  listcolor,
  tableRowConfig,
  templateDownload,
} from '@/pages/investorReview/func';
import {Table} from '@/components';
import List from '@/components/List';
import {useSetState} from "ahooks";
import ImportData from '@/components/ImportData'
import ExportData from '@/components/ExportData'
import ExportAll from "@/components/ExportAll";
import request from "@/utils/request";

const Index = (props)=>{
  const {
    fnLink,publicTas,//T001_1
    institutionalManage: {
      saveListFetch,
      saveSearch,
      getOrgNameInfo,
    }
    ,dispatch, listLoading,}=props
  let urlParam=useRef(getUrlParam())
  urlParam.current.title='机构管理'
  const pageNum=useRef(1)
  const pageSize=useRef(30)
  const [state, setState] = useSetState({
    pageNum:1,
    pageSize:10,
    selectedRows:'',
    selectedRowKeys:'',
    tabData:[],//当前主页tab列表数据
    publicTas:publicTas,//tab切换信息
    field:"",// 排序依据
    direction:'',// 排序方式
    saveListFetchData:[],//获取到的表格数据
    columns:[//列表表头
      {
        title: '机构名称',
        key: 'orgName',
        dataIndex: 'orgName',
        ...tableRowConfig,
        width: 256,
      },
      {
        title: '机构类型',
        dataIndex: 'orgTypeName',
        key: 'orgTypeName',
        ...listcolor,
      },
      {
        title: '机构性质',
        dataIndex: 'orgPropertyName',
        key: 'orgPropertyName',
        ...tableRowConfig,
      },
      {
        title: '审核状态',
        dataIndex: 'checkedName',
        key: 'checkedName',
        ...listcolor,
        align: 'center',
      },
      {
        title: '最后修改时间',
        dataIndex: 'lastEditTime',
        key: 'lastEditTime',
        ...tableRowConfig,
        sorter: true,
      },
      {
        title: '最后修改人',
        dataIndex: 'lastEditorName',
        key: 'lastEditorName',
        ...tableRowConfig,
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        fixed: 'right',
        align: 'center',
        width: 280,
        render: (text, record) => {
          return (
            <>
              <Button type="link" size="small" onClick={() => handleCanCheck(record)}>查看</Button>
              {record.checked==='D001_1'?<Button type="link" size="small" onClick={() => handleCanUpdate(record)}>修改</Button>:''}
              {record.checked==='D001_1'?<Button type="link" size="small"   onClick={() => handleCanDelete(record)}>删除</Button>:''}
              {record.checked==='D001_1'?<Button type="link" size="small" onClick={() => checking(record)}>审核</Button>:''}
              {record.checked==='D001_2'? <Button type="link" size="small" onClick={() => antiChecking(record)}>反审核</Button>:''}
              <Button type="link" size="small" onClick={() => handleText(record)}>机构信息</Button>
            </>
          );
        },
      }
    ],
  })
  let formItemData=[//高级搜索
    {
      name: 'orgName',
      label: '机构名称',
      type: 'select',
      readSet: {name: 'name', code: 'name'},
      config: {mode: 'multiple'},
      option: getOrgNameInfo,
    },
    {
      name: 'orgType',
      label: '机构类型',
      type: 'select',
      readSet: {name: 'name', code: 'code'},
      config: {mode: 'multiple'},
      option: saveSearch?.rpOrgType,
    },
  ]
  useEffect(() => {
    //主页面数据
    handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction, {});
    //高级搜索下拉数据
    handleGetSelectOptions('rpOrgType')
  }, []);

  // 查看
  const handleCanCheck = record => {
    router.push({
      pathname:`/contract/institutionalManage/form`,
      query: {
        id:record.id,
        title:`查看-${urlParam.current.title}`,
        formType:true,
      }
    })
  }
  // 新增
  const handleAdd = (record) => {
    router.push({
      pathname:`/contract/institutionalManage/form`,
      query: {title:`新增-${urlParam.current.title}`}
    })
  };
  // 修改
  const handleCanUpdate = record => {
    router.push({
      pathname:`/contract/institutionalManage/form`,
      query: {
        id:record.id,title:`修改-${urlParam.current.title}`
      }
    })
  };
  // 删除
  const handleCanDelete = record => {
    let id=[];
    if(Array.isArray(record)){
      if(record.some(item=>{return item.checked == 'D001_2'})) {
        return message.warning('选择产品中含有已审核的产品，请重新选择');
      }
      record.forEach((v)=>{id.push(v.id)})
    }else {id=[record.id]}
    Modal.confirm({
      title: '请确认是否删除?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'institutionalManage/handleDelete',
          payload: {'ids':id},
          val:{url:`/yss-contract-server/RpOrg/deleteByIds`,method:'POST',},
        }).then(()=>{
          setState({selectedRows:[],selectedRowKeys:[]})
          handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction, keyWordsValue.current)
        })
      },
    });
  };
  //审核
  const checking = async (record) => {
    let id=[]
    if(Array.isArray(record)){
      record.forEach((v)=>{id.push(v.id)})
    }else {id=[record.id]}
    request(`/yss-contract-server/RpOrg/isCheck`,
      {method:'POST',data: {'ids':id,checked:'D001_2'},
      }).then(r=>{r.status===200?(message.success('操作成功'),
        setState({selectedRows:[],selectedRowKeys:[]}),
        handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction, keyWordsValue.current))
      :message.error(`操作失败${r.status}`)
    });
  }
  //反审核
  const antiChecking = async (record) => {
    let id=[]
    if(Array.isArray(record)){
      record.forEach((v)=>{id.push(v.id)})
    }else {id=[record.id]}
    request(`/yss-contract-server/RpOrg/isCheck`,
      {method:'POST',data: {'ids':id,checked:'D001_1'},
      }).then(r=>{r.status===200?(message.success('操作成功'),
        setState({selectedRows:[],selectedRowKeys:[]}),
        handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction, keyWordsValue.current))
      :message.error(`操作失败${r.status}`)
    });
  }
  //机构信息
  const handleText = record => {
    dispatch(
      routerRedux.push({
        pathname: `/contract/institutionalManage/organizationInformation`,
        query: { ...record },
      }),
    );
  }
  //搜索参数集合
  const keyWordsValue = useRef('');
  /**
   * 发起请求 列表（搜索）
   * @method  handleGetListFetch
   * @return {Object}
   * @param publicTas {string} 任务类型
   * @param field  {string} 排序字段
   * @param direction  {string} 排序方式
   * @param formData {Object} 表单项
   */
  const handleGetListFetch = ( publicTas,Size,Num,field,direction,formData,) => {
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
    dispatch({
      type: 'institutionalManage/handleListFetch',
      payload: {
        publicTas,
        pageSize:Size,
        pageNum:Num,
        field,
        direction,
        ...formData
      },
      val:{url:`/yss-contract-server/RpOrg/queryByPage`,method:'POST',},
      callback: (res) => {
        if(res && res.status === 200){
          setState({saveListFetchData:saveListFetch,selectedRows:[],selectedRowKeys:[]})
        }else {
          message.error(res.message)
        }
      }
    });
  };
  // 请求:获取表单下拉选项
  const handleGetSelectOptions = (value) => {
    dispatch({
      type: 'institutionalManage/getOrgNameInfoV',
      payload: { codeList:value },
      val:{url:`/yss-contract-server/RpOrg/getOrgNameInfo`,method:'GET',},
    });
    dispatch({
      type: 'institutionalManage/handleSearch',
      payload: { codeList:value },
      val:{url:`/ams-base-parameter/datadict/queryInfoByList`,method:'GET',},
    });
  };
  //查询
  const blurSearch = formData => {
    sessionStorage.setItem('keyValueSearch', JSON.stringify({keyWords:formData}));
    setState({pageNum: 1,})
    keyWordsValue.current = formData;
    handleGetListFetch(publicTas, pageSize.current,1, state.field, state.direction,{keyWords:keyWordsValue.current});
  };
  // 高级查询
  function advancSearch(formData){
    sessionStorage.setItem('keyValueSearch', JSON.stringify(formData));
    setState({pageNum: 1,})
    keyWordsValue.current = formData;
    handleGetListFetch(publicTas, pageSize.current, 1, state.field, state.direction, formData);
  }

  // 高级重置
  const handleReset = () => {
    setState({
      pageNum:1,
      selectedRows:[],
      selectedRowKeys:[],
    })
    keyWordsValue.current = '';
    handleGetListFetch(publicTas, pageSize.current, 1, '', '', {});
  };
  //* table 回调
  const handleTabsChanges = key => {
    dispatch({type: 'publicModel/setPublicTas',payload: key,});
    setState({publicTas: key})
    handleReset();
  };

  //选中键值
  const  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    setState({selectedRows:selectedRows,selectedRowKeys: selectedRowKeys})
    console.log(state.selectedRows)
  };
  //分页回调
  const handlePaginationChange = (pagination, filters, sorter, extra) => {
    let direction=directionFun(sorter?.order)
    setState({
      pageNum:pagination.current,
      pageSize: pagination.pageSize,
      field:sorter.columnKey,
      direction:direction
    })
    pageSize.current=pagination.pageSize
    pageNum.current=pagination.current
    sessionStorage.setItem('sessionPageNum', pagination.current);
    handleGetListFetch(
      publicTas,
      pagination.pageSize,
      pagination.current,
      sorter.columnKey,
      direction,
      keyWordsValue.current?.constructor=== Object?
        keyWordsValue.current:
        {keyWords:keyWordsValue.current}
    );
  };

  const callBackHandler = value => {setState({columns:value})};
  const {columns,selectedRows,selectedRowKeys}=state
  //table组件
  const tableCom = (columns) => {
    return (<Table
      rowKey={'id'}
      loading={listLoading}
      dataSource={saveListFetch?.rows}
      columns={columns}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        pageSize:pageSize.current,
        current: pageNum.current,
        total: saveListFetch?.total,
        showTotal: total => `共 ${total} 条数据`,
        pageSizeOptions:['30','50','100','300'],
      }}
      onChange={handlePaginationChange}
      scroll={{ x: false }}
      rowSelection={{//选中键值
        selectedRowKeys:selectedRowKeys,
        onChange: handleRowSelectChange,
      }}
    />);
  };

  return(
    <>
      {/*{listLoading?<Loading/>:''}*/}
      {/*头部信息*/}
      <List pageCode="institutionalManage"
            // pageContainerProps={{
            //   breadcrumb: [{ title: '基本信息管理', url: '' },{ title: '机构管理', url: '' }]
            // }}
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
            // { key: 'T001_1', tab: '' },
            // { key: 'T001_3', tab: '我发起' },
            // { key: 'T001_4', tab: '未提交' },
            // { key: 'T001_5', tab: '已办理' },
          ],
          activeTabKey: publicTas,
          onTabChange: handleTabsChanges,
        }}
        title={'机构管理'}
        extra={<>
          <Button type="primary"  onClick={() => {handleAdd()}}>新增</Button>
          <ImportData data={props}
                      url={'/ams/yss-contract-server/RpOrgInfo/excel/import'}
                      handleGetListFetch={()=>{handleGetListFetch(publicTas,pageSize.current, 1, '', '', {})}}
          />
          <ExportData data={props} selectedRows={selectedRows}
                      url={'/ams/yss-contract-server/RpOrg/export'}
          />
          <ExportAll data={props} url={'/ams/yss-contract-server/RpOrg/exportExcelAll'}/>
          {templateDownload('/ams/yss-contract-server/RpOrgInfo/excel/downloadFile?fileName=机构信息导入模板','机构信息导入模板.xlsx')}
        </>}
        tableList={
          <>
            {tableCom(columns)}
            {/*{publicTas === 'T001_3' ? <> {tableCom(state.columns)} </>:''}*/}
            {/*{batchOperation(selectedRows,handleCanDelete)}*/}
            <BatchOperation selectedRows={selectedRows} DeleteFun={handleCanDelete}
                            checking={checking} antiChecking={antiChecking}
                            // action={{DeleteFun:'archiveTaskHandleList:treeNodeDelete',
                            // }}
            />
        </>}
      />
    </>
  )
}
const WrappedIndexForm = errorBoundary(
  linkHoc()(
      connect(({ institutionalManage, loading, publicModel: { publicTas } }) => ({
        institutionalManage,
        publicTas,
        listLoading: loading.effects['institutionalManage/handleListFetch'],
      }))(Index),
  ),
);

export default WrappedIndexForm;
