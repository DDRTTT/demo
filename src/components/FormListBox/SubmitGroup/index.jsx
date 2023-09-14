import React, {useState, memo, useRef} from 'react';
import {getUrlParam, requestAdd} from "@/pages/investorReview/func";
import {Affix, message} from "antd";
import {FormButtonGroup, Submit} from "@formily/antd";

function SubmitGroup(props) {
  const {
    url,method,id,
    record //record:非form表单中的值，但是是需要传入的参数，以{}的形式传入
  }=props
  const [loading,setLoading]=useState(false)
  const urlParam=useRef(getUrlParam())
  function submit(values){
    setLoading(true)
    requestAdd({url:url,method:method},
      {...values,id:id||'',...record||''},
    ).then((res)=>{
      if (res&&res.status===200){
        message.success(res.message);
        window.history.back()
      }
      setLoading(false)
    })
  }
  return<>
    {urlParam.current.title?.includes('查看')?'':
      <Affix offsetBottom={0}>
        <FormButtonGroup.Sticky align="center" >
          <FormButtonGroup>
            <Submit block loading={loading} onSubmit={(values) => {submit(values)}}>提交</Submit>
          </FormButtonGroup>
        </FormButtonGroup.Sticky>
      </Affix>
    }
  </>
}
export default SubmitGroup
