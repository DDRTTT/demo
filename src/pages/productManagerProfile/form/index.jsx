//页面-产品经理人简介-表单
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
import CustomInput from "@/components/FormListBox/CustomInput";
import SubmitGroup from '@/components/FormListBox/SubmitGroup';
import {connect as connectDva} from "dva";
import {getUrlParam,requestList,requestAdd} from "@/pages/investorReview/func";
import {Form, FormItem,DatePicker,Checkbox, Cascader, Editable,Input,NumberPicker, Switch, Password,Radio,
  Reset,Space,Submit, TimePicker, Transfer,Upload,FormGrid,FormLayout,FormTab,FormCollapse,
  ArrayTable,ArrayCards,FormButtonGroup,ArrayItems
} from '@formily/antd'
const SchemaField = createSchemaField({
  components: {Space,FormGrid,FormLayout,FormTab,FormCollapse, ArrayTable,ArrayCards,FormItem, DatePicker,
    Checkbox,Cascader,Editable,Input,Text,NumberPicker,Switch,Password,Radio,Reset,Submit,TimePicker,
    Transfer,Upload,Card, Slider,Rate,FormButtonGroup,ArrayItems,SelectTooltip,TreeSelectTooltip,CustomInput},
  scope: {
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
      requestList({url:`/yss-contract-server/RpProductManager/viewById`,method:'get'},
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

      //机构名称下拉
      onFieldReact('orgId', field => {
        let orgTypeCode = field.query('orgType').value()
        if(orgTypeCode){
          requestList({url:`/yss-contract-server/RpOrg/getListByParam`,method:'post'},
            {orgTypeLike:orgTypeCode||''},
          ).then(async (res)=>{
            field.dataSource = res
            field.loading = false
            let intersection =handleIntersection(field,'orgId','id')
            form.setValuesIn('orgId',intersection[0]||'')
            // await form.validate('orgId')
          })
        }
      })

      // onFieldReact('proCode',(field)=>{
      //   if(field.query('proName').value()==3){
      //     field.dataSource = [//改变下拉
      //       {label: 'AAA', value: '111',},
      //       {label: 'BBB',value: '222',},
      //     ]
      //     field.setInitialValue(field.value='222')//改变默认值
      //   }else {
      //     field.dataSource = [//改变下拉
      //       {label: 'ccc', value: '333',},
      //       {label: 'ddd',value: '444',},
      //     ]
      //     field.setInitialValue(field.value='444')//改变默认值
      //   }
      // })
    }
  }),[])

  // let loading
  return<>
    <FormListBox title={''} loading={loading}
                 pageContainerProps={{
                   breadcrumb: [
                     { title: '产品经理人简介', url: '' },
                     { title: urlParam.current.title, url: '' },
                   ],
                 }}
                 div={<>
                   <Form form={form}  labelCol={3} wrapperCol={18}>
                     <SchemaField>
                       <SchemaField.String
                         required={true}
                         title={"姓名"}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={"name"}
                         x-component={'CustomInput'}
                       />
                       <SchemaField.Markup
                         required={true}
                         title={'性别'}
                         name={"sex"}
                         x-decorator="FormItem"
                         x-component="Radio.Group"
                         enum={[{ label: "男", value: 1 },{ label: "女", value: 2 }]}
                       />
                       <SchemaField.String
                         required={true}
                         title={"说明"}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={"introductions"}
                         x-component={'CustomInput.TextArea'}
                         x-component-props={{
                           placeholder:"请输入",autoSize: true
                         }}
                       />
                     </SchemaField>
                     <SubmitGroup
                       url={urlParam.current.id?
                       '/yss-contract-server/RpProductManager/changeById'
                       :'/yss-contract-server/RpProductManager/conserve'}
                       method={'post'}
                       id={urlParam.current.id}
                     />
                   </Form>
                 </>}
    />
  </>
}
export default  connectDva(({ productManagerProfile, publicModel: { publicTas } }) => ({
  productManagerProfile,publicTas
}))(Index)
