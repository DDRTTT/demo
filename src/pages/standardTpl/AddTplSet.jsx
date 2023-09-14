import router from 'umi/router';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Modal, Form, Input, Button, Select, Space, Upload, Radio, message, Tooltip } from 'antd';
import { getCustodianList, getProductList, getTplInfo, copyTemplate  } from '@/services/prospectuSet';
import {
  getFilePathByCode,
} from '@/services/templateSet';
import { getSession, setSession } from '@/utils/session'
import { ConsoleSqlOutlined } from '@ant-design/icons';
const { Option } = Select;
const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
const tailLayout = {
  wrapperCol: { offset: 5, span: 15 },
};

const Add = forwardRef((
  props,
  ref,
) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadBtnLoading, setUploadBtnLoading] = useState(false);
  const [disableUpload, setDisableUpload] = useState(true);
  const [custodianList, setCustodianList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    showModal,
    jumpPage,
  }))
  const showModal = () => {
    custodianList.length === 0 && getCustodianList().then(res => {
      if (res.status === 200) {
        setCustodianList(res.data)
      }
    });
    setIsModalVisible(true);
    onReset();
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const onCustodianChange = (ids) => {
    if (ids.length > 0) {
      getProductList({id: ids}).then(res => {
        if (res.status === 200) {
          setProductList(res.data)
        }
      })
    } else {
      setProductList([])
    }
  };
  const onFinish = (values) => {
    console.log(values);
  };

  const onValuesChange = (a, formItemProps) => {
   if (formItemProps['custodian'] && formItemProps['custodian'].length > 0 &&
     formItemProps['productName'] && formItemProps['productName'].length > 0)
    {
      setDisableUpload(false)
    } else {
      setDisableUpload(true)
    }
  }

  const onReset = () => {
    form.resetFields();
    setDisableUpload(true);
  };

  const onAdd = () => {
    form.validateFields().then(formVals=>{
      copyTemplate({ templateId: 3140, proCode: formVals.productName }).then(res=>{
        if (res.status === 200) {
          let resData = res.data;
          jumpPage({
            "type": "docx",
            "isSmart": 1,
            "status": "newAdd",
            "templateName": resData.fileName,
            "fileNumber": resData.fileSerialNumber, // 文件流水号
            "id": resData.id,
            "proCode": formVals.productName
          }, 'newAdd');
        } else {
          message.warn(`${res.message}`);
        }
      })
    })
  };
  const jumpPage = (item, status) => {
    item.status = status;
    setSession('_status', status);
    setSession('templateDetailsParams', JSON.stringify(item));
    router.push('/contract/templateDetails');
  };

  const beforeUpload = file => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.warn('文件不能大于100M!');
    }
    return isLt100M;
  };

  const uploadChange = info => {
    // 导入模版
    if (info.file.status === 'uploading') {
      setUploadBtnLoading(true)
    }
    if (info.file.status === 'done') {
      if (info?.file?.response?.status === 200) {
        message.success(`${info.file.name} 导入成功`);
        // 获取文件路劲信息
        getFilePathByCode({
          code: info?.file?.response?.data
        }).then(res=>{
          if (res.status === 200 ) {
            let formVals = form?.getFieldsValue();
            formVals = {
              "ownershipInstitution": getSession('USER_INFO')?JSON.parse(getSession('USER_INFO'))['orgId'] : '',
              "templateName": res.data.fileName,
              "type": "docx",
              "isSmart": 1,
              "status": "upload",
              "proCode": formVals.productName,
              ...res.data,
            };
            jumpPage(formVals, 'upload');
          }
        });
        setUploadBtnLoading(false)
      } else {
        message.warn(info?.file?.response.message);
        setState({uploadBtnLoading:false});
      }
    }
    if (info.file.status === 'error') {
      message.warn(`${info.file.name} 导入失败，请稍后再试`);
      setUploadBtnLoading(false)
    }
  };

  const uploadProps = {
    action: '/ams/ams-file-service/fileServer/uploadFile',
    name: 'file',
    headers: {
      // Token: getAuthToken(),
    },
  };

  return (
    <div>
     <Modal title="招募说明书" footer={null} width={800} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <Form {...layout} form={form} onFinish={onFinish} onValuesChange={onValuesChange}>
        <Form.Item name="custodian" label="托管人"
          rules={[{ required: true } ]}>
          <Select
            mode="multiple"
            placeholder="请选择"
            onChange={onCustodianChange}
            allowClear>
            {
              custodianList.map(
                item => <Option value={item.id} key={item.id}> {item.orgName} </Option>
              )
            }
          </Select>
        </Form.Item>
        <Form.Item name="productName" label="产品名称"
          rules={[{ required: true }]}>
          <Select
            showArrow
            placeholder="请选择"
            allowClear>
            {
              productList.map(
                item => <Option value={item.proCode} key={item.proCode}>{item.proName}</Option>
              )
            }
          </Select>
        </Form.Item>
        <Form.Item name="tmplateName" label="模版名称">
          <Input addonAfter=".docx" placeholder="模版名称" disabled/>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Space>
            <Upload
              {...uploadProps}
              data={{
                uploadFilePath: `contractfile/orgTemplate`,
              }}
              accept=".docx"
              onChange={e => uploadChange(e)}
              beforeUpload={e => beforeUpload(e)}
              showUploadList={false}
            >
              <Button
                type="primary"
                loading={uploadBtnLoading}
                disabled = {disableUpload}
              >
                导入模板
              </Button>
            </Upload>
            {/* <Button htmlType="button" onClick={onAdd}>
              新增
            </Button> */}
            <Button htmlType="button" onClick={onReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
     </Modal>
   </div>
  )
})

export default Add;
