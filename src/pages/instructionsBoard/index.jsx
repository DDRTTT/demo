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
} from 'antd';
import { LeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { actionDownload, getParameters } from '@/utils/download';
import { getAuthToken } from '@/utils/session';
import router from 'umi/router';
import CleanWord from '@/pages/cleanWord'
import {
  getAllProductList,
  getProcessInfo,
  dictsInfo,
  delBusinessArchive,
} from '@/services/prospectuSet';
import { getInstructionsBoardList, updateState, getNginxIP, insteadWord } from '@/services/instructionsBoard';
import { pinyin } from 'pinyin-pro';
import { result } from 'lodash';
const { Option } = Select;

class Index extends Component {
  formRef = React.createRef();
  state = {
    dataSource: [],
    productList: [],
    dictsMap: [],
    tableLoading: false,
    current: 1,
    pageSize: 10,
    total: 0,
    selectedRowKeys: [],
    dateTime: '',
    selectedRows:[],
    dingGaoLoading: false,
    IPObject: {},
    cleanWordVisible: false
  };
  onPageChange(page, pageSize) {
    this.setState(
      {
        current: page,
        pageSize: pageSize,
      },
      () => {
        this.getList();
      },
    );
  }
  queryList = () => {
    this.setState(
      {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      () => {
        this.getList();
      },
    );
  };
  onRest = () => {
    this.formRef.current.resetFields();
    this.setState({dateTime:''});
  };

  getProCode = () => {
    let formVals = this.formRef.current.getFieldsValue();
    const newProCode = [];
    const proCode = formVals.proCode;
    const proName = formVals.proName;
    if (proCode != null && proCode != undefined && proCode.length != 0) {
      proCode.forEach(item => {
        newProCode.push(item);
      });
    }
    if (proName != null && proName != undefined && proName.length != 0) {
      proName.forEach(item => {
        newProCode.push(item);
      });
    }
    const newProCodes = newProCode.filter((item, index) => {
      return newProCode.indexOf(item) === index;
    });
    return newProCodes;
  };
  // 招募说明书列表查询
  getList = () => {
    this.setState({ tableLoading: true }, () => {
      let formVals = this.formRef.current.getFieldsValue();
      getInstructionsBoardList({
        proCode: this.getProCode(),
        disclosureDate: this.state.dateTime == '' ? '' : `${this.state.dateTime} 00:00:00.000`,
        deleted: formVals?.deleted || '',
        fileName: formVals.fileName,
        state: formVals.state,
        pageNum: this.state.current,
        pageSize: this.state.pageSize,
      }).then(res => {
        if (res?.status === 200) {
          const dataSources = [];
          let current = this.state.current;
          let pages = this.state.pageSize;
          if (res.data.rows.length != 0) {
            res.data.rows.forEach((item, index) => {
              dataSources.push({ ...item, seq: (current - 1) * pages + index + 1 });
            });
          }
          this.setState({
            dataSource: dataSources,
            total: res.data.total,
            tableLoading: false,
            selectedRowKeys: [],
          });
        } else {
          this.setState({ dataSource: [], total: 0, tableLoading: false, selectedRowKeys: [] });
        }
      });
    });
  };
  doAction = (operate, rowData) => {
    switch (operate) {
      case 'dowload':
        this.setState({ tableLoading: true }, () => {
          axios
            .get(
              `/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${rowData.fileSerialNumber}`,
              {
                responseType: 'blob',
                headers: {
                  Token: getAuthToken() || '', //设置token
                },
              },
            )
            .then(response => {
              // const headerOptions = getParameters(decodeURI(response.headers['content-disposition']), ';')
              actionDownload(
                window.URL.createObjectURL(new Blob([response.data])),
                `${rowData.fileName}`,
                // decodeURIComponent(window.atob(headerOptions.get('fileName')))
              ).then(res => {
                this.setState({ tableLoading: false });
              });
            })
            .catch(console.error);
        });
        break;
      case 'delItem':
        Modal.confirm({
          title: '系统提示',
          content: '确定需要执行该操作吗',
          onOk: ()=>{
            delBusinessArchive({
              contractId: rowData.id,
            }).then(res => {
              if (res.status === 200) {
                this.getList();
              } else {
                message.error(res.message);
              }
            });
          },
        })
        break;
      case 'check':
        router.push(`/contract/detail?id=${rowData.id}`);
        break;
      case 'guidang':
        Modal.confirm({
          title: '系统提示',
          content: '确定需要执行该操作吗',
          onOk: ()=>{
            this.setState({ tableLoading: true}, () => {
              this.cleanDraft(rowData, (data) => {
                this.batchFinalization(data.id)
              });
            });
          },
        })
        break;
      case 'preview':
        sessionStorage.setItem('_status', 'isSee');
        if (rowData?.fileSerialNumber) {
          sessionStorage.setItem(
            'templateDetailsParams',
            JSON.stringify({
              type: rowData.fileFormat,
              isSmart: 1,
              status: 'isSee',
              templateName: rowData.fileName,
              fileNumber: rowData.fileSerialNumber, // 文件流水号
              id: rowData.id,
            }),
          );
          router.push('/contract/preview');
        } else {
          message.warning('未办理流程无法预览，请先移步办理页面进行办理！')
        }
        break;
      case 'history':
        getProcessInfo({ id: rowData.id }).then(res => {
          if (res.status === 200) {
            const taskInfo = res.data.taskInstanceResponseList;
            if (taskInfo && taskInfo.length > 0) {
              router.push({
                // 转历史对应的入参如下：
                // taskId: id
                // processInstanceId: processInstanceId,
                // nodeId: taskDefinitionKey,
                pathname: '/processCenter/processHistory',
                query: {
                  taskId: res.data.id,
                  processInstanceId: taskInfo[0].processInstanceId,
                  nodeId: taskInfo[0].taskDefinitionKey,
                },
              });
            }
          } else {
            message.error(res.message);
          }
        });
        break;
      case 'cleanWord':
        sessionStorage.setItem('_status', 'isSee');
        this.setState({tableLoading: true})
        if (rowData?.fileSerialNumber) {
          let {IPObject} = this.state;
          let url = `${IPObject.gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${rowData.fileSerialNumber}`;
          const params = {
            fileUrl: url,
            acceptAllRevision: true
          }
          fetch(`${IPObject.jsApiIp}/cleandraft`, {
            method: 'POST',
            headers:{
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(params)
          }).then(suc => {
            if (suc.status == 200) {
              suc.json().then(res => {
                if (res.end) {
                  let url = res.urls['result.docx'];
                  sessionStorage.setItem('templateDetailsParams',JSON.stringify({
                    type: rowData.fileFormat,
                    isSmart: 1,
                    status: 'isSee',
                    templateName: rowData.fileName,
                    fileNumber: rowData.fileSerialNumber,
                    url: url, // 文件流水号
                    id: rowData.id,
                  }));
                  this.setState({cleanWordVisible: true, tableLoading: false});
                }
              })
            }
          })
        } else {
          message.warning('未办理流程无法预览，请先移步办理页面进行办理！');
          this.setState({tableLoading: false});
        }
      break;
    }
  };
  exportXls() {
    let formVals = this.formRef.current.getFieldsValue();
    let downParam = {
      proCode: formVals.proCode,
      fileName: formVals.fileName,
      state: formVals.state,
      pageNum: this.state.current,
      pageSize: this.state.pageSize,
    };
    if (this.state.selectedRowKeys.length > 0) {
      downParam['ids'] = this.state.selectedRowKeys;
      // downParam['ids'] = this.state.dataSource.filter(item=> this.state.selectedRowKeys.indexOf(item.id) > -1)
      //                                       .map(item=>item.fileSerialNumber)
    }
    this.setState({ tableLoading: true }, () => {
      axios
        .post(`/ams/yss-contract-server/businessArchive/batchExport`, downParam, {
          responseType: 'blob',
          headers: {
            Token: getAuthToken() || '', //设置token
          },
        })
        .then(response => {
          const headerOptions = getParameters(
            decodeURI(response.headers['content-disposition']),
            '; ',
          );
          actionDownload(
            window.URL.createObjectURL(new Blob([response.data])),
            decodeURIComponent(headerOptions.get(' filename')),
          ).then(res => {
            this.setState({ tableLoading: false });
          });
        })
        .catch(console.error);
    });
  }
  onSelectChange = (selectedRowKeys,selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows});
  };
  componentDidMount() {
    // 获取全量的产品名称
    getAllProductList({}).then(res => {
      if (res.status === 200) {
        this.setState({ productList: res.data || [] });
      }
    });
    dictsInfo({
      path: null,
      methodName: 'POST',
      linkId: 'yssBC8822B74290D2EF2C6ED8403129EE96',
      queryParams: [
        {
          type: 0,
          code: 'orgId',
          required: 1,
          value: '0',
        },
      ],
      viewId: 'yssBC8822B74290D2EF2C6ED8403129EE96',
    }).then(res => {
      if (res.status === 200) {
        this.setState({ dictsMap: res.data.rows });
      }
    });
    getNginxIP().then(res => {
      if (res?.status === 200) {
        this.setState({
          IPObject: res.data
        })
      }
    });
    // 查询 列表
    this.getList();
  }
  goBack(event) {
    event.preventDefault();
    history.go(-1);
  }
  deletedStatus() {
    if (JSON.parse(sessionStorage.getItem('USER_INFO')).usercode == 'GLAAdmin') {
      return true;
    }
    return false;
  }
  tgrDgButton() {
    const positions = JSON.parse(sessionStorage.getItem('USER_INFO'))?.positions
    if(positions) {
      for(let i = 0; i<positions.length;i++) {
        if(positions[i] == '统稿人') {
          return true
        }
      }
    }
    return false;
  }
  dateChange = (date, dateString) => {
    this.setState({
      dateTime: dateString,
    });
  };
  delVisiable = (record) => {
    const userInfo = JSON.parse(sessionStorage.getItem('USER_INFO'))
    const positions = JSON.parse(sessionStorage.getItem('USER_INFO'))?.positions
    let delV = false;
    let delT = false
    if (record.creatorId == userInfo.id) {
      delV = true
    }
    if(positions) {
      for(let i = 0; i<positions.length;i++) {
        if(positions[i] == '统稿人') {
          delT = true
        }
      }
    }
    if(delV || delT) {
      return true
    }else{
      return false;
    }
  }
  finalizeManuscript = async () =>{
    let flag = true;
    this.setState({dingGaoLoading: true});
    if(this.state.selectedRows.length < 1) {
      this.setState({dingGaoLoading: false});
      return message.warning('请勾选需要定稿的招募书');
    }
    for(let i = 0; i < this.state.selectedRows.length; i++) {
      if (this.state.selectedRows[i].state != '2') {
        flag = false;
        break;
      }
    }
    if(!flag) {
      this.setState({dingGaoLoading: false});
      return message.warning('含有在进行中或者已定稿的招募书，请重新选择！')
    }
    await this.mapCleandraft();
    await this.batchFinalization(this.state.selectedRowKeys.join());
  }
  //按拼音模糊搜素
  pinYinSearch=(val, option)=>{
    return option.children.includes(val) || pinyin(option.children, { pattern: 'initial' }).replace(/\s*/g,'').includes(val);
  }
  //循环批量清稿
  mapCleandraft = () => {
    this.state.selectedRows.forEach(item => {
      this.cleanDraft(item)
    })
  }
  //一键清稿
  cleanDraft = (data,callback = null) => {
    let {IPObject} = this.state;
      let url = `${IPObject.gateWayIp}/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${data.fileSerialNumber}`;
      const params = {
        fileUrl: url,
        acceptAllRevision: true
      }
      fetch(`${IPObject.jsApiIp}/cleandraft`, {
        method: 'POST',
        headers:{
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(params)
      }).then(suc => {
        if (suc.status == 200) {
          suc.json().then(success => {
            if(success.end) {
              fetch(`${IPObject.jsApiIp}/remove`, {
                method: 'get',
                headers:{
                  "Content-Type": "application/json;charset=UTF-8",
                },
                params:{key: data.fileSerialNumber}
              }).then(resp=>{
                let urls = success.urls;
                insteadWord({fileSerialNumber: data.fileSerialNumber, url: urls['result.docx']}).then(succ => {
                  if (callback) {
                    callback(data)
                  }
                });
              })
            }
          })
        }
      })
  }
  //批量定稿
  batchFinalization = (data) => {
    updateState({ contractIdList: data}).then(res => {
      if (res.status === 200) {
        this.setState({dingGaoLoading: false, selectedRowKeys: [], selectedRows: []});
        this.getList();
      } else {
        this.setState({dingGaoLoading: false, selectedRowKeys: [], selectedRows: []});
        message.error(res.message);
      }
    });
  }
  //打开畅写清洁版
  cleanWordFn = () => {
    this.setState({cleanWordVisible: false})
  }
  render() {
    const {
      current,
      total,
      pageSize,
      tableLoading,
      dataSource,
      productList,
      dictsMap,
      selectedRowKeys,
      dingGaoLoading,
      cleanWordVisible,
    } = this.state;
    const columns = [
      { title: `序号`, width: '60px', fixed: 'left', dataIndex: 'seq' },
      { title: '招募书名称', dataIndex: 'fileName', width: '250px', fixed: 'left' },
      {
        title: '产品名称',
        dataIndex: 'proName',
        width: '200px',
        render: (text, record, index) => {
          const curItem = this.state.productList.find(
            item => item.proCode === record['proCode'][0],
          );
          return <span> {curItem ? curItem.proName : record['proCode'][0]}</span>;
        },
      },
      { title: '产品代码', dataIndex: 'proCode', width: '120px' },
      {
        ...(this.deletedStatus() && {
          title: '删除状态',
          dataIndex: 'deleted',
          width: '100px',
          render: text => <span> {text == 0 ? '未删除' : '已删除'} </span>,
        }),
      },
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
      // { title: '数据更新进度', dataIndex: 'plannedSpeed', width: '160px', },
      {
        title: '状态',
        dataIndex: 'state',
        width: '120px',
        render: (text, record) => {
          if (record.state === '1') {
            return '进行中';
          } else if (record.state === '2') {
            return '待定稿';
          } else if (record.state === '3') {
            return '已定稿';
          } else {
            return record.state;
          }
        },
      },
      { title: '创建时间', dataIndex: 'createTime', width: '200px' },
      {
        title: '办理人',
        dataIndex: 'handler',
        width: '200px',
        // render: (_, record) => {
        //   const curItem = dictsMap.filter(
        //     item => item['yssBC8822B74290D2EF2C6ED8403129EE96丿id'] === record['creatorId'],
        //   )[0];
        //   return (
        //     <>
        //       {curItem ? curItem['yssBC8822B74290D2EF2C6ED8403129EE96丿name'] : record['creatorId']}
        //     </>
        //   );
        // },
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '150px',
        fixed: 'right',
        render: (text, record) => (
          <span>
            {/* <Button type="link" onClick={() => this.doAction('dowload', record)}>
              {' '}
              下载{' '}
            </Button>
            {this.delVisiable(record) && <Popconfirm
              icon={<QuestionCircleOutlined style={{ color: '#3384D5' }} />}
              placement="topRight"
              title="确定需要执行该操作吗?"
              onConfirm={() => this.doAction('delItem', record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link"> 删除 </Button>
            </Popconfirm>}
            {this.tgrDgButton() && record.state == '2' && (
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: '#3384D5' }} />}
                placement="topRight"
                title="确定需要执行该操作吗?"
                onConfirm={() => this.doAction('guidang', record)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="link"> 定稿 </Button>
              </Popconfirm>
            )}
            <Button type="link" onClick={() => this.doAction('preview', record)}>
              {' '}
              预览{' '}
            </Button>
            <Button type="link" onClick={() => this.doAction('history', record)}>
              {' '}
              流转历史{' '}
            </Button>
            <Button type="link" onClick={() => this.doAction('cleanWord', record)}>
              {' '}
              下载清洁版{' '}
            </Button> */}
            <Select onSelect={(value)=>{this.doAction(value,record)}} placeholder='请选择操作' size='middle' showArrow={false} style={{width: '120px'}}>
              <Option value='dowload'>下载</Option>
              {this.delVisiable(record) && <Option value='delItem'>删除</Option>}
              { this.tgrDgButton() && record.state == '2' && <Option value='guidang'>定稿</Option>}
              <Option value='preview'>预览</Option>
              <Option value='history'>流转历史</Option>
              <Option value='cleanWord'>下载清洁版</Option>
            </Select>
          </span>
        ),
      },
    ];

    const stateList = [
      { value: '进行中', key: '1' },
      { value: '待定稿', key: '2' },
      { value: '已定稿', key: '3' },
    ];
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
            <Breadcrumb.Item>招募说明书看板</Breadcrumb.Item>
          </Breadcrumb>
        </Row>

        <div style={{ padding: '12px', background: '#ffffff' }}>
          <Row>
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
                  <Form.Item label="招募书名称" name="fileName">
                    <Input placeholder="请输入" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="产品名称" name="proName">
                    <Select
                      showArrow
                      optionFilterProp='children'
                      filterOption={(input, option)=>this.pinYinSearch(input, option)}
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
              </Row>
              <Row>
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
                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
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
                <Col span={12}>
                  <Form.Item label="状态" name="state">
                    <Select allowClear placeholder="请选择">
                      {stateList.map(item => (
                        <Option value={item.key} key={item.key}>
                          {' '}
                          {item.value}{' '}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                {JSON.parse(sessionStorage.getItem('USER_INFO')).usercode == 'GLAAdmin' && (
                  <Col span={12}>
                    <Form.Item label="删除状态" name="deleted">
                      <Select allowClear placeholder="请选择">
                        <Option value={1} key={1}>
                          {' '}
                          已删除{' '}
                        </Option>
                        <Option value={0} key={0}>
                          {' '}
                          未删除{' '}
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}
                <Col span={12}>
                  <Form.Item label="披露日期选择" name="disclosureDate">
                    <DatePicker onChange={this.dateChange} />
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
          </Row>
          <Space style={{ marginBottom: 16, float: 'right' }}>
          <Button loading={tableLoading ? true : dingGaoLoading} onClick={() => this.finalizeManuscript()}>
              {' '}
              批量定稿{' '}
            </Button>
            <Button loading={tableLoading} onClick={() => this.exportXls()}>
              {' '}
              导出{' '}
            </Button>
          </Space>
          <Table
            scroll={{ x: '1200px', y: 'calc(65vh)' }}
            columns={columns}
            dataSource={dataSource}
            loading={tableLoading}
            currentPage={current}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              total,
              current,
              pageSize,
              showTotal: totals => `共 ${totals} 条数据`,
              onChange: (page, pageSize) => this.onPageChange(page, pageSize),
            }}
            rowKey={record => record.id}
            rowSelection={{
              selectedRowKeys,
              onChange: this.onSelectChange,
            }}
          />
        </div>
        <Modal visible={cleanWordVisible} mask={true} destroyOnClose={true} onCancel={() => this.cleanWordFn()} width={1200} style={{ top: 20 }} footer={null} maskClosable={false}>
          <CleanWord></CleanWord>
        </Modal>
      </div>
    );
  }
}
export default Index;
