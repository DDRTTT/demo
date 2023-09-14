import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'umi';
import request from '@/utils/request';
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import Action from '@/utils/hocUtil';
import styles from './index.less';
// import { tsImportEqualsDeclaration } from '@babel/types';

const { Search } = Input;
let templateLableArr = [];

class TemplateClauseManage extends Component {
  formRef = React.createRef();
  state = {
    visible: false,
    page: 1,
    limit: 10,
    modalData: {},
    id: '',
    isEdit: false,
    text: '',
    IPObject: {},
    btnLoading: false,
    values: {},
    selectLoading: false,
    checkboxLoading: false,
    tabLoading: false,
    flabelNameArr: [],
    str: '',
  };

  mapLimit = (list, limit, asyncHandle) => {
    let recursion = arr => {
      return asyncHandle(arr.shift()).then(() => {
        if (arr.length !== 0) return recursion(arr);
        else return '';
      });
    };

    let listCopy = [].concat(list);
    let asyncList = []; // 正在进行的所有并发异步操作
    while (limit--) {
      asyncList.push(recursion(listCopy));
    }
    return Promise.all(asyncList).then(() => {
      const { values } = this.state;
      this.handleSave(values);
    }); // 所有并发异步操作都完成后，本次并发控制迭代完成
  };

  // 列表总条数
  showTotal = total => {
    return `共 ${total} 条数据`;
  };

  // 切换页码
  changePage = (page, pageSize) => {
    this.setState({ page, limit: pageSize });
    this.getTableList(page, pageSize);
  };

  // 切换页大小
  changePageSize = (page, pageSize) => {
    this.setState({ page: 1, limit: pageSize }, () => {
      this.getTableList(this.state.page, pageSize);
    });
  };

  getLabelList = text => {
    const { dispatch } = this.props;
    this.setState({ selectLoading: true }, () => {
      dispatch({
        type: 'tempClauseManage/getLabelList',
        payload: { text },
      }).then(res => {
        if (res) {
          this.setState({ selectLoading: false });
        }
      });
    });
  };

  selectLabel = value => {
    let { text } = this.state;
    let { labelList } = this.props.tempClauseManage;
    labelList.forEach(item => {
      if (item.code === value) {
        text = item.text;
      }
    });
    this.setState({ text });
    this.getTempList(value);
  };

  getTempList = labelName => {
    const { dispatch } = this.props;
    this.setState({ checkboxLoading: true }, () => {
      dispatch({
        type: 'tempClauseManage/getTempList',
        payload: {
          labelName,
        },
      }).then(res => {
        if (res) {
          this.setState({ checkboxLoading: false });
        }
      });
    });
  };

  showModal = () => {
    const { dispatch } = this.props;
    // this.setState({ visible: true, isEdit: false, modalData: {}, tempList: [] });
    this.setState({ visible: true, isEdit: false, modalData: {} });
    dispatch({
      type: 'tempClauseManage/initTempList',
      payload: [],
    });
    this.getLabelList('');
  };

  showEditModal = modalData => {
    this.setState({ modalData, visible: true, isEdit: true, id: modalData.id, flabelNameArr: [] });
    this.getTempList(modalData.flabelName.split(','));
    this.getLabelList('');
  };

  // 新增配置取消
  handleCancel = () => {
    this.formRef.current.resetFields(['fname', 'flabelName', 'ftemplateId', 'fvalue']);
    this.setState({ visible: false, modalData: {}, isEdit: false, btnLoading: false, checkboxLoading: false });
  };

  afterClose = () => {
    this.setState({ modalData: {}, isEdit: false, btnLoading: false, checkboxLoading: false });

  };

