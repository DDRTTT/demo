import React, { Component } from 'react';
import {
  Breadcrumb,
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Table,
  Tabs,
  Upload,
} from 'antd';
import { DownOutlined, UploadOutlined, UpOutlined } from '@ant-design/icons';
import styles from './index.less';
// import { ColumnsType } from "antd/es/table";
import request from 'umi-request';
import { stringify } from 'qs';
import { uuid } from '@/utils/utils';
import router from 'umi/router';
import { handleShowTransferHistory } from '@/utils/transferHistory';
import { connect } from 'dva';
import Action from '@/utils/hocUtil';

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const { confirm } = Modal;
let landMark = '合同';
const publicName = '合同审批';
const uri = '/ams/yss-contract-server';
const dropdownList = {
  //合同类型, 合同性质, 合同紧急程度, 合同行, 关联类型, 机构类型, 文件类型
  codeList:
    'contractType, contractNature, contractEmergency, contractBack, parentType, proBusType, contractFileType, contractStatus',
};

class Index extends Component {
  formRef = React.createRef();
  state = {
    activeTabsKey: this.props.publicTas || 'T001_1',
    fileInfo: {},
    contractNo: '',
    tableData: [],
    dropdownObj: {},
    loading: false,
    upLoading: false,
    expand: false,
    current: 1,
    pageSize: 10,
    total: 0,
    like: '',
    userInfo: {},
  };

  // 获取下拉列表
  getDropdownData = () => {
    request(
      `/ams/ams-base-parameter/datadict/queryInfoByList?${stringify({ ...dropdownList })}`,
    ).then(res => {
      if (res?.status === 200) {
        this.setState({ dropdownObj: res.data });
      }
    });
  };

  onFinish = () => {
    this.formRef.current?.validateFields().then(fieldsValue => {
      const payload = {
        current: 1,
        pageSize: 10,
        body: {
          manageType: this.props.publicTas,
          ...fieldsValue,
        },
      };
      this.getContractTableData(payload);
    })
  };

  onSearch = value => {
    this.setState({ like: value });
    const payload = {
      current: 1,
      pageSize: 10,
      body: {
        manageType: this.props.publicTas,
        like: value,
      },
    };
    this.getContractTableData(payload);
  };

  // 列表查询
  getContractTableData = params => {
    this.setState({ loading: true }, () => {
      fetch(`${uri}/contractfile/query?currentPage=${params.current}&pageSize=${params.pageSize}`, {
        headers: {
          Token: sessionStorage.getItem('auth_token'),
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          Data: new Date().getTime(),
          Sys: 1,
        },
        method: 'POST',
        body: JSON.stringify(params.body),
      }).then(fres => {
        if (fres?.status === 200) {
          fres.json().then(res => {
            if (res.status === 200) {
              this.setState({
                tableData: res.data.rows,
                total: res.data.total,
                loading: false,
              });
            } else {
              message.warn(res.message);
              this.setState({ loading: false });
            }
          });
        } else {
          message.warn('请稍后再试');
          this.setState({ loading: false });
        }
      });
    });
  };

  // 获取合同编号
  getContractNo = () => {
    request(`${uri}/contractfile/getcontractnumber`).then(res => {
      if (res?.status === 200) {
        this.setState({ contractNo: res.data }, () => {
          this.contractSubmit();
        });
      }
    });
  };

