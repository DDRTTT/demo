import React, {useEffect, useState,useRef} from 'react';
import {connect} from 'dva';
import {Breadcrumb, PageContainers} from '@/components';
import DocEditAuth from "@/components/DocDeal/DocEditAuth";
import {getUrlParam} from "@/pages/investorReview/func";


// 流程库指引
const EditConfig = props => {
  const {
    dispatch,
    pageInfo,
    serviceCdn,
    fileDefaultPath,
    pageData,
    docInfo
  } = props;
  // 当前选中的card的指引
  const [currentId, setCurrentId] = useState(-1);

  let urlParam=useRef(getUrlParam())
  // useEffect(() => {
  // }, );

  return (
      <div>
        <div style={{float: 'left'}}>
          <PageContainers breadcrumb={
            [
              { title: '招募说明书', url: '' },
              { title: urlParam.current.title, url: '' },
            ]
          }
          />
        </div>
        <DocEditAuth
          isProcess={false}
          processData={pageData}
          nodeInfo={pageInfo}
          fileDefaultPath={ fileDefaultPath }
          docInfo={docInfo}
          docConfig={{}}
          serviceCdn={serviceCdn}
         />
      </div>
  );
};
const Index = state => {
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
export default connect(Index)(EditConfig);
