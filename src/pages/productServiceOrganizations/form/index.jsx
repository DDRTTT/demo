//页面-产品相关服务机构-表单
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
import {connect as connectDva} from "dva";
import {getUrlParam,requestList,requestAdd} from "@/pages/investorReview/func";
import {Form, FormItem,DatePicker,Checkbox, Cascader, Editable,Input,NumberPicker, Switch, Password,Radio,
  Reset,Space,Submit, TimePicker, Transfer,Upload,FormGrid,FormLayout,FormTab,FormCollapse,
  ArrayTable,ArrayCards,FormButtonGroup,ArrayItems,Select
} from '@formily/antd'
const SchemaField = createSchemaField({
  components: {Space,FormGrid,FormLayout,FormTab,FormCollapse, ArrayTable,ArrayCards,FormItem, DatePicker,
    Checkbox,Cascader,Editable,Input,Text,NumberPicker,Switch,Password,Radio,Reset,Submit,TimePicker,
    Transfer,Upload,Card, Slider,Rate,FormButtonGroup,ArrayItems,Select,SelectTooltip,TreeSelectTooltip},
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
    }
  }
})


const Index = (props)=>{
  const {publicTas,dispatch,
  }=props
  let urlParam=useRef(getUrlParam())
  const [loading,setLoading]=useState(false)
  useEffect(() => {
    // handleGetValue()
    // form.setInitialValues({
    //   orgType: 'OT006',
    // })
  }, []);

  function handleGetValue() {
    if(urlParam.current.id){
      setLoading(true)
      requestList({url:`/yss-contract-server/RpProductOrg/viewById`,method:'get'},
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

      onFieldInputValueChange('proCode', (field, form) => {
        let proName=field.query('proCode').get('inputValues')
        form.setValues({ proName: proName[1]?.proName });
      });
    }
  }),[])

  // let loading
  return<>
    <FormListBox title={''} loading={loading} form={form}
                 handleGetValue={handleGetValue}
                 // url={`/yss-contract-server/RpProductOrg/viewById`}
                 // method={'get'}
                 // params={{id:urlParam.current.id}}
                 pageContainerProps={{
                   breadcrumb: [
                     { title: '产品相关服务机构', url: '' },
                     { title: urlParam.current.title, url: '' },
                   ],
                 }}
                 div={<>
                <Form form={form}  labelCol={3} wrapperCol={18}>
                  <SchemaField>
                    <SchemaField.String
                      required={true}
                      title={"机构类型"}
                      x-decorator="FormItem"
                      x-validator={[]}
                      name={"orgType"}
                      x-component={'SelectTooltip'}
                      x-index={0}
                      x-component-props={{
                        fieldname:'name',
                        fieldnamevalue:'code',
                      }}
                      x-reactions={'{{orgTypeFun}}'}
                    />
                    <SchemaField.String
                      required={true}
                      title={"产品名称"}
                      x-decorator="FormItem"
                      x-validator={[]}
                      name={"proCode"}
                      x-component="SelectTooltip"
                      x-index={1}
                      x-component-props={{
                        fieldname:'proName',
                        fieldnamevalue:'proCode',
                      }}
                    />
                    <SchemaField.String
                      required={true}
                      title={"机构名称"}
                      x-decorator="FormItem"
                      x-validator={[]}
                      name={"orgId"}
                      x-component={'SelectTooltip'}
                      x-index={2}
                      x-component-props={{
                        fieldname:'orgName',
                        fieldnamevalue:'id',
                      }}
                    />
                    <SchemaField.String
                      title={"生效日期"}
                      name="effectiveDate"
                      x-decorator="FormItem"
                      x-validator={[]}
                      x-component={'DatePicker'}
                      x-index={3}
                    />
                  </SchemaField>
                  <SubmitGroup url={urlParam.current.id?
                    '/yss-contract-server/RpProductOrg/changeById':
                    '/yss-contract-server/RpProductOrg/conserve'}
                               method={'post'}
                               id={urlParam.current.id}
                  />
              </Form>
              </>}
    />
  </>
}
export default  connectDva(({ productServiceOrganizations, publicModel: { publicTas } }) => ({
  productServiceOrganizations,publicTas
}))(Index)
