//页面-产品经理人任职情况-表单
import React, {useEffect, useRef, useMemo, useState} from 'react';
import { createForm,onFieldReact,onFieldMount,onFieldInputValueChange,} from '@formily/core'
import { FormProvider, createSchemaField,VoidField,Field,connect, mapProps } from '@formily/react'
import {Button, Modal, Slider, Rate, Affix, message} from 'antd';
import { action } from '@formily/reactive'
import { Card} from '@/components';
import FormListBox from '@/components/FormListBox';
import {handleIntersection,useRequestDefaults} from '@/components/FormListBox/fun';
import SelectTooltip from '@/components/FormListBox/SelectTooltip';
import TreeSelectTooltip from '@/components/FormListBox/TreeSelectTooltip';
import SubmitGroup from '@/components/FormListBox/SubmitGroup';
import CustomInput from '@/components/FormListBox/CustomInput';
import {connect as connectDva} from "dva";
import {getUrlParam,requestList,requestAdd} from "@/pages/investorReview/func";
import {Form, FormItem,DatePicker,Checkbox, Cascader, Editable,NumberPicker, Switch, Password,Radio,
  Reset,Space,Submit, TimePicker, Transfer,Upload,FormGrid,FormLayout,FormTab,FormCollapse,
  ArrayTable,ArrayCards,FormButtonGroup,ArrayItems
} from '@formily/antd'
const SchemaField = createSchemaField({
  components: {Space,FormGrid,FormLayout,FormTab,FormCollapse, ArrayTable,ArrayCards,FormItem, DatePicker,
    Checkbox,Cascader,Editable,CustomInput,Text,NumberPicker,Switch,Password,Radio,Reset,Submit,TimePicker,
    Transfer,Upload,Card, Slider,Rate,FormButtonGroup,ArrayItems,SelectTooltip,TreeSelectTooltip},
  scope: {
    //产品名称下拉 proCode
    proCodeFun:(field)=>{
      field.loading = true
      requestList({url:`/yss-contract-server/RpProduct/getProductInfo`,method:'GET'},{},
      ).then(
        action.bound((data) => {
          field.dataSource = data
          field.loading = false
        })
      )
    },
    //产品经理人下拉 managerId
    managerIdFun:(field)=>{
      field.loading = true
      requestList({url:`/yss-contract-server/RpProductManager/getProductManagerInfo`,method:'GET'},{},
      ).then(
        action.bound((data) => {
          field.dataSource = data
          field.loading = false
        })
      )
    },
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
      requestList({url:`/yss-contract-server/RpManagerOffice/viewById`,method:'get'},
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
      //产品名称下拉
      onFieldReact('proCode', field => {
        let orgTypeCode = field.query('orgType').value()
        if(orgTypeCode){
          field.loading = true
          requestList({url:`/yss-contract-server/RpFund/fuzzyQueryByName`,method:'post'},
            {orgType:orgTypeCode||''},
          ).then(async (res)=>{
            field.dataSource = res
            field.loading = false
            let intersection =handleIntersection(field,'proCode','proCode')
            form.setInitialValues({proCode:intersection[0]||''})
            // await form.validate('proCode')
          })
        }
      })

    }
  }),[])

  // let loading
  return<>
    <FormListBox title={''} loading={loading}
                 pageContainerProps={{
                   breadcrumb: [
                     { title: '产品经理人任职情况', url: '' },
                     { title: urlParam.current.title, url: '' },
                   ],
                 }}
                 div={<>
                   <Form form={form}  labelCol={3} wrapperCol={18}>
                     <SchemaField>
                       <SchemaField.String
                         required={true}
                         title={"产品名称"}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={"proCode"}
                         x-component={'SelectTooltip'}
                         x-index={0}
                         x-component-props={{
                           fieldname:'name',
                           fieldnamevalue:'code',
                         }}
                         x-reactions={'{{proCodeFun}}'}
                       />
                       <SchemaField.String
                         required={true}
                         title={"产品经理人"}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={"managerId"}
                         x-component={'SelectTooltip'}
                         x-index={1}
                         x-component-props={{
                           fieldname:'name',
                           fieldnamevalue:'code',
                         }}
                         x-reactions={'{{managerIdFun}}'}
                       />
                       <SchemaField.String
                         required={true}
                         title={"到任时间"}
                         name="positionSdate"
                         x-decorator="FormItem"
                         x-validator={[]}
                         x-component={"DatePicker"}
                         x-index={2}
                       />
                       <SchemaField.String
                         title={"离任时间"}
                         name="positionEdate"
                         x-decorator="FormItem"
                         x-validator={[]}
                         x-component={"DatePicker"}
                         x-index={3}
                       />
                     </SchemaField>
                     <SubmitGroup url={urlParam.current.id?
                       '/yss-contract-server/RpManagerOffice/changeById'
                       :'/yss-contract-server/RpManagerOffice/conserve'}
                                  method={'post'} id={urlParam.current.id}
                     />
                   </Form>
                 </>}
    />
  </>
}
export default  connectDva(({ positionProductManager, publicModel: { publicTas } }) => ({
  positionProductManager,publicTas
}))(Index)
