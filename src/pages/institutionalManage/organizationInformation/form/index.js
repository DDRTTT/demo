//页面-机构信息-表单
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
import CustomInput from '@/components/FormListBox/CustomInput';
import SubmitGroup from '@/components/FormListBox/SubmitGroup';
import {connect as connectDva} from "dva";
import {getUrlParam,requestList,requestAdd} from "@/pages/investorReview/func";
import {Form, FormItem,DatePicker,Checkbox, Cascader, Editable,NumberPicker, Switch, Password,Radio,
  Reset,Space,Submit, TimePicker, Transfer,Upload,FormGrid,FormLayout,FormTab,FormCollapse,
  ArrayTable,ArrayCards,FormButtonGroup,ArrayItems,
} from '@formily/antd'
const SchemaField = createSchemaField({
  components: {Space,FormGrid,FormLayout,FormTab,FormCollapse, ArrayTable,ArrayCards,FormItem, DatePicker,
    Checkbox,Cascader,Editable,Text,NumberPicker,Switch,Password,Radio,Reset,Submit,TimePicker,
    Transfer,Upload,Card, Slider,Rate,FormButtonGroup,ArrayItems,SelectTooltip,TreeSelectTooltip,CustomInput},
  scope: {
    //类型下拉 orgInfoType
    orgInfoTypeFun:(field)=>{
      field.loading = true
      requestList({url:`/ams-base-parameter/datadict/queryInfoByList`,method:'GET'},
        {codeList:'rpOrgInfoType'},
      ).then(
        action.bound((data) => {
          field.dataSource = data?.rpOrgInfoType||[]
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
      requestList({url:`/yss-contract-server/RpOrgInfo/viewInfoById`,method:'get'},
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
                     { title: '机构管理', url: '' },
                     { title: '机构信息', url: '' },
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
                         x-index={0}
                         name={"orgName"}
                         x-component={'CustomInput'}
                         default={urlParam.current.orgName}
                         x-disabled={true}
                       />
                       <SchemaField.String
                         title="生效日"
                         x-decorator="FormItem"
                         x-component={"DatePicker"}
                         x-validator={[]}
                         x-index={1}
                         name="effectiveDate"
                       />
                       <SchemaField.String
                         required={true}
                         title={'类型'}
                         x-decorator="FormItem"
                         x-validator={[]}
                         name={'orgInfoType'}
                         x-component="SelectTooltip"
                         x-component-props={{
                           fieldname:'name',
                           fieldnamevalue:'code'
                         }}
                         x-reactions={'{{orgInfoTypeFun}}'}
                       />
                       <SchemaField.String
                         required={true}
                         title="概况"
                         x-decorator="FormItem"
                         x-component="CustomInput.TextArea"
                         x-validator={[]}
                         name="overview"
                         x-component-props={{
                           placeholder:"请输入",autoSize: true
                         }}
                       />
                       <SchemaField.Array
                         name="orgEquityList"
                         title="股权结构"
                         x-decorator="FormItem"
                         x-component="ArrayTable"
                         x-display={urlParam.current.orgType==='OT002'?'visible':"none"}
                         x-component-props={{
                           pagination: { pageSize: 999 },
                           scroll: { x: '100%' },
                         }}
                       >
                         <SchemaField.Object>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{ width: 50, title: '', align: 'center' }}
                           >
                             <SchemaField.Void
                               x-decorator="FormItem"
                               x-component="ArrayTable.SortHandle"
                             />
                           </SchemaField.Void>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{ width: 80, title: '序号', align: 'center' }}
                           >
                             <SchemaField.String
                               x-decorator="FormItem"
                               x-component="ArrayTable.Index"
                             />
                           </SchemaField.Void>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{ title: '股东名称' }}
                           >
                             <SchemaField.String
                               required={true}
                               x-decorator="FormItem"
                               name={"shareHolderName"}
                               x-component={'CustomInput'}
                             />
                           </SchemaField.Void>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{ title: '持股比例' }}
                           >
                             <SchemaField.String
                               required={true}
                               x-decorator="Editable"
                               name={"shareHoldingRatio"}
                               x-component={'CustomInput'}
                               x-component-props={{ addonAfter: '%' }}
                             />
                           </SchemaField.Void>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{
                               title: '操作',
                               dataIndex: 'operations',
                               width: 100,
                               fixed: 'right',
                             }}
                           >
                             <SchemaField.Void x-component="FormItem">
                               <SchemaField.Void x-component="ArrayTable.Remove" />
                               {/*<SchemaField.Void x-component="ArrayTable.MoveDown" />*/}
                               {/*<SchemaField.Void x-component="ArrayTable.MoveUp" />*/}
                             </SchemaField.Void>
                           </SchemaField.Void>
                         </SchemaField.Object>
                         <SchemaField.Void x-component="ArrayTable.Addition" title="新增" />
                       </SchemaField.Array>
                     </SchemaField>
                     <SubmitGroup
                       url={urlParam.current.id?
                         '/yss-contract-server/RpOrgInfo/modify'
                         :'/yss-contract-server/RpOrgInfo/conserve'}
                       method={'post'}
                       id={urlParam.current.id}
                       record={{orgId:urlParam.current.orgId}}
                     />
                   </Form>
                 </>}
    />
  </>
}

export default  connectDva(({ institutionalManage, publicModel: { publicTas } }) => ({
  institutionalManage,publicTas
}))(Index)
