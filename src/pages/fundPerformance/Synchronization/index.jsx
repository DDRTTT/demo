import React, { useEffect, useRef, useState,memo,useMemo } from 'react';
import {useSetState,useReactive} from "ahooks";
import request from "@/utils/request";
import {Button, message, Modal,DatePicker,Form,Radio,Select } from "antd";
import {connect} from "dva";
import moment from 'moment';
import { getUrlParam, requestList } from '@/pages/investorReview/func';

const Index = (props) => {
  const {
    saveSearch,
    handleReset
  }=props
  const [form]=Form.useForm()
  const [loading,setLoading]=useState(false)
  const [val,setVal]=useSetState({
    isModalVisible:false,
    type:false,
    season:false,
  })
  const [product, setProduct] = useState([])
  useEffect(()=>{
    requestList({ url: `/yss-contract-server/RpProduct/getProductInfo`, method: 'get' },{},res=>{
      setProduct(res)
    });
  },[])
  useEffect(()=>{
    setVal({
      type:false,
      season:false,
    })
  },[val.isModalVisible])

  const showModal = () => {
    setVal({isModalVisible: true})
  };
  const onCancel = () => {
    setVal({isModalVisible: false})
    form.resetFields()//antd表单清空记忆
  }
  async function syGraded(e){
    await setLoading(true)
    await form.validateFields().then((values) => {
      request(`/yss-contract-server/RpFund/xbPull`,{method:'GET',data: {...values},})
        .then(r=>{
          if(r?.status===200){
            message.success('同步成功！')
          } else {
            message.error(`操作失败:${r.message||r.status}`)
          }
          onCancel()
          setLoading(false),
          handleReset()
        })
    }).catch(errorInfo => {
      setLoading(false);
      handleReset()
    })
  }

  return<>
    <Button onClick={showModal}>
      同步基金业绩信息
    </Button>
    <Modal title="同步基金业绩信息" visible={val.isModalVisible} onCancel={onCancel}
           footer={[
             <Button key="recall" onClick={onCancel}>取消</Button>,
             <Button type="primary" loading={loading} onClick={e=>syGraded(e)}>确定</Button>,
           ]}
    >
      {val.isModalVisible?<Form wrapperCol={{span: '18'}} labelCol={{span:'4'}} form={form}>
        <Form.Item name={'proCode'} label="产品名称">
          <Select
            placeholder={"请选择"}
            allowClear={true}//支持清除
            showArrow={true}//是否显示下拉小箭头
            showSearch={true}//配置是否可搜索
            optionFilterProp={'name'}
            fieldNames={{label: 'name',value: 'code',key:'code'}}
            options={product}
          />
        </Form.Item>
      </Form> :''}
    </Modal>
  </>
}

export default Index
