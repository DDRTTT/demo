import router from 'umi/router';
import React, { Component } from 'react';
import { Table, Button, Space, Modal, Breadcrumb, Row, message, Popconfirm, Upload } from 'antd';
import { InfoCircleOutlined, QuestionCircleOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import SeaHeader from './SeaHeader';
import AddTplSet from './AddTplSet';
import { getAuthToken, getSession, setSession } from '@/utils/session';
import { getTplList, auditTpls, getAllProductList, dictsInfo, getBaseList } from '@/services/prospectuSet';
import { delTemplate, delTagData, getFilePathByCode } from '@/services/templateSet';
import { actionDownload, getParameters } from '@/utils/download';
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      productList: [],
      dictsMap: [],
      current: 1,
      pageSize: 10,
      total: 20,
      templateDelTip: false,
      delLoading: false,
      tableLoading: false,
      delId: '',
      selectedRowKeys: [],
      disabledChecked: false,
      disabledUnChecked: false,
      paramsObj: {},
      uploadBtnLoading: false,
    };
    this.containerRef = React.createRef();
  }
  componentDidMount () {
    getAllProductList({}).then(res=>{
      if (res.status === 200 ) {
        this.setState({ productList: res.data||[] });
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
    this.getList();
  }
  getList = (paramsObj) => {
    if (paramsObj) {
      for(let k in paramsObj) {
        if (Array.isArray(paramsObj[k])) {
          this.state.paramsObj[k] = paramsObj[k].join()
        } else {
          this.state.paramsObj[k] = paramsObj[k]
        }
        this.setState({
          current: 1,
          pageSize: 10
        })
      }
    }
    const params = {
      pageSize: this.state.pageSize,
      currentPage: this.state.current,
      ...this.state.paramsObj,
    }
    this.setState({ tableLoading: true }, () => {
      getBaseList(params).then(res => {
        if (res.status === 200) {
          if(res?.data){
            const dataSources = [];
          let current = this.state.current;
          let pages = this.state.pageSize
          dataSources.push({...res.data,seq:1});
          this.setState({
            dataSource: dataSources,
            total: 1,
            tableLoading: false,
            selectedRowKeys: [],
            disabledChecked: false,
            disabledUnChecked: false,
          });
          } else {
            this.setState({
              dataSource: [],
              total: 0,
              tableLoading: false,
              selectedRowKeys: [],
              disabledChecked: false,
              disabledUnChecked: false,
            });
          }
        } else {
          this.setState({
            dataSource: [],
            total: 0,
            tableLoading: false,
            selectedRowKeys: [],
            disabledChecked: false,
            disabledUnChecked: false,
          });
        }
      }).catch(err=>{
        console.log(err);
        this.setState({
          dataSource: [],
          total: 0,
          tableLoading: false,
          selectedRowKeys: [],
          disabledChecked: false,
          disabledUnChecked: false,
        });
      })
    });
  }
  handleClick = () => {
    this.containerRef.current.showModal();
  }
  rowBtn = (action, rowData) => {
    switch (action) {
      case 'isSee':
        this.containerRef.current.jumpPage(rowData, 'isSee');
        break;
      case 'isUpdate':
        this.containerRef.current.jumpPage(rowData, 'isUpdate');
        break;
      case 'delItem':
        this.setState({ templateDelTip: true, delId: rowData.id });
        break;
      case 'checked':
      case 'unChecked':
        auditTpls({ id: [rowData.id] }, action).then(res=>{
          if (res.status === 200 ) {
            this.getList();
          }
        })
        break;
      case 'download':
        this.setState({ tableLoading: true }, ()=>{
          axios.get(
            `/ams/ams-file-service/fileServer/downloadUploadFile?getFile=${rowData.fileSerialNumber}`,
           {
            responseType: 'blob',
            headers: {
              'Token': getAuthToken() || ''//设置token
            },
          }).then(response => {
            // const headerOptions = getParameters(decodeURI(response.headers['content-disposition']), ';')
            actionDownload(
              window.URL.createObjectURL(new Blob([response.data])),
              rowData.recruitmentName
              // decodeURIComponent(window.atob(headerOptions.get('fileName')))
            ).then(res=>{
              this.setState({tableLoading: false})
            })
          }).catch(console.error);
        })
        break;
    }
  }
  exportXls () {
    let downParam = {
      pageSize: this.state.pageSize,
      currentPage: this.state.current,
      ...this.state.paramsObj,
    }
    if (this.state.selectedRowKeys.length > 0 ) {
      downParam['ids'] = this.state.dataSource.filter(item=> this.state.selectedRowKeys.indexOf(item.id) > -1)
                                            .map(item=>item.fileSerialNumber)
    }
    this.setState({ tableLoading: true }, ()=>{
      axios.post(
        `/ams/ams-file-service/template/batchExport`,
        downParam,
        {
          responseType: 'blob',
          headers: {
            'Token': getAuthToken() || ''//设置token
        },
      }).then(response => {
        const headerOptions = getParameters(decodeURI(response.headers['content-disposition']), '; ')
        actionDownload(
          window.URL.createObjectURL(new Blob([response.data])),
          decodeURIComponent(headerOptions.get('filename'))
        ).then(res=>{
          this.setState({tableLoading: false})
        })
      }).catch(console.error);
    })
  }
  golbalBtn (action) {
    const { dataSource, selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      message.warn(`您还没有选择数据!`)
      return
    }
    auditTpls({ id: selectedRowKeys }, action).then(res=>{
      if (res.status === 200 ) {
        this.getList();
      }
    })
  }
  // 删除模板
  delConfirm = () => {
    this.setState({ delLoading: true }, () => {
      const { delId, dataSource } = this.state;
      delTemplate([delId]).then(res=>{
        if (res.status === 200 ) {
          message.success('操作成功');
          this.setState({ delLoading: false, templateDelTip: false });
          this.getList(); 
          const delKey = dataSource.find(item => item.id===delId)['templateKey'];
          // 删除模板时同步删除掉模板中的标签数据
          delTagData({ changxieKey: delKey })
        }
      })
    });
  };

  onSelectChange = selectedRowKeys => {
    const { dataSource, disabledChecked, disabledUnChecked } = this.state;
    let checkeds = dataSource.filter(item=> selectedRowKeys.indexOf(item.id) > -1)
    .map(item=>item.checked)
    if (checkeds.length ===0 ) {
      this.setState({
        selectedRowKeys,
        disabledChecked: false,
        disabledUnChecked: false,
      });
      return
    }
    if (checkeds.every(checked=>checked===1)) { // 全是已审核状态
      this.setState({
        selectedRowKeys,
        disabledChecked: true,
        disabledUnChecked: false,
      });
    } else if (checkeds.every(checked=>checked===0)) {  // 全是未审核状态
      this.setState({
        selectedRowKeys,
        disabledChecked: false,
        disabledUnChecked: true
      });
    } else {
      this.setState({
        selectedRowKeys,
        disabledChecked: true,
        disabledUnChecked: true
      });
    }
  };
  onPageChange (page, pageSize) {
    this.setState({
      current: page,
      pageSize: pageSize
    }, ()=>{
      this.getList();
    })
  }
  goBack (event) {
    event.preventDefault();
    history.go(-1);
  }
  uploadChange = info => {
    // 导入模版
    if (info.file.status === 'uploading') {
      this.setState({uploadBtnLoading:true});
    }
    if (info.file.status === 'done') {
      if (info?.file?.response?.status === 200) {
        message.success(`${info.file.name} 导入成功`);
        // 获取文件路劲信息
        getFilePathByCode({
          code: info?.file?.response?.data
        }).then(res=>{
          if (res.status === 200 ) {
            const formVals = {
              "ownershipInstitution": getSession('USER_INFO')?JSON.parse(getSession('USER_INFO'))['orgId'] : '',
              "templateName": res.data.fileName,
              "type": "docx",
              "isSmart": 1,
              "status": "upload",
              "templateType": 0,
              ...res.data,
            };
            this.jumpPage(formVals, 'upload');
          }
        });
        this.setState({uploadBtnLoading:false});
      } else {
        message.warn(info?.file?.response.message);
        this.setState({uploadBtnLoading:false});
      }
    }
    if (info.file.status === 'error') {
      message.warn(`${info.file.name} 导入失败，请稍后再试`);
      this.setState({uploadBtnLoading:false});

    }
  };
  beforeUpload = file => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.warn('文件不能大于100M!');
    }
    return isLt100M;
  };
  jumpPage = (item, status) => {
    item.status = status;
    setSession('_status', status);
    setSession('templateDetailsParams', JSON.stringify(item));
    router.push('/contract/templateDetails');
  };
  render() {
    const { dataSource, delId, current, total, pageSize, templateDelTip, delLoading, tableLoading, selectedRowKeys, disabledChecked, disabledUnChecked, dictsMap } = this.state;
    const delItem = dataSource.find(item => item.id===delId);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: `序号`,
        width: '60px',
        fixed: 'left',
        render: (text, record, index) => {
          return ( <span> {index+1}</span> );
        },
      },
      {
        title: `招募说明书名称`,
        dataIndex: 'recruitmentName',
        width: '250px',
        fixed: 'left',
      },
      {
        title: `最新更新时间`,
        dataIndex: 'lastEditTime',
        width: '200px',
      },
      {
        title: '最新更新人',
        dataIndex: 'lastEditorId',
        width: '120px',
        render: (_, record) => {
          const curItem = dictsMap.filter(item=>item['yssBC8822B74290D2EF2C6ED8403129EE96丿id']===record['lastEditorId'])[0]
          return (
            <>
              {curItem ? curItem['yssBC8822B74290D2EF2C6ED8403129EE96丿name']:record['lastEditorId'] }
            </>
          );
        },
      },
      {
        title: `数据来源`,
        dataIndex: 'dataFrom',
        width: '120px',
      },
      {
        title: '状态',
        dataIndex: 'checked',
        width: '100px',
        render: (_, record) => {
          return (
            <>
              <Button type="text" size='small'> {record.checked ? '已审核':'未审核'} </Button>
            </>
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'id',
        width: '400px',
        fixed: 'right',
        render: (_, record) => {
          return (
            <>
              <Button type="link" onClick={ () => this.rowBtn('isSee', record) }> 查看 </Button>
              <Button type="link" disabled={record.checked===1} onClick={ () => this.rowBtn('isUpdate', record) }> 修改 </Button>
              <Button type="link" disabled={record.checked===1} onClick={ () => this.rowBtn('delItem', record )}> 删除 </Button>
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: '#3384D5' }} /> }
                placement="topRight"
                title='确定需要执行该操作吗?'
                onConfirm={() => this.rowBtn('checked', record) }
                okText="确认"
                cancelText="取消"
              >
                <Button type="link" disabled={record.checked===1}> 审核 </Button>
              </Popconfirm>
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: '#3384D5' }} /> }
                placement="topRight"
                title='确定需要执行该操作吗?'
                onConfirm={() => this.rowBtn('unChecked', record) }
                okText="确认"
                cancelText="取消"
              >
                <Button type="link" disabled={record.checked!==1}> 反审核 </Button>
              </Popconfirm>
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: '#3384D5' }} /> }
                placement="topRight"
                title='确定需要执行该操作吗?'
                onConfirm={() => this.rowBtn('download', record) }
                okText="确认"
                cancelText="取消"
              >
                <Button type="link"> 下载 </Button>
              </Popconfirm>
            </>
          );
        },
      },
    ];
    const uploadProps = {
      action: '/ams/ams-file-service/template/uploadFile',
      name: 'file',
      headers: {
        // Token: getAuthToken(),
      },
    };
    return (
      <div>
        <Row>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Space size={20}>
                <a href="#" onClick={this.goBack}> <LeftOutlined /> 返回 </a>
                <a href="/base/processCenterHome"> 首页 </a>
              </Space>
            </Breadcrumb.Item>
            <Breadcrumb.Item>招募说明书</Breadcrumb.Item>
            <Breadcrumb.Item>招募说明书标准模板</Breadcrumb.Item>
          </Breadcrumb>
        </Row>
        <div style={{ padding: '12px', background: '#ffffff' }}>
          <Space style={{ marginBottom: 16, float: 'right', }}>
          <Upload
              {...uploadProps}
              data={{
                uploadFilePath: `contractfile/orgTemplate`,
              }}
              accept=".docx"
              onChange={e => this.uploadChange(e)}
              beforeUpload={e => this.beforeUpload(e)}
              showUploadList={false}
            >
              <Button
                type="primary"
                loading={this.state.uploadBtnLoading}
              >
                导入模板
              </Button>
            </Upload>
            {/* <Button disabled={disabledChecked} onClick={ () => this.golbalBtn('checked') }> 审核通过 </Button> */}
            {/* <Button disabled={disabledUnChecked} onClick={ () => this.golbalBtn('unChecked') }> 审核不通过 </Button> */}
          </Space>
          <Table  scroll={{ x: '1200px', y: 'calc(65vh)' }}
            pagination={ {
              showSizeChanger: true,
              showQuickJumper: true,
              total,
              current,
              pageSize,
              showTotal: totals => `共 ${totals} 条数据`,
              onChange: (page, pageSize) => this.onPageChange(page, pageSize)
            } }
            dataSource={dataSource}
            columns={columns}
            loading={tableLoading}
            rowSelection={rowSelection}
            rowKey={record => record.id}
            />
          <AddTplSet ref={this.containerRef} />
          <Modal
            title="提示"
            visible={templateDelTip}
            onClick={() => this.setState({ templateDelTip: false, delLoading: false })}
            destroyOnClose={true}
            footer={null}
            width={450}
            onCancel={() => this.setState({ templateDelTip: false, delLoading: false })}
          >
            <div>
              <p>
                <InfoCircleOutlined style={{ color: '#3384D5', marginRight: 10 }} theme="filled" />
                确定删除 { delItem?delItem['recruitmentName'] : '' } 么？
              </p>
              <div style={{ textAlign: 'right' }}>
                <Button loading={delLoading} type="primary" onClick={() => this.delConfirm()}>
                  确定
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => this.setState({ templateDelTip: false, delLoading: false })}
                >
                  取消
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

export default Index;
