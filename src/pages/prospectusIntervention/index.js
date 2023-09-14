//页面-招募说明书干预
import React, {useEffect, useRef, useState} from 'react';
import {errorBoundary} from '@/layouts/ErrorBoundary';
import {connect} from 'dva';
import {Button, Form, message, Modal, Tooltip, Tag} from 'antd';
import {useSetState} from "ahooks";
import router from 'umi/router';
import {linkHoc} from '@/utils/hocUtil'; //权限
import {
  BatchOperation,
  directionFun,
  getUrlParam,
  listcolor,
  tableRowConfig,
  templateDownload,
} from '@/pages/investorReview/func';
import {Table} from '@/components';
import List from '@/components/List';
import ImportData from '@/components/ImportData'
import ExportData from '@/components/ExportData'
import ExportAll from "@/components/ExportAll";
import request from "@/utils/request";

const Index = (props)=>{
  const {
    fnLink,publicTas,//T001_1
    prospectusIntervention: {
      saveListFetch,
      saveSearch,
    },dispatch, listLoading}=props
  let urlParam=useRef(getUrlParam());
  urlParam.current.title='招募说明书干预'
  const pageNum=useRef(1)
  const pageSize=useRef(30)
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
        key: 'fileName',
        dataIndex: 'fileName',
        ...tableRowConfig,
        width: 256,
        ellipsis: false,
      },
      {
        title: '产品名称',
        dataIndex: 'proName',
        key: 'proName',
        ...tableRowConfig,
        ellipsis: false,
        width: 256,
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        ...tableRowConfig,
        width: 180,
      },
      {
        title: '财务时间',
        dataIndex: 'financialDate',
        key: 'financialDate',
        ...tableRowConfig,
        width: 120,
      },
      {
        title: '截至时间',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        ...tableRowConfig,
        width: 120,
      },
      {
        title: '披露日期',
        dataIndex: 'disclosureDate',
        key: 'disclosureDate',
        ...tableRowConfig,
        width: 120,
      },
      {
        title: '更新类型',
        dataIndex: 'updateType',
        key: 'updateType',
        width: 100,
        render: (updateType) => {
          return (
            <span>{updateType === '0'? '全部更新': '临时更新'}</span>
          )
        }
      },
      {
        title: '批次号',
        dataIndex: 'batchNumber',
        key: 'batchNumber',
        width: 80,
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        width: 80,
        render: (value)=>{
          let color
          let text
          if (value == 1) text = '进行中' ;
          if (value == 2) text = '待定稿';
          if (value == 3) { color = 'green'; text = '已完成' };
          return (
            <Tooltip title={text} key={value} placement="topLeft" >
                <Tag color={color||''} style={{margin:'2px'}}>
                  {text||'-'}
                </Tag>
              </Tooltip>
          )
        }
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
          {/* <Button type="link" size="small" onClick={() => handleEdit(record)}>修改文档</Button> */}
          {record.updateType == '1' && <Button type="link" size="small" onClick={() => handleAddTags(record)}>新增标签</Button>}
          {record.updateType == '1' && <Button type="link" size="small"   onClick={() => handleAddPositions(record)}>新增岗位</Button>}
          {record.updateType == '0' && <Tag>该流程为全部更新，无需干预</Tag>}
          </>);
        },
      }
    ],
  })
  let formItemData=[//高级搜索
    {
      name: 'fileName',
      label: '招募书名称',
      type: 'input',
      // readSet: {name: 'proName', code: 'proCode'},
      // config: {mode: 'multiple'},
      // option: saveSearch,
    },{
      name: 'proCode',
      label: '产品名称',
      type: 'select',
      readSet: {name: 'proName', code: 'proCode'},
      config: {mode: 'multiple'},
      option: saveSearch,
    },
  ]
  useEffect(() => {
    handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction,{});
    //高级搜索下拉数据
    handleGetSelectOptions()
    return () => {}
  }, []);

  const handleAddTags = record => {
    if (record?.fileSerialNumber) {
      router.push({
        pathname: 'prospectusIntervention/form',
        state: {...record},
      })
    } else {
      message.warning('该条流程还未办理，请移至办理页面进行办理后再试')
    }
    
  }
  const handleAddPositions = record => {
    if (record.taskName.includes('统稿')) {
      Modal.confirm({
        title:'系统提示',
        content: '该流程已到统稿人归档，该操作会造成流程回退，是否继续？',
        onOk:()=>{
          router.push({
            pathname: 'prospectusIntervention/formPositions',
            state: {...record},
            query:{type:'back'}
          })
        },
        onCancel:()=>{}
      });
      return
    }
    if (record?.fileSerialNumber) {
      router.push({
        pathname: 'prospectusIntervention/formPositions',
        state: {...record},
      })
    } else {
      message.warning('该条流程还未办理，请移至办理页面进行办理后再试')
    }
  }
  //审核
  const checking = async (record) => {
    let id=[]
    if(Array.isArray(record)){
      record.forEach((v)=>{id.push(v.id)})
    }else {id=[record.id]}
    request(`/yss-contract-server/RpFund/isCheck`,
      {method:'POST',data: {'ids':id,checked:'D001_2'},
      }).then(r=>{r.status===200?(message.success('操作成功'),
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
    request(`/yss-contract-server/RpFund/isCheck`,
      {method:'POST',data: {'ids':id,checked:'D001_1'},
      }).then(r=>{r.status===200?(message.success('操作成功'),
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
  const handleGetListFetch = ( publicTas,pageSize,pageNum,field,direction,formData) => {
    const reqBody = [
      {code: 'proCodeList', value: formData?.proCode ? formData?.proCode.join() : ''},
      {code: 'fileName', value: formData.fileName || ''},
      {code: 'keyWords', value: formData?.keyWords || ''}
    ];
    dispatch({
      type: 'prospectusIntervention/handleListFetch',
      payload: {
        
        contentType: 2,
        linkId: "a878187fa60744f895b58fd979194864",
        methodName: "POST",
        path: "/ams/yss-contract-server/businessArchive/getBusinessArchiveListProcessInfo?coreModule=TContractBusinessArchive",
        queryParams: [
          {
            code: "taskType",
            value: 'T001_1'
          },
          {
            code: "processId",
            value: "c054d6d3b36b4dfc84965064169f59c5"
          },
          {
            code: "pageNum",
            value: pageNum
          },
          {
            code: "pageSize",
            value: pageSize
          },
          ...reqBody,
        ]
      },
      val:{url:`/api/amc-datalink-server/data-view/query/http`,method:'POST',},
      callback: (res) => {
        if(res && res.status === 200){
          setState({saveListFetchData:saveListFetch,selectedRows:[],selectedRowKeys:[]})
        }else {
          message.error(res.message);
        }
      }
    });
  };
  // 请求:获取表单下拉选项
  const handleGetSelectOptions = (value) => {
    // 'CS021' 参数类型 / 'S001' 状态 / 'A002' 产品类型
    dispatch({
      type: 'prospectusIntervention/handleSearch',
      payload: { coreModule:value||'' },
      val:{url:`/yss-contract-server/RpProduct/queryAllByCondition`,method:'POST',},
    });
  };
  //查询
  const blurSearch = formData => {
    sessionStorage.removeItem('keyValueSearch');
    setState({pageNum: 1,});
    sessionStorage.setItem('keyValueSearch', JSON.stringify({keyWords:formData}));
    keyWordsValue.current = formData;
    handleGetListFetch(publicTas, pageSize.current, 1, state.field, state.direction, {keyWords:keyWordsValue.current});
  };
  // 高级查询
  function advancSearch(formData){
    sessionStorage.removeItem('keyValueSearch');
    setState({pageNum: 1,});
    // const reqBody = {
    //   proName: [],
    //   proCode: [],
    // }
    // formData.proName?.forEach(ele => {
    //   reqBody.proName.push(ele.title);
    // });
    // formData.proCode?.forEach(element => {
    //   reqBody.proCode.push(element.title)
    // })
    // console.log(window.location.query);
    sessionStorage.setItem('keyValueSearch', JSON.stringify(formData));
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
    sessionStorage.removeItem('keyValueSearch');
    handleGetListFetch(publicTas, pageSize.current, 1, '', '', {});
  };
  //* table 回调
  const handleTabsChanges = key => {
     ({type: 'publicModel/setPublicTas',payload: key,});
    setState({publicTas: key})
    handleReset();
  };

  //选中键值
  const  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    setState({selectedRows:selectedRows,selectedRowKeys: selectedRowKeys})
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
  //同步基金业绩信息
  function SynchType(props){
     const [loading,setLoading]=useState(false)
      async function onOk(value){
        await setLoading(true)
        await request(`/yss-contract-server/RpFund/xbPull`,{method:'GET'})
          .then(r=>{
            r.status===200?(message.success('操作成功'),handleReset())
              :message.error(`操作失败:${r.message||r.status}`)
          })
        await setLoading(false)
      }
    return<>
      <Button loading={loading} onClick={() => {onOk()}}>同步基金业绩信息</Button>
    </>
  }

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
      <List pageCode="prospectusIntervention"
            pageContainerProps={{
              breadcrumb: [{ title: '招募说明书', url: '' },{ title: '招募说明书干预', url: '' }]
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
                // { key: 'T001_1', tab: '' },
                // { key: 'T001_3', tab: '我发起' },
                // { key: 'T001_4', tab: '未提交' },
                // { key: 'T001_5', tab: '已办理' },
              ],
              activeTabKey: publicTas,
              onTabChange: handleTabsChanges,
            }}
            title={urlParam.current.title}
            extra={<>
              {/* <SynchType/>
              <Button type="primary"  onClick={() => {handleAdd()}}>新增</Button>
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
                {tableCom(columns)}
                {/*{publicTas === 'T001_3' ? <> {tableCom(state.columns)} </>:''}*/}
                {/*<MoreOperation/>*/}
                {/* <BatchOperation selectedRows={selectedRows} DeleteFun={handleCanDelete}
                                checking={checking} antiChecking={antiChecking} 
                                // action={{DeleteFun:'archiveTaskHandleList:treeNodeDelete',
                                //   checking:'archiveTaskHandleList:treeNodeDelete',
                                //   antiChecking:'archiveTaskHandleList:treeNodeDelete'
                                // }}
                />*/}
              </>}
      />
    </>
  )
}
const WrappedIndexForm = errorBoundary(
  linkHoc()(
    connect(({ prospectusIntervention, loading, publicModel: { publicTas } }) => ({
      prospectusIntervention,
      publicTas,
      listLoading: loading.effects['prospectusIntervention/handleListFetch'],
    }))(Index),
  ),
);
export default WrappedIndexForm;
