//页面-机构管理-表单
import React, {useEffect, useRef, useMemo, useState} from 'react';
import { createForm,onFieldReact,onFieldMount,onFieldInputValueChange,} from '@formily/core'
import { FormProvider, createSchemaField,VoidField,Field,connect, mapProps } from '@formily/react'
import {Button, Modal, Slider, Rate, Affix, message} from 'antd';
import { action } from '@formily/reactive'
import { Card} from '@/components';
import FormListBox from '@/components/FormListBox';
import {handleIntersection} from '@/components/FormListBox/fun';
import SelectTooltip from '@/components/FormListBox/SelectTooltip';
import TreeSelectTooltip from '@/components/FormListBox/TreeSelectTooltip';
import CustomInput from '@/components/FormListBox/CustomInput'
import SubmitGroup from '@/components/FormListBox/SubmitGroup';
import {connect as connectDva} from "dva";
import {getUrlParam,requestList,requestAdd} from "@/pages/investorReview/func";
import {Form, FormItem,DatePicker,Checkbox, Cascader, Editable,NumberPicker, Switch, Password,Radio,
  Reset,Space,Submit, TimePicker, Transfer,Upload,FormGrid,FormLayout,FormTab,FormCollapse,
  ArrayTable,ArrayCards,FormButtonGroup,ArrayItems
} from '@formily/antd'
const SchemaField = createSchemaField({
  components: {Space,FormGrid,FormLayout,FormTab,FormCollapse, ArrayTable,ArrayCards,FormItem, DatePicker,
    Checkbox,Cascader,Editable,Text,NumberPicker,Switch,Password,Radio,Reset,Submit,TimePicker,
    Transfer,Upload,Card, Slider,Rate,FormButtonGroup,ArrayItems,SelectTooltip,TreeSelectTooltip,CustomInput},
  scope: {
    //产品名称下拉 proName
    proNameFun:(field)=>{
      field.loading = true
      requestList({url:`/yss-contract-server/RpProduct/getProductInfo`,method:'GET'},
        {},
      ).then(
        action.bound((data) => {
          field.dataSource = data||[]
          field.loading = false
        })
      )
    }
  }
})


const Index = (props)=>{
  const {publicTas,dispatch,
  }=props
  let urlParam=useRef(getUrlParam())
  const [loading,setLoading]=useState(false)
  useEffect(() => {
    handleGetValue()
    // form.setInitialValues({
    //   orgType: 'OT006',
    // })
  }, []);

  function handleGetValue() {
    if(urlParam.current.id){
      setLoading(true)
      requestList({url:`/yss-contract-server/RpFundAnno/viewById`,method:'get'},
        {id:urlParam.current.id},
      ).then((res)=>{
        setLoading(false)
        form.setInitialValues({...res})
      })
    }
  }


  const form = useMemo(() => createForm({
    readPretty: urlParam.current.formType,
    validateFirst: true,
    effects() {

    }
  }),[])

  // let loading
  return<>
    <FormListBox title={''} loading={loading}
                 pageContainerProps={{
                   breadcrumb: [
                     { title: '基金业绩注解', url: '' },
                     { title: urlParam.current.title, url: '' },
                   ],
                 }}
                 div={<>
                   <Form form={form}  labelCol={3} wrapperCol={18}>
                     <SchemaField>
                       <SchemaField.String
                         required={true}
                         title={'产品名称'}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={'proCode'}
                         x-component="SelectTooltip"
                         x-component-props={{
                           fieldname:'name',
                           fieldnamevalue:'code'
                         }}
                         x-reactions={'{{proNameFun}}'}
                       />
                       <SchemaField.String
                         required={true}
                         title={"基金业绩注解"}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={"anno"}
                         x-component={'CustomInput.TextArea'}
                         x-component-props={{
                           placeholder:"请输入",
                           autoSize: true
                         }}
                       />

                     </SchemaField>
                     <SubmitGroup
                       url={'/yss-contract-server/RpFundAnno/addAndUpdate'}
                       method={'post'}
                       id={urlParam.current.id}
                     />
                   </Form>
                 </>}
    />
  </>
}
export default  connectDva(({ notesFundPerformance, publicModel: { publicTas } }) => ({
  notesFundPerformance,publicTas
}))(Index)