  // 保存
  contractSubmit = () => {
    const { fileInfo, contractNo } = this.state;
    let contractName = fileInfo.fileName;
    // 设置默认值（值 暂定）
    let contractNature = '3',
      contractType = '2',
      parentId = -1;
    const payload = {
      fileKey: uuid().replace(/-/g, ''),
      contractBase: {
        contractStatus: '',
      },
      contractOrigin: '0', //0:文件导入;1:新建;
      fileName: fileInfo.fileName,
      fileNumber: fileInfo.fileNumber,
      contractName,
      contractNature,
      contractType,
      parentId,
      contractNumber: contractNo,
      contractStatus: '',
    };
    fetch(`${uri}/contractfile/add`, {
      headers: {
        Token: sessionStorage.getItem('auth_token'),
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Data: new Date().getTime(),
        Sys: 1,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(res => {
      if (res?.status === 200) {
        const payloads = {
          current: 1,
          pageSize: 10,
          body: {
            manageType: this.props.publicTas,
          },
        };
        this.getContractTableData(payloads);
      }
    });
  };

  // 获取文件存放路径
  getFilePathByCode = params => {
    request(`${uri}/contractfile/getfilebycode?code=${params.code}`).then(res => {
      if (res?.status === 200) {
        // 存放文件的相关信息
        this.setState({ fileInfo: res.data }, () => {
          this.getContractNo();
        });
      }
    });
  };

  // 上传
  uploadChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ upLoading: true, loading: true });
    }
    if (info.file.status === 'done') {
      if (info.file.response.status === 200) {
        message.success(`${info.file.name} 导入成功`);
        this.setState({ upLoading: false });
        const payload = {
          code: info.file.response.data,
          fileName: info.file.name,
        };
        this.getFilePathByCode(payload);
      } else {
        message.warn(`${info.file.name} 导入失败，请稍后再试`);
        this.setState({ upLoading: false });
      }
    }
    if (info.file.status === 'error') {
      message.warn(`${info.file.name} 导入失败，请稍后再试`);
      this.setState({ upLoading: false });
    }
  };

  tabsChange = key => {
    this.props.dispatch({
      type: 'publicModel/setPublicTas',
      payLoad: key,
    });
    this.setState({ tableData: [], current: 1, pageSize: 10, loading: true, activeTabsKey: key });
    const payload = {
      current: 1,
      pageSize: 10,
      body: {
        manageType: key,
      },
    };
    this.getContractTableData(payload);
  };

  tableChange = ({ current, pageSize }) => {
    const { expand, like } = this.state;
    this.setState({ current, pageSize }, () => {
      if (expand) {
        this.formRef.current?.validateFields().then(fieldsValue => {
          const payload = {
            current,
            pageSize,
            body: {
              manageType: this.props.publicTas,
              ...fieldsValue,
            },
          };
          this.getContractTableData(payload);
        })
      } else {
        const payload = {
          current,
          pageSize,
          body: {
            manageType: this.props.publicTas,
            like,
          },
        };
        this.getContractTableData(payload);
      }
    });
  };

  handleGoCheck = record => {
    return router.push(
      `/processCenter/taskDeal?taskId=${record.taskId}&processInstanceId=${record.processInstanceId}&mode=deal&contractID=${record.id}`,
    );
  };

  handleResetView = () => {
    const payload = {
      current: 1,
      pageSize: 10,
      body: {
        manageType: this.props.publicTas,
      },
    };
    this.getContractTableData(payload);
  };

  handleGoSubmit = record => {
    return router.push(
      `/dynamicPage/pages/${publicName}/4028e7b6782a111001785878da6e000a/提交?contractID=${record.id}&contractBaseId=${record.contractBase.id}`,
    );
  };

  handleGoUpdate = record => {
    return router.push(
      `/dynamicPage/pages/${publicName}/4028e7b6782a111001785878da6e000a/修改?contractID=${record.id}&contractBaseId=${record.contractBase.id}`,
    );
  };

  handleCanCheck = record => {
    return router.push({
      pathname: '/processCenter/taskDeal',
      query: {
        taskId: record.taskId,
        processDefinitionId: record.processDefinitionId,
        processInstanceId: record.processInstanceId,
        id: record.id,
        taskDefinitionKey: record.taskDefinitionKey,
        mode: 'deal',
      },
    });
  };

  handleCanLocationHistory = record => {
    const url = `/processCenter/processHistory?processInstanceId=${record.processInstanceId}&taskId=${record.taskId}`;
    return router.push(url);
  };

  handleCanDetails = record => {
    const url = `/processCenter/processDetail?processInstanceId=${record.processInstanceId}&nodeId=${record.taskDefinitionKey}&taskId=${record.taskId}`;
    return router.push(url);
  };

  handleCanDelete = (record, func) => {
    confirm({
      title: '请确认是否删除?',
      onOk() {
        request(`${uri}/contractfile/delete?ids=${(record.id || '').toString()}`).then(res => {
          res && res.status === 200
            ? [message.success('删除成功 ! ', 1), func()]
            : message.warn('删除失败 ! ', 1);
        });
      },
      onCancel() { },
    });
  };

  handleCanBackOut = (record, func) => {
    confirm({
      title: '请确认是否撤销?',
      onOk() {
        request(
          `/ams/yss-lifecycle-flow/common/revoke?processInstId=${(
            record.processInstanceId || ''
          ).toString()}`,
        ).then(res => {
          res && res.status === 200
            ? [message.success('撤销成功 ! ', 1), func()]
            : message.warn('撤销失败 ! ', 1);
        });
      },
      onCancel() { },
    });
  };

  handleShowButton = (activeTabsKey, record) => {
    if (activeTabsKey === 'T001_1' || activeTabsKey === 'T001_4') {
      switch (record.billowsStatus) {
        case 'S001_1':
          return (
            <>
              <Action code="contractList:update">
                <Button type="link" onClick={() => this.handleGoUpdate(record)}>
                  修改
                </Button>
              </Action>
              <Action code="contractList:submit">
                <Button type="link" onClick={() => this.handleGoSubmit(record)}>
                  提交
                </Button>
              </Action>
              <Action code="contractList:delete">
                {record.revoke === '1' ? (
                  <Button
                    type="link"
                    onClick={() => this.handleCanDelete(record, this.handleResetView)}
                  >
                    删除
                  </Button>
                ) : (
                  ''
                )}
              </Action>
            </>
          );
        case 'S001_2':
          return (
            <>
              <Action code="contractList:check">
                <Button type="link" onClick={() => this.handleCanCheck(record)}>
                  办理
                </Button>
              </Action>
              <Button type="link" onClick={() => handleShowTransferHistory(record)}>
                流转历史
              </Button>
              {record.revoke === '1' ? (
                <Button
                  type="link"
                  onClick={() => this.handleCanBackOut(record, this.handleResetView)}
                >
                  撤销
                </Button>
              ) : (
                ''
              )}
              {/* 更多 */}
            </>
          );
        case 'S001_3':
          return (
            <>
              <Action code="contractList:details">
                <Button
                  type="link"
                  onClick={() => {
                    this.handleCanDetails(record);
                  }}
                >
                  详情
                </Button>
              </Action>
              <Button type="link" onClick={() => handleShowTransferHistory(record)}>
                流转历史
              </Button>
            </>
          );
        default:
          return '';
      }
    } else if (activeTabsKey === 'T001_3' || activeTabsKey === 'T001_5') {
      return (
        <>
          <Button
            type="link"
            onClick={() => {
              this.handleCanDetails(record);
            }}
          >
            详情
          </Button>
          <Button type="link" onClick={() => handleShowTransferHistory(record)}>
            流转历史
          </Button>
          {record.revoke === '1' && record.billowsStatus === 'S001_2' ? (
            <Button type="link" onClick={() => this.handleCanBackOut(record, this.handleResetView)}>
              撤销
            </Button>
          ) : (
            ''
          )}
        </>
      );
    }
  };

  jumpPage = () => {
    router.push('/contract/templateSet');
  };

  componentDidMount() {
    const userInfo = sessionStorage.getItem('USER_INFO');
    this.setState({ userInfo: JSON.parse(userInfo) });
    this.getDropdownData();
    const payload = {
      current: 1,
      pageSize: 10,
      body: {
        manageType: this.props.publicTas || "T001_1",
      },
    };
    this.getContractTableData(payload);
  }

  render() {
    const {
      loading,
      upLoading,
      dropdownObj,
      expand,
      tableData,
      current,
      total,
      userInfo,
    } = this.state;
    const columns = [
      {
        title: `${landMark}名称`,
        dataIndex: 'contractName',
      },
      {
        title: `${landMark}类型`,
        dataIndex: 'contractTypeName',
      },
      {
        title: `${landMark}来源`,
        dataIndex: 'contractOriginName',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: `${landMark}状态`,
        dataIndex: 'contractStatusName',
      },
      {
        title: '流程状态',
        dataIndex: 'billowsStatusName',
      },
      {
        title: '审核时间',
        dataIndex: 'checkerTime',
      },
      {
        title: '操作',
        dataIndex: 'id',
        align: 'center',
        width: 200,
        fixed: 'right',
        // render: (val, record) => {
        //   if (+record.contractStatus === 1) {
        //     return (
        //       <Button type="link" onClick={() => this.handleGoSubmit(record)}>提交</Button>
        //     )
        //   }
        //   if (+record.contractStatus === 2) {
        //     return (
        //       <Button type="link" onClick={() => this.handleGoCheck(record)}>办理</Button>
        //     )
        //   }
        // }
        render: (_, record) => {
          return (
            <div style={{ display: 'flex' }}>
              {this.handleShowButton(this.state.activeTabsKey, record)}
            </div>
          );
        },
      },
    ];
    const uploadContractProps = {
      action: '/ams/ams-file-service/fileServer/uploadFile',
      name: 'file',
      headers: {
        Token: sessionStorage.getItem('auth_token'),
      },
    };
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      current: current,
      total,
      showTotal: totals => `共 ${totals} 条数据`,
    };
    return (
      <div>
        <div className={styles.searchBox} style={{ display: expand ? 'none' : 'block' }}>
          <Breadcrumb style={{ marginTop: 7 }}>
            <Breadcrumb.Item>电子文档管理</Breadcrumb.Item>
            <Breadcrumb.Item>合同审批</Breadcrumb.Item>
          </Breadcrumb>
          <div className={styles.reviewBox}>
            <div className={styles.search}>
              <Input.Search
                placeholder="请输入合同名称"
                onSearch={this.onSearch}
                style={{ width: 242, marginRight: 20, height: 34 }}
              />
              <a style={{ fontSize: 12 }} onClick={() => this.setState({ expand: !expand })}>
                展开
              </a>
              <DownOutlined />
            </div>
          </div>
        </div>
        <div
          className={styles.tableListForm}
          style={{ display: expand ? 'block' : 'none', paddingLeft: 20 }}
        >
          <Breadcrumb style={{ marginTop: 7 }}>
            <Breadcrumb.Item>电子文档管理</Breadcrumb.Item>
            <Breadcrumb.Item>合同审批</Breadcrumb.Item>
          </Breadcrumb>
          <Form layout="inline" style={{ marginTop: 7 }} ref={this.formRef}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col xxl={8} md={12} sm={24}>
                <FormItem label={`${landMark}名称`} name="contractName">
                  <Input placeholder="请输入" />
                </FormItem>
              </Col>
              <Col xxl={8} md={12} sm={24}>
                <FormItem label={`${landMark}类型`} name="contractType">
                  <Select
                    style={{ width: '100%' }}
                    optionFilterProp={'children'}
                    placeholder="请选择"
                  >
                    {dropdownObj.contractType &&
                      dropdownObj.contractType.map(item => (
                        <Option key={item.code} value={item.code}>
                          {item.name}
                        </Option>
                      ))}
                  </Select>
                </FormItem>
              </Col>
              <Col xxl={8} md={12} sm={24}>
                <FormItem label={`${landMark}来源`} name="contractOrigin">
                  <Select style={{ width: '100%' }} optionFilterProp={'children'}>
                    <Option key={1} value={1}>
                      新增
                    </Option>
                    <Option key={2} value={0}>
                      导入
                    </Option>
                    <Option key={3} value={2}>
                      推送
                    </Option>
                  </Select>
                </FormItem>
              </Col>
              <Col xxl={8} md={12} sm={24}>
                <FormItem label={`${landMark}状态`} name="contractStatus">
                  <Select
                    style={{ width: '100%' }}
                    optionFilterProp={'children'}
                    placeholder="请选择"
                  >
                    {dropdownObj.contractStatus &&
                      dropdownObj.contractStatus.map(item => (
                        <Option key={item.code} value={item.code}>
                          {item?.name.replace(/合同/g, landMark)}
                        </Option>
                      ))}
                  </Select>
                </FormItem>
              </Col>
              <Col xxl={8} md={12} sm={24} />
              <Col xxl={8} md={12} sm={24} style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={this.onFinish}>
                  查询
                </Button>
                <Button style={{ margin: '0 8px' }} onClick={() => this.formRef.current?.resetFields()}>
                  清除
                </Button>
                <a style={{ fontSize: 12 }} onClick={() => this.setState({ expand: !expand })}>
                  收起
                </a>
                <UpOutlined />
              </Col>
            </Row>
          </Form>
        </div>

        <div className={styles.tabsBox}>
          <Tabs
            activeKey={this.props.publicTas}
            onChange={val => this.tabsChange(val)}
            tabBarExtraContent={
              <>
                <Action code="contractList:add">
                  <Button
                    type="primary"
                    onClick={this.jumpPage}
                    style={{ marginRight: 8 }}
                  >{`新增${landMark}`}</Button>
                  <Upload
                    {...uploadContractProps}
                    data={{ uploadFilePath: `contractfile/examineUploadFile/${userInfo?.orgId}` }} // 路径必选
                    accept=".docx"
                    onChange={e => this.uploadChange(e)}
                    // beforeUpload={this.beforeUpload}
                    showUploadList={false}
                  >
                    <Button loading={upLoading}>
                      <UploadOutlined />
                      {`导入${landMark}`}
                    </Button>
                  </Upload>
                </Action>
              </>
            }
          >
            <TabPane tab="我待办" key="T001_1">
              <Table
                columns={columns}
                dataSource={tableData}
                loading={loading}
                currentPage={current}
                onChange={this.tableChange}
                pagination={paginationProps}
              />
            </TabPane>
            <TabPane tab="我发起" key="T001_3">
              <Table
                columns={columns}
                dataSource={tableData}
                loading={loading}
                currentPage={current}
                onChange={this.tableChange}
                pagination={paginationProps}
              />
            </TabPane>
            <TabPane tab="未提交" key="T001_4">
              <Table
                columns={columns}
                dataSource={tableData}
                loading={loading}
                currentPage={current}
                onChange={this.tableChange}
                pagination={paginationProps}
              />
            </TabPane>
            <TabPane tab="已办理" key="T001_5">
              <Table
                columns={columns}
                dataSource={tableData}
                loading={loading}
                currentPage={current}
                onChange={this.tableChange}
                pagination={paginationProps}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

const ContractManage = connect(({ publicModel: { publicTas } }) => ({
  publicTas,
}))(Index);
export default ContractManage;
