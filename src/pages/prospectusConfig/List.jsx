import React, {useEffect, useState} from 'react';
import {Button, Tabs} from 'antd';
import {router} from 'umi';
// 公共组件
import CommonTable from "@/components/CommonTable";
import styles from './List.less';

import ColBtn from "@/components/ColBtn";


import resetModalManagement from "@/pages/resetModalManagement.config";

const { path } = resetModalManagement.contractDeal;

const { TabPane } = Tabs;

// 流程库指引
const List = props => {
  const { getData, deleteData, pageInfo, changeCreateStatus, listData, listLoading, getNodeData } = props;
  const { pageCode, contentType, linkId, coreModule } = pageInfo;
  const [filterStatus, setFilterStatus] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1)
  const [total, setTotal] = useState(0)

  // table
  const [dataSource, setDataSource] = useState({
    rows: [],
    pageSize,
    pageNum:current,
    total: 0});

  useEffect(() => {
    setDataSource({
      rows: listData.rows || [],
      pageSize,
      pageNum:current,
      total: listData.total || 0,
    });
  }, [listData]);

  useEffect(() => {
       getDatasource();
  }, [pageSize, current]);

  const view = (record) => {
    sessionStorage.setItem('_templateParams', JSON.stringify(record));
      router.push(`/prospectus/prospectusConfig/view`); // 需要taskId
  };

  const edit = (record, index) => {
    // store变化
    sessionStorage.setItem('_templateParams', JSON.stringify(record));
    sessionStorage.setItem('_status', '_isUpdate');
    router.push(`/prospectus/prospectusConfig/edit`); // 需要taskId
  }

  const pageColumns = [
    {
      title: "序号",
      sort: 1,
      dataIndex: "seq",
      width: 60,
      textAlign: 'center'
    },
    {
      title: "招募说明书名称",
      sort: 2,
      dataIndex: "recruitmentName",
      minWidth: 150,
      ellipsis: true
    },
    {
      title: "产品名称",
      sort: 3,
      dataIndex: "proName",
      minWidth: 150,
    },
    {
      title: "产品代码",
      sort: 4,
      width: 120,
      dataIndex: "productCode",
      ellipsis: true
    },
    {
      title: "最新更新时间",
      sort: 5,
      width: 120,
      dataIndex: "lastEditTime",
      ellipsis: true
    },
    {
      title: "最新更新人",
      sort: 6,
      width: 120,
      dataIndex: "lastEditorId",
      ellipsis: true
    },
    {
      title: "数据来源",
      sort: 6,
      width: 120,
      dataIndex: "dataFrom",
      ellipsis: true
    },
    {
      title: "状态",
      sort: 10,
      width: 80,
      dataIndex: "checked",
      ellipsis: true,
      render: (value)=>{
        return (
          <span>{value === 1 ? '已审核' : '未审核'}</span>
        )
      }
    },
    {
      title: "操作",
      sort: 11,
      dataIndex: "action",
      width: 300,
      render: (text, record, index)=>{
        const popConfig = {
          placement: "topLeft",
          cancelText: "取消"
        }
        const checked = record.checked === 1;
        return (
          <span style={{whiteSpace: 'nowrap'}}>
            <ColBtn text="查看" onClick={() => view(record)}></ColBtn>
            <ColBtn text="修改" disabled={checked} onClick={() => edit(record)}></ColBtn>
            <ColBtn text="删除" disabled={checked}
                    popConfig={{...popConfig, title: '确定要删除么？',okText: "删除",  onConfirm: (e)=>deleteItem(record, index)}}></ColBtn>
            <ColBtn text="审核" disabled={checked}
                    popConfig={{...popConfig, title: '确定要执行审核操作么？',okText: "确定",  onConfirm: (e)=>deleteItem(record, index)}}></ColBtn>
            <ColBtn text="反审核" disabled={!checked}
                    popConfig={{...popConfig, title: '确定要执行反审核操作么？',okText: "确定",  onConfirm: (e)=>deleteItem(record, index)}}></ColBtn>
            <ColBtn text="下载" onClick={() => view(record)}></ColBtn>
          </span>
        )
      }
    }
  ];

  const deleteItem = (record)=>{
    const { linkId,contentType } = pageInfo;
    const data = {
      payload :{
        linkId,
        contentType,
        path: "/ams/yss-contract-server/businessArchive/deleteOne",
        methodName: "GET",
        queryParams: [
          {
            code: "contractId",
            value: record.id
          }
        ]
      },
      cb: getDatasource
    };
    deleteData(data)
  };

  const handleSubmit = data => {
    const params = data instanceof Array ? [...data] : [data]
    setCurrent(1);
    getDatasource(params);
  };

  const rowSelection = {
    // onChange: (selectedRowKeys, selectedRows) => {
    // },
    // getCheckboxProps: record => ({
    //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
    //   name: record.name,
    // }),
  };

  const onChange = (pageNumber) => {
    setCurrent(pageNumber);
    // getDatasource();
  }

  const onShowSizeChange = (val)=>{
    setPageSize(val);
    setCurrent(1);
    // getDatasource();
  };

  const pagination = {
    showQuickJumper: true,
    onChange: onChange,
    onShowSizeChange: onShowSizeChange
  };


  const getDatasource = params => {
    const data = {
      currentPage: 1,
      pageSize: 10,
      proCode: "",
      templateType: 1
    };
    if(params){
      // 这里太糙了，需要重写

    }

    getData({
      payload: data
    });
  };

  const output = ()=>{};
  const addNew = ()=>{
    router.push('/processFlow/addTmp');
  };
  const approval = ()=>{};

  return (
    <div className={styles.processListContainer}>
      <div style={{float: 'right', lineHeight: '48px'}}>
        <Button onClick={output}>导出</Button>
        <Button style={{marginLeft: 10}}  onClick={addNew}>新增</Button>
        <Button style={{marginLeft: 10}}  onClick={approval}>审核通过</Button>
      </div>
      <div className={styles.content}>
        <CommonTable loading={listLoading} pagination={pagination} rowKey="id" rowSelection={rowSelection} columns={pageColumns} dataSource={dataSource} />
      </div>
    </div>
  );
};
export default List;
