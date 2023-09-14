import React, { useEffect, useRef, useState,memo,useMemo } from 'react';
import {useSetState,useReactive} from "ahooks";
import request from "@/utils/request";
import {Button, message, Modal,DatePicker,Form,Radio,Select } from "antd";
import {connect} from "dva";
import moment from 'moment';

const Index = (props) => {
  const {
    saveSearch
  }=props
  const [form]=Form.useForm()
  const [loading,setLoading]=useState(false)
  const [val,setVal]=useSetState({
    isModalVisible:false,
    type:false,
    season:false,
  })
  useEffect(()=>{

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
      values['year'] = values['year'].format("YYYY");
      request(`/yss-contract-server/RpPortfolioReport/getQuarterlyReport`,{method:'GET',data: {...values},})
        .then(r=>{
          if(r?.status===200){
            if(r?.data?.status===200){
              message.success('操作成功')
            } else {
              message.error(`操作失败：${r.data.message}`);
            }
          } else {
            message.error(`操作失败:${r.message||r.status}`)
          }
          onCancel()
          setLoading(false)
        })
    }).catch(errorInfo => {
      setLoading(false)
    })
  }

  let initialValues={
    period: 'SEASON',
    year:moment()
  }
  return<>
    <Button onClick={showModal}>
      获取报告
    </Button>
    <Modal title="获取报告" visible={val.isModalVisible} onCancel={onCancel}
           footer={[
             <Button key="recall" onClick={onCancel}>取消</Button>,
             <Button type="primary" loading={loading} onClick={e=>syGraded(e)}>确定</Button>,
           ]}
    >
      {val.isModalVisible?<Form wrapperCol={{span: '18'}} labelCol={{span:'6'}} initialValues={initialValues}  form={form}>
        <Form.Item name={'proCode'} label="主产品">
          <Select
            placeholder={"请选择"}
            allowClear={true}//支持清除
            showArrow={true}//是否显示下拉小箭头
            showSearch={true}//配置是否可搜索
            optionFilterProp={'name'}
            fieldNames={{label: 'name',value: 'code',key:'code'}}
            options={saveSearch}
          />
        </Form.Item>
        <Form.Item name={'period'} label="报告类型">
          <Radio.Group onChange={(e)=>{
            if(e.target.value==='YEAR'){
              setVal({type:false,season:false})
            }
            if(e.target.value==='MONTH6'){
              setVal({type:true,season:false})
            }
            if(e.target.value==='SEASON'){
              setVal({type:false,season:true})
            }
          }}>
            <Radio.Button value="SEASON">季报</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name={'year'} label="年份"
                   rules={[{ required: true, message: '必填项' }]}
        >
          <DatePicker picker="year"/>
          {/*rules: [{ required: true, message: '请选择日期!' }],*/}
          {/*initialValue:moment(moment().startOf('year').format("YYYY"), 'YYYY')*/}
        </Form.Item>
        <Form.Item name={'season'} label="季度区间"
                               rules={[{ required: true, message: '必填项' }]}
        >
          <Radio.Group>
            <Radio value="1">一季度</Radio>
            <Radio value="2">二季度</Radio>
            <Radio value="3">三季度</Radio>
            <Radio value="4">四季度</Radio>
          </Radio.Group>
        </Form.Item>
      </Form> :''}

    </Modal>
  </>
}

export default Index
