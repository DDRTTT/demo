//页面-招募说明书设置
import React, {useEffect, useRef} from 'react';
import {errorBoundary} from '@/layouts/ErrorBoundary';
import {connect, routerRedux} from 'dva';
import {Button, message, Modal,Cascader} from 'antd';
import {useRequest, useSetState} from "ahooks";
import router from 'umi/router';
import {linkHoc} from '@/utils/hocUtil'; //权限
import {
  BatchOperation,
  directionFun,
  getUrlParam,
  listcolor,
  tableRowConfig,
} from '@/pages/investorReview/func';
import {Table} from '@/components';
import List from '@/components/List';
import ExportData from '@/components/ExportData'
import ExportAll from "@/components/ExportAll";
import HandleAdd from "./HandleAdd";
import request from "@/utils/request";

const Index = (props)=>{
  const {
    fnLink,publicTas,//T001_1
    prospectusConfigIndex: {
      saveListFetch,
      saveSearch,
      getOrgNameInfo,
      queryInfoByList,
      rpOrgProperty,
    },
    dispatch, listLoading}=props
  let urlParam=useRef(getUrlParam())
  urlParam.current.title='招募说明书设置'
  const pageNum=useRef(1)
  const pageSize=useRef(30)

  //
  // async function queryProjectNotice() {
  //   return request(`/ams-file-service/template/queryAllSettingTemplate`, {
  //     method: 'POST',
  //     data: {
  //       publicTas,
  //       pageSize:pageSize.current,
  //       currentPage:pageNum.current,
  //       field:state.field,
  //       direction:state.direction,
  //       templateType:1
  //     },
  //   });
  // }
  //
  // const { loading, data,error } = useRequest(queryProjectNotice);
  // console.log(loading)
  // console.log(data)
  // console.log(error)

  const [state, setState] = useSetState({
    selectedRows:'',
    selectedRowKeys:'',
    tabData:[],//当前主页tab列表数据
    publicTas:publicTas,//tab切换信息
    field:"",// 排序依据
    direction:'',// 排序方式
    saveListFetchData:[],//获取到的表格数据
    columns:[//列表表头
      {
        title: '招募说明书名称',
        key: 'recruitmentName',
        dataIndex: 'recruitmentName',
        ...tableRowConfig,
        width: 256,
      },
      {
        title: '产品名称',
        key: 'proName',
        dataIndex: 'proName',
        ...tableRowConfig,
        width: 256,
      },
      {
        title: '产品代码',
        dataIndex: 'productCode',
        key: 'productCode',
        ...tableRowConfig,
        sorter: true,
      },
      {
        title: '最后修改时间',
        dataIndex: 'lastEditTime',
        key: 'lastEditTime',
        ...tableRowConfig,
      },
      {
        title: '最后修改人',
        dataIndex: 'lastEditorName',
        key: 'lastEditorName',
        ...tableRowConfig,
      },
      {
        title: '数据来源',
        dataIndex: 'dataFrom',
        key: 'dataFrom',
        ...tableRowConfig,
      },
      {
        title: '审核状态',
        dataIndex: 'checkedName',
        key: 'checkedName',
        ...listcolor,
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        fixed: 'right',
        align: 'center',
        width: 220,
        render: (text, record) => {
          return (<>
            <Button type="link" size="small" onClick={() => view(record)}>查看</Button>
            {record.checkedId==='D001_1'? <Button type="link" size="small" onClick={() => edit(record)}>修改</Button>:''}
            {record.checkedId==='D001_1'?<Button type="link" size="small"   onClick={() => handleCanDelete(record)}>删除</Button>:''}
            {record.checkedId==='D001_1'?<Button type="link" size="small" onClick={() => checking(record)}>审核</Button>:''}
            {record.checkedId==='D001_2'? <Button type="link" size="small" onClick={() => antiChecking(record)}>反审核</Button>:''}
          </>);
        },
      }
    ],
  })
  let formItemData=[//高级搜索
    {
      name: 'recruitmentName',
      label: '招募书名称',
      type: 'input',
    },
    {
      name: 'proName',
      label: '产品名称',
      type: 'select',
      readSet: {name: 'proName', code: 'proName'},
      config: {mode: 'multiple'},
      option: saveSearch,
    },
    {
      name: 'proCode',
      label: '产品代码',
      type: 'select',
      readSet: {name: 'proCode', code: 'proCode'},
      config: {mode: 'multiple'},
      option: saveSearch,
    },
  ]
  useEffect(() => {
    //主页面数据
    handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction,{});
    //高级搜索下拉数据
    handleGetSelectOptions('TAmsProduct')
  }, []);
  //查看
  const view = (record) => {
    sessionStorage.setItem('_templateParams', JSON.stringify(record));
    router.push(`/contract/prospectusConfig/view?title=${urlParam.current.title}`); // 需要taskId
  };
  //修改
  const edit = (record, index) => {
    sessionStorage.setItem('_templateParams', JSON.stringify(record));
    sessionStorage.setItem('_status', '_isUpdate');
    router.push(`/contract/prospectusConfig/edit?title=${urlParam.current.title}`); // 需要taskId
  }
  // 修改
  const handleCanUpdate = record => {
    // sessionStorage.setItem('accountParameterAccountType', state.accountType);
    dispatch(
      routerRedux.push({
        pathname: `/dynamicPage/pages/产品相关服务机构/4028e9c17f76cf7c017ffd449350001b/修改?id=${record.id}&secondary=true`,
      }),
    );
  };
  // 删除
  const handleCanDelete = record => {
    let id=[]
    if(Array.isArray(record)){
      record.forEach((v)=>{id.push(v.id)})
    }else {id=[record.id]}
    Modal.confirm({
      title: '请确认是否删除?',okText: '确认',cancelText: '取消',
      onOk: () => {
        request(`/ams-file-service/businessArchive/deleteFile`,
          {method:'POST',data: [...id],
          }).then(r=>{r.status===200?(message.success('操作成功'),
            setState({selectedRows:[],selectedRowKeys:[]}),
            handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction, keyWordsValue.current))
          :message.error(`操作失败${r.status}`)
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
    request(`/ams-file-service/template/checked`,
      {method:'POST',data: {'id':id},
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
    request(`/ams-file-service/template/unChecked`,
      {method:'POST',data: {'id':id},
      }).then(r=>{r.status===200?(message.success('操作成功'),
        setState({selectedRows:[],selectedRowKeys:[]}),
        handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction, keyWordsValue.current))
      :message.error(`操作失败${r.status}`)
    });
  }
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
  const handleGetListFetch = ( publicTas,Size,Num,field,direction,formData) => {
    dispatch({
      type: 'prospectusConfigIndex/handleListFetch',
      payload: {
        publicTas,
        pageSize:Size,
        currentPage:Num,
        field,
        direction,
        ...formData,
        templateType:1
      },
      val:{url:`/ams-file-service/template/queryAllSettingTemplate`,method:'POST',},
      callback: (res) => {
        if(res && res.status === 200){
          setState({saveListFetchData:saveListFetch})
        }else {
          message.error(res.message)
        }
      }
    });
  };
  // 请求:获取表单下拉选项
  const handleGetSelectOptions = (value) => {
     dispatch({//产品名称
      type: 'prospectusConfigIndex/handleSearch',
      payload: { coreModule:value },
      val:{url:`/yss-contract-server/RpProduct/queryProductInfo`,method:'GET',},
    });
  };
  //查询
  const blurSearch = formData => {
    pageNum.current=1
    keyWordsValue.current = formData;
    handleGetListFetch(publicTas, pageSize.current, pageNum.current, state.field, state.direction,{keyWords:keyWordsValue.current});
  };
  // 高级查询
  function advancSearch(formData){
    pageNum.current=1
    keyWordsValue.current = formData;
    handleGetListFetch(publicTas, pageSize.current, pageNum.current, state.field, state.direction, keyWordsValue.current);
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
        pageSizeOptions:['30','50','100','300']
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
      <List pageCode="productServiceOrganizations"
            // pageContainerProps={{
            //   breadcrumb: [{ title: '招募说明书', url: '' },{ title: '招募说明书设置', url: '' }]
            // }}
            showSearch={true}
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
            title={`招募说明书设置`}
            extra={<>
              <HandleAdd />
              <ExportData data={props} selectedRowKeys={selectedRowKeys} selectedRows={selectedRows}
                          url={'/ams/ams-file-service/template/batchExportNew'}
              />
              <ExportAll data={props} url={'/ams/ams-file-service/template/batchExportAllNew?type=1'}/>
            </>}
            tableList={
              <>
                {tableCom(columns)}
                {/*{publicTas === 'T001_3' ? <> {tableCom(state.columns)} </>:''}*/}
                {/*<MoreOperation/>*/}
                <BatchOperation selectedRows={selectedRows} DeleteFun={handleCanDelete}
                                checking={checking} antiChecking={antiChecking}
                />
              </>}
      />
    </>
  )
}
const WrappedIndexForm = errorBoundary(
  linkHoc()(
      connect(({ prospectusConfigIndex, loading, publicModel: { publicTas } }) => ({
        prospectusConfigIndex,
        publicTas,
        listLoading: loading.effects['prospectusConfigIndex/handleListFetch'],
      }))(Index),
  ),
);
export default WrappedIndexForm;
