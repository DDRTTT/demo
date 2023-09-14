import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Row, Col, } from 'antd';
import { UpOutlined ,DownOutlined } from '@ant-design/icons';
import { isNullObj } from '@/pages/investorReview/func';
import CustomFormItem from './CustomFormItem';
import PageContainer from '@/components/PageContainers';

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
 * @param {function} advancSearch 获取高级搜索的回调函数
 * @param {array} formItemData 搜索框的数据
 * @param {function} fuzzySearch 模糊搜索的回调函数
 * @param {string} searchPlaceholder 模糊搜索输入框的占位符
 * @param {number} searchInputWidth 模糊搜索输入框的宽度
 * @param {array} breadCrumb 面包屑列表
 * @param {boolean} loading 搜索按钮的loading
 * @param {Boolean} fuzzySearchBool 是否有模糊搜索
 * @param validateFields
 * @param resetFields
 * @param form
 */
const Index = props => {
  const {
    // 获取高级搜索的回调函数
    advancSearch = () => {},
    //搜索框的数据
    formItemData = [],
    // 模糊搜索的回调函数
    fuzzySearch = () => {},
    // 模糊搜索输入框的占位符
    searchPlaceholder = '请输入',
    // 模糊搜索输入框的宽度
    searchInputWidth = 200,
    // 面包屑列表
    breadCrumb = [],
    // loading
    loading = false,
    fuzzySearchBool = true,
    resetFn,
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
      // fuzzySearch('');
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
  return (
    <>
    <PageContainer />
    <Card style={{ marginBottom: 10,marginTop: 16 }}>
      <div
        style={
          !expand ? { display: 'flex', alignItems: 'end', justifyContent: 'flex-end' } : {}
        }
      >
        <Form {...layout} onSubmit={handleSearch}>
          <Row gutter={24} style={{ display: expand ? 'block' : 'none', marginTop: 20 }}>
            <CustomFormItem formItemList={formItemData} form={form} />
            <Col md={6} style={{float: 'right',textAlign: 'right'}}>
                <div style={{ display: expand ? 'inline-block' : 'none' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      marginRight: 18,
                    }}
                    loading={loading}
                  >
                    查询
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </div>
                <Button
                  onClick={() => {
                    setExpand(!expand);
                  }}
                  type="link">{expand ? '收起' : '展开搜索'}{expand?<UpOutlined />:<DownOutlined/>}
                  {/*<Icon type={expand ? 'up' : 'down'} />*/}
                </Button>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}  style={{display: 'block',textAlign:'right'}}>
                {fuzzySearchBool && (
                  <Search
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={searchChange}
                    onSearch={(value, e) => {
                      e.preventDefault();
                      value == '' ? fuzzySearch(!waste ? '' : null) : fuzzySearch(value);
                      setWaste(!waste);
                    }}
                    style={{
                      display: expand ? 'none' : 'inline-block',
                      width:
                        (!/px/.test(searchInputWidth) && searchInputWidth * 1) || searchInputWidth,
                    }}
                  />
                )}
                {/* 这个是垃圾代码,但是不想改了,就这样吧 */}
                <Button
                   style={{
                    display: expand ? 'none' : 'inline-block',
                  }}
                  onClick={() => {
                    setExpand(!expand);
                  }}
                  type="link">{expand ? '收起' : '展开搜索'}{expand?<UpOutlined />:<DownOutlined/>}
                </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </Card>
    </>
  );
};
export default Index;
