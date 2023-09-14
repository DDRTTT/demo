import React, { useState, useRef,memo, useEffect,useImperativeHandle,forwardRef} from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Row,
} from 'antd';
import { Card, PageContainers} from '@/components';
import {getTableMaxHeight, isNullObj} from '@/pages/investorReview/func';
import CustomFormItem from '@/components/AdvancSearch/CustomFormItem';
// import DynamicHeader from '@/components/DynamicHeader'
import {DownOutlined, UpOutlined} from "@ant-design/icons";
import pathToRegexp from "path-to-regexp";

const { Search } = Input;
// 布局
let layout = {
  labelAlign: 'right',
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};


const Index = (props) => {
  const {
    advancSearch = () => {}, // 获取高级搜索的回调函数
    formItemData = [], //搜索框的配置数据
    fuzzySearch = () => {}, // 模糊搜索的回调函数
    searchPlaceholder = '请输入', // 模糊搜索输入框的占位符
    searchInputWidth = 200, // 模糊搜索输入框的宽度
    fuzzySearchBool = true, //是否存在模糊查询
    advancSearchBool = true, //是否存在精准查询
    showBreadCrumb = true, // 是否展示面包屑列表
    showSearch, // 只显示条件搜索
    loading,
    resetFn, //重置
    pageContainerProps,
    tabs,
    tableList,
    title,
    extra,
    pageCode,
    columns,
    dynamicHeaderCallback,
    taskTypeCode,
    taskArrivalTimeKey,
    hasMoreTabs,
    customLayout,
    loginId,
    searchType,
    setHeight,
    handleGetListFetch
  } = props;
  const [form] = Form.useForm();

  const tabValue = useRef('');


  // 模糊搜索的数据
  const [searchValue, setSearchValue] = useState('');
  const searchChange = e => {
    setSearchValue(e.target.value);
  };

  // 是否展开
  const [expand, setExpand] = useState(false);


  useEffect(()=>{
    // getSession()
    execUrl()
    expandFun()
  }, [])

  useEffect(()=>{
    setHeight?setHeight():''
  },[expand])



  function execUrl(value){
    //页面重新加载时路由匹配，此处用来判断上个页面是否为页面B
    let previousPathname=JSON.parse(sessionStorage.getItem('pathname'))
    let actUrl=previousPathname?pathToRegexp(previousPathname||'').exec(window.location.pathname):''
    if(actUrl){getSession()}
    else {
      sessionStorage.removeItem('keyValueSearch')
      sessionStorage.removeItem('sessionPageNum');
    }
  }
  //只显示精确条件搜索
  function expandFun(){
    let formData=sessionStorage.getItem('keyValueSearch')
    let formValues=sessionStorage.getItem('formValues')
    if(formValues){
      setExpand(true)
      formValues&&(formValues!=='{}')?
        form.setFieldsValue(JSON.parse(formValues)) :''
    }else {setExpand(false)}
  }

  //sessionStorage索条件
  function getSession(){
    const formData = sessionStorage.getItem('keyValueSearch');
    let reqBody
    let objectKeys
    if (formData) {
      reqBody = JSON.parse(formData);
    }
    formData && setSearchValue(reqBody?.keyWords)
  }

  // 切换 模糊 or 精准查询
  const updateExpand = expand => {
    sessionStorage.removeItem('sessionPageNum');
    setExpand(expand);
    setSearchValue('');
    if(expand===true){
      sessionStorage.removeItem('keyValueSearch')//清除模糊搜索
    }else {
      sessionStorage.removeItem('formValues')//清除精确搜索
    }

    // sessionStorage.setItem('keyValueSearch', JSON.stringify(formData));
    // if (!loginId) {
    //   // 产品要素管理，彭章涛要求切换时，不能重置查询条件
    //   handleReset();
    // }
  }; // ok

  // tabs 切换
  const onTabChange = value => {
    setExpand(false);
    setSearchValue('');
    form.resetFields();
    tabs.onTabChange(value);
    tabValue.current = value;
  };

  /**
   *  @description 搜索
   */
  const handleSearch = e => {
    e.preventDefault();
    sessionStorage.removeItem('formValues');
    sessionStorage.removeItem('keyValueSearch');
    sessionStorage.removeItem('sessionPageNum');
    form.validateFields().then((values) => {
      const formValues = { ...values };
      advancSearch(formValues)
      sessionStorage.setItem('formValues', JSON.stringify(formValues));
    })
  };

  /**
   *  @description 重置搜索框
   */
  const handleReset = () => {
    sessionStorage.removeItem('formValues');
    sessionStorage.removeItem('keyValueSearch');
    sessionStorage.removeItem('sessionPageNum');
    if (resetFn) {
      resetFn();
      form.resetFields();
    } else {
      form.resetFields();
    }
    tabValue.current = tabValue.current + '1';
  };
  //模糊查询
  function onSearch(value, e){
    e.preventDefault();
    fuzzySearch(value);
  }

  // 模糊查询组件
  const renderFuzzy = (
    <div style={{display: !searchType  ? 'block' : 'none'}}>
      <Search loading={loading}
        allowClear={true}
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={searchChange}
        onSearch={(value, e) => {
          e.preventDefault();
          sessionStorage.removeItem('sessionPageNum');
          sessionStorage.removeItem('formValues');
          fuzzySearch(value);
        }}
        style={{
          display: expand ? 'none' : 'inline-block',
          width: (!/px/.test(searchInputWidth) && searchInputWidth * 1) || searchInputWidth,
        }}
      />
      <Button
        type="link"
        onClick={() => {
          updateExpand(!expand);
        }}
        style={{ display: !expand && advancSearchBool ? 'inline-block' : 'none' }}
      >
        高级搜索{expand?<UpOutlined />:<DownOutlined/>}
      </Button>
    </div>
  );
  // customLayout存在，优先使用;否则，使用原layout
  layout = customLayout ? customLayout : layout;
  // tab栏较多时，显示有问题，需要重新设置样式
  const cardClassName = `listCard ${hasMoreTabs ? 'moreTabsListCard' : ''}`;
  return (
    <>
      <div className={'headAssembly'} style={{ display: searchInputWidth?'block' : 'none'}}>
        <div style={{ display: showBreadCrumb ? 'block' : 'none' }}>
          <PageContainers {...pageContainerProps} fuzz={fuzzySearchBool ? renderFuzzy : ''} />
        </div>
        <Card
          className={'search-card2 margin_t-16'}
          style={{ display: expand || !fuzzySearchBool ? 'block' : 'none' }}
        >
          <Form {...layout} form={form} className={'seachForm2'}>
            <Row gutter={24}>
              {
                formItemData.map((item,index) => {
                  const { extra } = item;
                  // console.log("打印下组件接受的东西--------------------")
                  return !item.unRender ?
                    <CustomFormItem
                      tabvalue={tabValue.current}
                      formItemList={formItemData}
                      data={item}
                      loginId={loginId}
                    />:''
                })}
              <Col span={6} className={'textAlign_r padding_t8 padding_b8 float_r'}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className={'margin_l5 margin_l5'}
                  onClick={e=>{handleSearch(e)}}
                >
                  查询
                </Button>
                <Button loading={loading} onClick={handleReset} className={'margin_l5 margin_r5'}>
                  重置
                </Button>
                {
                  !showSearch? <Button
                    style={{ display: fuzzySearchBool ? 'inline-block' : 'none' }}
                    onClick={() => {
                      updateExpand(!expand);
                    }}
                    type="link"
                  >
                    收起{expand?<UpOutlined />:<DownOutlined/>}
                  </Button>:''
                }
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
      <Card
        title={title}
        className={cardClassName}
        tabList={tabs && tabs.tabList}
        activeTabKey={tabs && tabs.activeTabKey}
        onTabChange={onTabChange}
        extra={
          <>
            {extra}
            {pageCode && (''
              // <DynamicHeader
              //   tabValue={tabValue.current}
              //   columns={columns}
              //   pageCode={pageCode}
              //   callBackHandler={dynamicHeaderCallback}
              //   taskTypeCode={taskTypeCode}
              //   taskArrivalTimeKey={taskArrivalTimeKey}
              // />
              )
            }
          </>
        }
      >
        {tableList}
      </Card>
    </>
  );
};

export default Index
