import React, {useState, memo, useEffect, useRef} from 'react';
import {Spin, } from 'antd';
import { Card, PageContainers } from '@/components';
import {PreviewText} from "@formily/antd";
import styles from './index.less';
import {getUrlParam, requestList} from "@/pages/investorReview/func";
import {connect} from "dva";

function FormListBox(props) {
  const { title,dispatch,
    defaultTitle,
    pageContainerProps,
    loading,div,form,
    previewTextValue,
    url,method,params,
    handleGetValue,
  }=props
  let urlParam=useRef(getUrlParam())
  const [boxLoading,setBoxLoading]=useState(false)
  useEffect(()=>{
    if(urlParam.current.id){
      GetValue()
    }
    return ()=>{
      sessionStorage.setItem('pathname', JSON.stringify(window.location.pathname));
    }
  },[])
  async function GetValue() {
    if(handleGetValue){
      await setBoxLoading(true)
      await handleGetValue()
      await setBoxLoading(false)
    }
    if(url){
      await setBoxLoading(true)
      await requestList({url:url,method:method},
        params,
      ).then((res)=>{
        setBoxLoading(false)
        form.setInitialValues({...res})
      })
    }
  }

  return<>
    <PageContainers {...pageContainerProps} />
    <Card title={title||getUrlParam().title||' '} className={styles.margin} >
      <Spin spinning={loading||boxLoading}>
        <PreviewText.Placeholder value={'-'}>
          {div}
        </PreviewText.Placeholder>
      </Spin>
    </Card>
  </>
}

export default  connect(({ publicModel: { publicTas } }) => ({
  publicTas
}))(FormListBox)
