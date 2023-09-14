import React, { useEffect, useState, useRef, useContext, forwardRef, useMemo } from 'react';
import {ConfigProvider} from 'antd';
import { connect } from 'dva';
import style from './view.less';
import {Breadcrumb, PageContainers} from '@/components';
import DocView from "@/components/DocDeal/DocView";
import cx_view_config from "@/components/DocDeal/docConfig/view";
import {getUrlParam} from "@/pages/investorReview/func";

// 流程库指引
const View = props => {
  const {
    dispatch,
    pageInfo,
    serviceCdn,
    listLoading,
    fileDefaultPath,
    pageData,
    docInfo
  } = props;
  // 当前选中的card的指引
  const [currentId, setCurrentId] = useState(-1);

  let urlParam=useRef(getUrlParam())

  // useEffect(() => {
  //
  // },[] );

  const changeCreateStatus = (creatStatus) =>{
  };

  return (
      <div >
        <PageContainers breadcrumb={
          [
            { title: '招募说明书', url: '' },
            { title: urlParam.current.title, url: '' },
          ]
          }
        />
        <DocView
          isProcess={false}
          processData={pageData}
          nodeInfo={pageInfo}
          fileDefaultPath={ fileDefaultPath }
          docInfo={docInfo}
          docConfig={cx_view_config}
          serviceCdn={serviceCdn}
         />
      </div>
  );
};
const list = state => {
  const {
    dispatch,
    prospectusPageTpl,
    processNode,
    loading
  } = state;
  const {
    listData,
    pageInfo,
    pageData,
    fileDefaultPath,
  } = prospectusPageTpl;
  const {fileSerialNumber, fileName, fileForm} = pageData;
  return {
    dispatch,
    serviceCdn: processNode.serviceCdn,

    docInfo: {
      fileSerialNumber,
      fileName,
      fileType: fileForm,
    },
    listData,
    fileDefaultPath,
    pageInfo, // 页面相关信息
    pageData, // 页面相关信息
    listLoading: loading.effects['processListModels/getListData'],
  };
};
export default connect(list)(View);
