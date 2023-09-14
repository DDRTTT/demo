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
    //机构类型下拉 orgType
    orgTypeFun:(field)=>{
      field.loading = true
      requestList({url:`/ams-base-parameter/datadict/queryInfoByList`,method:'GET'},
        {codeList:'rpOrgType'},
      ).then(
        action.bound((data) => {
          field.dataSource = data?.rpOrgType||[]
          field.loading = false
        })
      )
    },
    //机构性质 orgProperty
    orgPropertyFun:(field)=>{
      field.loading = true
      requestList({url:`/ams-base-parameter/datadict/queryInfoByList`,method:'GET'},
        {codeList:'rpOrgProperty'},
      ).then(
        action.bound((data) => {
          field.dataSource = data?.rpOrgProperty||[]
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
      requestList({url:`/yss-contract-server/RpOrg/queryInfoByOrgId`,method:'get'},
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
      // OT006
      onFieldReact('orgProperty', (field) => {
        let orgType=field.query('orgType').value()
        if(orgType!=='OT006'){
          field.display='none'
        }else {
          field.display='visible'
        }
      })
    }
  }),[])

  // let loading
  return<>
    <FormListBox title={''} loading={loading}
                 pageContainerProps={{
                   breadcrumb: [
                     { title: '机构管理', url: '' },
                     { title: urlParam.current.title, url: '' },
                   ],
                 }}
                 div={<>
                   <Form form={form}  labelCol={3} wrapperCol={18}>
                     <SchemaField>
                       <SchemaField.String
                         required={true}
                         title={"机构名称"}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={"orgName"}
                         x-component={'CustomInput'}
                       />
                       <SchemaField.String
                         required={true}
                         title={'机构类型'}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={'orgType'}
                         x-component="SelectTooltip"
                         x-component-props={{
                           fieldname:'name',
                           fieldnamevalue:'code'
                         }}
                         x-reactions={'{{orgTypeFun}}'}
                       />
                       <SchemaField.String
                         required={true}
                         title={'机构性质'}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={'orgProperty'}
                         x-component="SelectTooltip"
                         x-component-props={{
                           fieldname:'name',
                           fieldnamevalue:'code'
                         }}
                         x-reactions={'{{orgPropertyFun}}'}
                       />
                     </SchemaField>
                     <SubmitGroup
                       url={urlParam.current.id?
                         '/yss-contract-server/RpOrg/singleModify'//修改
                         :'/yss-contract-server/RpOrg/singleConserve'}//新增
                       method={'post'}
                       id={urlParam.current.id}
                     />
                   </Form>
                 </>}
    />
  </>
}
export default  connectDva(({ institutionalManage, publicModel: { publicTas } }) => ({
  institutionalManage,publicTas
}))(Index)
