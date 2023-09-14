import React, { Component } from 'react';
import {
  Breadcrumb,
  Button,
  Row,
  Col,
  Divider,
  Form,
  Input,
  Select,
  Table,
  Space,
  Popconfirm,
  message,
  Tooltip,
  DatePicker,
  Modal,
  Spin,
} from 'antd';
import { LeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getAllProductList, getIsCallback, getBanLiList, backBingXing, getPositions } from '@/services/letterIntervene';
import { pinyin } from 'pinyin-pro';
import Item from 'antd/lib/list/Item';
const { Option } = Select;
class Index extends Component {
  formRef = React.createRef();
  state = {
    productList: [],
    currentPage: 1,
    pageSize: 999999,
    loading: false,
    dataSource: [],
    banLiData: [],
    backList: [],
    backVisible: false,
    backLoading: false
  };
  goBack(event) {
    event.preventDefault();
    history.go(-1);
  }
  //按拼音模糊搜素
  pinYinSearch = (val, option) => {
    return (
      option.children.includes(val) ||
      pinyin(option.children, { pattern: 'initial' })
        .replace(/\s*/g, '')
        .includes(val)
    );
  };
  closeBack = () => {
    this.setState({
      backVisible: false,
      loading:false,
      backLoading: false
    })
  }
  componentDidMount() {
    let { currentPage, pageSize } = this.state;
    this.setState({
      loading: true,
    });
    const userInfo = JSON.parse(sessionStorage.getItem('USER_INFO'));
    const obj = {
      queryParams: [
        { code: 'taskType', value: 'T001_1' },
        { code: 'currentPage', value: currentPage },
        { code: 'pageSize', value: pageSize },
        { code: 'processId', value: 'c054d6d3b36b4dfc84965064169f59c5' },
      ],
    };
    const headers = {
      UserId: userInfo?.id,
      OrgId: userInfo.orgId,
      'Content-Type': 'application/json;charset=UTF-8',
      Sys: 1,
    };
    // 获取全量的产品名称
    getAllProductList({}).then(res => {
      if (res.status === 200) {
        this.setState({ productList: res.data || [] });
      }
    });
    // getNeedDealList({queryParams: [...obj]},headers).then(res => {
    //   console.log(res);
    // })
    fetch(`/ams/yss-contract-server/businessArchive/getBusinessArchiveListProcessInfo`, {
      method: 'post',
      headers,
      body: JSON.stringify(obj),
    }).then(res => {
      if (res.status == 200) {
        res.json().then(response => {
          this.setState({
            loading: false,
            dataSource: response?.data?.rows || [],
          });
        });
      } else {
        this.setState({
          loading: false,
        });
        message.error('服务调用失败，请稍后再试');
      }
    });
  }
  doAction = record => {
    const obj = {
      processInstanceId: record.procinsId,
    };
    this.setState({ loading: true });
    getIsCallback(obj).then(res => {
      console.log(res);
      if (res.data) {
        this.dataDeal(record);
      } else {
        // console.log(123);
      }
    });
  };
  dataDeal = record => {
    console.log(record);
    const taskList = record.processList[0].taskList;
    getPositions(record.procinsId).then(res => {
      if (res.status == 200) {
        getBanLiList(record.procinsId).then(succ => {
          if (res.status == 200) {
            res.data.nodeInfos.forEach(item =>{
              succ.data.forEach(ele => {
                if (item.taskName == ele.taskName) {
                  ele.taskDefinitionKey = item.taskDefinitionKey;
                  ele.processInstanceId = record.procinsId
                }
              })
            })
            taskList.forEach(item => {
              succ.data.forEach(ele => {
                if (item.name == ele.taskName) {
                  ele.backButton = true;
                }
              })
            })
            this.setState({ backList: succ.data, backVisible: true, loading: false });
          }
        });
      }
    })

  };
  backBingXing = (record) => {
    const userInfo = JSON.parse(sessionStorage.getItem('USER_INFO'));
    const headers = {
      UserId: userInfo?.id,
      OrgId: userInfo.orgId,
      'Content-Type': 'application/json;charset=UTF-8',
      Sys: 1,
    };
    const obj = {
      queryParams: [
        { code: "taskId", value: record.taskId },
        { code: "processInstanceId", value: record.processInstanceId },
        { code: "rejectActivityId", value: record.taskDefinitionKey },
        { code: "userId", value: String(record.hardlerId) },
      ]
    }
    const repBody = {
      taskId: record.taskId,
      processInstanceId: record.processInstanceId,
      rejectActivityId: record.taskDefinitionKey,
      userId: String(record.hardlerId)
    }
    backBingXing(repBody).then(res => {
      // console.log(res);
    })
    // fetch('/api/yss-base-billows/task-reject/alreadyDealtReject',{
    //   method:'post',
    //   headers,
    //   body: JSON.stringify(obj)
    // }).then(res=>{
    //   console.log(res);
    // })
  }
  render() {
    const { productList, loading, dataSource, backVisible, backList, backLoading } = this.state;
    const columns = [
      { title: `序号`, width: '60px', render: (text, record, index) => `${index + 1}` },
      { title: '招募书名称', dataIndex: 'fileName', width: '250px' },
      { title: '产品名称', dataIndex: 'proName', width: '200px' },
      { title: '财务日期', dataIndex: 'financialDate', width: '120px' },
      { title: '截止日期', dataIndex: 'expiryDate', width: '120px' },
      { title: '披露日期', dataIndex: 'disclosureDate', width: '120px' },
      { title: '批次号', dataIndex: 'batchNumber', width: '100px' },
      {
        title: '更新类型',
        dataIndex: 'updateType',
        width: '120px',
        render: (text, record) => {
          if (Number(record.updateType) === 0) {
            return '全部更新';
          } else if (Number(record.updateType) === 1) {
            return '临时更新';
          } else {
            return record.updateType;
          }
        },
      },
      {
        title: '状态',
        dataIndex: 'state',
        width: '120px',
        render: (text, record) => {
          if (record.state === 1) {
            return '进行中';
          } else if (record.state === 2) {
            return '监察稽核已审核';
          } else if (record.state === 3) {
            return '已定稿';
          } else {
            return record.state;
          }
        },
      },
      { title: '创建时间', dataIndex: 'createTime', width: '200px' },
      {
        title: '操作',
        title: '操作',
        dataIndex: 'action',
        width: '80px',
        fixed: 'right',
        render: (text, record) => (
          <Button type="link" onClick={() => this.doAction(record)}>撤回</Button>
        ),
      },
    ];
    const columnsBack =[
      { title: '任务名称', dataIndex: 'taskName', width: '150px' },
      { title: '办理岗位', dataIndex: 'handPost', width: '150px' },
      { title: '办理人', dataIndex: 'handler', width: '150px' },
      { title: '办理备注', dataIndex: 'taskComment', width: '150px' },
      { title: '办理时间', dataIndex: 'handleTime', width: '150px' },
      { title: '操作', dataIndex: 'action', width: '150px', fixed: 'right',
        render:(text, record, index) => {
          if (record.taskName != "新增招募说明书" && record.taskComment == '已办理' && !record.backButton) {
            return <Button type="link" onClick={() => this.backBingXing(record)}>撤回</Button>
          }
        }
      },
    ]
    return (
      <div>
        <Row>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space size={20}>
                <a href="#" onClick={this.goBack}>
                  {' '}
                  <LeftOutlined /> 返回{' '}
                </a>
                <a href="/base/processCenterHome"> 首页 </a>
              </Space>
            </Breadcrumb.Item>
            <Breadcrumb.Item>招募说明书</Breadcrumb.Item>
            <Breadcrumb.Item>招募说明书干预</Breadcrumb.Item>
          </Breadcrumb>
        </Row>
        <div style={{ padding: '12px', background: '#ffffff' }}>
          {/* <Row>
              <Form
                labelCol={{
                  span: 4,
                }}
                wrapperCol={{
                  span: 12,
                }}
                layout="horizontal"
                ref={this.formRef}
              >
                <Row>
                  <Col span={12}>
                    <Form.Item label="产品名称" name="proName">
                      <Select
                        showArrow
                        optionFilterProp="children"
                        filterOption={(input, option) => this.pinYinSearch(input, option)}
                        maxTagCount={1}
                        placeholder="请选择"
                        mode="multiple"
                        allowClear
                      >
                        {productList.map(item => (
                          <Option value={item.proCode} key={item.proCode}>
                            {item.proName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="产品代码" name="proCode">
                      <Select
                        showArrow
                        optionFilterProp="children"
                        maxTagCount={1}
                        placeholder="请选择"
                        mode="multiple"
                        filterOption={(input, option) => option.children.includes(input)}
                        filterSort={(optionA, optionB) =>
                          optionA.children
                            .toLowerCase()
                            .localeCompare(optionB.children.toLowerCase())
                        }
                        allowClear
                      >
                        {productList.map(item => (
                          <Option value={item.proCode} key={item.proCode}>
                            {item.proCode}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: 'flex', justifyContent: 'center' }}>
                  <Form.Item>
                    <Space>
                      <Button type="primary" onClick={() => this.queryList()}>
                        {' '}
                        查询{' '}
                      </Button>
                      <Button onClick={() => this.onRest()}> 重置 </Button>
                    </Space>
                  </Form.Item>
                </Row>
              </Form>
            </Row> */}
          <Table
            scroll={{ x: '1000px', y: 'calc(65vh)' }}
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            // currentPage={current}
            pagination={false}
            rowKey={record => record.id}
            // rowSelection={{
            //   selectedRowKeys,
            //   onChange: this.onSelectChange,
            // }}
          />
        </div>
        <Modal
          visible={backVisible}
          mask={true}
          destroyOnClose={true}
          onCancel={() => this.closeBack()}
          width={1200}
          bodyStyle={{height: 400}}
          footer={null}
          maskClosable={false}
          centered={true}
        >
          <Table
            scroll={{ x: '1000px'}}
            columns={columnsBack}
            dataSource={backList}
            loading={backLoading}
            rowKey={record => record.taskId}
            pagination={false}
          />
        </Modal>
      </div>
    );
  }
}
export default Index;