  handleSave = data => {
    // 保存的数据准备，勿删！
    delete data.xxxx;
    // let str = data.ftemplateId;
    let keyArr = data.ftemplateId.split(','),
      _keyArr = [];
    keyArr.forEach(item => {
      if (!_keyArr.includes(item.split('_')[0])) {
        _keyArr.push(item.split('_')[0]);
      }
    });
    data.ftemplateId = _keyArr.join(',');
    data.flabelName = data.flabelName.join(',');
    data.templateLable = templateLableArr.join(',');
    const { page, limit, id, isEdit } = this.state;
    const payload = isEdit ? { id, ...data } : data;
    // return;
    request(`/yss-contract-server/clause/add`, {
      method: 'POST',
      data: payload,
    })
      .then(res => {
        templateLableArr = [];
        if (res?.status === 200) {
          message.success(res.message);
          this.getTableList(page, limit);
          this.setState({ visible: false, isEdit: false, modalData: {}, btnLoading: false });
          this.formRef.current.resetFields();
        }
        if (res?.status?.toString().length === 8) {
          message.warn(res.message);
          this.setState({ isEdit: false, btnLoading: false });
        }
      })
      .catch(res => {
        templateLableArr = [];
        message.warning(res.message);
        this.setState({ visible: false, isEdit: false, modalData: {} });
        this.formRef.current.resetFields();
      });
  };

  // 替换标签的txt
  replaceTagsTxt = replaceTagsTxtParms => {
    request(`/yss-contract-server/directory/updateByLabelName`, {
      method: 'POST',
      data: replaceTagsTxtParms,
    }).then(res => {
      if (res?.status?.toString().length === 8) {
        message.warn(res.message);
      }
    });
  };

