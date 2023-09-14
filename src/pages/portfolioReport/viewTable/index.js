//页面-投资组合报告 查看
import React, { useEffect, useRef, useState } from 'react';
import { errorBoundary } from '@/layouts/ErrorBoundary';
import {connect, routerRedux} from 'dva';
import {Button, message, Modal} from 'antd';
import {useSetState} from "ahooks";
import router from 'umi/router';
import Action, { linkHoc } from '@/utils/hocUtil';//权限
import {
  tableRowConfig,
  listcolor,//带色表格块
  // handleClearQuickJumperValue,
  directionFun,//升降序转换
  getUrlParam,//获取url参数
  BatchOperation,//批量操作
} from '@/pages/investorReview/func';
import { Table } from '@/components';
import List from '@/components/List';
import request from "@/utils/request";

const Index = (props)=>{
  const {
    fnLink,publicTas,//T001_1
    portfolioReport: {
      saveTotal,
    },dispatch, listLoading}=props
  let urlParam=useRef(getUrlParam())
  const [state, setState] = useSetState({
    accountType:'',
    pageNum:1,
    pageSize:20,
    selectedRows:'',
    selectedRowKeys:'',
    tabData:[],//当前主页tab列表数据
    publicTas:publicTas,//tab切换信息
    field:"",// 排序依据
    direction:'',// 排序方式
    saveListFetchData:[],//获取到的表格数据
    columns:[//列表表头
      {
        title: '项目',
        key: 'project',
        dataIndex: 'project',
        ...tableRowConfig,
        width: 256,
      },
      {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        ...tableRowConfig,
        // sorter: true,
      },
      {
        title: '占基金总资产的比例（%）',
        dataIndex: 'ratio',
        key: 'ratio',
        ...tableRowConfig,
        // sorter: true,
      },

    ],
  })
  useEffect(() => {
    //主页面数据
    handleGetListFetch(publicTas, state.pageSize, 1, state.field, state.direction,{reportId:urlParam.current.reportId,});
  }, []);


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
    dispatch({
      type: 'portfolioReport/handleListFetchTotal',
      payload: {
        publicTas,
        pageSize,
        pageNum,
        field,
        direction,
        ...formData,
      },
      val:{url:`/yss-contract-server/RpPortfolioReportDetail/queryByReportId`,method:'POST',},
      callback: (res) => {
        if(res && res.status === 200){
          setState({saveListFetchData:res?.data,selectedRows:[],selectedRowKeys:[]})
          // handleClearQuickJumperValue()
        }else {
          message.error(res.message)
        }
      }
    });
  };
  //分页回调
  const handlePaginationChange = (pagination, filters, sorter, extra) => {
    let direction=directionFun(sorter?.order)
    setState({
      // pageNum:pagination.current,
      // pageSize: pagination.pageSize,
      field:sorter.columnKey,
      direction:direction
    })
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
  const {columns,pageSize,pageNum,selectedRows,selectedRowKeys}=state
  //table组件
  const tableCom = (columns) => {
    return (<Table
      rowKey={'id'}
      // loading={listLoading}
      dataSource={saveTotal||''}
      columns={columns}
      // pagination={{
      //   showSizeChanger: true,
      //   showQuickJumper: true,
      //   pageSize:pageSize,
      //   current: pageNum,
      //   total: saveTotal?.total,
      //   showTotal: total => `共 ${total} 条数据`,
      // }}
      onChange={handlePaginationChange}
      pagination={false}
      // scroll={{ x: true }}
      // rowSelection={{//选中键值
      //   selectedRowKeys:selectedRowKeys,
      //   onChange: handleRowSelectChange,
      // }}
    />);
  };

  return(
    <>
      {/*{listLoading?<Loading/>:''}*/}
      <List pageCode="portfolioReportViewTable"
            pageContainerProps={{
              breadcrumb: [{ title: '基本信息管理', url: '' },{ title: '投资组合报告', url: '' },{ title: '查看', url: '' }]
            }}
            dynamicHeaderCallback={callBackHandler}
            columns={columns}
            taskTypeCode={publicTas}
            // formItemData={formItemData}
            // advancSearch={advancSearch}
            // resetFn={handleReset}
            // searchPlaceholder="请输入"
            // fuzzySearch={blurSearch}
            // searchInputWidth={false}
            fuzzySearchBool={true}
            searchType={true}
            // advancSearchBool={false}
            // showSearch={false}
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
            title={`${urlParam.current?.name}`}
            extra={''}
            tableList={
              <>
                {tableCom(columns)}
              </>}
      />
    </>
  )
}
const WrappedIndexForm = errorBoundary(
  linkHoc()(
      connect(({ portfolioReport, loading, publicModel: { publicTas } }) => ({
        portfolioReport,
        publicTas,
        listLoading: loading.effects['portfolioReport/handleListFetchTotal'],
      }))(Index),
  ),
);
export default WrappedIndexForm;
