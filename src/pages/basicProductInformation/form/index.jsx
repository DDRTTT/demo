//页面-产品基本信息-表单
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
import CustomInput from '@/components/FormListBox/CustomInput';
import SubmitGroup from '@/components/FormListBox/SubmitGroup';
import {connect as connectDva} from "dva";
import {getUrlParam,requestList,requestAdd} from "@/pages/investorReview/func";
import {Form, FormItem,DatePicker,Checkbox, Cascader, Editable,NumberPicker, Switch, Password,Radio,
  Reset,Space,Submit, TimePicker, Transfer,Upload,FormGrid,FormLayout,FormTab,FormCollapse,
  ArrayTable,ArrayCards,FormButtonGroup,ArrayItems
} from '@formily/antd'

const SchemaField = createSchemaField({
  components: {Space,FormGrid,FormLayout,FormTab,FormCollapse, ArrayTable,ArrayCards,FormItem, DatePicker,
    Checkbox,Cascader,Editable,Text,NumberPicker,Switch,Password,Radio,Reset,Submit,TimePicker,Button,
    Transfer,Upload,Card, Slider,Rate,FormButtonGroup,ArrayItems,SelectTooltip,TreeSelectTooltip,CustomInput},
  scope: {
    //产品类型下拉 proType
    proTypeFun:(field)=>{
      field.loading = true
      requestList({url:`/ams-base-parameter/datadict/queryInfoByList`,method:'GET'},
        {codeList:'rpProductType'},
      ).then(
        action.bound((data) => {
          field.dataSource = data?.rpProductType||[]
          field.loading = false
        })
      )
    },
    //产品管理人下拉 proCustodian
    proCustodianFun:(field)=>{
      field.loading = true
      requestList({url:`/yss-contract-server/RpOrg/getProCustodian`,method:'get'},
        {},
      ).then(
        action.bound((data) => {
          field.dataSource =data||[]
          field.loading = false
        })
      )
    }
  }
})


