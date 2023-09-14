import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Row } from 'antd';
import { isNullObj } from '@/pages/investorReview/func';
import CustomFormItem from './CustomFormItem';
import PageContainer from '@/components/PageContainers';
import {DownOutlined, UpOutlined} from "@ant-design/icons";

const { Search } = Input;
// 共享状态
// const IndexContext = React.createContext();
// 布局
const layout = {
  labelAlign: 'right',
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
/**
 *
 * @param props
 * @param {function} advancSearch 获取高级搜索的回调函数
 * @param {array} formItemData 搜索框的数据
 * @param {number} searchInputWidth 模糊搜索输入框的宽度
 * @param {boolean} showBreadCrumb 是否需要展示面包屑
 * @param {boolean} loading 搜索按钮的loading
 * @param {Boolean} fuzzySearchBool 是否有模糊搜索
 * @param validateFields
 * @param resetFields
 * @param form
 * @param pageContainerProps 头部参数
 */
const Index = props => {
  const {
    // 获取高级搜索的回调函数
    advancSearch = () => {},
    //搜索框的数据
    formItemData = [],
    // 模糊搜索输入框的宽度
    searchInputWidth = 200,
    // 面包屑列表
    showBreadCrumb = true,
    // loading
    loading = false,
    fuzzySearchBool = true,
    resetFn,
    pageContainerProps,
  } = props;
  const [form] = Form.useForm();
  const { validateFields, resetFields }=form
  // 非要改成可以一直调接口的
  const [waste, setWaste] = useState(false);

  // 是否展开
  const [expand, setExpand] = useState(false);
  // 模糊搜索的数据
  const [searchValue, setSearchValue] = useState('');
  /**
   * 模糊搜索的change
   * @param {} e
   */
  const searchChange = e => {
    setSearchValue(e.target.value);
  };
  /**
   *  @description 重置搜索框
   */
  const handleReset = () => {
    if (resetFn) {
      resetFn();
      resetFields();
    } else {
      resetFields();
    }
    // advancSearch({});
  };

  useEffect(() => {
    if (!expand) {
      handleReset();
    } else {
      setSearchValue('');
    }
  }, [expand]);
  /**
   *  @description 搜索
   */
  const handleSearch = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (err) return;
      const formValues = { ...values };
      isNullObj(formValues) ? advancSearch(waste ? {} : null) : advancSearch(formValues);
      setWaste(!waste);
    });
  };
  // 默认展示前三条数据
  const defaultConds = formItemData && formItemData.slice(0, 3);
  return (
    <>
      <div style={{ display: showBreadCrumb ? 'block' : 'none' }}>
        <PageContainer {...pageContainerProps} />
      </div>
      <Card className={'search-card'}>
        <Form {...layout} onSubmit={handleSearch} className={'seachForm'}>
          <Row gutter={24}>
            <div style={{ display: expand ? 'block' : 'none' }}>
              <CustomFormItem formItemList={formItemData} form={form} />
            </div>
            <div style={{ display: expand && fuzzySearchBool ? 'none' : 'block' }}>
              <CustomFormItem formItemList={defaultConds} form={form} />
            </div>
            <Col span={6} className={'textAlign_r padding_t8 padding_b8 float_r'}>
              <Button
                className={'margin_l5 margin_r5 margin_t5'}
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                查询
              </Button>
              <Button className={'margin_l5 margin_r5 margin_t5'} onClick={handleReset}>
                重置
              </Button>
              <Button
                style={{
                  display: formItemData && formItemData.length > 3 ? 'inline-block' : 'none',
                }}
                className={'margin_l5 margin_r5 padding_r0 margin_t5'}
                onClick={() => {
                  setExpand(!expand);
                }}
                type="link"
              >
                {expand ? '收起' : '展开搜索'}{expand?<UpOutlined />:<DownOutlined/>}
                {/*<Icon type={expand ? 'up' : 'down'} />*/}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );
};
export default Index;
