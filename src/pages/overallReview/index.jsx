import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Col, Form, message, Row, Table, Tabs, Space, Popconfirm } from 'antd';
import { LeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import SeaHeader from './SeaHeader';
import { getAllProductList, getBusinessArchiveListProcessInfo } from '@/services/prospectuSet';
import { getAuthToken } from '@/utils/session';
import router from "umi/router";
import axios from 'axios';
import { actionDownload } from '@/utils/download';
const { TabPane } = Tabs;

const defaultdataSource = [
  {
    id: '3122',
    createTime: '2022-04-13 14:21:47',
    fileName: '文件名称',
    fileNumber: '04131009244298322765',
    fileTypeCode: 'h',
    isSmart: 1,
    orgId: '2',
    path: 'contractfile/orgTemplate/2022-04-13/04131009244298322765.docx',
    processId: 'tb491e5a8ed24267b684558c8e66d8d4',
    templateKey: '04131009244298322765',
    templateName: '文件名称',
    templateType: 1,
    timeVisited: 0,
    type: 'docx',
  },
  {
    id: '111222',
    createTime: '2022-04-13 14:21:47',
    fileName: '文件名称',
    fileNumber: '04131009244298322765',
    fileTypeCode: 'h',
    isSmart: 1,
    orgId: '2',
    path: 'contractfile/orgTemplate/2022-04-13/04131009244298322765.docx',
    processId: 'tb491e5a8ed24267b684558c8e66d8d4',
    templateKey: '04131009244298322765',
    templateName: '文件名称',
    templateType: 1,
    timeVisited: 0,
    type: 'docx',
  },
];
const OverallReview = () => {
  const [tableData, setTableData] = useState(defaultdataSource);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(10);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [productList, setProductList] = useState([]);
  const [taskType, setTaskType] = useState('');

  const rowBtn = (code, rowData) => {
    switch (code) {
      case 'unaudit':
      case 'audit':
        router.push({
          pathname: '/contract/overallReviewDetail'
        })
        break;
      case 'download':
        setLoading(true)
        axios.get(
          `/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${rowData.fileSerialNumber}`,
          {
          responseType: 'blob',
          headers: {
            'Token': getAuthToken() || ''//设置token
          },
        }).then(response => {
          actionDownload(
            window.URL.createObjectURL(new Blob([response.data])),
            decodeURIComponent(`${rowData.recruitmentName}.docx`)
          ).then(res=>{
            setLoading(false)
          })
        }).catch(console.error);
        break;
      case 'preview':
        console.log('预览')
        break;
      case 'check':
        router.push({
          pathname: '/contract/detail?id=${rowData.id}'
        })
        break;
    }
  }
  const tabsChange = activeKey => {
    setCurrent(1);
    setPageSize(10);
    setTaskType(activeKey);// 这里设置之后为什么在getList中没有生效了？
    getList(activeKey);
  }
  const getList = (paramsObj) => {
    const params = {
      taskType: taskType,
      pageNum: current,
      pageSize: pageSize,
      state: 3, // 当前审核人的列表
    };
    if (paramsObj) {
      params['proCode'] = paramsObj.proCode // []
      params['fileName'] = paramsObj.fileName
    }
    if (typeof paramsObj === 'string') {
      params['taskType'] = paramsObj
    }
    setLoading(true)
    getBusinessArchiveListProcessInfo(params).then(res => {
      if(res.status===200) {
        setTableData(res.data.rows);
        setTotal(res.data.total);
      } 
      setLoading(false)
    }).catch(() => {
      setTableData(defaultdataSource);
      setLoading(false);
    });
  };
  const tableChange = ({ current, pageSize }, taskType) => {
    setCurrent(current);
    setPageSize(pageSize);
    setTaskType(taskType);
    // getList();
  };
  const tableHandle = () => {
    const columns = [
      {
        title: `序号`, width: '60px', fixed: 'left',
        render: (text, record, index) => {
          return ( <span> {index+1}</span> );
        },
      },
      { title: '招募书名称', dataIndex: 'fileName', width: '250px', fixed: 'left',},
      { title: '产品名称', dataIndex: 'proCode', width: '200px',
        render: (text, record, index) => {
          const curItem = productList.find(item=> item.proCode===record['proCode'])
          return ( <span> {curItem?curItem.proName:record['proCode']}</span> );
        },
      },
      { title: '财务日期', dataIndex: 'financialDate',width: '200px', },
      { title: '截止日期', dataIndex: 'expiryDate',width: '200px', },
      { title: '披露日期', dataIndex: 'disclosureDate',width: '200px', },
      { title: '批次号', dataIndex: 'batchNumber', width: '120px', },
      { title: '更新类型', dataIndex: 'updateType', width: '120px', },
      { title: '数据更新进度', dataIndex: 'plannedSpeed', width: '160px', },
      { title: '状态', dataIndex: 'state', width: '120px',
        render: (text, record) => {
          if (record.state === "1") {
            return '进行中'
          } else if (record.state === "2") {
            return '监察稽核已审核'
          } else if (record.state === "3") {
            return '已定稿'
          } else {
            return record.state
          }
        }
      },
      { title: '创建时间', dataIndex: 'createTime', width: '200px', },
      { title: '创建人', dataIndex: 'creatorId', width: '200px', },
      { title: '操作', dataIndex: 'action', width: '400px', fixed: 'right',
      // state = 1 才有审核动作
        render: (text, rowData) => (
          <>
            {rowData.state === "1" && (
              <>
                <Button type='link' onClick={()=>rowBtn('audit', rowData)}> 审核 </Button>
               <Button type='link' onClick={()=>rowBtn('unaudit', rowData)}> 反审核 </Button>
              </>
            )}
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ color: '#3384D5' }} /> }
              placement="topRight"
              title='确定需要执行该操作吗?'
              onConfirm={() => rowBtn('download', rowData)} 
              okText="确认"
              cancelText="取消"
            >
              <Button type="link"> 下载 </Button>
            </Popconfirm>
            <Button type='link' onClick={()=>rowBtn('preview', rowData)}> 预览 </Button>
            <Button type='link' onClick={()=>rowBtn('check', rowData)}> 查看 </Button>
          </>
        )
      },
    ];
    
    return (
      <Table scroll={{ x: '1200px', y: 'calc(65vh)' }}
        columns={columns}
        dataSource={tableData}
        loading={loading}
        currentPage={current}
        onChange={e => tableChange(e, taskType)}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          current: current,
          total,
          showTotal: totals => `共 ${totals} 条数据`,
        }}
        rowKey={record => record.id}
      />
    )
  }

  
  const goBack = (event) => {
    event.preventDefault();
    history.go(-1);
  }
  useEffect(() => {
    getAllProductList({}).then(res => {
      if (res?.status === 200) {
        setProductList(res.data || []);
      }
    });
  }, []);
  return (
    <div>
      <Row>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Space size={20}>
              <a href="#" onClick={goBack}> <LeftOutlined /> 返回 </a>
              <a href="/base/processCenterHome"> 首页 </a>
            </Space>
          </Breadcrumb.Item>
          <Breadcrumb.Item>招募说明书</Breadcrumb.Item>
          <Breadcrumb.Item>招募说明书设置</Breadcrumb.Item>
        </Breadcrumb>
      </Row>
      <div style={{ padding: '12px', background: '#ffffff' }}>
        <Row style={{ marginBottom: 16,}}>
          <SeaHeader getList={getList} productList={productList} />
        </Row>
        <Tabs activeKey={taskType} onChange={ tabsChange } >
          <TabPane tab="全部" key="">
            { taskType===""? tableHandle(taskType): '' }
          </TabPane>
          <TabPane tab="待审核" key="T001_1">
            { taskType==="T001_1"?tableHandle(taskType): '' }
          </TabPane>
          <TabPane tab="审核通过" key="T001_5">
            { taskType==="T001_5"?tableHandle(taskType): '' }
          </TabPane>
          <TabPane tab="已退回" key="T001_6">
            { taskType==="T001_6"?tableHandle(taskType): '' }
          </TabPane>
        </Tabs>  
      </div>
    </div>
  );
};
export default OverallReview;
