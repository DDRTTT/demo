import React, { useState } from 'react';
import { Form, Input, Select, Button, Space, Row, Col, Tooltip } from 'antd';
import { pinyin } from 'pinyin-pro';
const { Option } = Select;


const Search = (props) => {
  const [form] = Form.useForm();
  const onFinish = (formObj) => {
    // 此处调用列表查询接口
    props.getList(formObj);
  };
  const onReset = () => {
    form.resetFields();
  };
  const pinYinSearch=(val, option)=>{
    return option.children.includes(val) || pinyin(option.children, { pattern: 'initial' }).replace(/\s*/g,'').includes(val);
  }
  return (
    <Row>
      <Form 
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 12,
        }}
        layout="horizontal"
        form={form}
        onFinish={onFinish}
      >
        <Row>
          <Col span={12}>
          <Form.Item label="招募书名称" name="fileName" >
            <Input placeholder="请输入" allowClear />
          </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item label="产品类型" name="proType" >
            <Select
              showArrow
              optionFilterProp="children"
              maxTagCount={1}
              placeholder="请选择"
              filterOption={(input, option)=>pinYinSearch(input, option)}
              mode="multiple"
              allowClear>
              { 
                props.productType.map(
                  item => <Option value={item.assCode} key={item.assCode}>{item.assName}</Option>
                )
              }
            </Select>
          </Form.Item>
          </Col>
        </Row>
          
        <Row style={{ display: 'flex', justifyContent: 'center' }}>
        <Form.Item>
          <Space>
            <Button type='primary' htmlType="submit" >查询</Button>
            <Button htmlType="button" onClick={onReset} >重置</Button>
          </Space>
        </Form.Item>
        </Row>
      </Form>
    </Row>
  );
};
export default Search;