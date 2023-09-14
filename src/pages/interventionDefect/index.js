import React, { useEffect, useRef, useState } from 'react';
import {
  BatchOperation,
  directionFun,
  getUrlParam,
  listcolor,
  tableRowConfig,
  templateDownload,
} from '@/pages/investorReview/func';
import { Button, Form, message, Modal, Tooltip, Tag, Table, Select, Row, Col } from 'antd';
import { Breadcrumb, PageContainers } from '@/components';
import { useSetState } from 'ahooks';
import router from 'umi/router';
import request from '@/utils/request';
import { queryTask } from './services.js';
import {password} from './password.js'
const Index = props => {
  const [pwd, setPwd] = useState(false);
  const [state, setState] = useSetState({
    columns: [
      //列表表头
      {
        title: '序号',
        key: 'req',
        width: 60,
        align: 'center',
        render: (t, r, i) => {
          return <>{i + 1}</>;
        },
      },
      {
        title: '招募说明书名称',
        key: 'fileName',
        dataIndex: 'fileName',
        ...tableRowConfig,
        width: 256,
      },
      {
        title: '产品名称',
        dataIndex: 'proName',
        key: 'proName',
        ...tableRowConfig,
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
        render: updateType => {
          return <span>{updateType === '0' ? '全部更新' : '临时更新'}</span>;
        },
      },
      {
        title: '批次号',
        dataIndex: 'batchNumber',
        key: 'batchNumber',
        align: 'center',
        width: 80,
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        width: 80,
        render: value => {
          let color;
          let text;
          if (value == 1) text = '进行中';
          if (value == 2) text = '待定稿';
          if (value == 3) {
            color = 'green';
            text = '已完成';
          }
          return (
            <Tooltip title={text} key={value} placement="topLeft">
              <Tag color={color || ''} style={{ margin: '2px' }}>
                {text || '-'}
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        fixed: 'right',
        align: 'center',
        width: 100,
        render: (text, record) => {
          return (
            <>
              <Button type="link" size="small" onClick={() => handleEdit(record)}>
                修改文档
              </Button>
            </>
          );
        },
      },
    ],
    listLoading: true,
    dataSource: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
    optionsProCode: [],
  });
  useEffect(() => {
    const { pageNum, pageSize } = state;
    let pwd = getUrlParam().pwd;
    const date = new Date();
    let a = date.getFullYear()%100;
    let b = (date.getMonth()+1)%2 == 0 ? date.getMonth()+4 : date.getMonth()+3;
    let c = date.getDate()%2 == 0 ? date.getDate()+3 : date.getDate()+1;
    let d = date.getHours() * 2;
    let aa = '';
    let bb = '';
    let cc = '';
    let dd = '';
    for (let i = 0; i < a; i++) {
        aa = aa+password[a+i]
    }
    for (let i = 0; i < b; i++) {
        bb = bb+password[b+i]
    }
    for (let i = 0; i < c; i++) {
        cc = cc+password[c+i]
    }
    for (let i = 0; i < d; i++) {
        dd = dd+password[d+i]
    }
    const pass = `${aa}${a%2==0?'yssmlb':'yssgdz'}${bb}${b%2==0?'ljgs':'gdgs'}${cc}${c%2==0?'bl':'kp'}${dd}${d%2==0?'qys':'psd'}`;
    sessionStorage.setItem('pass',pass);
    if (pwd == undefined || pwd == null || pwd == '' || pwd != pass) {
        return
    };
    if (pwd == pass) {
      setPwd(true);
      handleGetListFetch(pageNum, pageSize, {});
      handleGetSelectOptions();
    }
  }, []);
  const handleGetListFetch = (pageNum, pageSize, formData) => {
    const reqBody = {};
    if (formData?.proCodeList) {
      (reqBody.code = 'proCodeList'), (reqBody.value = formData?.proCodeList);
    }

    const params = {
      contentType: 2,
      linkId: 'a878187fa60744f895b58fd979194864',
      methodName: 'POST',
      path:
        '/ams/yss-contract-server/businessArchive/getBusinessArchiveListProcessInfo?coreModule=TContractBusinessArchive',
      queryParams: [
        {
          code: 'taskType',
          value: 'T001_1',
        },
        {
          code: 'processId',
          value: 'c054d6d3b36b4dfc84965064169f59c5',
        },
        {
          code: 'pageNum',
          value: pageNum,
        },
        {
          code: 'pageSize',
          value: pageSize,
        },
        reqBody,
      ],
    };
    queryTask(params).then(res => {
      setState({
        dataSource: res.data.rows,
        total: res.data.total,
        listLoading: false,
      });
    });
  };
  const handleGetSelectOptions = () => {
    const reqBody = {
      path: '/ams/yss-contract-server/RpProduct/queryAllByCondition',
      methodName: 'POST',
      linkId: 'a878187fa60744f895b58fd979194864',
      contentType: 2,
      queryParams: [],
    };
    queryTask(reqBody).then(res => {
      setState({ optionsProCode: res.data });
    });
  };
  const handlePaginationChange = async value => {
    await loading();
    setState({
      pageNum: value.current,
      pageSize: value.pageSize,
    });
    handleGetListFetch(value.current, value.pageSize);
  };
  const onFinish = async values => {
    const { pageNum, pageSize } = state;
    await loading();
    handleGetListFetch(pageNum, pageSize, values);
  };
  const handleEdit = record => {
    sessionStorage.setItem('_templateParams', JSON.stringify(record));
    router.push(`/contract/interventionDefect/cxConfig`); // 需要taskId
  };
  function loading() {
    setState({ listLoading: true });
  }
  const { listLoading, columns, dataSource, pageSize, pageNum, total, optionsProCode } = state;
  return (
    <>
      {pwd && (
        <>
          <div>
            <PageContainers
              breadcrumb={[
                { title: '招募说明书', url: '' },
                { title: '招募说明书干预', url: '' },
              ]}
            />
          </div>
          <Form
            name="basic"
            labelCol={{
              span: 3,
            }}
            wrapperCol={{
              span: 10,
            }}
            onFinish={onFinish}
          >
            <Row>
              <Col span={12}>
                <Form.Item label="产品名称" name="proCodeList">
                  <Select showSearch optionFilterProp="children" allowClear>
                    {optionsProCode.map(item => (
                      <Option key={item.id} value={item.proCode}>
                        {item.proName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Table
            rowKey={'id'}
            loading={listLoading}
            dataSource={dataSource}
            columns={columns}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              pageSize: pageSize,
              current: pageNum,
              total: total,
              showTotal: total => `共 ${total} 条数据`,
              pageSizeOptions: ['10', '20', '30', '40'],
            }}
            scroll={{ x: false }}
            onChange={handlePaginationChange}
          ></Table>
        </>
      )}
    </>
  );
};
export default Index;
