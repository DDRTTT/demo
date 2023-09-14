import React, { useState } from 'react';
import { Form, Input, Select, Button, Space, Row, Col, Tooltip } from 'antd';
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
  return (
    <Row>
      <Form 
        layout="inline"
        form={form}
        onFinish={onFinish}
      >
        <Col span={23} offset={1}>
          <Form.Item label="招募书名称" name="recruitmentName" >
            <Input placeholder="请输入" allowClear />
          </Form.Item>
          <Form.Item label="产品名称" name="proCode" >
            <Select
              showArrow
              optionFilterProp="children"
              maxTagCount={1}
              placeholder="请选择"
              mode="multiple"
              style={{ width: 330 }} allowClear>
              { 
                props.productList.map(
                  item => <Option value={item.proCode} key={item.proCode}>{item.proName}</Option>
                )
              }
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type='primary' htmlType="submit" >查询</Button>
              <Button htmlType="button" onClick={onReset} >重置</Button>
            </Space>
          </Form.Item>
        </Col>
      </Form>
    </Row>
  );
};
export default Search;