  // 替换
  magic = values => {
    const { IPObject, isEdit, id, modalData, str } = this.state;
    let keyArr = isEdit ? values.templateLable.split(',') : values.ftemplateId.split(','),
      paramsArr = [],
      replaceTagsTxtParms = [];
    let placeIndex = {};
    let tempIndex = 0;
    keyArr.forEach(item => {
      let tempArr = item.split('_');
      replaceTagsTxtParms.push({
        changxieKey: tempArr[0],
        labelName: tempArr[1],
        text: values.fvalue,
      });
      if (+placeIndex[tempArr[0]] != NaN && +placeIndex[tempArr[0]] >= 0) {
        paramsArr[placeIndex[tempArr[0]]].jsonArr.push({
          name: tempArr[1],
          id: '',
          clear: true,
          content: { body: [{ span: [{ '@value': values.fvalue }] }] },
        });
        paramsArr[placeIndex[tempArr[0]]]?.tagsName?.push(tempArr[1]);
        paramsArr[placeIndex[tempArr[0]]]?.oldFileSerialNumber?.push(tempArr[2]);
      } else {
        placeIndex[tempArr[0]] = tempIndex;
        paramsArr[tempIndex] = {
          jsonArr: [
            {
              name: tempArr[1],
              id: '',
              clear: true,
              content: { body: [{ span: [{ '@value': values.fvalue }] }] },
            },
          ],
          fileUrl: `${IPObject.gateWayIp
            }/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${item.split('_')[2]}`, // 已文件流方式
          key: tempArr[0],
          tagsName: [tempArr[1]],
          oldFileSerialNumber: [tempArr[2]],
          templateLable: isEdit ? modalData.templateLable : str,
          id,
        };
        tempIndex++;
      }
    });
    // keyArr.forEach(item => {
    //   paramsArr.push({
    //     jsonArr: [
    //       {
    //         name: item.split('_')[1],
    //         id: '',
    //         clear: true,
    //         content: { body: [{ span: [{ '@value': values.fvalue }] }] },
    //       },
    //     ],
    //     fileUrl: `${
    //       IPObject.gateWayIp
    //     }/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${item.split('_')[2]}`, // 已文件流方式
    //     key: item.split('_')[0],
    //     tagsName: item.split('_')[1],
    //     oldFileSerialNumber: item.split('_')[2],
    //     templateLable: isEdit ? modalData.templateLable : str,
    //     id,
    //   });
    //   replaceTagsTxtParms.push({
    //     changxieKey: item.split('_')[0],
    //     labelName: item.split('_')[1],
    //     text: values.fvalue,
    //   });
    // });
    this.replaceTagsTxt(replaceTagsTxtParms);

    let count = 0;
    let _limit = paramsArr.length > 1 ? 1 : paramsArr.length; // 设置最大并发数为1  替换标签内容的接口必须一个一个的调用,不然会出现文档错误替换,
    this.mapLimit(paramsArr, _limit, item => {
      return new Promise(resolve => {
        count++;
        fetch(`${IPObject.jsApiIp}/addtocontentcontrol`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
          },
          method: 'POST',
          body: JSON.stringify({
            jsonArr: JSON.stringify(item.jsonArr),
            fileUrl: item.fileUrl,
          }),
        }).then(res => {
          if (res.status === 200) {
            res.json().then(response => {
              if (response?.end === true) {
                // console.log('当前并发量:', count--);
                // 替换后的文档 保存
                request('/ams-file-service/template/updateTemplateByBusId', {
                  method: 'POST',
                  data: {
                    busId: item.key,
                    url: response?.urls['result.docx'],
                    // "oldFileSerialNumber": item.oldFileSerialNumber,
                    // "templateLable": item.templateLable,
                    // "id": item.id,
                  },
                }).then(res => {
                  if (res?.status === 200) {
                    item.tagsName.forEach(sonitem => {
                      templateLableArr.push(item.key + '_' + sonitem + '_' + res.data.newSerialNum);
                    });

                    // 清除文档缓存
                    fetch(`${IPObject.jsApiIp}/remove?key=${item.key}`).then(res => {
                      if (res?.status === 200) {
                        resolve();
                      }
                    });
                  }
                  if (res?.status?.toString().length === 8) {
                    message.warn(res.message);
                  }
                });
              }
            });
          }
        });
      });
    }).then(() => { });
  };

  // 新增配置提交
  handleModalSubmit = values => {
    // const { tempClauseManage: { tempList }, } = this.props;
    const {
      IPObject,
      // modalData,
      // isEdit
    } = this.state;
    if (Array.isArray(values.ftemplateId)) {
      if (values.ftemplateId.length > 1) {
        values.ftemplateId = values.ftemplateId.join(',');
      } else {
        values.ftemplateId = values.ftemplateId[0];
      }
    }
    let str = values.ftemplateId;
    let arr = values.ftemplateId.split(','),
      _arr = [];
    arr.forEach(item => {
      if (!_arr.includes(item.split('_')[0])) {
        _arr.push(item.split('_')[0]);
      }
    });
    values.templateLable = str;
    this.setState({ values, btnLoading: true, str }, () => {
      const pArr = [];
      _arr.forEach(val => {
        pArr.push(
          new Promise(resolve => {
            fetch(`${IPObject.jsApiIp}/IsOnline?key=${val}`).then(res => {
              if (res?.status === 200) {
                res.json().then(response => {
                  resolve(response);
                });
              }
            });
          }),
        );
      });
      Promise.all(pArr).then(result => {
        let flag = true;
        for (let i = 0; i < result.length; i++) {
          if (result[i].online) {
            let userName = '';
            if (result[i].users.length > 1) {
              result[i].users.forEach(item => {
                userName += item.username + ' ';
              });
            } else {
              userName = result[i].users[0].username;
            }
            message.warn(`${userName}正在编辑当前文档，不能进行替换，请所有人退出文档编辑后再试`);
            flag = false;
            this.setState({ btnLoading: false });
            break;
          }
        }
        if (flag) {
          this.magic(values);
        }
      });
    });

    // this.handleSave(values);
  };

  deleteItem = record => {
    Modal.confirm({
      title: '请确认是否删除?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        let ftemplateId = record.ftemplateId;
        if (Array.isArray(ftemplateId)) {
          if (ftemplateId.length > 0) {
            ftemplateId = ftemplateId.join(',');
          } else {
            ftemplateId = ftemplateId[0];
          }
        }
        const payload = {
          id: record.id,
          fname: record.fname,
          fvalue: record.fvalue,
          flabelName: record.flabelName, // 不要修改！
          ftemplateId,
        };
        dispatch({
          type: 'tempClauseManage/deletItem',
          payload,
          callback: () => {
            const { page, limit } = this.state;
            this.getTableList(page, limit);
          },
        });
      },
    });
  };

  // 获取表格数据
  getTableList = (page, pageSize) => {
    const { dispatch } = this.props;
    this.setState({ tabLoading: true }, () => {
      dispatch({
        type: 'tempClauseManage/getList',
        payload: {
          page,
          pageSize,
        },
      }).then(res => {
        if (res) {
          this.setState({ tabLoading: false });
        }
      });
    });
  };

  // 获取地址
  getNginxIP = () => {
    request('/yss-contract-server/contractfile/getnginxip').then(res => {
      if (res?.status === 200) {
        this.setState({ IPObject: res.data });
      }
    });
  };

  componentDidMount() {
    const { page, limit } = this.state;
    this.getTableList(page, limit);
    this.getNginxIP();
  }

  render() {
    const {
      btnLoading,
      page,
      limit,
      visible,
      modalData,
      isEdit,
      selectLoading,
      checkboxLoading,
      tabLoading,
      // flabelNameArr,
    } = this.state;
    const { total, dataSource, labelList, tempList } = this.props.tempClauseManage;
    const { TextArea } = Input;
    const columnTooltip = text => {
      return (
        <Tooltip title={text} placement="topLeft">
          <span>{text}</span>
        </Tooltip>
      );
    };
    const columns = [
      {
        key: 'number',
        title: '序号',
        dataIndex: 'number',
        width: 70,
        render: (text, record, index) => `${(page - 1) * limit + (index + 1)}`,
      },
      {
        key: 'fname',
        title: '管理标识',
        dataIndex: 'fname',
        width: 150,
        ellipsis: true,
        render: columnTooltip,
      },
      {
        key: 'flabelName', // 不要修改名称
        title: '文档标签',
        dataIndex: 'flabelName', // 不要修改名称
        width: 150,
        ellipsis: true,
        render: columnTooltip,
      },
      {
        key: 'tempName',
        title: '对应模板',
        dataIndex: 'tempName',
        width: 200,
        ellipsis: true,
        render: columnTooltip,
      },
      {
        key: 'fvalue',
        title: '替换内容',
        dataIndex: 'fvalue',
        width: 200,
        ellipsis: true,
        render: columnTooltip,
      },
      {
        key: 'handle',
        title: '操作',
        fixed: 'right',
        width: 160,
        render: (item, record) => (
          <div>
            <Link to={`/contract/templateClauseManage/check?id=${record.id}`}>查看</Link>
            <Action code="templateClauseManage:update">
              <a style={{ margin: '0 16px 0 16px' }} onClick={() => this.showEditModal(record)}>
                修改
              </a>
            </Action>
            <Action code="templateClauseManage:delete">
              <a onClick={() => this.deleteItem(record)}>删除</a>
            </Action>
          </div>
        ),
      },
    ];
    const formItemLayout2 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
      },
    };

    return (
      <>
        <Card bordered={false}>
          <Row>
            <Col md={12} sm={12}>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <span>电子档案管理</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <span>模板条款管理</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Card>
        <Card extra={
          <Action code="templateClauseManage:add">
            <Button type="primary" onClick={this.showModal}>
              新增
            </Button>
          </Action>
        }>
          <Table
            rowKey="id"
            loading={tabLoading}
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: 1000 }}
            pagination={{
              onChange: this.changePage,
              onShowSizeChange: this.changePageSize,
              total: total,
              pageSize: limit,
              current: page,
              showTotal: this.showTotal,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
          <Modal
            title={isEdit ? '修改配置' : '新增配置'}
            centered
            visible={visible}
            footer={null}
            onCancel={this.handleCancel}
            destroyOnClose={true}
            zIndex={998}
            width={720}
          >
            <Spin spinning={btnLoading} size="small">
              <Form
                onFinish={this.handleModalSubmit}
                ref={this.formRef}
                initialValues={isEdit ? {
                  fname: modalData?.fname,
                  flabelName: modalData.flabelName.split(','),
                  ftemplateId: modalData?.templateLable?.split(','),
                  fvalue: modalData?.fvalue,
                } : {}}
              >
                <Form.Item
                  {...formItemLayout2}
                  label="管理标识"
                  name="fname"
                  rules={[{ required: true, message: '请填写管下标识' }]}
                >
                  <Input disabled={isEdit} />
                </Form.Item>
                <Form.Item {...formItemLayout2} label="标注内容" name="xxxx">
                  {/* <Search
                    disabled={isEdit}
                    // placeholder="请输入标注内容"
                    allowClear
                    onSearch={value => this.getLabelList(value)}
                  /> */}
                  <Search placeholder="请输入标注内容" onSearch={value => this.getLabelList(value)} />
                </Form.Item>
                <Spin size="small" spinning={selectLoading}>
                  <Form.Item
                    {...formItemLayout2}
                    label="文档标签"
                    name="flabelName"
                    rules={[{ required: true, message: '请选择文档标签' }]}
                  >
                    <Select onChange={this.selectLabel} disabled={isEdit} mode="multiple">
                      {labelList.map(item => {
                        return (
                          <Select.Option value={item.name} key={item.code}>
                            {`${item.name}-标签数量(${item.labelConut})-涉及模板(${item.tempConut})`}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Spin>
                <Spin size="small" spinning={checkboxLoading}>
                  <Form.Item
                    label="选择模板"
                    {...formItemLayout2}
                    name="ftemplateId"
                    rules={[{ required: true, message: '请选择模板' }]}
                  >
                    <Checkbox.Group className={styles.selTempt} disabled={false}>
                      {tempList
                        ? tempList.map(item => {
                          return (
                            <Row key={item.code}>
                              {item.name}
                              {item.list &&
                                item.list.map((k, i) => (
                                  <Col
                                    md={24}
                                    sm={24}
                                    style={{ paddingLeft: 20 }}
                                    key={k.code + i}
                                  >
                                    <Checkbox
                                      value={
                                        k.code + '_' + k.labelName + '_' + k.fileSerialNumber
                                      }
                                    >
                                      {k.labelName.length > 10 ? (
                                        <Tooltip
                                          title={k.labelName}
                                          placement="topLeft"
                                        >{`${k.labelName.substr(0, 10)}...`}</Tooltip>
                                      ) : (
                                        k.labelName
                                      )}
                                      <span style={{ color: '#ddd', marginLeft: 8 }}>
                                        --
                                        {k.text.length > 20
                                          ? `${k.text.substr(0, 20)}...`
                                          : k.text}
                                      </span>
                                    </Checkbox>
                                  </Col>
                                ))}
                            </Row>
                          );
                        })
                        : ''}
                    </Checkbox.Group>
                  </Form.Item>
                </Spin>
                <Form.Item
                  label="替换内容"
                  {...formItemLayout2}
                  name="fvalue"
                  rules={[{ required: true, message: '请填写替换内容' }]}
                >
                  <TextArea className={styles.txtarea} placeholder="请填写替换内容" />
                </Form.Item>
                <Form.Item style={{ marginLeft: '472px' }}>
                  <Button style={{ marginRight: '16px' }} onClick={this.handleCancel}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit" loading={btnLoading}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
        </Card>
      </>
    );
  }
}

export default connect(({ tempClauseManage }) => ({ tempClauseManage }))(TemplateClauseManage);
