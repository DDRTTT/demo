import router from 'umi/router';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Space, Upload, Radio, message, Tooltip, Transfer, Row, Col } from 'antd';
import { getCustodianList, getProductList, getTplInfo, copyTemplate, getProductlList, baseCompare, saveTemplate, getNginxIP, getTplList  } from '@/services/productSet';
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
  const [proTypeList, setProTypeList] = useState([]);
  const [baseCompareData, setBaseCompareData] = useState([]);
  const [targetkey, setTargetkey] = useState([]);
  const [selectTarget, setSelectTarget] = useState(null);
  const [direction, setDirection] = useState('');
  const [moveKeys, setMoveKeys] = useState({});
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [infomation, setInfomation] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [form] = Form.useForm();
  const [IPObject, setIPObject] = useState({});

  useImperativeHandle(ref, () => ({
    showModal,
    jumpPage,
  }))

  useEffect(()=>{
    getProductlList({}).then(res=>{
      console.log(res);
      if (res.status === 200) {
        console.log(res.data);
        setProTypeList(res.data)
      }
    });
    getNginxIP().then(res=>{
      if (res?.status === 200) {
        setIPObject(res.data);
      }
    })
  },[])
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
   if (formItemProps['proType'] && formItemProps['proType'].length > 0)
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
      copyTemplate({ proType: formVals.proType }).then(res=>{
        if (res.status === 200) {
          let resData = res.data;
          jumpPage({
            "type": "docx",
            "isSmart": 1,
            "status": "newAdd",
            "templateName": resData.fileName,
            "fileNumber": resData.fileSerialNumber, // 文件流水号
            "id": resData.id,
            "proType": formVals.proType,
            "templateType": 2,
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
    router.push('/contract/templateProduct');
  };

  const beforeUpload = (file, flieList) => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    let fileName = file.name;
    let index = fileName.lastIndexOf(".");
    let suffix = fileName.substr(index);
    if(!/\.(doc|docx)$/.test(suffix)){
      message.warn('导入文件类型必须是.doc或者.docx中的一种');
      return false
    }
    if (!isLt100M) {
      message.warn('文件不能大于100M!');
    }
    return isLt100M;
  };

  const uploadChange = info => {
    setInfomation(info)
    // 导入模版
    if (info.file.status === 'uploading') {
      setUploadBtnLoading(true)
    }
    if(info.file.status === 'done') {
      if (info?.file?.response?.status === 200) {
        message.success(`${info.file.name} 导入成功`);
        onRefresh(info);
        setOpen(true);
      } else {
        message.error(info.file.response.message);
        setUploadBtnLoading(false);
      }
    }
    if (info.file.status === 'error') {
      message.warn(`${info.file.name} 导入失败，请稍后再试`);
      setUploadBtnLoading(false)
    }
  };
  const formVal = form?.getFieldsValue();
  const uploadProps = {
    action: '/ams/yss-contract-server/RpTemplate/showOneLevelTitleOnRpAndTemplate',
    name: 'file',
    headers: {
      // Token: getAuthToken(),
    },
  };
  const compareChange=(data)=>{
    setOpen1(true)
    setMoveKeys({...data, del: true})
  }

  const compareChangeOk=()=>{
    const array = [...targetkey];
    const array1 = [...baseCompareData];
    if(!selectTarget) {
      return message.warning('请选择章节！')
    }
    if(direction == '') {
      return message.warning('请选择添加在该章节的位置！')
    }
    targetkey.forEach((item,index)=>{
      if(item.key == selectTarget) {
        if(direction == '0') {
          array.splice(index,0,moveKeys);
        }else{
          array.splice(index+1,0,moveKeys);
        }
      }
    })
    array1.forEach((item, index)=>{
      if(item.key == moveKeys.key) {
        item.color = null;
      }
    })
    setDirection('');
    setSelectTarget(null);
    setTargetkey(array);
    setBaseCompareData(array1);
    setOpen1(false);
  }
  const compareSave=()=>{
    setSaveLoading(true);
    const array = [];
    const changeTitle = [];
    const userInfo = JSON.parse(getSession("USER_INFO"));
    if(targetkey.length > 0){
      targetkey.forEach(item=>{
        array.push(item.title);
        if(item?.color) {
          changeTitle.push(item.title);
        }
      });
    }
    let formVals = form?.getFieldsValue();
    const obj = {
      titleList: [...array],
      insertTitleList: [...changeTitle],
      path:'contractfile/orgTemplate',
      name:'flie',
      proType: formVals.proType,
      file: infomation?.file?.response?.data?.file_base64Str
    }
    baseCompare(obj).then(res => {
      if(res.status == 200) {
        const templateKey = res.data;
        getFilePathByCode({code: res.data}).then(succ=>{
          if (res.status === 200 ) {
            formVals = {
              "ownershipInstitution": getSession('USER_INFO')?JSON.parse(getSession('USER_INFO'))['orgId'] : '',
              "templateName": infomation?.file?.name,
              "type": "docx",
              "isSmart": 1,
              "status": "upload",
              "proType": formVals.proType,
              "templateType": 2,
              ...succ.data,
            };
            const fileName = formVals?.fileName?.split('.')[0] || formVals.templateName || 'template';
            saveTemplate({
              fileSerialNumber: formVals.fileNumber || templateKey,
              fileName: fileName, // 去掉后缀名
              busId: templateKey,
              fileKey: templateKey,
              fileForm: 'docx',
              sysCode: 'flow',
              archivesClassification: 'template',
              documentType: 'rp',
              ownershipInstitution: formVals.ownershipInstitution || '',
              proType: formVals.proType,
              templateType: formVals?.templateType,
            }).then(ele => {
              getTplList({pageSize: 10, currentPage: 1, templateType: 1}).then(suc => {
                if (suc.data.rows) {
                  suc.data.rows.forEach(item => {
                    if(item.fileSerialNumber == formVals.fileNumber) {
                      formVals = {...formVals, id: item.id}
                    }
                  });
                }
                message.success('保存成功');
                jumpPage(formVals, 'upload');
                setUploadBtnLoading(false);
                setSaveLoading(false);
              })
            })
          } else {
            message.warn(`保存失败，请稍后再试`);
            setUploadBtnLoading(false);
            setSaveLoading(false);
          }
        });
      }else{
        message.warning(res.message);
        setUploadBtnLoading(false);
        setSaveLoading(false);
      }
    })
  }
  const onRefresh = (info={}) => {
    const compareData = [];
    const template =info?.file?.response?.data['template'] || infomation?.file?.response?.data['template'];
    const current = info?.file?.response?.data['current'] || infomation?.file?.response?.data['current'];
    const currentTarget = [];
    const baseBook = [];
    const newBook = [];
    if(template.length > 0) {
      template.forEach((item, index) => {
        const num = item.indexOf('、');
        baseBook.push(item.substring(num+1));
        compareData.push({key:item, title:item, article: item.substring(num+1)});
      })
    }
    if(current.length > 0) {
      current.forEach((item, index) => {
        const num = item.indexOf('、');
        newBook.push(item.substring(num+1));
        currentTarget.push({key:item, title:item, article: item.substring(num+1)});
      })
    }
    const arr = [...baseBook, newBook];
    const newArr = arr.filter(item => {
      return !(baseBook.includes(item) && newBook.includes(item));
    });
    const newNowData = newBook.filter(item=>{
      return !baseBook.includes(item)
    });
    if(newNowData.length > 0){
      currentTarget.forEach((item) => {
        for(let i = 0; i < newNowData.length; i++) {
          if(item.article == newNowData[i]) {
            item.del = true
          }
        }
      })
    }
    if(newArr.length > 0){
      compareData.forEach(item=>{
        for(let i = 0; i < newArr.length; i++) {
          if(item.article == newArr[i]) {
            item.color = 'red'
          }
        }
      })
    }
    setBaseCompareData([...compareData]);
    setTargetkey([...currentTarget]);
  }
  const compareDel = (data) => {
    const array = [...targetkey];
    const array1 = [...baseCompareData];
    targetkey.forEach((item, index)=>{
      if(item.article == data.article) {
        array.splice(index, 1)
      }
    });
    if(data?.color) {
      array1.forEach(item=>{
        if(item.article == data.article) {
          item.color = 'red'
        }
      })
    }
    setTargetkey(array);
    setBaseCompareData(array1);
  }
  return (
    <div>
     <Modal title="招募说明书" footer={null} width={800} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <Form {...layout} form={form} onFinish={onFinish} onValuesChange={onValuesChange}>
        {/* <Form.Item name="custodian" label="托管人"
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
        </Form.Item> */}
        <Form.Item name="proType" label="产品类型"
          rules={[{ required: true }]}>
          <Select
            showArrow
            placeholder="请选择"
            allowClear>
            {
              proTypeList.map(
                item => <Option value={item.assCode} key={item.assCode}>{item.assName}</Option>
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
                proType: formVal.proType,
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
            <Button htmlType="button" onClick={onAdd}>
              新增
            </Button>
            <Button htmlType="button" onClick={onReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
     </Modal>
     <Modal
        title="标准模板比对"
        visible={open}
        width='80%'
        destroyOnClose={true}
        maskClosable={false}
        onCancel={()=>{setOpen(false);setUploadBtnLoading(false);}}
        footer={[
        <Button key="submit" type='primary' onClick={compareSave} loading={saveLoading}>保存</Button>,
        <Button key="refresh" type="primary" loading={refreshLoading} onClick={onRefresh}>刷新</Button>
      ]}
      >
        <div style={{display:'flex',justifyContent:'center'}}>
        <Row style={{width:'500px',padding:'20px',border:'1px solid black'}}>
          <h1>现有招募书章节</h1>
          <Col>
            {targetkey.map(item=><p key={item.key} style={{height:'30px',lineHeight:'30px', marginBottom: 0}}>{item.title}{item?.del && <Button style={{float: 'right'}} size='small' type='primary' onClick={()=>compareDel(item)}>删除</Button>}</p>)}
          </Col>
        </Row>
        <Row style={{borderLeft:'1px solid black',width:'500px',padding:'20px',border:'1px solid black'}}>
          <h1>标准招募书章节</h1>
          <Col>
            {baseCompareData.map(item=><p key={item.key} style={{color:item.color,height:'30px',lineHeight:'30px', marginBottom: 0}}>{item.title}{item?.color && <Button style={{float: 'right'}} size='small' type='primary' onClick={()=>compareChange(item)}>添加</Button>}</p>)}
          </Col>
        </Row>
        </div>
      </Modal>
      <Modal
        title="添加章节"
        visible={open1}
        onOk={compareChangeOk}
        destroyOnClose={true}
        maskClosable={false}
        onCancel={()=>setOpen1(false)}
      >
        <span>
          <Select style={{width:'200px'}} onChange={(e)=>setSelectTarget(e)}>
            {targetkey.map(item=><Option value={item.key} key={item.key}>{item.title}</Option>)}
          </Select>
          <Select style={{marginLeft:'40px', width:'200px'}} onChange={(e)=>setDirection(e)}>
            <Option value='0'>上方</Option>
            <Option value='1'>下方</Option>
          </Select>
          </span>
      </Modal>
   </div>
  )
})

export default Add;
