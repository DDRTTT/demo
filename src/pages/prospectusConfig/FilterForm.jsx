import React, {useEffect, useState} from "react";
import {Button, Form, Select, Input, Row, Col} from "antd";
import styles from "@/pages/fundAchieveNote/index.less";
const Option = Select.Option;

import {queryAllByCondition} from "@/services/prospectusPageTpl";

const FilterForm = ({ submit})=>{

  const [optionsData, setOptionsData] = useState([]);
  const [selection, setSelection] = useState('');

  const tagStatus = e => {
    e.preventDefault()
  };

  useEffect(()=>{
    // 加载产品数据
    getOptionsData();
  },[]);

  const getOptionsData = ()=>{
    const data = {
    }
    // 获取下拉数据
    queryAllByCondition(data).then((res)=>{
      if(res?.status === 200){
        setOptionsData(res.data.map((item)=>{
          return {
            proCode: item.proCode,
            proName: item.proCode + '-' + item.proName
          }
        }));
      }
    })
  };

  const searchCallBack = (e)=>{
    e.preventDefault();
    const params = {
      proCode: selection
    };
    submit(params);
  }
  const resetData = (e)=>{
    e.preventDefault();
    const params = {
      proCode: selection
    };
    submit(params);
  };

  const handleSelectChange = value => {
    setSelection(value.map((item)=>item.proCode).toString());
  }
  return (
    <div style={{clear:'both', backgroundColor: '#ffffff'}}>
     <Form layout="horizontal" style={{display:'flex'}}>
        <Row gutter={[10, 10]} style={{width: '100%'}}>
          <Col span={8} >
            <Form.Item label="招募书名称" style={{marginBottom: 5}} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Input placeholder="" />
            </Form.Item>
          </Col>
          <Col span={10} >
            <Form.Item label="产品名称"  style={{marginBottom: 5}}  labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Select
                mode="multiple"
                labelInValue
                placeholder="请选择"
                maxTagCount={1}
                onChange={handleSelectChange}
                allowClear
              >
                { optionsData.map((item)=>(<Option key={item.proCode} value={item.proCode}>{item.proName}</Option>))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6} >
            <Form.Item style={{textAlign: 'right', marginBottom: 5}}  labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
              <Button style={{fontSize: 12}} type="primary" size="small" htmlType="submit" onClick={(e)=>searchCallBack(e)}>
                查询
              </Button>
              <Button style={{marginLeft: 20, fontSize: 12}}  size="small" onClick={(e)=>resetData(e)}>
                重置
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
};

export default FilterForm;
