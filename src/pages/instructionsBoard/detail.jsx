import React, { Component } from 'react';
import { Breadcrumb, Form, Row, Col, Table, Space, Button, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import router from "umi/router";
import styles from './index.less';
import {getContractById} from "@/services/instructionsBoard";
import { getProcessInfo, dictsInfo } from "@/services/prospectuSet";
import { timeFormatSeconds } from '@/utils/utils';

const FormItem = Form.Item;
class Index extends Component {
  formRef = React.createRef();
  state = {
    current: 1,
    total: 0,
    loading: false,
    dataSource: [],
    dictsMap: [],
    res: {},
  };
  componentDidMount() {
    // 查询 列表
    const id = this.props.location.query
    getContractById(id).then(res => {
      if (res?.status === 200) {
        this.setState({ dataSource: res.data.taskInstanceResponseList, total: res.data.total, loading: false, res: res.data })
      } else {
        this.setState({ dataSource: [], total: 0, loading: false })
      }
    })
    dictsInfo({ 
      path: null,
      methodName: 'POST',
      linkId: 'yssBC8822B74290D2EF2C6ED8403129EE96',
      queryParams: [{ 
        type:0,
        code: 'orgId',
        required: 1,
        value: '0'
      }],
      viewId: 'yssBC8822B74290D2EF2C6ED8403129EE96'
    }).then(res=>{
      if (res.status === 200 ) {
        this.setState({ dictsMap: res.data.rows });
      }
    })
  }

  doAction = (operate, rowData) => {
    switch (operate) {
      case 'history':
        getProcessInfo({ id: this.state.res.id }).then(res=>{
          if (res.status === 200) {
            const taskInfo = res.data.taskInstanceResponseList
            if (taskInfo && taskInfo.length > 0) {
              router.push({
                pathname: '/processCenter/processHistory',
                query: {
                  taskId: res.data.id,
                  processInstanceId: taskInfo[0].processInstanceId,
                  nodeId: taskInfo[0].taskDefinitionKey,
                }
              })
            }
          } else {
            message.error(res.message)
          }
        })
        break;
    }
  }
  tableHandle = () => {
    const { current, total, loading, dataSource, res, dictsMap } = this.state;
    const columns = [
      {
        title: '办理部门',
        dataIndex: 'name',
        align: 'center',
      },
      {
        title: '办理人员',
        dataIndex: 'assignee',
        align: 'center',
        render: (_, record) => {
          const curItem = dictsMap.filter(item=>item['yssBC8822B74290D2EF2C6ED8403129EE96丿id']===Number(record['assignee']))[0]
          return (
            <>
              {curItem ? curItem['yssBC8822B74290D2EF2C6ED8403129EE96丿name']:record['assignee'] }
            </>
          );
        },
      },
      {
        title: '办理时间',
        dataIndex: 'endTime',
        align: 'center',
        render: (_, record) => {
          return (
            <>
              { timeFormatSeconds(record.endTime) }
            </>
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'state',
        align: 'center',
        render: (text, record) => {
          if (res.state === 1) {
            return '进行中'
          } else if (res.state === 2) {
            return '监察稽核已审核'
          } else if (res.state === 3) {
            return '已定稿'
          } else {
            return res.state
          }
        }
      },
      { title: '操作', dataIndex: 'action', width: '400px', fixed: 'right',
        render: (text, record) => (
          <span>
            <Button type="link" onClick={() => this.doAction('history', record) }> 流转历史 </Button>
          </span>
        ),
      },
    ];
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      current: current,
      total,
      showTotal: totals => `共 ${totals} 条数据`,
    };
    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        currentPage={current}
        pagination={paginationProps}
        rowKey={record => record.id}
      />
    )
  }
  goBack (event) {
    event.preventDefault();
    history.go(-1);
  }

  render() {
    const { res, dictsMap } = this.state
    const curItem = dictsMap.filter(item=>item['yssBC8822B74290D2EF2C6ED8403129EE96丿id']===Number(res['creatorId']))[0]
    return (
      <>
        <Row>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space size={20}>
                <a href="#" onClick={this.goBack}> <LeftOutlined /> 返回 </a>
                <a href="/base/processCenterHome"> 首页 </a>
              </Space>
            </Breadcrumb.Item>
            <Breadcrumb.Item>招募说明书</Breadcrumb.Item>
            <Breadcrumb.Item>招募说明书看板</Breadcrumb.Item>
          </Breadcrumb>
        </Row>
        <div className={styles.tabsBox}>
          <h3>{res?.fileName}</h3>
          <Form style={{ marginTop: 7 }} ref={this.formRef}>
            <Row gutter={32}>
              <Col span={8}>
                <FormItem label='财务日期'>
                  <div>{res.financialDate}</div>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='截止日期'>
                  <div>{res.expiryDate}</div>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='披露日期'>
                  <div>{res.disclosureDate}</div>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={32}>
              <Col span={8}>
                <FormItem label='批次号'>
                  <div>{res.batchNumber}</div>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='创建时间'>
                  <div>{res.createTime}</div>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='创建人'>
                  <div>
                    {curItem ? curItem['yssBC8822B74290D2EF2C6ED8403129EE96丿name']:res.creatorId }
                  </div>
                </FormItem>
              </Col>
            </Row>
          </Form>
          {this.tableHandle()}
        </div>
      </>
    );
  }
}

export default Index;