const Index = (props)=>{
  const {publicTas,dispatch
  }=props
  let urlParam=useRef(getUrlParam())
  const [loading,setLoading]=useState(false)
  useEffect(() => {
    handleGetValue()
  }, []);

  // function changeUsername(url,method,params){
  //   return new Promise((resolve) => {
  //     requestList({url:`/yss-contract-server/RpProduct/queryInfoById`,method:'get'},
  //       {id:urlParam.current.id},
  //     ).then((res)=>{
  //         resolve(res);
  //     })
  //   });
  // }
  //
  // const { data, error, aloading } = useRequest(changeUsername);
  // console.log( data, error, aloading)



  function handleGetValue() {
    if(urlParam.current.id){
      setLoading(true)
      requestList({url:`/yss-contract-server/RpProduct/queryInfoById`,method:'get'},
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
      //分级产品
      onFieldReact('gradedProductInformation', (field) => {
        let isClassified=field.query('isClassified').value()
        isClassified!==1?field.display='none'
          :field.display='visible'
      })
    }
  }),[])

  return<>
    <FormListBox title={''} loading={loading}
                 pageContainerProps={{
                   breadcrumb: [
                     { title: '产品基本信息', url: '' },
                     { title: urlParam.current.title, url: '' },
                   ],
                 }}
                 div={<>
                   <Form form={form} layout="vertical"  labelCol={6} wrapperCol={18}>
                     <SchemaField>
                       <SchemaField.Void
                         x-component="FormGrid"
                         x-component-props={{maxColumns: 2,}}
                       >
                         <SchemaField.String
                           required={true}
                           title={"产品名称"}
                           x-decorator="FormItem"
                           x-validator={[]}
                           name={"proName"}
                           x-component={'CustomInput'}
                           x-index={0}
                         />
                         <SchemaField.String
                           required={true}
                           title={"产品简称"}
                           x-decorator="FormItem"
                           x-validator={[]}
                           name={"proFname"}
                           x-component={'CustomInput'}
                           x-index={1}
                         />
                         <SchemaField.String
                           required={true}
                           title={"产品代码"}
                           x-decorator="FormItem"
                           x-disabled={!urlParam.current.id ? false : true}
                           x-validator={[]}
                           name={"proCode"}
                           x-component={'CustomInput'}
                           x-index={2}
                         />
                         <SchemaField.String
                           required={true}
                           title={"产品合同生效日"}
                           name="operationSdate"
                           x-decorator="FormItem"
                           x-validator={[]}
                           x-component={"DatePicker"}
                           x-index={3}
                         />
                         <SchemaField.String
                           required={true}
                           title={'产品类型'}
                           x-decorator="FormItem"
                           x-validator={[]}
                           name={'proType'}
                           x-component="SelectTooltip"
                           x-index={4}
                           x-component-props={{
                             fieldname: 'name',
                             fieldnamevalue:'code'
                           }}
                           x-reactions={'{{proTypeFun}}'}
                         />
                         <SchemaField.String
                           required={true}
                           title={'产品管理人'}
                           x-decorator="FormItem"
                           x-validator={[]}
                           name={'proCustodian'}
                           x-component="SelectTooltip"
                           x-index={5}
                           x-component-props={{
                             fieldname:'orgName',
                             fieldnamevalue:'id'
                           }}
                           x-reactions={'{{proCustodianFun}}'}
                         />
                         <SchemaField.Markup
                           title={'是否分级产品'}
                           name="isClassified"
                           x-decorator="FormItem"
                           x-component="Radio.Group"
                           enum={[{ label: "是", value: 1 },{ label: "否", value: 2 }]}
                           default={1}
                           x-index={6}
                         />
                       </SchemaField.Void>
                       <SchemaField.Array
                         name="gradedProductInformation"
                         title="分级产品信息"
                         x-decorator="FormItem"
                         x-component="ArrayTable"
                         x-component-props={{
                           pagination: { pageSize: 999 },
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
                             x-component-props={{ title: '分级产品代码' }}
                           >
                             <SchemaField.String
                               required={true}
                               x-decorator="FormItem"
                               name={"gradeCode"}
                               x-component={'CustomInput'}
                             />
                           </SchemaField.Void>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{ title: '分级产品名称' }}
                           >
                             <SchemaField.String
                               required={true}
                               x-decorator="FormItem"
                               name={"gradeName"}
                               x-component={'CustomInput'}
                             />
                           </SchemaField.Void>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{ title: '分级类别' }}
                           >
                             <SchemaField.String
                               required={true}
                               x-decorator="FormItem"
                               name={'natureOfReport'}
                               x-component="SelectTooltip"
                               x-component-props={{
                                 fieldname:'name',
                                 fieldnamevalue:'code'
                               }}
                               enum={[{ name: "A", code: 'A' },{ name: "B", code: "B" },{ name: "C", code: "C" },{ name: "D", code: "D" },
                                 { name: "E", code: 'E' },{ name: "F", code: "F" },{ name: "I", code: "I" }]}
                             />
                           </SchemaField.Void>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{ title: '合同生效日' }}
                           >
                             <SchemaField.String
                               required={true}
                               x-decorator="FormItem"
                               name={"operationSdate"}
                               x-component={'DatePicker'}
                             />
                           </SchemaField.Void>
                           <SchemaField.Void
                             x-component="ArrayTable.Column"
                             x-component-props={{
                               title: '操作',
                               dataIndex: 'operations',

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
                     <SubmitGroup url={urlParam.current.id?
                       '/yss-contract-server/RpProduct/modify'
                       :'/yss-contract-server/RpProduct/conserve'} method={'post'}
                                  id={urlParam.current.id}
                     />
                   </Form>
                 </>}
    />
  </>
}
export default  connectDva(({ basicProductInformation, publicModel: { publicTas } }) => ({
  basicProductInformation,publicTas
}))(Index)
