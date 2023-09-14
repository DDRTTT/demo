import React, { useEffect, useState, } from 'react';
import { Form,  message, ConfigProvider} from 'antd';
import { connect } from 'dva';
import style from './index.less';
import List from "./List";
import {router} from "umi";
import { Breadcrumb } from '@/components';

import FilterForm from "@/pages/prospectusConfig/FilterForm";

// const GuideContext = React.createContext({});
// 流程库指引
const Index = props => {
  const {
    dispatch,
    pageInfo,
    listData,
    serviceCdn,
    listLoading
  } = props;
  // 当前选中的card的指引
  const [currentId, setCurrentId] = useState(-1);
  // 当前的数据

  // useEffect(() => {
  // }, );

  const changeCreateStatus = (creatStatus) =>{
    // dispatch({
    //   type: 'processNode/setCreateStatus',
    //   payload: {creatStatus}
    // });
  };

  const deleteData = ({payload, cb})=>{
    dispatch({
      type:'prospectusPageTpl/deleteListData',
      payload,
      cb
    });
  }

  const handleSubmit = data => {
    const params = data;
  };

  const getData = ({payload})=>{
    dispatch({
      type:'prospectusPageTpl/getListData',
      payload
    });
  }

  const getNodeData = (data) =>{
    if(!serviceCdn.jsApiIp){
      message.error('无法获取cdn文件服务');
      return;
    }

    // 暂时无法介入umi的redux数据持久化动作，只能先作缓存

    sessionStorage.setItem('_templateParams', JSON.stringify(data));
    router.push('/processFlow/process');// 是否需要再这里跳转
    // dispatch({
    //   type:'processNode/getNodeData',
    //   payload: { ...data }
    // });
  }

  return (
    // <GuideContext.Provider value={{ detailRef }}>
    <ConfigProvider autoInsertSpaceInButton={ false }>
      <div className={style.processLibraryGuide}>
        <Breadcrumb breadcrumbArray={[
          {
            title: '招募说明书',
            url: '',
          },
          {
            title: '招募说明书办理',
            url: '',
          },
        ]} />

        {/*<ShowHide  style={{ marginTop: 10 }} title="">*/}
          <FilterForm submit={handleSubmit}></FilterForm>
        {/*</ShowHide>*/}
        <List
          getNodeData={getNodeData}
          getData={getData}
          listData={listData}
          listLoading={listLoading}
          deleteData={deleteData}
          pageInfo={pageInfo}
          changeCreateStatus={changeCreateStatus}
        >
        </List>
      </div>
    </ConfigProvider>
    // </GuideContext.Provider>
  );
};
const list = state => {
  const {
    dispatch,
    prospectusPageTpl,
    processNode,
    loading
  } = state;
  return {
    dispatch,
    serviceCdn: processNode.serviceCdn,
    listData: prospectusPageTpl.listData,
    pageInfo: prospectusPageTpl.pageInfo, // 页面相关信息
    listLoading: loading.effects['processListModels/getListData'],
  };
};
export default connect(list)(Index);
