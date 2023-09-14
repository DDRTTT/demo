import React, {useState,useEffect} from 'react';
import {
  AutoComplete,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  Select,
  Switch,
  TimePicker,
  TreeSelect,
  Tooltip,
} from 'antd';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 自定义输入框组件 可以根据type的类型返回不同的输入框
/**
 *
 * @param {string} name formItem的名字
 * @param {string} label formItem的label
 * @param {string} type formItem的类型
 * @param {object} config 控件的属性配置 可以配置一些自定义属性和回调
 * @param {array} rules 控件的校验规则
 * @param {array} option 下拉框的下拉列表 类型为下拉的时候需要填写 默认格式{name:'xxx',code:'xxx'}
 * @param {object} readSet 自定义读取option属性的key 例子:{ name: 'proName', code: 'proCode', bracket?: 'proCode' },bracket是name后面括号里的内容
 * @param {boolean} unRender 是否渲染
 */


const CustomFormItem = (props) => {
  const { loginId, tabValue,data } = props;
  const [selectedNameList, setSelectedNameList] = useState([]);
  // useEffect(() => {
  //   setSelectedNameList([]);
  // }, [tabValue]);
  const { config = {} } = data;
  let child;
  switch (data.type && typeof data.type === 'string' && data.type.toLowerCase()) {
    case 'select':
      if (!data.option) {
        child = (
          <Col
            span={data.width || 6}
            key={data.name}
            pull={data.pull}
            offset={data.offset}
            style={data.style}
            className=  {`cust-col ${data.className}`}
          >
          <Form.Item
            name={data?.name}
            // labelCol={data.labelCol || { span: 7 }}
            // wrapperCol={data.wrapperCol || { span: 17 }}
            required={data?.required}
            label={data?.label}
            {...data?.formItemConfig}
          >
            <Select
              allowClear
              showSearch
              showArrow
              optionFilterProp="children"
              placeholder="请选择"
              maxTagCount={1}
              disabled={loginId !== '1' && data.name === 'orgId' ? true : false}// 产品要素库需求变更：查询时，非管理员登录，归属机构默认为登录时所属的归属机构，不可编辑
              {...config}
            />
          </Form.Item>
          </Col>
        );
      } else {
        // 设置默认值  默认绑定的字段是 name和code
        const { readSet = { name: 'name', code: 'code' } } = data;
        const getSelectedNameList = selectedCodeList => {
          setSelectedNameList(selectedCodeList);
        };
        child = (
          <Col
            span={data.width || 6}
            key={data.name}
            pull={data.pull}
            offset={data.offset}
            style={data.style}
            className=  {`cust-col ${data.className}`}
          >
          <Form.Item
            name={data?.name}
            // labelCol={data.labelCol || { span: 7 }}
            // wrapperCol={data.wrapperCol || { span: 17 }}
            required={data?.required}
            label={data?.label}
            {...data?.formItemConfig}
          >
            {/*<Tooltip*/}
            {/*  arrowPointAtCenter*/}
            {/*  placement="topLeft"*/}
            {/*  overlayStyle={{ maxWidth: 1000 }}*/}
            {/*  title={*/}
            {/*    config.mode === 'multiple' &&*/}
            {/*    selectedNameList.length > 1 && (*/}
            {/*      <ul style={{ marginBottom: 0 }}>*/}
            {/*        {selectedNameList.map(item => <li key={item}>{item}</li>)}*/}
            {/*      </ul>*/}
            {/*    )*/}
            {/*  }*/}
            {/*>*/}
              <Select
                allowClear
                showSearch
                showArrow
                optionFilterProp="children"
                placeholder="请选择"
                maxTagCount={1}
                getPopupContainer={triggerNode => triggerNode.parentElement}
                disabled={loginId && loginId !== '1' && data.name === 'orgId' ? true : false}// 产品要素库需求变更：查询时，非管理员登录，归属机构默认为登录时所属的归属机构，不可编辑
                {...config}
                onChange={val => {
                  getSelectedNameList(val);
                }}
              >
                {data &&
                Array.isArray(data?.option)&&
                  data.option.map((item, index) => {
                    const isObj = Object.prototype.toString.call(item) === '[object Object]';
                    return (
                      <Select.Option
                        key={`${isObj ? item[readSet.code] : item}`}
                        value={`${isObj ? item[readSet.code] : item}`}
                      >
                        {isObj
                          ? item[readSet.name]
                            ? `${item[readSet.name]}` // 因为要特殊显示所以加了一个bracket属性 显示为 产品名称(产品代码)
                            : item[readSet.name]
                          : item
                        }
                      </Select.Option>
                    );
                  })}
              </Select>
            {/*</Tooltip>*/}
          </Form.Item>
          </Col>
        );
      }
      break;
    case 'datepicker':
      child = <Col
        span={data.width || 6}
        key={data.name}
        pull={data.pull}
        offset={data.offset}
        style={data.style}
        className=  {`cust-col ${data.className}`}
      >
        <Form.Item
          name={data?.name}
          // labelCol={data.labelCol || { span: 7 }}
          // wrapperCol={data.wrapperCol || { span: 17 }}
          required={data?.required}
          label={data?.label}
          {...data?.formItemConfig}
        >
          <DatePicker placeholder="请选择日期" allowClear {...config}  style={{width:"100%"}}/>
        </Form.Item>
        </Col>
      break;
    case 'rangepicker':
      child = <Col
        span={data.width || 6}
        key={data.name}
        pull={data.pull}
        offset={data.offset}
        style={data.style}
        className=  {`cust-col ${data.className}`}
      >
        <Form.Item
          name={data?.name}
          // labelCol={data.labelCol || { span: 7 }}
          // wrapperCol={data.wrapperCol || { span: 17 }}
          required={data?.required}
          label={data?.label}
          {...data?.formItemConfig}
        >
          <RangePicker placeholder="请选择日期" allowClear {...config} />
        </Form.Item>
        </Col>
      break;
    case 'timepicker':
      child = <Col
        span={data.width || 6}
        key={data.name}
        pull={data.pull}
        offset={data.offset}
        style={data.style}
        className=  {`cust-col ${data.className}`}
      >
        <Form.Item
          name={data?.name}
          // labelCol={data.labelCol || { span: 7 }}
          // wrapperCol={data.wrapperCol || { span: 17 }}
          required={data?.required}
          label={data?.label}
          {...data?.formItemConfig}
        >
        <TimePicker placeholder="请选择时间" allowClear {...config} />
        </Form.Item>
        </Col>
      break;
    case 'radio':
      const { readSet = { name: 'name', code: 'code' } } = data;
      child = (
        <Col
          span={data.width || 6}
          key={data.name}
          pull={data.pull}
          offset={data.offset}
          style={data.style}
          className=  {`cust-col ${data.className}`}
        >
          <Form.Item
            name={data?.name}
            // labelCol={data.labelCol || { span: 7 }}
            // wrapperCol={data.wrapperCol || { span: 17 }}
            required={data?.required}
            label={data?.label}
            {...data?.formItemConfig}
          >
          <Radio.Group {...config}>
            {data.option.map((item, index) => {
              const isObj = Object.prototype.toString.call(item) === '[object Object]';
              return (
                <Radio key={index} value={isObj ? item[readSet.code] : item}>
                  {isObj ? item[readSet.name] : item}
                </Radio>
              );
            })}
          </Radio.Group>
          </Form.Item>
        </Col>
      );
      break;
    case 'checkbox':
      const { readSet: readB = { name: 'name', code: 'code' } } = data;
      child = (
        <Col
          span={data.width || 6}
          key={data.name}
          pull={data.pull}
          offset={data.offset}
          style={data.style}
          className=  {`cust-col ${data.className}`}
        >
          <Form.Item
            name={data?.name}
            // labelCol={data.labelCol || { span: 7 }}
            // wrapperCol={data.wrapperCol || { span: 17 }}
            required={data?.required}
            label={data?.label}
            {...data?.formItemConfig}
          >
        <Checkbox.Group {...config}>
          {data.option.map((item, index) => {
            const isObj = Object.prototype.toString.call(item) === '[object Object]';
            return (
              <Checkbox key={index} value={isObj ? item[readB.code] : item}>
                {isObj ? item[readB.name] : item}
              </Checkbox>
            );
          })}
        </Checkbox.Group>
          </Form.Item>
        </Col>
      );
      break;
    case 'area':
      child = <Col
        span={data.width || 6}
        key={data.name}
        pull={data.pull}
        offset={data.offset}
        style={data.style}
        className=  {`cust-col ${data.className}`}
      >
        <Form.Item
          name={data?.name}
          // labelCol={data.labelCol || { span: 7 }}
          // wrapperCol={data.wrapperCol || { span: 17 }}
          required={data?.required}
          label={data?.label}
          {...data?.formItemConfig}
        ><TextArea allowClear placeholder="请输入" {...config} autoSize={{ minRows: 2 }} />
        </Form.Item>
      </Col>
      break;
    case 'treeselect':
      child = <Col
        span={data.width || 6}
        key={data.name}
        pull={data.pull}
        offset={data.offset}
        style={data.style}
        className=  {`cust-col ${data.className}`}
      >
        <Form.Item
          name={data?.name}
          // labelCol={data.labelCol || { span: 7 }}
          // wrapperCol={data.wrapperCol || { span: 17 }}
          required={data?.required}
          label={data?.label}
          {...data?.formItemConfig}
        >
          <TreeSelect placeholder="请选择" {...config} />
        </Form.Item>
      </Col>
      break;
    case 'switch':
      child = <Col
        span={data.width || 6}
        key={data.name}
        pull={data.pull}
        offset={data.offset}
        style={data.style}
        className=  {`cust-col ${data.className}`}
      >
        <Form.Item
          name={data?.name}
          // labelCol={data.labelCol || { span: 7 }}
          // wrapperCol={data.wrapperCol || { span: 17 }}
          required={data?.required}
          label={data?.label}
          {...data?.formItemConfig}
        >
        <Switch {...config} />
        </Form.Item>
      </Col>
      break;
    case 'autocomplete':
      child = <Col
        span={data.width || 6}
        key={data.name}
        pull={data.pull}
        offset={data.offset}
        style={data.style}
        className=  {`cust-col ${data.className}`}
      >
        <Form.Item
          name={data?.name}
          // labelCol={data.labelCol || { span: 7 }}
          // wrapperCol={data.wrapperCol || { span: 17 }}
          required={data?.required}
          label={data?.label}
          {...data?.formItemConfig}
        >
        <AutoComplete {...config} placeholder="请输入" />
        </Form.Item>
      </Col>
      break;

    default:
      child = <Col
        span={data.width || 6}
        key={data.name}
        pull={data.pull}
        offset={data.offset}
        style={data.style}
        className=  {`cust-col ${data.className}`}
      >
        <Form.Item
          name={data?.name}
          // labelCol={data.labelCol || { span: 7 }}
          // wrapperCol={data.wrapperCol || { span: 17 }}
          required={data?.required}
          label={data?.label}
          {...data?.formItemConfig}
        >
        <Input allowClear placeholder="请输入" {...config} />
        </Form.Item>
      </Col>
      break;
  }
  return child;
};



export default CustomFormItem;
