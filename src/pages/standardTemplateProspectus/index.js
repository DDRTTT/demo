//页面-招募说明书标准模板
import React, { useEffect, useRef, useState } from 'react';
import { errorBoundary } from '@/layouts/ErrorBoundary';
import {connect, routerRedux} from 'dva';
import {Button, message, Modal, Tag, Dropdown, Menu, Upload} from 'antd';
import {useRequest, useSetState} from "ahooks";
import router from 'umi/router';
import Action, { linkHoc } from '@/utils/hocUtil';//权限
import { cloneDeep } from 'lodash';
import { stringify } from 'qs';
import {
  tableRowConfig,
  listcolor,//带色表格块
  // handleClearQuickJumperValue,
  removeSpaces, //对象去空格
  directionFun,//升降序转换
  templateDownload,//模板下载
  getUrlParam,//获取url参数
  BatchOperation,//批量操作
} from '@/pages/investorReview/func';
import { Table } from '@/components';
import List from '@/components/List';
import ImportData from '@/components/ImportData'
import ExportData from '@/components/ExportData'
import ExportAll from "@/components/ExportAll";
import request from "@/utils/request";
import {getAuthToken} from "@/utils/cookie";
import {download,actionDownload} from "@/utils/download";

const Index = (props)=>{
  const {
    fnLink,publicTas,//T001_1
    standardTemplateProspectus: {
      saveListFetch,
      saveSearch,
      getOrgNameInfo,
      rpOrgProperty,
    },
    dispatch, listLoading }=props
  let urlParam=useRef(getUrlParam())
  urlParam.current.title='招募说明书标准模板'

  const pageNum=useRef(1)
  const pageSize=useRef(10)
  const [state, setState] = useSetState({
    selectedRows:'',
    selectedRowKeys:'',
    tabData:[],//当前主页tab列表数据
    publicTas:publicTas,//tab切换信息
    field:"",// 排序依据
    direction:'',// 排序方式
    saveListFetchData:[],//获取到的表格数据
    uploadBtnLoading: false,//导入按钮loading
    columns:[//列表表头
      {
        title: '招募说明书名称',
        key: 'recruitmentName',
        dataIndex: 'recruitmentName',
        ...tableRowConfig,
        width: 256,
        fixed: 'left',
      },
      {
        title: '最新更新时间',
        dataIndex: 'lastEditTime',
        key: 'lastEditTime',
        ...tableRowConfig,
        sorter: true,
      },
      {
        title: '最新更新人',
        dataIndex: 'lastEditorName',
        key: 'lastEditorName',
        ...tableRowConfig,
        sorter: true,
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
        render: (text, record) => {
          return (<>
              <Button type="link" size="small" onClick={() => view(record)}>查看</Button>
              {record.checkedType==='D001_1'? <Button type="link" size="small" onClick={() => edit(record)}>修改</Button>:''}
              {record.checkedType==='D001_1'? <Button type="link" size="small"   onClick={() => handleCanDelete(record)}>删除</Button>:''}
              {record.checkedType==='D001_1'?<Button type="link" size="small" onClick={() => checking(record)}>审核</Button>:''}
              {record.checkedType==='D001_2'? <Button type="link" size="small" onClick={() => antiChecking(record)}>反审核</Button>:''}
              <Button size="small" type="link" onClick={() => dowloadDOC(record)}> 下载 </Button>
          </>);
        },
      }
    ],
  })
  useEffect(() => {
    //主页面数据
    handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction,{});

  }, []);


  // 查看
  const view = record => {
    sessionStorage.setItem('_templateParams', JSON.stringify(record));
    router.push(`/contract/prospectusConfig/view?title=${urlParam.current.title}`); // 需要taskId
  }
  // 新增
  const handleAdd = (record) => {
    return router.push(`/dynamicPage/pages/产品相关服务机构/4028e9c17f76cf7c017f8a55f1190004/新增?secondary=true`);
  };
  // 修改
  const edit = record => {
    sessionStorage.setItem('_templateParams', JSON.stringify(record));
    sessionStorage.setItem('_status', '_isUpdate');
    router.push(`/contract/prospectusConfig/edit?title=${urlParam.current.title}`); // 需要taskId
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
          {method:'POST',data: id,
          }).then(r=>{r.status===200?(message.success('操作成功'),
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
        handleGetListFetch(publicTas, pageSize.current,pageNum.current, state.field, state.direction, keyWordsValue.current))
      :message.error(`操作失败${r.status}`)
    });
  }
  //下载
  const dowloadDOC =async (record) => {
    await setState({dingGaoLoading: true})
    await request(`/ams-file-service/fileServer/downloadUploadFile?getFile=${record.fileSerialNumber}`,
      {method:'GET',responseType: 'blob',
        headers: {
          Token: getAuthToken() || '', //设置token
        },
      }).then(r=>{
        if(r){
          actionDownload(
            window.URL.createObjectURL(new Blob([r])),
            `${record.fileName}`,
          )
        }else {message.error(`操作失败${r.status}`)}
      }).then(
        setTimeout(()=>{
          setState({dingGaoLoading: false})
        },1000)
      )
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
      type: 'standardTemplateProspectus/handleListFetch',
      payload: {
        publicTas,
        pageSize:Size,
        pageNum:Num,
        field,
        direction,
        ...formData,
      },
      val:{url:`/ams-file-service/template/getStandardTemplate`,method:'GET',},
      callback: (res) => {
        if(res && res.status === 200){
          setState({saveListFetchData:saveListFetch})
          // handleClearQuickJumperValue()
        }else {
          message.error(res.message)
        }
      }
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
      keyWordsValue.current,
    );
  };

  const callBackHandler = value => {setState({columns:value})};
  const uploadChange = info => {
    console.log(info.file,info.fileList);
    // 导入模版
    if (info.file.status === 'uploading') {
      setState({uploadBtnLoading:true});
    }
    if (info.file.status === 'done') {
      if (info?.file?.response?.status === 200) {
        message.success(`${info.file.name} 导入成功`);
        // 获取文件路劲信息
        request(`/yss-contract-server/contractfile/getfilebycode?${stringify({code:info?.file?.response?.data})}`).then(res => {
          console.log(res);
          if (res.status === 200 ) {
            const formVals = {
              "ownershipInstitution": sessionStorage.getItem('USER_INFO')?JSON.parse(sessionStorage.getItem('USER_INFO'))['orgId'] : '',
              "templateName": res.data.fileName,
              "type": "docx",
              "isSmart": 1,
              "status": "upload",
              "templateType": 0,
              ...res.data,
            };
            jumpPage(formVals, 'upload');
          }
        });
        setState({uploadBtnLoading:false});
      } else {
        message.warn(info?.file?.response.message);
        setState({uploadBtnLoading:false});
      }
    }
    if (info.file.status === 'error') {
      message.warn(`${info.file.name} 导入失败，请稍后再试`);
      setState({uploadBtnLoading:false});
    }
  };
  const jumpPage = (item, status) => {
    item.status = status;
    sessionStorage.setItem('_status', status);
    sessionStorage.setItem('_templateParams', JSON.stringify(item));
    router.push(`/contract/prospectusConfig/edit?title=${urlParam.current.title}`);
  };
  const beforeUpload = file => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.warn('文件不能大于100M!');
    }
    return isLt100M;
  };
  const {columns,selectedRows,selectedRowKeys}=state;
  const uploadProps = {
    action: '/ams/ams-file-service/template/uploadFile',
    name: 'file',
    headers: {
      // Token: getAuthToken(),
    },
  };
  //table组件
  const tableCom = (columns) => {
    return (<Table
      rowKey={'id'}
      loading={listLoading}
      dataSource={saveListFetch ? [saveListFetch] : [] }
      columns={columns}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        pageSize:10,
        current: 1,
        // total: saveListFetch?.total,
        // showTotal: total => `共 ${total} 条数据`,
      }}
      onChange={handlePaginationChange}
      scroll={{ x: true }}
      // rowSelection={{//选中键值
      //   selectedRowKeys:selectedRowKeys,
      //   onChange: handleRowSelectChange,
      // }}
    />);
  };


  return(
    <>
      {/*{listLoading?<Loading/>:''}*/}
      <List pageCode="standardTemplateProspectus"
            pageContainerProps={{
              breadcrumb: [{ title: '招募说明书', url: '' },{ title:urlParam.current.title, url: '' }]
            }}
            dynamicHeaderCallback={callBackHandler}
            columns={columns}
            taskTypeCode={publicTas}
            // formItemData={formItemData}
            // advancSearch={advancSearch}
            // resetFn={handleReset}
            // searchPlaceholder="请输入"
            fuzzySearch={blurSearch}
            searchType={true}
            // loading={listLoading}
            tabs={{
              tabList: [
                // { key: 'T001_1', tab: '' },
                // { key: 'T001_3', tab: '我发起' },
                // { key: 'T001_4', tab: '未提交' },
                // { key: 'T001_5', tab: '已办理' },
              ],
              activeTabKey: publicTas,
              // onTabChange: handleTabsChanges,
            }}
            title={urlParam.current.title}
            extra={<>
            <Upload
              {...uploadProps}
              data={{
                uploadFilePath: `contractfile/orgTemplate`,
              }}
              accept=".docx"
              onChange={e => uploadChange(e)}
              beforeUpload={e => beforeUpload(e)}
              showUploadList={false}
            >
              <Button
                type="primary"
                loading={state.uploadBtnLoading}
              >
                导入模板
              </Button>
            </Upload>
              {/* <Button type="primary"  onClick={() => {handleAdd()}}>新增</Button> */}
              {/* <ExportData data={props} selectedRowKeys={selectedRowKeys} selectedRows={selectedRows}
                          url={'/ams/yss-contract-server/RpProductOrg/export'}
              />
              <ExportAll data={props} url={'/ams/yss-contract-server/RpProductOrg/exportExcelAll'}/> */}
            </>}
            tableList={
              <>
                {tableCom(columns)}
                {/*{publicTas === 'T001_3' ? <> {tableCom(state.columns)} </>:''}*/}
                {/*<MoreOperation/>*/}
                {/* <BatchOperation selectedRows={selectedRows} DeleteFun={handleCanDelete} checking={checking} antiChecking={antiChecking} /> */}
              </>}
      />
    </>
  )
}
const WrappedIndexForm = errorBoundary(
  linkHoc()(
    connect(({ standardTemplateProspectus, loading, publicModel: { publicTas } }) => ({
      standardTemplateProspectus,
      publicTas,
      listLoading: loading.effects['standardTemplateProspectus/handleListFetch'],
    }))(Index),
  ),
);
export default WrappedIndexForm;
